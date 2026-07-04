// ============================================================
// Servidor do consultório — Node.js + Express
//
// Banco de dados com dois modos (detectado por variável de ambiente):
//  • TURSO_DATABASE_URL definida  → Turso (SQLite na nuvem, plano grátis)
//    — necessário em hospedagens sem disco persistente (ex.: Render grátis)
//  • sem a variável               → SQLite local em dados/clinica.db
//
// Rodar local:  npm install && npm start        (porta 3000)
//               node server.js 4180             (porta específica)
// ============================================================

const express = require("express");
const crypto = require("crypto");
const path = require("path");

const PORTA = Number(process.argv[2]) || Number(process.env.PORT) || 3000;
const DURACAO_SESSAO_MS = 8 * 60 * 60 * 1000; // 8 horas
const SEMEAR_DEMO = process.env.SEED_DEMO !== "0";
const USANDO_TURSO = Boolean(process.env.TURSO_DATABASE_URL);

// ---------- camada de banco (Turso na nuvem OU SQLite local) ----------
let bd; // { consulta(sql,args)=>rows, executa(sql,args)=>{changes}, fecha() }

async function iniciarBanco() {
  if (USANDO_TURSO) {
    const { createClient } = require("@libsql/client");
    const cliente = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    bd = {
      consulta: async (sql, args = []) => (await cliente.execute({ sql, args })).rows,
      executa: async (sql, args = []) => {
        const r = await cliente.execute({ sql, args });
        return { changes: r.rowsAffected };
      },
      fecha: () => cliente.close(),
    };
    console.log("Banco: Turso (nuvem).");
  } else {
    const fs = require("fs");
    const { DatabaseSync } = require("node:sqlite");
    const pasta = path.join(__dirname, "dados");
    if (!fs.existsSync(pasta)) fs.mkdirSync(pasta);
    const db = new DatabaseSync(path.join(pasta, "clinica.db"));
    db.exec("PRAGMA journal_mode = WAL;");
    bd = {
      consulta: async (sql, args = []) => db.prepare(sql).all(...args),
      executa: async (sql, args = []) => {
        const r = db.prepare(sql).run(...args);
        return { changes: r.changes };
      },
      fecha: () => db.close(),
    };
    console.log("Banco: SQLite local (dados/clinica.db).");
  }

  const tabelas = [
    `CREATE TABLE IF NOT EXISTS usuarios (
      id TEXT PRIMARY KEY,
      usuario TEXT UNIQUE NOT NULL,
      senha_hash TEXT NOT NULL,
      nome TEXT NOT NULL,
      papel TEXT NOT NULL CHECK (papel IN ('Psiquiatra','Assistente')),
      medico_id TEXT NOT NULL,
      equipe TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS sessoes (
      token TEXT PRIMARY KEY,
      usuario_id TEXT NOT NULL,
      expira INTEGER NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS pacientes (
      id TEXT PRIMARY KEY,
      medico_id TEXT NOT NULL,
      nome TEXT NOT NULL,
      cpf TEXT NOT NULL,
      rg TEXT,
      telefone TEXT,
      nascimento TEXT,
      medicamentos TEXT NOT NULL DEFAULT '[]',
      obs TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS agenda (
      id TEXT PRIMARY KEY,
      medico_id TEXT NOT NULL,
      paciente_id TEXT NOT NULL,
      data TEXT NOT NULL,
      hora TEXT NOT NULL,
      tipo TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'agendada'
    )`,
    `CREATE TABLE IF NOT EXISTS controlados (
      id TEXT PRIMARY KEY,
      medico_id TEXT NOT NULL,
      paciente_id TEXT NOT NULL,
      medicamento TEXT NOT NULL,
      tipo TEXT NOT NULL,
      data TEXT NOT NULL,
      numeracao TEXT NOT NULL
    )`,
  ];
  for (const sql of tabelas) await bd.executa(sql);
}

