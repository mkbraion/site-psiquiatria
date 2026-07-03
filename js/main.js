// ============================================================
// Interações do site: menu, animações de scroll (reveal),
// barra de progresso, contadores e formulário → WhatsApp
// ============================================================

const NUMERO_WHATSAPP = "5555999112233"; // número fictício de exemplo

const reduzMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---- Menu mobile ----
const menuBtn = document.querySelector(".menu-btn");
const nav = document.querySelector(".nav");
if (menuBtn && nav) {
  menuBtn.addEventListener("click", () => {
    const aberto = nav.classList.toggle("aberto");
    menuBtn.setAttribute("aria-expanded", String(aberto));
  });
  nav.addEventListener("click", (e) => {
    if (e.target.tagName === "A") nav.classList.remove("aberto");
  });
}

// ---- Ano automático no rodapé ----
const ano = document.getElementById("ano");
if (ano) ano.textContent = new Date().getFullYear();

// ---- Barra de progresso de leitura ----
const barra = document.createElement("div");
barra.className = "progresso";
document.body.prepend(barra);

const topo = document.querySelector(".topo");
function aoRolar() {
  const total = document.documentElement.scrollHeight - window.innerHeight;
  barra.style.width = total > 0 ? (window.scrollY / total) * 100 + "%" : "0";
  if (topo) topo.classList.toggle("rolado", window.scrollY > 30);
}
window.addEventListener("scroll", aoRolar, { passive: true });
aoRolar();

// ---- Animações de scroll: elementos surgem ao entrar na tela
//      e se desfazem ao sair (efeito de fluidez ao rolar) ----
const animaveis = document.querySelectorAll(
  ".card, .tratamento, .secao-cabeca, .duas-colunas > div, .faq details, " +
  ".cta-final, .stat, .hero-texto, .hero-visual, .pagina-cabeca .container, " +
  ".artigo > h2, .artigo > p, .artigo .caixa-aviso, .artigo .lista-check, .mapa iframe, form"
);

animaveis.forEach((el) => {
  el.classList.add("anim");
  // efeito cascata: irmãos dentro de grades ganham atrasos progressivos
  const pai = el.parentElement;
  if (pai && (pai.classList.contains("grid-cards") || pai.classList.contains("stats-grid"))) {
    const i = Array.from(pai.children).indexOf(el);
    el.style.transitionDelay = i * 90 + "ms";
  }
});

const mostraTudo = () => animaveis.forEach((el) => el.classList.add("visivel"));

if (reduzMovimento || !("IntersectionObserver" in window)) {
  mostraTudo();
} else {
  let observerFuncionou = false;
  const observador = new IntersectionObserver(
    (entradas) => {
      observerFuncionou = true;
      for (const e of entradas) e.target.classList.toggle("visivel", e.isIntersecting);
    },
    { threshold: 0.12, rootMargin: "0px 0px -30px 0px" }
  );
  animaveis.forEach((el) => observador.observe(el));
  // Rede de segurança: se o observer não disparar (webviews antigos,
  // ambientes embutidos), nada pode ficar invisível para sempre.
  setTimeout(() => {
    if (!observerFuncionou) {
      observador.disconnect();
      mostraTudo();
    }
  }, 1000);
}

// ---- Contadores animados (faixa de estatísticas) ----
const contadores = document.querySelectorAll("[data-contar]");
if (contadores.length) {
  const formata = (n) => n.toLocaleString("pt-BR");
  const animaContador = (el) => {
    const alvo = parseInt(el.dataset.contar, 10);
    const inicio = performance.now();
    const duracao = 1400;
    const passo = (agora) => {
      const p = Math.min((agora - inicio) / duracao, 1);
      const suave = 1 - Math.pow(1 - p, 3);
      el.textContent = (el.dataset.prefixo || "") + formata(Math.round(alvo * suave)) + (el.dataset.sufixo || "");
      if (p < 1) requestAnimationFrame(passo);
    };
    requestAnimationFrame(passo);
  };
  if (reduzMovimento) {
    contadores.forEach((el) => {
      el.textContent = (el.dataset.prefixo || "") + parseInt(el.dataset.contar, 10).toLocaleString("pt-BR") + (el.dataset.sufixo || "");
    });
  } else {
    const obsContador = new IntersectionObserver(
      (entradas, obs) => {
        for (const e of entradas) {
          if (e.isIntersecting) {
            animaContador(e.target);
            obs.unobserve(e.target);
          }
        }
      },
      { threshold: 0.5 }
    );
    contadores.forEach((el) => obsContador.observe(el));
  }
}

// ---- Parallax sutil nos blobs do hero ----
const blobs = document.querySelectorAll(".blob");
if (blobs.length && !reduzMovimento) {
  window.addEventListener(
    "scroll",
    () => {
      const y = window.scrollY;
      blobs.forEach((b, i) => {
        b.style.translate = `0 ${y * (i % 2 ? 0.08 : -0.05)}px`;
      });
    },
    { passive: true }
  );
}

// ---- Formulário de contato → abre o WhatsApp com a mensagem pronta ----
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
