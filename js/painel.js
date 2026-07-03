// ============================================================
// Painel da equipe — DEMONSTRAÇÃO (dados fictícios em localStorage)
// Cada registro pertence a um "medicoId": psiquiatras e assistentes
// só enxergam os dados do próprio consultório.
// ============================================================

const sessao = exigeLogin();
if (!sessao) throw new Error("sem sessão");

const CHAVE_DADOS = "psiq_dados_v1";

// ---------- utilidades ----------
const $ = (s) => document.querySelector(s);
const esc = (t) =>
  String(t ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
const uid = () =>
  crypto.randomUUID ? crypto.randomUUID() : "id-" + Date.now() + "-" + Math.random().toString(36).slice(2);

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

// ---------- dados iniciais (fictícios) ----------
function dadosIniciais() {
  return {
    pacientes: [
      {
        id: "p1", medicoId: "alessandra", nome: "João Pereira da Silva",
        cpf: "987.654.321-00", rg: "1098765432", telefone: "(55) 99123-4567",
        nascimento: "1989-03-14",
        medicamentos: [
          { nome: "Sertralina", dose: "50 mg — 1x ao dia", controlado: false },
          { nome: "Clonazepam", dose: "0,5 mg — à noite", controlado: true },
        ],
        obs: "Transtorno de ansiedade generalizada. Retorno em 30 dias.",
      },
      {
        id: "p2", medicoId: "alessandra", nome: "Maria Fernanda Costa",
        cpf: "123.456.789-09", rg: "2087654321", telefone: "(55) 98765-1234",
        nascimento: "1996-11-02",
        medicamentos: [{ nome: "Venlafaxina", dose: "75 mg — 1x pela manhã", controlado: false }],
        obs: "Depressão moderada, em melhora progressiva.",
      },
      {
        id: "p3", medicoId: "alessandra", nome: "Carlos Eduardo Ramos",
        cpf: "111.444.777-35", rg: "3076543210", telefone: "(55) 99888-7766",
        nascimento: "1978-07-25",
        medicamentos: [{ nome: "Metilfenidato", dose: "10 mg — 2x ao dia", controlado: true }],
        obs: "TDAH em adulto, diagnóstico confirmado em 2024.",
      },
      {
        id: "p4", medicoId: "ricardo", nome: "Ana Beatriz Lopes",
        cpf: "222.333.444-05", rg: "4065432109", telefone: "(55) 99777-2211",
        nascimento: "2001-01-19",
        medicamentos: [{ nome: "Escitalopram", dose: "10 mg — 1x ao dia", controlado: false }],
        obs: "",
      },
    ],
    agenda: [
      { id: "a1", medicoId: "alessandra", data: dataRelativa(1), hora: "09:00", pacienteId: "p1", tipo: "Presencial", status: "agendada" },
      { id: "a2", medicoId: "alessandra", data: dataRelativa(1), hora: "14:30", pacienteId: "p2", tipo: "Online", status: "agendada" },
      { id: "a3", medicoId: "alessandra", data: dataRelativa(3), hora: "10:00", pacienteId: "p3", tipo: "Presencial", status: "agendada" },
      { id: "a4", medicoId: "ricardo", data: dataRelativa(2), hora: "11:00", pacienteId: "p4", tipo: "Online", status: "agendada" },
    ],
    controlados: [
      { id: "c1", medicoId: "alessandra", medicamento: "Clonazepam 0,5 mg", tipo: "B — Azul (psicotrópicos)", pacienteId: "p1", data: dataRelativa(-7), numeracao: "B2-0045871" },
      { id: "c2", medicoId: "alessandra", medicamento: "Metilfenidato 10 mg", tipo: "A — Amarela (entorpecentes)", pacienteId: "p3", data: dataRelativa(-3), numeracao: "A-0098234" },
    ],
  };
}

function carregarDados() {
  let d = null;
  try { d = JSON.parse(localStorage.getItem(CHAVE_DADOS)); } catch {}
  if (!d || !d.pacientes) {
    d = dadosIniciais();
    localStorage.setItem(CHAVE_DADOS, JSON.stringify(d));
  }
  return d;
}
let dados = carregarDados();
const salvarDados = () => localStorage.setItem(CHAVE_DADOS, JSON.stringify(dados));

// escopo: só o que pertence ao consultório do usuário logado
const meus = (lista) => lista.filter((x) => x.medicoId === sessao.medicoId);
const pacientePorId = (id) => dados.pacientes.find((p) => p.id === id);

// ---------- topo: usuário logado ----------
$("#usuario-nome").textContent = sessao.nome;
$("#usuario-papel").textContent = sessao.papel + " · " + sessao.equipe;
$("#avatar").textContent = sessao.nome
  .replace(/^Dra?\.\s*/i, "")
  .split(" ")
  .filter(Boolean)
  .map((p) => p[0])
  .slice(0, 2)
  .join("")
  .toUpperCase();

// ---------- abas ----------
document.querySelectorAll(".aba-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".aba-btn").forEach((b) => b.classList.remove("ativa"));
    document.querySelectorAll(".aba-secao").forEach((s) => s.classList.remove("ativa"));
    btn.classList.add("ativa");
    $("#aba-" + btn.dataset.aba).classList.add("ativa");
  });
});