const um = async (sql, args) => (await bd.consulta(sql, args))[0];

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
async function semear() {
  const existe = await um("SELECT COUNT(*) AS n FROM usuarios");
  if (Number(existe.n) > 0) return;

  const criaUsuario = (u, s, n, p, m, e) =>
    bd.executa("INSERT INTO usuarios (id, usuario, senha_hash, nome, papel, medico_id, equipe) VALUES (?,?,?,?,?,?,?)",
      [uid(), u, gerarHash(s), n, p, m, e]);
  await criaUsuario("alessandra", "demo123", "Dra. Alessandra Menezes", "Psiquiatra", "alessandra", "Consultório Dra. Alessandra");
  await criaUsuario("carla", "demo123", "Carla Souza", "Assistente", "alessandra", "Consultório Dra. Alessandra");
  await criaUsuario("ricardo", "demo123", "Dr. Ricardo Fontes", "Psiquiatra", "ricardo", "Consultório Dr. Ricardo");
  console.log("Usuários iniciais criados (senha: demo123): alessandra, carla, ricardo");

  if (!SEMEAR_DEMO) return;
  const dataRel = (dias) => {
    const t = new Date();
    t.setDate(t.getDate() + dias);
    return t.toISOString().slice(0, 10);
  };
  const criaPaciente = (id, m, nome, cpf, rg, tel, nasc, meds, obs) =>
    bd.executa("INSERT INTO pacientes (id, medico_id, nome, cpf, rg, telefone, nascimento, medicamentos, obs) VALUES (?,?,?,?,?,?,?,?,?)",
      [id, m, nome, cpf, rg, tel, nasc, JSON.stringify(meds), obs]);
  const p1 = uid(), p2 = uid(), p3 = uid(), p4 = uid();
  await criaPaciente(p1, "alessandra", "João Pereira da Silva", "987.654.321-00", "1098765432", "(55) 99123-4567", "1989-03-14",
    [{ nome: "Sertralina", dose: "50 mg — 1x ao dia", controlado: false }, { nome: "Clonazepam", dose: "0,5 mg — à noite", controlado: true }],
    "Transtorno de ansiedade generalizada. Retorno em 30 dias.");
  await criaPaciente(p2, "alessandra", "Maria Fernanda Costa", "123.456.789-09", "2087654321", "(55) 98765-1234", "1996-11-02",
    [{ nome: "Venlafaxina", dose: "75 mg — 1x pela manhã", controlado: false }], "Depressão moderada, em melhora progressiva.");
  await criaPaciente(p3, "alessandra", "Carlos Eduardo Ramos", "111.444.777-35", "3076543210", "(55) 99888-7766", "1978-07-25",
    [{ nome: "Metilfenidato", dose: "10 mg — 2x ao dia", controlado: true }], "TDAH em adulto, diagnóstico confirmado em 2024.");
  await criaPaciente(p4, "ricardo", "Ana Beatriz Lopes", "222.333.444-05", "4065432109", "(55) 99777-2211", "2001-01-19",
    [{ nome: "Escitalopram", dose: "10 mg — 1x ao dia", controlado: false }], "");

  const criaConsulta = (m, p, d, h, t) =>
    bd.executa("INSERT INTO agenda (id, medico_id, paciente_id, data, hora, tipo, status) VALUES (?,?,?,?,?,?, 'agendada')",
      [uid(), m, p, d, h, t]);
  await criaConsulta("alessandra", p1, dataRel(1), "09:00", "Presencial");
  await criaConsulta("alessandra", p2, dataRel(1), "14:30", "Online");
  await criaConsulta("alessandra", p3, dataRel(3), "10:00", "Presencial");
  await criaConsulta("ricardo", p4, dataRel(2), "11:00", "Online");

  const criaReceita = (m, p, med, tipo, d, n) =>
    bd.executa("INSERT INTO controlados (id, medico_id, paciente_id, medicamento, tipo, data, numeracao) VALUES (?,?,?,?,?,?,?)",
      [uid(), m, p, med, tipo, d, n]);
  await criaReceita("alessandra", p1, "Clonazepam 0,5 mg", "B — Azul (psicotrópicos)", dataRel(-7), "B2-0045871");
  await criaReceita("alessandra", p3, "Metilfenidato 10 mg", "A — Amarela (entorpecentes)", dataRel(-3), "A-0098234");
  console.log("Dados fictícios de demonstração inseridos (SEED_DEMO=0 para iniciar vazio).");
}

// ---------- sessões ----------
function lerCookies(req) {
  const saida = {};
  (req.headers.cookie || "").split(";").forEach((par) => {
    const i = par.indexOf("=");
    if (i > 0) saida[par.slice(0, i).trim()] = decodeURIComponent(par.slice(i + 1));
  });
  return saida;
}

