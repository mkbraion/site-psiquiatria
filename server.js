// ============================================================
// Servidor do consultório — Node.js + Express + SQLite (node:sqlite)
//
// - Serve o site público (arquivos estáticos desta pasta)
// - API real com autenticação por sessão (cookie HttpOnly)
// - Senhas criptografadas com scrypt (nunca em texto puro)
// - Cada consultório (medico_id) só enxerga os próprios dados
//
// Rodar:  npm install && npm start        (porta 3000)
//         node server.js 4180             (porta específica)
// ============================================================

const express = require("express");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");
const { DatabaseSync } = require("node:sqlite");

const PORTA = Number(process.argv[2]) || Number(process.env.PORT) || 3000;
const DURACAO_SESSAO_MS = 8 * 60 * 60 * 1000; // 8 horas
const SEMEAR_DEMO = process.env.SEED_DEMO !== "0";

// ---------- banco de dados ----------
const pastaDados = path.join(__dirname, "dados");
if (!fs.existsSync(pastaDados)) fs.mkdirSync(pastaDados);
const db = new DatabaseSync(path.join(pastaDados, "clinica.db"));

db.exec(`
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS usuarios (
    id TEXT PRIMARY KEY,
    usuario TEXT UNIQUE NOT NULL,
    senha_hash TEXT NOT NULL,
    nome TEXT NOT NULL,
    papel TEXT NOT NULL CHECK (papel IN ('Psiquiatra','Assistente')),
    medico_id TEXT NOT NULL,
    equipe TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS sessoes (
    token TEXT PRIMARY KEY,
    usuario_id TEXT NOT NULL,
    expira INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS pacientes (
    id TEXT PRIMARY KEY,
    medico_id TEXT NOT NULL,
    nome TEXT NOT NULL,
    cpf TEXT NOT NULL,
    rg TEXT,
    telefone TEXT,
    nascimento TEXT,
    medicamentos TEXT NOT NULL DEFAULT '[]',
    obs TEXT
  );
  CREATE TABLE IF NOT EXISTS agenda (
    id TEXT PRIMARY KEY,
    medico_id TEXT NOT NULL,
    paciente_id TEXT NOT NULL,
    data TEXT NOT NULL,
    hora TEXT NOT NULL,
    tipo TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'agendada'
  );
  CREATE TABLE IF NOT EXISTS controlados (
    id TEXT PRIMARY KEY,
    medico_id TEXT NOT NULL,
    paciente_id TEXT NOT NULL,
    medicamento TEXT NOT NULL,
    tipo TEXT NOT NULL,
    data TEXT NOT NULL,
    numeracao TEXT NOT NULL
  );
`);

// ---------- senhas (scrypt, sal individual) ----------
function gerarHash(senha) {
  const sal = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(senha, sal, 64).toString("hex");
  return `${sal}:${hash}`;
}
function conferirSenha(senha, guardado) {
  const [sal, hash] = String(guardado).split(":");
  if (!sal || !hash) return false;
  const teste = crypto.scryptSync(senha, sal, 64);
  const original = Buffer.from(hash, "hex");
  return teste.length === original.length && crypto.timingSafeEqual(teste, original);
}
const uid = () => crypto.randomUUID();