const fechar = (id) => document.getElementById(id).close();

// ============================================================
// AGENDA
// ============================================================
function renderAgenda() {
  const itens = meus(dados.agenda).sort((a, b) =>
    (a.data + a.hora).localeCompare(b.data + b.hora)
  );
  const hoje = new Date().toISOString().slice(0, 10);
  const deHoje = itens.filter((i) => i.data === hoje && i.status === "agendada").length;
  const futuras = itens.filter((i) => i.data >= hoje && i.status === "agendada").length;

  $("#resumo-agenda").innerHTML = `
    <div class="resumo-card"><span class="num">${deHoje}</span><span class="rotulo">consultas hoje</span></div>
    <div class="resumo-card"><span class="num">${futuras}</span><span class="rotulo">consultas futuras</span></div>
    <div class="resumo-card"><span class="num">${meus(dados.pacientes).length}</span><span class="rotulo">pacientes ativos</span></div>`;

  const corpo = $("#lista-agenda");
  if (!itens.length) {
    corpo.innerHTML = `<tr><td colspan="6" class="vazio">Nenhuma consulta agendada. Clique em “+ Nova consulta”.</td></tr>`;
    return;
  }
  corpo.innerHTML = itens
    .map((i) => {
      const p = pacientePorId(i.pacienteId);
      const chipTipo = i.tipo === "Online" ? "chip-online" : "chip-presencial";
      const chipStatus = i.status === "concluida" ? `<span class="chip chip-concluida">concluída</span>` : `<span class="chip chip-comum">agendada</span>`;
      return `<tr>
        <td>${fData(i.data)}</td>
        <td>${esc(i.hora)}</td>
        <td>${esc(p ? p.nome : "—")}</td>
        <td><span class="chip ${chipTipo}">${esc(i.tipo)}</span></td>
        <td>${chipStatus}</td>
        <td><div class="acoes-linha">
          <button class="btn-mini" onclick="alternarStatus('${i.id}')">${i.status === "concluida" ? "Reabrir" : "Concluir"}</button>
          <button class="btn-mini perigo" onclick="excluirConsulta('${i.id}')">Excluir</button>
        </div></td>
      </tr>`;
    })
    .join("");
}

function abrirNovaConsulta() {
  const sel = $("#select-paciente-agenda");
  sel.innerHTML = meus(dados.pacientes)
    .map((p) => `<option value="${p.id}">${esc(p.nome)}</option>`)
    .join("");
  if (!sel.innerHTML) {
    alert("Cadastre um paciente primeiro, na aba Pacientes.");
    return;
  }
  $("#form-consulta").reset();
  $("#form-consulta").elements.data.value = dataRelativa(1);
  $("#modal-consulta").showModal();
}

$("#form-consulta").addEventListener("submit", () => {
  const f = new FormData($("#form-consulta"));
  dados.agenda.push({
    id: uid(),
    medicoId: sessao.medicoId,
    pacienteId: f.get("pacienteId"),
    data: f.get("data"),
    hora: f.get("hora"),
    tipo: f.get("tipo"),
    status: "agendada",
  });
  salvarDados();
  renderAgenda();
});

function alternarStatus(id) {
  const i = dados.agenda.find((x) => x.id === id);
  if (i) {
    i.status = i.status === "concluida" ? "agendada" : "concluida";
    salvarDados();
    renderAgenda();
  }
}
function excluirConsulta(id) {
  if (!confirm("Excluir esta consulta?")) return;
  dados.agenda = dados.agenda.filter((x) => x.id !== id);
  salvarDados();
  renderAgenda();
}

