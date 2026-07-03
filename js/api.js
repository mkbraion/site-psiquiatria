// ============================================================
// Camada de dados do painel — dois modos, detectados sozinhos:
//
//  • "servidor": conversa com a API real (server.js — Node + SQLite,
//    sessão em cookie HttpOnly, senhas criptografadas no banco)
//  • "demo": sem servidor (ex.: GitHub Pages) — simulação em
//    localStorage, apenas para demonstração
// ============================================================

// ---------- modo demo (fallback) ----------
const Demo = (() => {
  const USUARIOS_BASE = [
    { usuario: "alessandra", senha: "demo123", nome: "Dra. Alessandra Menezes", papel: "Psiquiatra", medicoId: "alessandra", equipe: "Consultório Dra. Alessandra" },
    { usuario: "carla", senha: "demo123", nome: "Carla Souza", papel: "Assistente", medicoId: "alessandra", equipe: "Consultório Dra. Alessandra" },
    { usuario: "ricardo", senha: "demo123", nome: "Dr. Ricardo Fontes", papel: "Psiquiatra", medicoId: "ricardo", equipe: "Consultório Dr. Ricardo" },
  ];
  const ler = (chave, padrao) => {
    try { return JSON.parse(localStorage.getItem(chave)) ?? padrao; } catch { return padrao; }
  };
  const gravar = (chave, valor) => localStorage.setItem(chave, JSON.stringify(valor));
  const uid = () => (crypto.randomUUID ? crypto.randomUUID() : "id-" + Date.now() + "-" + Math.random().toString(36).slice(2));
  const dataRel = (dias) => { const t = new Date(); t.setDate(t.getDate() + dias); return t.toISOString().slice(0, 10); };

  function dadosIniciais() {
    return {
      pacientes: [
        { id: "p1", medicoId: "alessandra", nome: "João Pereira da Silva", cpf: "987.654.321-00", rg: "1098765432", telefone: "(55) 99123-4567", nascimento: "1989-03-14", medicamentos: [{ nome: "Sertralina", dose: "50 mg — 1x ao dia", controlado: false }, { nome: "Clonazepam", dose: "0,5 mg — à noite", controlado: true }], obs: "Transtorno de ansiedade generalizada. Retorno em 30 dias." },
        { id: "p2", medicoId: "alessandra", nome: "Maria Fernanda Costa", cpf: "123.456.789-09", rg: "2087654321", telefone: "(55) 98765-1234", nascimento: "1996-11-02", medicamentos: [{ nome: "Venlafaxina", dose: "75 mg — 1x pela manhã", controlado: false }], obs: "Depressão moderada, em melhora progressiva." },
        { id: "p3", medicoId: "alessandra", nome: "Carlos Eduardo Ramos", cpf: "111.444.777-35", rg: "3076543210", telefone: "(55) 99888-7766", nascimento: "1978-07-25", medicamentos: [{ nome: "Metilfenidato", dose: "10 mg — 2x ao dia", controlado: true }], obs: "TDAH em adulto, diagnóstico confirmado em 2024." },
        { id: "p4", medicoId: "ricardo", nome: "Ana Beatriz Lopes", cpf: "222.333.444-05", rg: "4065432109", telefone: "(55) 99777-2211", nascimento: "2001-01-19", medicamentos: [{ nome: "Escitalopram", dose: "10 mg — 1x ao dia", controlado: false }], obs: "" },
      ],
      agenda: [
        { id: "a1", medicoId: "alessandra", pacienteId: "p1", data: dataRel(1), hora: "09:00", tipo: "Presencial", status: "agendada" },
        { id: "a2", medicoId: "alessandra", pacienteId: "p2", data: dataRel(1), hora: "14:30", tipo: "Online", status: "agendada" },
        { id: "a3", medicoId: "alessandra", pacienteId: "p3", data: dataRel(3), hora: "10:00", tipo: "Presencial", status: "agendada" },
        { id: "a4", medicoId: "ricardo", pacienteId: "p4", data: dataRel(2), hora: "11:00", tipo: "Online", status: "agendada" },
      ],
      controlados: [
        { id: "c1", medicoId: "alessandra", pacienteId: "p1", medicamento: "Clonazepam 0,5 mg", tipo: "B — Azul (psicotrópicos)", data: dataRel(-7), numeracao: "B2-0045871" },
        { id: "c2", medicoId: "alessandra", pacienteId: "p3", medicamento: "Metilfenidato 10 mg", tipo: "A — Amarela (entorpecentes)", data: dataRel(-3), numeracao: "A-0098234" },
      ],
    };
  }

  function dados() {
    let d = ler("psiq_dados_v1", null);
    if (!d || !d.pacientes) { d = dadosIniciais(); gravar("psiq_dados_v1", d); }
    return d;
  }
  const salvar = (d) => gravar("psiq_dados_v1", d);
  const todosUsuarios = () => USUARIOS_BASE.concat(ler("psiq_usuarios_extra", []));
  const senhaDe = (u) => ler("psiq_senhas", {})[u.usuario] ?? u.senha;
  const sessao = () => { try { return JSON.parse(sessionStorage.getItem("psiq_sessao")); } catch { return null; } };
  const perfil = (u) => ({ id: u.usuario, usuario: u.usuario, nome: u.nome, papel: u.papel, medicoId: u.medicoId, equipe: u.equipe });

  return {
    eu: () => sessao(),
    entrar(usuario, senha) {
      const u = todosUsuarios().find((x) => x.usuario === String(usuario).trim().toLowerCase());
      if (!u || senhaDe(u) !== senha) throw new Error("Usuário ou senha incorretos.");
      const p = perfil(u);
      sessionStorage.setItem("psiq_sessao", JSON.stringify(p));
      return p;
    },
    sair() { sessionStorage.removeItem("psiq_sessao"); },
    listar(recurso) {
      const s = sessao();
      return dados()[recurso].filter((x) => x.medicoId === s.medicoId);
    },
    criar(recurso, obj) {
      const s = sessao(); const d = dados();
      const novo = { ...obj, id: uid(), medicoId: s.medicoId };
      d[recurso].push(novo); salvar(d); return { id: novo.id };
    },
    atualizar(recurso, id, obj) {
      const s = sessao(); const d = dados();
      const i = d[recurso].findIndex((x) => x.id === id && x.medicoId === s.medicoId);
      if (i < 0) throw new Error("Registro não encontrado.");
      d[recurso][i] = { ...d[recurso][i], ...obj, id, medicoId: s.medicoId };
      salvar(d);
    },
    remover(recurso, id) {
      const s = sessao(); const d = dados();
      d[recurso] = d[recurso].filter((x) => !(x.id === id && x.medicoId === s.medicoId));
      if (recurso === "pacientes") {
        d.agenda = d.agenda.filter((x) => x.pacienteId !== id);
        d.controlados = d.controlados.filter((x) => x.pacienteId !== id);
      }
      salvar(d);
    },
    listarEquipe() {
      const s = sessao();
      return todosUsuarios().filter((u) => u.medicoId === s.medicoId)
        .map((u) => ({ id: u.usuario, usuario: u.usuario, nome: u.nome, papel: u.papel }));
    },
    criarAssistente({ usuario, nome, senha }) {
      const login = String(usuario || "").trim().toLowerCase();
      if (!/^[a-z0-9._-]{3,30}$/.test(login)) throw new Error("Usuário inválido (3–30 caracteres, minúsculos).");
      if (!nome || !senha || senha.length < 6) throw new Error("Preencha nome e senha (mín. 6 caracteres).");
      if (todosUsuarios().some((u) => u.usuario === login)) throw new Error("Este usuário já existe.");
      const s = sessao();
      const extras = ler("psiq_usuarios_extra", []);
      extras.push({ usuario: login, senha, nome, papel: "Assistente", medicoId: s.medicoId, equipe: s.equipe });
      gravar("psiq_usuarios_extra", extras);
    },
    removerUsuario(id) {
      const extras = ler("psiq_usuarios_extra", []);
      if (!extras.some((u) => u.usuario === id)) throw new Error("As contas de demonstração não podem ser removidas.");
      gravar("psiq_usuarios_extra", extras.filter((u) => u.usuario !== id));
    },
    trocarSenha(atual, nova) {
      const s = sessao();
      const u = todosUsuarios().find((x) => x.usuario === s.usuario);
      if (senhaDe(u) !== atual) throw new Error("Senha atual incorreta.");
      if (!nova || nova.length < 6) throw new Error("A nova senha precisa ter ao menos 6 caracteres.");
      const senhas = ler("psiq_senhas", {});
      senhas[s.usuario] = nova;
      gravar("psiq_senhas", senhas);
    },
  };
})();