// ---------- dados iniciais (fictícios, para demonstração) ----------
function semear() {
  const temUsuario = db.prepare("SELECT COUNT(*) AS n FROM usuarios").get().n;
  if (temUsuario > 0) return;

  const criaUsuario = db.prepare(
    "INSERT INTO usuarios (id, usuario, senha_hash, nome, papel, medico_id, equipe) VALUES (?,?,?,?,?,?,?)"
  );
  criaUsuario.run(uid(), "alessandra", gerarHash("demo123"), "Dra. Alessandra Menezes", "Psiquiatra", "alessandra", "Consultório Dra. Alessandra");
  criaUsuario.run(uid(), "carla", gerarHash("demo123"), "Carla Souza", "Assistente", "alessandra", "Consultório Dra. Alessandra");
  criaUsuario.run(uid(), "ricardo", gerarHash("demo123"), "Dr. Ricardo Fontes", "Psiquiatra", "ricardo", "Consultório Dr. Ricardo");
  console.log("Usuários iniciais criados (senha: demo123): alessandra, carla, ricardo");

  if (!SEMEAR_DEMO) return;
  const dataRel = (dias) => {
    const t = new Date();
    t.setDate(t.getDate() + dias);
    return t.toISOString().slice(0, 10);
  };
  const criaPaciente = db.prepare(
    "INSERT INTO pacientes (id, medico_id, nome, cpf, rg, telefone, nascimento, medicamentos, obs) VALUES (?,?,?,?,?,?,?,?,?)"
  );
  const p1 = uid(), p2 = uid(), p3 = uid(), p4 = uid();
  criaPaciente.run(p1, "alessandra", "João Pereira da Silva", "987.654.321-00", "1098765432", "(55) 99123-4567", "1989-03-14",
    JSON.stringify([{ nome: "Sertralina", dose: "50 mg — 1x ao dia", controlado: false }, { nome: "Clonazepam", dose: "0,5 mg — à noite", controlado: true }]),
    "Transtorno de ansiedade generalizada. Retorno em 30 dias.");
  criaPaciente.run(p2, "alessandra", "Maria Fernanda Costa", "123.456.789-09", "2087654321", "(55) 98765-1234", "1996-11-02",
    JSON.stringify([{ nome: "Venlafaxina", dose: "75 mg — 1x pela manhã", controlado: false }]),
    "Depressão moderada, em melhora progressiva.");
  criaPaciente.run(p3, "alessandra", "Carlos Eduardo Ramos", "111.444.777-35", "3076543210", "(55) 99888-7766", "1978-07-25",
    JSON.stringify([{ nome: "Metilfenidato", dose: "10 mg — 2x ao dia", controlado: true }]),
    "TDAH em adulto, diagnóstico confirmado em 2024.");
  criaPaciente.run(p4, "ricardo", "Ana Beatriz Lopes", "222.333.444-05", "4065432109", "(55) 99777-2211", "2001-01-19",
    JSON.stringify([{ nome: "Escitalopram", dose: "10 mg — 1x ao dia", controlado: false }]), "");

  const criaConsulta = db.prepare(
    "INSERT INTO agenda (id, medico_id, paciente_id, data, hora, tipo, status) VALUES (?,?,?,?,?,?, 'agendada')"
  );
  criaConsulta.run(uid(), "alessandra", p1, dataRel(1), "09:00", "Presencial");
  criaConsulta.run(uid(), "alessandra", p2, dataRel(1), "14:30", "Online");
  criaConsulta.run(uid(), "alessandra", p3, dataRel(3), "10:00", "Presencial");
  criaConsulta.run(uid(), "ricardo", p4, dataRel(2), "11:00", "Online");

  const criaReceita = db.prepare(
    "INSERT INTO controlados (id, medico_id, paciente_id, medicamento, tipo, data, numeracao) VALUES (?,?,?,?,?,?,?)"
  );
  criaReceita.run(uid(), "alessandra", p1, "Clonazepam 0,5 mg", "B — Azul (psicotrópicos)", dataRel(-7), "B2-0045871");
  criaReceita.run(uid(), "alessandra", p3, "Metilfenidato 10 mg", "A — Amarela (entorpecentes)", dataRel(-3), "A-0098234");
  console.log("Dados fictícios de demonstração inseridos (SEED_DEMO=0 para iniciar vazio).");
}
semear();

// ---------- sessões ----------
function lerCookies(req) {
  const saida = {};
  (req.headers.cookie || "").split(";").forEach((par) => {
    const i = par.indexOf("=");
    if (i > 0) saida[par.slice(0, i).trim()] = decodeURIComponent(par.slice(i + 1));
  });
  return saida;
}