// ============================================================
// PACIENTES
// ============================================================
function renderPacientes() {
  const itens = meus(dados.pacientes).sort((a, b) => a.nome.localeCompare(b.nome));
  const corpo = $("#lista-pacientes");
  if (!itens.length) {
    corpo.innerHTML = `<tr><td colspan="6" class="vazio">Nenhum paciente cadastrado ainda.</td></tr>`;
    return;
  }
  corpo.innerHTML = itens
    .map((p) => {
      const meds = (p.medicamentos || [])
        .map((m) =>
          `<span class="chip ${m.controlado ? "chip-controlado" : "chip-comum"}">${esc(m.nome)}${m.controlado ? " ⚠" : ""}</span>`
        )
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
  f.elements.telefone.value = p.telefone;
  f.elements.nascimento.value = p.nascimento;
  f.elements.obs.value = p.obs || "";
  $("#meds-container").innerHTML = "";
  (p.medicamentos || []).forEach(adicionarLinhaMed);
  if (!(p.medicamentos || []).length) adicionarLinhaMed();
  $("#modal-paciente").showModal();
}

$("#form-paciente").addEventListener("submit", () => {
  const f = $("#form-paciente");
  const medicamentos = Array.from($("#meds-container").querySelectorAll(".med-linha"))
    .map((l) => ({
      nome: l.querySelector(".med-nome").value.trim(),
      dose: l.querySelector(".med-dose").value.trim(),
      controlado: l.querySelector(".med-ctrl").checked,
    }))
    .filter((m) => m.nome);
  const registro = {
    id: f.elements.id.value || uid(),
    medicoId: sessao.medicoId,
    nome: f.elements.nome.value.trim(),
    cpf: f.elements.cpf.value.trim(),
    rg: f.elements.rg.value.trim(),
    telefone: f.elements.telefone.value.trim(),
    nascimento: f.elements.nascimento.value,
    medicamentos,
    obs: f.elements.obs.value.trim(),
  };
  const i = dados.pacientes.findIndex((p) => p.id === registro.id);
  if (i >= 0) dados.pacientes[i] = registro;
  else dados.pacientes.push(registro);
  salvarDados();
  renderPacientes();
  renderAgenda();
  renderControlados();
});

function verFicha(id) {
  const p = pacientePorId(id);
  if (!p) return;
  const meds = (p.medicamentos || [])
    .map((m) =>
      `<li>${m.controlado ? "⚠️" : "💊"} <strong>${esc(m.nome)}</strong> — ${esc(m.dose || "dose não informada")}
       ${m.controlado ? '<span class="chip chip-controlado">controlado</span>' : ""}</li>`
    )
    .join("") || "<li class='texto-suave'>Nenhum medicamento em uso.</li>";
  $("#ficha-conteudo").innerHTML = `
    <h3>${esc(p.nome)}</h3>
    <div class="ficha-grid">
      <div><span class="rotulo">Idade</span>${idade(p.nascimento)} anos</div>
      <div><span class="rotulo">Nascimento</span>${fData(p.nascimento)}</div>
      <div><span class="rotulo">CPF</span>${esc(p.cpf)}</div>
      <div><span class="rotulo">RG</span>${esc(p.rg || "—")}</div>
      <div><span class="rotulo">Telefone</span>${esc(p.telefone)}</div>
      <div><span class="rotulo">Responsável</span>${esc(sessao.equipe)}</div>
    </div>
    <p class="rotulo" style="font-size:0.7rem;text-transform:uppercase;letter-spacing:0.08em;color:var(--texto-suave);margin-bottom:6px">Medicamentos em uso</p>
    <ul class="ficha-meds">${meds}</ul>
    ${p.obs ? `<p style="margin-top:14px"><span class="rotulo" style="font-size:0.7rem;text-transform:uppercase;letter-spacing:0.08em;color:var(--texto-suave);display:block">Observações</span>${esc(p.obs)}</p>` : ""}
    <div class="modal-acoes"><button class="btn" onclick="fechar('modal-ficha')">Fechar</button></div>`;
  $("#modal-ficha").showModal();
}

function excluirPaciente(id) {
  const p = pacientePorId(id);
  if (!p || !confirm(`Excluir o paciente "${p.nome}" e todos os registros ligados a ele?`)) return;
  dados.pacientes = dados.pacientes.filter((x) => x.id !== id);
  dados.agenda = dados.agenda.filter((x) => x.pacienteId !== id);
  dados.controlados = dados.controlados.filter((x) => x.pacienteId !== id);
  salvarDados();
  renderPacientes();
  renderAgenda();
  renderControlados();
}

// ============================================================
// REMÉDIOS CONTROLADOS
// ============================================================
function renderControlados() {
  const itens = meus(dados.controlados).sort((a, b) => b.data.localeCompare(a.data));
  const pacientesComControlado = meus(dados.pacientes).filter((p) =>
    (p.medicamentos || []).some((m) => m.controlado)
  );

  $("#resumo-controlados").innerHTML = `
    <div class="resumo-card"><span class="num">${itens.length}</span><span class="rotulo">receitas registradas</span></div>
    <div class="resumo-card"><span class="num">${pacientesComControlado.length}</span><span class="rotulo">pacientes em uso de controlados</span></div>`;

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
  sel.innerHTML = meus(dados.pacientes)
    .map((p) => `<option value="${p.id}">${esc(p.nome)}</option>`)
    .join("");
  if (!sel.innerHTML) {
    alert("Cadastre um paciente primeiro, na aba Pacientes.");
    return;
  }
  $("#form-receita").reset();
  $("#form-receita").elements.data.value = dataRelativa(0);
  $("#modal-receita").showModal();
}

$("#form-receita").addEventListener("submit", () => {
  const f = new FormData($("#form-receita"));
  dados.controlados.push({
    id: uid(),
    medicoId: sessao.medicoId,
    pacienteId: f.get("pacienteId"),
    medicamento: f.get("medicamento").trim(),
    tipo: f.get("tipo"),
    data: f.get("data"),
    numeracao: f.get("numeracao").trim(),
  });
  salvarDados();
  renderControlados();
});

function excluirReceita(id) {
  if (!confirm("Excluir este registro de receita?")) return;
  dados.controlados = dados.controlados.filter((x) => x.id !== id);
  salvarDados();
  renderControlados();
}

// ---------- primeira renderização ----------
renderAgenda();
renderPacientes();
renderControlados();