// ---------- API unificada ----------
const Api = {
  modo: null, // "servidor" | "demo"

  async _req(metodo, caminho, corpo) {
    const r = await fetch(caminho, {
      method: metodo,
      headers: corpo ? { "Content-Type": "application/json" } : undefined,
      body: corpo ? JSON.stringify(corpo) : undefined,
    });
    if (!r.ok) {
      let msg = "Erro ao comunicar com o servidor.";
      try { msg = (await r.json()).erro || msg; } catch {}
      throw new Error(msg);
    }
    return r.status === 204 ? null : r.json();
  },

  // Detecta o modo e devolve a sessão atual (ou null)
  async init() {
    try {
      const r = await fetch("api/eu");
      if (r.status === 404) { this.modo = "demo"; return Demo.eu(); }
      this.modo = "servidor";
      return r.ok ? await r.json() : null;
    } catch {
      this.modo = "demo";
      return Demo.eu();
    }
  },

  async entrar(usuario, senha) {
    if (this.modo === "demo") return Demo.entrar(usuario, senha);
    return this._req("POST", "api/entrar", { usuario, senha });
  },
  async sair() {
    if (this.modo === "demo") return Demo.sair();
    return this._req("POST", "api/sair");
  },

  // normaliza as linhas do servidor para o formato usado na tela
  _normaliza(recurso, linha) {
    if (this.modo === "demo") return linha;
    const { medico_id, paciente_id, ...resto } = linha;
    return paciente_id !== undefined ? { ...resto, pacienteId: paciente_id } : resto;
  },
  async listar(recurso) {
    if (this.modo === "demo") return Demo.listar(recurso);
    const linhas = await this._req("GET", "api/" + recurso);
    return linhas.map((l) => this._normaliza(recurso, l));
  },
  async criar(recurso, obj) {
    if (this.modo === "demo") return Demo.criar(recurso, obj);
    return this._req("POST", "api/" + recurso, obj);
  },
  async atualizar(recurso, id, obj) {
    if (this.modo === "demo") return Demo.atualizar(recurso, id, obj);
    const metodo = recurso === "agenda" ? "PATCH" : "PUT";
    return this._req(metodo, `api/${recurso}/${id}`, obj);
  },
  async remover(recurso, id) {
    if (this.modo === "demo") return Demo.remover(recurso, id);
    return this._req("DELETE", `api/${recurso}/${id}`);
  },

  async listarEquipe() {
    if (this.modo === "demo") return Demo.listarEquipe();
    return this._req("GET", "api/equipe");
  },
  async criarAssistente(obj) {
    if (this.modo === "demo") return Demo.criarAssistente(obj);
    return this._req("POST", "api/equipe", obj);
  },
  async removerUsuario(id) {
    if (this.modo === "demo") return Demo.removerUsuario(id);
    return this._req("DELETE", "api/equipe/" + id);
  },
  async trocarSenha(atual, nova) {
    if (this.modo === "demo") return Demo.trocarSenha(atual, nova);
    return this._req("POST", "api/senha", { atual, nova });
  },
};