async function criarSessao(res, usuarioId, req) {
  const token = crypto.randomBytes(32).toString("hex");
  await bd.executa("INSERT INTO sessoes (token, usuario_id, expira) VALUES (?,?,?)",
    [token, usuarioId, Date.now() + DURACAO_SESSAO_MS]);
  const seguro = req.secure || req.headers["x-forwarded-proto"] === "https" ? "; Secure" : "";
  res.setHeader("Set-Cookie",
    `psiq_token=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${DURACAO_SESSAO_MS / 1000}${seguro}`);
}

async function exigeSessao(req, res, next) {
  try {
    await bd.executa("DELETE FROM sessoes WHERE expira < ?", [Date.now()]);
    const token = lerCookies(req).psiq_token;
    const sessao = token && (await um("SELECT * FROM sessoes WHERE token = ?", [token]));
    if (!sessao) return res.status(401).json({ erro: "Não autenticado." });
    const u = await um("SELECT * FROM usuarios WHERE id = ?", [sessao.usuario_id]);
    if (!u) return res.status(401).json({ erro: "Usuário não existe mais." });
    req.usuario = u;
    req.token = token;
    next();
  } catch (e) { next(e); }
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

// util: envolve handler assíncrono e repassa erros
const roda = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// ---------- aplicação ----------
const app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1); // cookies Secure funcionam atrás de Nginx/Caddy/Render
app.use(express.json({ limit: "200kb" }));

// cabeçalhos de segurança básicos em todas as respostas
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
});

// --- autenticação ---
app.post("/api/entrar", limitaLogin, roda(async (req, res) => {
  const { usuario, senha } = req.body || {};
  const u = usuario && (await um("SELECT * FROM usuarios WHERE usuario = ?", [String(usuario).trim().toLowerCase()]));
  if (!u || !conferirSenha(String(senha || ""), u.senha_hash))
    return res.status(401).json({ erro: "Usuário ou senha incorretos." });
  await criarSessao(res, u.id, req);
  res.json(perfil(u));
}));

app.post("/api/sair", exigeSessao, roda(async (req, res) => {
  await bd.executa("DELETE FROM sessoes WHERE token = ?", [req.token]);
  res.setHeader("Set-Cookie", "psiq_token=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0");
  res.status(204).end();
}));

app.get("/api/eu", exigeSessao, (req, res) => res.json(perfil(req.usuario)));

app.post("/api/senha", exigeSessao, roda(async (req, res) => {
  const { atual, nova } = req.body || {};
  if (!conferirSenha(String(atual || ""), req.usuario.senha_hash))
    return res.status(400).json({ erro: "Senha atual incorreta." });
  if (!nova || String(nova).length < 6)
    return res.status(400).json({ erro: "A nova senha precisa ter ao menos 6 caracteres." });
  await bd.executa("UPDATE usuarios SET senha_hash = ? WHERE id = ?", [gerarHash(String(nova)), req.usuario.id]);
  res.status(204).end();
}));

// --- pacientes ---
app.get("/api/pacientes", exigeSessao, roda(async (req, res) => {
  const linhas = await bd.consulta("SELECT * FROM pacientes WHERE medico_id = ? ORDER BY nome", [req.usuario.medico_id]);
  res.json(linhas.map((p) => ({ ...p, medicamentos: JSON.parse(p.medicamentos || "[]") })));
}));

function validaPaciente(corpo) {
  if (!corpo || !String(corpo.nome || "").trim()) return "Informe o nome do paciente.";
  if (!String(corpo.cpf || "").trim()) return "Informe o CPF.";
  return null;
}

app.post("/api/pacientes", exigeSessao, roda(async (req, res) => {
  const erro = validaPaciente(req.body);
  if (erro) return res.status(400).json({ erro });
  const c = req.body;
  const id = uid();
  await bd.executa("INSERT INTO pacientes (id, medico_id, nome, cpf, rg, telefone, nascimento, medicamentos, obs) VALUES (?,?,?,?,?,?,?,?,?)",
    [id, req.usuario.medico_id, String(c.nome).trim(), String(c.cpf).trim(), String(c.rg || "").trim(),
      String(c.telefone || "").trim(), String(c.nascimento || ""), JSON.stringify(c.medicamentos || []), String(c.obs || "").trim()]);
  res.status(201).json({ id });
}));

