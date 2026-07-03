// ============================================================
// Painel da equipe — consome a camada Api (servidor real ou demo).
// Todo dado exibido já vem filtrado pelo consultório do usuário:
// no modo servidor, o filtro é imposto pelo backend (SQLite).
// ============================================================

const $ = (s) => document.querySelector(s);
const esc = (t) =>
  String(t ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );

function idade(nascimento) {
  if (!nascimento) return "—";
  const n = new Date(nascimento + "T12:00:00");
  const h = new Date();
  let i = h.getFullYear() - n.getFullYear();
  const m = h.getMonth() - n.getMonth();
  if (m < 0 || (m === 0 && h.getDate() < n.getDate())) i--;
  return i;
}
const fData = (iso) => (iso ? new Date(iso + "T12:00:00").toLocaleDateString("pt-BR") : "—");
const dataRelativa = (dias) => {
  const t = new Date();
  t.setDate(t.getDate() + dias);
  return t.toISOString().slice(0, 10);
};
const fechar = (id) => document.getElementById(id).close();

let sessao = null;
let cachePacientes = [];
const pacientePorId = (id) => cachePacientes.find((p) => p.id === id);

// ---------- inicialização ----------
async function iniciar() {
  sessao = await Api.init();
  if (!sessao) {
    window.location.replace("login.html");
    return;
  }

  // topo
  $("#usuario-nome").textContent = sessao.nome;
  $("#usuario-papel").textContent = sessao.papel + " · " + sessao.equipe;
  $("#avatar").textContent = sessao.nome
    .replace(/^Dra?\.\s*/i, "").split(" ").filter(Boolean)
    .map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  // banner conforme o modo
  const banner = $("#banner-modo");
  if (Api.modo === "servidor") {
    banner.className = "aviso-servidor";
    banner.innerHTML = "✅ <strong>Conectado ao servidor.</strong> Os dados são salvos no banco de dados do consultório, com login verificado e acesso restrito à sua equipe.";
  } else {
    banner.className = "aviso-demo";
    banner.innerHTML = "⚠️ <strong>Modo demonstração (sem servidor).</strong> Dados fictícios salvos apenas neste navegador. Não insira dados reais de pacientes.";
  }

  // aba de equipe: apenas psiquiatras
  if (sessao.papel === "Psiquiatra") $("#btn-aba-equipe").hidden = false;

  await atualizarTudo();
}

async function atualizarTudo() {
  cachePacientes = await Api.listar("pacientes");
  renderPacientes();
  await Promise.all([renderAgenda(), renderControlados()]);
  if (sessao.papel === "Psiquiatra") await renderEquipe();
}

// ---------- abas ----------
document.querySelectorAll(".aba-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".aba-btn").forEach((b) => b.classList.remove("ativa"));
    document.querySelectorAll(".aba-secao").forEach((s) => s.classList.remove("ativa"));
    btn.classList.add("ativa");
    $("#aba-" + btn.dataset.aba).classList.add("ativa");
  });
});

async function sairDoPainel() {
  try { await Api.sair(); } catch {}
  window.location.href = "login.html";
}

// ============================================================
// AGENDA
// ============================================================
async function renderAgenda() {
  const agenda = (await Api.listar("agenda")).sort((a, b) =>
    (a.data + a.hora).localeCompare(b.data + b.hora)
  );
  const hoje = new Date().toISOString().slice(0, 10);
  const deHoje = agenda.filter((i) => i.data === hoje && i.status === "agendada").length;
  const futuras = agenda.filter((i) => i.data >= hoje && i.status === "agendada").length;

  $("#resumo-agenda").innerHTML = `
    <div class="resumo-card"><span class="num">${deHoje}</span><span class="rotulo">consultas hoje</span></div>
    <div class="resumo-card"><span class="num">${futuras}</span><span class="rotulo">consultas futuras</span></div>
    <div class="resumo-card"><span class="num">${cachePacientes.length}</span><span class="rotulo">pacientes ativos</span></div>`;

  const corpo = $("#lista-agenda");
  if (!agenda.length) {
    corpo.innerHTML = `<tr><td colspan="6" class="vazio">Nenhuma consulta agendada. Clique em “+ Nova consulta”.</td></tr>`;
    return;
  }
  corpo.innerHTML = agenda
    .map((i) => {
      const p = pacientePorId(i.pacienteId);
      const chipTipo = i.tipo === "Online" ? "chip-online" : "chip-presencial";
      const chipStatus = i.status === "concluida"
        ? `<span class="chip chip-concluida">concluída</span>`
        : `<span class="chip chip-comum">agendada</span>`;
      return `<tr>
        <td>${fData(i.data)}</td>
        <td>${esc(i.hora)}</td>
        <td>${esc(p ? p.nome : "—")}</td>
        <td><span class="chip ${chipTipo}">${esc(i.tipo)}</span></td>
        <td>${chipStatus}</td>
        <td><div class="acoes-linha">
          <button class="btn-mini" onclick="alternarStatus('${i.id}','${i.status}')">${i.status === "concluida" ? "Reabrir" : "Concluir"}</button>
          <button class="btn-mini perigo" onclick="excluirConsulta('${i.id}')">Excluir</button>
        </div></td>
      </tr>`;
    })
    .join("");
}