function criarSessao(res, usuarioId, req) {
  const token = crypto.randomBytes(32).toString("hex");
  db.prepare("INSERT INTO sessoes (token, usuario_id, expira) VALUES (?,?,?)").run(
    token, usuarioId, Date.now() + DURACAO_SESSAO_MS
  );
  const seguro = req.secure || req.headers["x-forwarded-proto"] === "https" ? "; Secure" : "";
  res.setHeader("Set-Cookie",
    `psiq_token=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${DURACAO_SESSAO_MS / 1000}${seguro}`);
}

function exigeSessao(req, res, next) {
  db.prepare("DELETE FROM sessoes WHERE expira < ?").run(Date.now());
  const token = lerCookies(req).psiq_token;
  const sessao = token && db.prepare("SELECT * FROM sessoes WHERE token = ?").get(token);
  if (!sessao) return res.status(401).json({ erro: "Não autenticado." });
  const u = db.prepare("SELECT * FROM usuarios WHERE id = ?").get(sessao.usuario_id);
  if (!u) return res.status(401).json({ erro: "Usuário não existe mais." });
  req.usuario = u;
  req.token = token;
  next();
}

const perfil = (u) => ({ id: u.id, usuario: u.usuario, nome: u.nome, papel: u.papel, medicoId: u.medico_id, equipe: u.equipe });

// ---------- proteção simples contra força-bruta no login ----------
const tentativas = new Map();
function limitaLogin(req, res, next) {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "?";
  const agora = Date.now();
  const registro = tentativas.get(ip) || { n: 0, zera: agora + 15 * 60 * 1000 };
  if (agora > registro.zera) { registro.n = 0; registro.zera = agora + 15 * 60 * 1000; }
  if (registro.n >= 20)
    return res.status(429).json({ erro: "Muitas tentativas. Aguarde 15 minutos." });
  registro.n++;
  tentativas.set(ip, registro);
  next();
}

// ---------- aplicação ----------
const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "200kb" }));

// --- autenticação ---
app.post("/api/entrar", limitaLogin, (req, res) => {
  const { usuario, senha } = req.body || {};
  const u = usuario && db.prepare("SELECT * FROM usuarios WHERE usuario = ?").get(String(usuario).trim().toLowerCase());
  if (!u || !conferirSenha(String(senha || ""), u.senha_hash))
    return res.status(401).json({ erro: "Usuário ou senha incorretos." });
  criarSessao(res, u.id, req);
  res.json(perfil(u));
});

app.post("/api/sair", exigeSessao, (req, res) => {
  db.prepare("DELETE FROM sessoes WHERE token = ?").run(req.token);
  res.setHeader("Set-Cookie", "psiq_token=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0");
  res.status(204).end();
});

app.get("/api/eu", exigeSessao, (req, res) => res.json(perfil(req.usuario)));

app.post("/api/senha", exigeSessao, (req, res) => {
  const { atual, nova } = req.body || {};
  if (!conferirSenha(String(atual || ""), req.usuario.senha_hash))
    return res.status(400).json({ erro: "Senha atual incorreta." });
  if (!nova || String(nova).length < 6)
    return res.status(400).json({ erro: "A nova senha precisa ter ao menos 6 caracteres." });
  db.prepare("UPDATE usuarios SET senha_hash = ? WHERE id = ?").run(gerarHash(String(nova)), req.usuario.id);
  res.status(204).end();
});

// --- pacientes ---
app.get("/api/pacientes", exigeSessao, (req, res) => {
  const linhas = db.prepare("SELECT * FROM pacientes WHERE medico_id = ? ORDER BY nome").all(req.usuario.medico_id);
  res.json(linhas.map((p) => ({ ...p, medicamentos: JSON.parse(p.medicamentos || "[]") })));
});

function validaPaciente(corpo) {
  if (!corpo || !String(corpo.nome || "").trim()) return "Informe o nome do paciente.";
  if (!String(corpo.cpf || "").trim()) return "Informe o CPF.";
  return null;
}