app.put("/api/pacientes/:id", exigeSessao, roda(async (req, res) => {
  const erro = validaPaciente(req.body);
  if (erro) return res.status(400).json({ erro });
  const c = req.body;
  const r = await bd.executa("UPDATE pacientes SET nome=?, cpf=?, rg=?, telefone=?, nascimento=?, medicamentos=?, obs=? WHERE id=? AND medico_id=?",
    [String(c.nome).trim(), String(c.cpf).trim(), String(c.rg || "").trim(), String(c.telefone || "").trim(),
      String(c.nascimento || ""), JSON.stringify(c.medicamentos || []), String(c.obs || "").trim(),
      req.params.id, req.usuario.medico_id]);
  if (!r.changes) return res.status(404).json({ erro: "Paciente não encontrado." });
  res.status(204).end();
}));

app.delete("/api/pacientes/:id", exigeSessao, roda(async (req, res) => {
  const r = await bd.executa("DELETE FROM pacientes WHERE id=? AND medico_id=?", [req.params.id, req.usuario.medico_id]);
  if (!r.changes) return res.status(404).json({ erro: "Paciente não encontrado." });
  await bd.executa("DELETE FROM agenda WHERE paciente_id=? AND medico_id=?", [req.params.id, req.usuario.medico_id]);
  await bd.executa("DELETE FROM controlados WHERE paciente_id=? AND medico_id=?", [req.params.id, req.usuario.medico_id]);
  res.status(204).end();
}));

// --- agenda ---
app.get("/api/agenda", exigeSessao, roda(async (req, res) => {
  res.json(await bd.consulta("SELECT * FROM agenda WHERE medico_id = ? ORDER BY data, hora", [req.usuario.medico_id]));
}));

app.post("/api/agenda", exigeSessao, roda(async (req, res) => {
  const c = req.body || {};
  if (!c.pacienteId || !c.data || !c.hora)
    return res.status(400).json({ erro: "Paciente, data e hora são obrigatórios." });
  const dono = await um("SELECT 1 AS ok FROM pacientes WHERE id=? AND medico_id=?", [c.pacienteId, req.usuario.medico_id]);
  if (!dono) return res.status(400).json({ erro: "Paciente inválido." });
  const id = uid();
  await bd.executa("INSERT INTO agenda (id, medico_id, paciente_id, data, hora, tipo, status) VALUES (?,?,?,?,?,?, 'agendada')",
    [id, req.usuario.medico_id, c.pacienteId, String(c.data), String(c.hora), c.tipo === "Online" ? "Online" : "Presencial"]);
  res.status(201).json({ id });
}));

app.patch("/api/agenda/:id", exigeSessao, roda(async (req, res) => {
  const status = req.body && req.body.status === "concluida" ? "concluida" : "agendada";
  const r = await bd.executa("UPDATE agenda SET status=? WHERE id=? AND medico_id=?", [status, req.params.id, req.usuario.medico_id]);
  if (!r.changes) return res.status(404).json({ erro: "Consulta não encontrada." });
  res.status(204).end();
}));

app.delete("/api/agenda/:id", exigeSessao, roda(async (req, res) => {
  const r = await bd.executa("DELETE FROM agenda WHERE id=? AND medico_id=?", [req.params.id, req.usuario.medico_id]);
  if (!r.changes) return res.status(404).json({ erro: "Consulta não encontrada." });
  res.status(204).end();
}));

// --- remédios controlados ---
app.get("/api/controlados", exigeSessao, roda(async (req, res) => {
  res.json(await bd.consulta("SELECT * FROM controlados WHERE medico_id = ? ORDER BY data DESC", [req.usuario.medico_id]));
}));

app.post("/api/controlados", exigeSessao, roda(async (req, res) => {
  const c = req.body || {};
  if (!c.pacienteId || !c.medicamento || !c.numeracao || !c.data)
    return res.status(400).json({ erro: "Preencha paciente, medicamento, data e numeração." });
  const dono = await um("SELECT 1 AS ok FROM pacientes WHERE id=? AND medico_id=?", [c.pacienteId, req.usuario.medico_id]);
  if (!dono) return res.status(400).json({ erro: "Paciente inválido." });
  const id = uid();
  await bd.executa("INSERT INTO controlados (id, medico_id, paciente_id, medicamento, tipo, data, numeracao) VALUES (?,?,?,?,?,?,?)",
    [id, req.usuario.medico_id, c.pacienteId, String(c.medicamento).trim(),
      String(c.tipo || "C — Branca (controle especial)"), String(c.data), String(c.numeracao).trim()]);
  res.status(201).json({ id });
}));