function abrirNovaConsulta() {
  const sel = $("#select-paciente-agenda");
  sel.innerHTML = cachePacientes
    .map((p) => `<option value="${p.id}">${esc(p.nome)}</option>`)
    .join("");
  if (!sel.innerHTML) return alert("Cadastre um paciente primeiro, na aba Pacientes.");
  $("#form-consulta").reset();
  $("#form-consulta").elements.data.value = dataRelativa(1);
  $("#modal-consulta").showModal();
}

$("#form-consulta").addEventListener("submit", async () => {
  const f = new FormData($("#form-consulta"));
  try {
    await Api.criar("agenda", {
      pacienteId: f.get("pacienteId"),
      data: f.get("data"),
      hora: f.get("hora"),
      tipo: f.get("tipo"),
      status: "agendada",
    });
    await renderAgenda();
  } catch (e) { alert(e.message); }
});

async function alternarStatus(id, statusAtual) {
  try {
    await Api.atualizar("agenda", id, { status: statusAtual === "concluida" ? "agendada" : "concluida" });
    await renderAgenda();
  } catch (e) { alert(e.message); }
}
async function excluirConsulta(id) {
  if (!confirm("Excluir esta consulta?")) return;
  try { await Api.remover("agenda", id); await renderAgenda(); } catch (e) { alert(e.message); }
}

// ============================================================
// PACIENTES
// ============================================================
function renderPacientes() {
  const corpo = $("#lista-pacientes");
  const itens = [...cachePacientes].sort((a, b) => a.nome.localeCompare(b.nome));
  if (!itens.length) {
    corpo.innerHTML = `<tr><td colspan="6" class="vazio">Nenhum paciente cadastrado ainda.</td></tr>`;
    return;
  }
  corpo.innerHTML = itens
    .map((p) => {
      const meds = (p.medicamentos || [])
        .map((m) => `<span class="chip ${m.controlado ? "chip-controlado" : "chip-comum"}">${esc(m.nome)}${m.controlado ? " ⚠" : ""}</span>`)
        .join(" ") || "<span class='texto-suave'>nenhum</span>";
      return `<tr>
        <td><strong>${esc(p.nome)}</strong></td>
        <td>${idade(p.nascimento)} anos</td>
        <td>${esc(p.cpf)}</td>
        <td>${esc(p.telefone)}</td>
        <td>${meds}</td>
        <td><div class="acoes-linha">
          <button class="btn-mini" onclick="verFicha('${p.id}')">Ficha</button>
          <button class="btn-mini" onclick="editarPaciente('${p.id}')">Editar</button>
          <button class="btn-mini perigo" onclick="excluirPaciente('${p.id}')">Excluir</button>
        </div></td>
      </tr>`;
    })
    .join("");
}

function adicionarLinhaMed(med) {
  const linha = document.createElement("div");
  linha.className = "med-linha";
  linha.innerHTML = `
    <input type="text" placeholder="Medicamento" class="med-nome" value="${esc(med?.nome || "")}">
    <input type="text" placeholder="Dose / posologia" class="med-dose" value="${esc(med?.dose || "")}">
    <label class="ctrl"><input type="checkbox" class="med-ctrl" ${med?.controlado ? "checked" : ""}> controlado</label>
    <button type="button" class="med-remove" title="Remover" onclick="this.parentElement.remove()">✕</button>`;
  $("#meds-container").appendChild(linha);
}

