// Menu mobile
const menuBtn = document.querySelector(".menu-btn");
const nav = document.querySelector(".nav");
if (menuBtn && nav) {
  menuBtn.addEventListener("click", () => {
    const aberto = nav.classList.toggle("aberto");
    menuBtn.setAttribute("aria-expanded", String(aberto));
  });
}

// Ano automático no rodapé
const ano = document.getElementById("ano");
if (ano) ano.textContent = new Date().getFullYear();

// Formulário de contato → abre o WhatsApp com a mensagem preenchida
// (não exige servidor; a secretária recebe direto no WhatsApp)
const NUMERO_WHATSAPP = "5511999999999"; // TODO: substituir pelo número real

const form = document.getElementById("form-contato");
if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const dados = new FormData(form);
    const msg =
      `Olá! Meu nome é ${dados.get("nome")}.\n` +
      `Modalidade desejada: ${dados.get("modalidade")}.\n` +
      `Melhor período para contato: ${dados.get("periodo")}.\n\n` +
      `${dados.get("mensagem")}`;
    window.open(
      `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(msg)}`,
      "_blank",
      "noopener"
    );
  });
}
