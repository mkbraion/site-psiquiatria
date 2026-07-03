// ============================================================
// Autenticação de DEMONSTRAÇÃO — front-end apenas.
// Em um sistema real, login e dados de pacientes ficam em um
// servidor com senha criptografada, HTTPS e controle de acesso.
// Nunca use este modelo com dados reais (LGPD — dados sensíveis).
// ============================================================

const USUARIOS_DEMO = [
  {
    usuario: "alessandra",
    senha: "demo123",
    nome: "Dra. Alessandra Menezes",
    papel: "Psiquiatra",
    medicoId: "alessandra",
    equipe: "Consultório Dra. Alessandra",
  },
  {
    usuario: "carla",
    senha: "demo123",
    nome: "Carla Souza",
    papel: "Assistente",
    medicoId: "alessandra",
    equipe: "Consultório Dra. Alessandra",
  },
  {
    usuario: "ricardo",
    senha: "demo123",
    nome: "Dr. Ricardo Fontes",
    papel: "Psiquiatra",
    medicoId: "ricardo",
    equipe: "Consultório Dr. Ricardo",
  },
];

const CHAVE_SESSAO = "psiq_sessao";

function sessaoAtual() {
  try {
    return JSON.parse(sessionStorage.getItem(CHAVE_SESSAO));
  } catch {
    return null;
  }
}

function entrar(usuario, senha) {
  const u = USUARIOS_DEMO.find(
    (x) => x.usuario === usuario.trim().toLowerCase() && x.senha === senha
  );
  if (!u) return null;
  const sessao = {
    usuario: u.usuario,
    nome: u.nome,
    papel: u.papel,
    medicoId: u.medicoId,
    equipe: u.equipe,
  };
  sessionStorage.setItem(CHAVE_SESSAO, JSON.stringify(sessao));
  return sessao;
}

function sair() {
  sessionStorage.removeItem(CHAVE_SESSAO);
  window.location.href = "login.html";
}

// Usado pelo painel: se não há sessão, volta para o login
function exigeLogin() {
  const s = sessaoAtual();
  if (!s) window.location.replace("login.html");
  return s;
}