function abrirNovoPaciente() {
  $("#modal-paciente-titulo").textContent = "Novo paciente";
  $("#form-paciente").reset();
  $("#form-paciente").elements.id.value = "";
  $("#meds-container").innerHTML = "";
  adicionarLinhaMed();
  $("#modal-paciente").showModal();
}

function editarPaciente(id) {
  const p = pacientePorId(id);
  if (!p) return;
  $("#modal-paciente-titulo").textContent = "Editar paciente";
  const f = $("#form-paciente");
  f.reset();
  f.elements.id.value = p.id;
  f.elements.nome.value = p.nome;
  f.elements.cpf.value = p.cpf;
  f.elements.rg.value = p.rg || "";
  f.elements.telefone.value = p.telefone || "";
  f.elements.nascimento.value = p.nascimento || "";
  f.elements.obs.value = p.obs || "";
  $("#meds-container").innerHTML = "";
  (p.medicamentos || []).forEach(adicionarLinhaMed);
  if (!(p.medicamentos || []).length) adicionarLinhaMed();
  $("#modal-paciente").showModal();
}

$("#form-paciente").addEventListener("submit", async () => {
  const f = $("#form-paciente");
  const medicamentos = Array.from($("#meds-container").querySelectorAll(".med-linha"))
    .map((l) => ({
      nome: l.querySelector(".med-nome").value.trim(),
      dose: l.querySelector(".med-dose").value.trim(),
      controlado: l.querySelector(".med-ctrl").checked,
    }))
    .filter((m) => m.nome);
  const registro = {
    nome: f.elements.nome.value.trim(),
    cpf: f.elements.cpf.value.trim(),
    rg: f.elements.rg.value.trim(),
    telefone: f.elements.telefone.value.trim(),
    nascimento: f.elements.nascimento.value,
    medicamentos,
    obs: f.elements.obs.value.trim(),
  };
  try {
    const id = f.elements.id.value;
    if (id) await Api.atualizar("pacientes", id, registro);
    else await Api.criar("pacientes", registro);
    await atualizarTudo();
  } catch (e) { alert(e.message); }
});

function verFicha(id) {
  const p = pacientePorId(id);
  if (!p) return;
  const rotulo = (t) => `<span class="rotulo">${t}</span>`;
  const meds = (p.medicamentos || [])
    .map((m) =>
      `<li>${m.controlado ? "⚠️" : "💊"} <strong>${esc(m.nome)}</strong> — ${esc(m.dose || "dose não informada")}
       ${m.controlado ? '<span class="chip chip-controlado">controlado</span>' : ""}</li>`
    )
    .join("") || "<li class='texto-suave'>Nenhum medicamento em uso.</li>";
  $("#ficha-conteudo").innerHTML = `
    <h3>${esc(p.nome)}</h3>
    <div class="ficha-grid">
      <div>${rotulo("Idade")}${idade(p.nascimento)} anos</div>
      <div>${rotulo("Nascimento")}${fData(p.nascimento)}</div>
      <div>${rotulo("CPF")}${esc(p.cpf)}</div>
      <div>${rotulo("RG")}${esc(p.rg || "—")}</div>
      <div>${rotulo("Telefone")}${esc(p.telefone || "—")}</div>
      <div>${rotulo("Responsável")}${esc(sessao.equipe)}</div>
    </div>
    <p class="rotulo" style="margin-bottom:6px">Medicamentos em uso</p>
    <ul class="ficha-meds">${meds}</ul>
    ${p.obs ? `<p style="margin-top:14px">${rotulo("Observações")}${esc(p.obs)}</p>` : ""}
    <div class="modal-acoes"><button class="btn" onclick="fechar('modal-ficha')">Fechar</button></div>`;
  $("#modal-ficha").showModal();
}

async function excluirPaciente(id) {
  const p = pacientePorId(id);
  if (!p || !confirm(`Excluir o paciente "${p.nome}" e todos os registros ligados a ele?`)) return;
  try { await Api.remover("pacientes", id); await atualizarTudo(); } catch (e) { alert(e.message); }
}