app.post("/api/pacientes", exigeSessao, (req, res) => {
  const erro = validaPaciente(req.body);
  if (erro) return res.status(400).json({ erro });
  const c = req.body;
  const id = uid();
  db.prepare("INSERT INTO pacientes (id, medico_id, nome, cpf, rg, telefone, nascimento, medicamentos, obs) VALUES (?,?,?,?,?,?,?,?,?)")
    .run(id, req.usuario.medico_id, String(c.nome).trim(), String(c.cpf).trim(), String(c.rg || "").trim(),
      String(c.telefone || "").trim(), String(c.nascimento || ""), JSON.stringify(c.medicamentos || []), String(c.obs || "").trim());
  res.status(201).json({ id });
});

app.put("/api/pacientes/:id", exigeSessao, (req, res) => {
  const erro = validaPaciente(req.body);
  if (erro) return res.status(400).json({ erro });
  const c = req.body;
  const r = db.prepare("UPDATE pacientes SET nome=?, cpf=?, rg=?, telefone=?, nascimento=?, medicamentos=?, obs=? WHERE id=? AND medico_id=?")
    .run(String(c.nome).trim(), String(c.cpf).trim(), String(c.rg || "").trim(), String(c.telefone || "").trim(),
      String(c.nascimento || ""), JSON.stringify(c.medicamentos || []), String(c.obs || "").trim(),
      req.params.id, req.usuario.medico_id);
  if (!r.changes) return res.status(404).json({ erro: "Paciente não encontrado." });
  res.status(204).end();
});

app.delete("/api/pacientes/:id", exigeSessao, (req, res) => {
  const r = db.prepare("DELETE FROM pacientes WHERE id=? AND medico_id=?").run(req.params.id, req.usuario.medico_id);
  if (!r.changes) return res.status(404).json({ erro: "Paciente não encontrado." });
  db.prepare("DELETE FROM agenda WHERE paciente_id=? AND medico_id=?").run(req.params.id, req.usuario.medico_id);
  db.prepare("DELETE FROM controlados WHERE paciente_id=? AND medico_id=?").run(req.params.id, req.usuario.medico_id);
  res.status(204).end();
});

// --- agenda ---
app.get("/api/agenda", exigeSessao, (req, res) => {
  res.json(db.prepare("SELECT * FROM agenda WHERE medico_id = ? ORDER BY data, hora").all(req.usuario.medico_id));
});

app.post("/api/agenda", exigeSessao, (req, res) => {
  const c = req.body || {};
  if (!c.pacienteId || !c.data || !c.hora)
    return res.status(400).json({ erro: "Paciente, data e hora são obrigatórios." });
  const dono = db.prepare("SELECT 1 FROM pacientes WHERE id=? AND medico_id=?").get(c.pacienteId, req.usuario.medico_id);
  if (!dono) return res.status(400).json({ erro: "Paciente inválido." });
  const id = uid();
  db.prepare("INSERT INTO agenda (id, medico_id, paciente_id, data, hora, tipo, status) VALUES (?,?,?,?,?,?, 'agendada')")
    .run(id, req.usuario.medico_id, c.pacienteId, String(c.data), String(c.hora), c.tipo === "Online" ? "Online" : "Presencial");
  res.status(201).json({ id });
});

app.patch("/api/agenda/:id", exigeSessao, (req, res) => {
  const status = req.body && req.body.status === "concluida" ? "concluida" : "agendada";
  const r = db.prepare("UPDATE agenda SET status=? WHERE id=? AND medico_id=?").run(status, req.params.id, req.usuario.medico_id);
  if (!r.changes) return res.status(404).json({ erro: "Consulta não encontrada." });
  res.status(204).end();
});

app.delete("/api/agenda/:id", exigeSessao, (req, res) => {
  const r = db.prepare("DELETE FROM agenda WHERE id=? AND medico_id=?").run(req.params.id, req.usuario.medico_id);
  if (!r.changes) return res.status(404).json({ erro: "Consulta não encontrada." });
  res.status(204).end();
});

// --- remédios controlados ---
app.get("/api/controlados", exigeSessao, (req, res) => {
  res.json(db.prepare("SELECT * FROM controlados WHERE medico_id = ? ORDER BY data DESC").all(req.usuario.medico_id));
});