app.delete("/api/controlados/:id", exigeSessao, roda(async (req, res) => {
  const r = await bd.executa("DELETE FROM controlados WHERE id=? AND medico_id=?", [req.params.id, req.usuario.medico_id]);
  if (!r.changes) return res.status(404).json({ erro: "Registro não encontrado." });
  res.status(204).end();
}));

// --- equipe (somente psiquiatras gerenciam) ---
function exigePsiquiatra(req, res, next) {
  if (req.usuario.papel !== "Psiquiatra")
    return res.status(403).json({ erro: "Apenas psiquiatras gerenciam a equipe." });
  next();
}

app.get("/api/equipe", exigeSessao, exigePsiquiatra, roda(async (req, res) => {
  res.json(await bd.consulta("SELECT id, usuario, nome, papel FROM usuarios WHERE medico_id = ? ORDER BY papel, nome", [req.usuario.medico_id]));
}));

app.post("/api/equipe", exigeSessao, exigePsiquiatra, roda(async (req, res) => {
  const { usuario, nome, senha } = req.body || {};
  const login = String(usuario || "").trim().toLowerCase();
  if (!/^[a-z0-9._-]{3,30}$/.test(login))
    return res.status(400).json({ erro: "Usuário: use 3–30 letras minúsculas, números, ponto, hífen." });
  if (!String(nome || "").trim()) return res.status(400).json({ erro: "Informe o nome." });
  if (!senha || String(senha).length < 6)
    return res.status(400).json({ erro: "A senha precisa ter ao menos 6 caracteres." });
  if (await um("SELECT 1 AS ok FROM usuarios WHERE usuario = ?", [login]))
    return res.status(409).json({ erro: "Este usuário já existe." });
  const id = uid();
  await bd.executa("INSERT INTO usuarios (id, usuario, senha_hash, nome, papel, medico_id, equipe) VALUES (?,?,?,?, 'Assistente', ?, ?)",
    [id, login, gerarHash(String(senha)), String(nome).trim(), req.usuario.medico_id, req.usuario.equipe]);
  res.status(201).json({ id });
}));

app.delete("/api/equipe/:id", exigeSessao, exigePsiquiatra, roda(async (req, res) => {
  const alvo = await um("SELECT * FROM usuarios WHERE id = ? AND medico_id = ?", [req.params.id, req.usuario.medico_id]);
  if (!alvo) return res.status(404).json({ erro: "Usuário não encontrado." });
  if (alvo.papel !== "Assistente") return res.status(400).json({ erro: "Só é possível remover assistentes." });
  await bd.executa("DELETE FROM usuarios WHERE id = ?", [alvo.id]);
  await bd.executa("DELETE FROM sessoes WHERE usuario_id = ?", [alvo.id]);
  res.status(204).end();
}));

// --- site público (arquivos estáticos) ---
app.use(express.static(__dirname, { extensions: ["html"] }));

// rota de API inexistente responde JSON; o resto cai na página 404
app.use("/api", (req, res) => res.status(404).json({ erro: "Rota não encontrada." }));
app.use((req, res) => res.status(404).sendFile(path.join(__dirname, "404.html")));

// tratador de erros: nunca vaza detalhes internos
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ erro: "Erro interno do servidor." });
});

// ---------- início ----------
let servidor;
iniciarBanco()
  .then(semear)
  .then(() => {
    servidor = app.listen(PORTA, () => {
      console.log(`Consultório no ar: http://localhost:${PORTA}`);
      console.log(`Área restrita:     http://localhost:${PORTA}/login.html`);
    });
  })
  .catch((e) => {
    console.error("Falha ao iniciar o banco:", e);
    process.exit(1);
  });

// desligamento limpo (Ctrl+C, docker stop, deploy)
for (const sinal of ["SIGINT", "SIGTERM"]) {
  process.on(sinal, () => {
    console.log("Encerrando...");
    if (!servidor) process.exit(0);
    servidor.close(() => {
      try { bd.fecha(); } catch {}
      process.exit(0);
    });
  });
}