// ============================================================
// REMÉDIOS CONTROLADOS
// ============================================================
async function renderControlados() {
  const itens = (await Api.listar("controlados")).sort((a, b) => b.data.localeCompare(a.data));
  const emUso = cachePacientes.filter((p) => (p.medicamentos || []).some((m) => m.controlado)).length;

  $("#resumo-controlados").innerHTML = `
    <div class="resumo-card"><span class="num">${itens.length}</span><span class="rotulo">receitas registradas</span></div>
    <div class="resumo-card"><span class="num">${emUso}</span><span class="rotulo">pacientes em uso de controlados</span></div>`;

  const corpo = $("#lista-controlados");
  if (!itens.length) {
    corpo.innerHTML = `<tr><td colspan="6" class="vazio">Nenhuma receita de controlado registrada.</td></tr>`;
    return;
  }
  corpo.innerHTML = itens
    .map((c) => {
      const p = pacientePorId(c.pacienteId);
      return `<tr>
        <td><strong>${esc(c.numeracao)}</strong></td>
        <td>${esc(c.medicamento)}</td>
        <td><span class="chip chip-controlado">${esc(c.tipo)}</span></td>
        <td>${esc(p ? p.nome : "—")}</td>
        <td>${fData(c.data)}</td>
        <td><button class="btn-mini perigo" onclick="excluirReceita('${c.id}')">Excluir</button></td>
      </tr>`;
    })
    .join("");
}

function abrirNovaReceita() {
  const sel = $("#select-paciente-receita");
  sel.innerHTML = cachePacientes
    .map((p) => `<option value="${p.id}">${esc(p.nome)}</option>`)
    .join("");
  if (!sel.innerHTML) return alert("Cadastre um paciente primeiro, na aba Pacientes.");
  $("#form-receita").reset();
  $("#form-receita").elements.data.value = dataRelativa(0);
  $("#modal-receita").showModal();
}

$("#form-receita").addEventListener("submit", async () => {
  const f = new FormData($("#form-receita"));
  try {
    await Api.criar("controlados", {
      pacienteId: f.get("pacienteId"),
      medicamento: f.get("medicamento").trim(),
      tipo: f.get("tipo"),
      data: f.get("data"),
      numeracao: f.get("numeracao").trim(),
    });
    await renderControlados();
  } catch (e) { alert(e.message); }
});

async function excluirReceita(id) {
  if (!confirm("Excluir este registro de receita?")) return;
  try { await Api.remover("controlados", id); await renderControlados(); } catch (e) { alert(e.message); }
}

// ============================================================
// EQUIPE (visível apenas para psiquiatras)
// ============================================================
async function renderEquipe() {
  let equipe;
  try { equipe = await Api.listarEquipe(); } catch { return; }
  const corpo = $("#lista-equipe");
  corpo.innerHTML = equipe
    .map((u) => `<tr>
      <td><strong>${esc(u.usuario)}</strong></td>
      <td>${esc(u.nome)}</td>
      <td><span class="chip ${u.papel === "Psiquiatra" ? "chip-comum" : "chip-online"}">${esc(u.papel)}</span></td>
      <td>${u.papel === "Assistente"
        ? `<button class="btn-mini perigo" onclick="removerMembro('${u.id}','${esc(u.usuario)}')">Remover</button>`
        : "<span class='texto-suave'>—</span>"}</td>
    </tr>`)
    .join("");
}

function abrirNovoAssistente() {
  $("#form-assistente").reset();
  $("#modal-assistente").showModal();
}

$("#form-assistente")?.addEventListener("submit", async () => {
  const f = new FormData($("#form-assistente"));
  try {
    await Api.criarAssistente({
      usuario: f.get("usuario"),
      nome: f.get("nome"),
      senha: f.get("senha"),
    });
    await renderEquipe();
  } catch (e) { alert(e.message); }
});

async function removerMembro(id, usuario) {
  if (!confirm(`Remover o acesso de "${usuario}"?`)) return;
  try { await Api.removerUsuario(id); await renderEquipe(); } catch (e) { alert(e.message); }
}

// ---------- trocar a própria senha (todos os papéis) ----------
function abrirTrocaSenha() {
  $("#form-senha").reset();
  $("#modal-senha").showModal();
}

$("#form-senha").addEventListener("submit", async () => {
  const f = new FormData($("#form-senha"));
  try {
    await Api.trocarSenha(f.get("atual"), f.get("nova"));
    alert("Senha alterada com sucesso.");
  } catch (e) { alert(e.message); }
});

iniciar();