app.post("/api/controlados", exigeSessao, (req, res) => {
  const c = req.body || {};
  if (!c.pacienteId || !c.medicamento || !c.numeracao || !c.data)
    return res.status(400).json({ erro: "Preencha paciente, medicamento, data e numeração." });
  const dono = db.prepare("SELECT 1 FROM pacientes WHERE id=? AND medico_id=?").get(c.pacienteId, req.usuario.medico_id);
  if (!dono) return res.status(400).json({ erro: "Paciente inválido." });
  const id = uid();
  db.prepare("INSERT INTO controlados (id, medico_id, paciente_id, medicamento, tipo, data, numeracao) VALUES (?,?,?,?,?,?,?)")
    .run(id, req.usuario.medico_id, c.pacienteId, String(c.medicamento).trim(), String(c.tipo || "C — Branca (controle especial)"),
      String(c.data), String(c.numeracao).trim());
  res.status(201).json({ id });
});

app.delete("/api/controlados/:id", exigeSessao, (req, res) => {
  const r = db.prepare("DELETE FROM controlados WHERE id=? AND medico_id=?").run(req.params.id, req.usuario.medico_id);
  if (!r.changes) return res.status(404).json({ erro: "Registro não encontrado." });
  res.status(204).end();
});

// --- equipe (somente psiquiatras gerenciam) ---
function exigePsiquiatra(req, res, next) {
  if (req.usuario.papel !== "Psiquiatra")
    return res.status(403).json({ erro: "Apenas psiquiatras gerenciam a equipe." });
  next();
}

app.get("/api/equipe", exigeSessao, exigePsiquiatra, (req, res) => {
  res.json(db.prepare("SELECT id, usuario, nome, papel FROM usuarios WHERE medico_id = ? ORDER BY papel, nome").all(req.usuario.medico_id));
});

app.post("/api/equipe", exigeSessao, exigePsiquiatra, (req, res) => {
  const { usuario, nome, senha } = req.body || {};
  const login = String(usuario || "").trim().toLowerCase();
  if (!/^[a-z0-9._-]{3,30}$/.test(login))
    return res.status(400).json({ erro: "Usuário: use 3–30 letras minúsculas, números, ponto, hífen." });
  if (!String(nome || "").trim()) return res.status(400).json({ erro: "Informe o nome." });
  if (!senha || String(senha).length < 6)
    return res.status(400).json({ erro: "A senha precisa ter ao menos 6 caracteres." });
  if (db.prepare("SELECT 1 FROM usuarios WHERE usuario = ?").get(login))
    return res.status(409).json({ erro: "Este usuário já existe." });
  const id = uid();
  db.prepare("INSERT INTO usuarios (id, usuario, senha_hash, nome, papel, medico_id, equipe) VALUES (?,?,?,?, 'Assistente', ?, ?)")
    .run(id, login, gerarHash(String(senha)), String(nome).trim(), req.usuario.medico_id, req.usuario.equipe);
  res.status(201).json({ id });
});

app.delete("/api/equipe/:id", exigeSessao, exigePsiquiatra, (req, res) => {
  const alvo = db.prepare("SELECT * FROM usuarios WHERE id = ? AND medico_id = ?").get(req.params.id, req.usuario.medico_id);
  if (!alvo) return res.status(404).json({ erro: "Usuário não encontrado." });
  if (alvo.papel !== "Assistente") return res.status(400).json({ erro: "Só é possível remover assistentes." });
  db.prepare("DELETE FROM usuarios WHERE id = ?").run(alvo.id);
  db.prepare("DELETE FROM sessoes WHERE usuario_id = ?").run(alvo.id);
  res.status(204).end();
});

// --- site público (arquivos estáticos) ---
app.use(express.static(__dirname, { extensions: ["html"] }));

app.listen(PORTA, () => {
  console.log(`Consultório no ar: http://localhost:${PORTA}`);
  console.log(`Área restrita:     http://localhost:${PORTA}/login.html`);
});
