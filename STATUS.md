# STATUS DO PROJETO — Site de Psiquiatria (exemplo/portfólio)

> **Para o Claude (ou qualquer sessão futura):** este arquivo é a fonte da verdade do progresso.
> Se a sessão anterior foi interrompida, leia este arquivo e o README.md e continue de onde
> parou, sem precisar perguntar nada ao usuário.

**Última atualização:** 2026-07-03
**Estado geral:** ✅ CONCLUÍDO (fase 4 — backend real Node+Express+SQLite, produto vendável)

## Fase 4 — Backend real (sistema funcional)

- [x] `server.js` — Express + node:sqlite (Node ≥ 22.5, zero deps nativas; única dep: express)
  - senhas com scrypt+sal, sessões 8h em cookie HttpOnly/SameSite, rate-limit de login
  - CRUD /api/pacientes, /api/agenda, /api/controlados — escopo por medico_id NO SERVIDOR
  - /api/equipe (psiquiatra cria/remove assistentes), /api/senha (trocar a própria)
  - seed automático no 1º start (SEED_DEMO=0 inicia sem pacientes fictícios)
  - serve o site público como estático; banco em dados/clinica.db (no .gitignore)
- [x] `js/api.js` — camada única: detecta servidor (fetch api/eu); sem servidor → modo demo
      em localStorage (GitHub Pages continua funcionando como demonstração)
- [x] `js/painel.js` reescrito assíncrono; `js/auth.js` removido
- [x] Aba 👥 Equipe (só psiquiatras) + botão "Senha" para todos
- [x] Testado de ponta a ponta na porta 4180: 401s, login, CRUD gravando no SQLite
      (verificado no arquivo), assistente criada logou e viu os dados do consultório
      (403 na gestão de equipe), ricardo isolado, modo demo estático ainda ok
- [x] launch.json: config "site-psiquiatria-app" (node server.js 4180)

## Fase 3 — Área restrita (demo front-end)

- [x] `login.html` + `js/auth.js` — 3 contas demo (alessandra/carla/ricardo, senha demo123),
      sessão em sessionStorage, guarda de acesso no painel
- [x] `painel.html` + `js/painel.js` + `css/painel.css` — abas Agenda / Pacientes / Controlados
- [x] Pacientes: nome, CPF, RG, telefone, nascimento (idade calculada), medicamentos dinâmicos
      com flag "controlado", ficha completa, CRUD com modais `<dialog>`
- [x] Agenda: consultas com paciente/data/hora/tipo, concluir/reabrir/excluir, resumo do dia
- [x] Controlados: receituário A/B/C com numeração + contagem de pacientes em uso
- [x] Escopo por medicoId: cada consultório vê só os próprios dados (testado: ricardo não vê
      dados da alessandra); assistente compartilha o escopo do médico dela
- [x] Link "🔒 Área restrita" no rodapé de todas as páginas públicas
- [x] Verificado no preview: senha errada rejeitada, login ok, CRUD de paciente, escopo, guarda

## Checklist

- [x] Fase 1: estrutura completa (11 páginas, CSS, JS) — commit inicial
- [x] Fase 2: redesign moderno
  - [x] Navbar flutuante estilo "pill" com glassmorphism (blur)
  - [x] Animações de scroll: elementos surgem/desaparecem ao rolar (IntersectionObserver
        com toggle) + efeito cascata em grades + fallback de segurança de 1s
  - [x] Blobs animados em gradiente com parallax sutil no hero
  - [x] Chips flutuantes sobre a foto, anéis girando, texto em gradiente
  - [x] Faixa de estatísticas com contadores animados
  - [x] Barra de progresso de leitura no topo
  - [x] Botão WhatsApp com animação de pulso
  - [x] `prefers-reduced-motion` respeitado
- [x] Dados fictícios realistas: Dra. Alessandra Menezes, CRM-RS 45.678, RQE 34.512,
      CNPJ 38.475.912/0001-92 (dígitos verificadores válidos), Rua do Acampamento 380,
      Santa Maria/RS, (55) 99911-2233, dra.alessandramenezes@gmail.com
- [x] Verificação no navegador (preview) — páginas, menu, FAQ, formulário→WhatsApp
- [x] Publicado no GitHub (sem coautoria) — ver URL no fim do arquivo

## Observações técnicas

- O painel de preview embutido do Claude não dispara IntersectionObserver nem scroll
  programático — as animações de scroll só são visíveis em navegador real. O fallback
  de 1s em `js/main.js` garante que o conteúdo nunca fique invisível.
- `overflow-x: clip` (não `hidden`) no html/body — hidden transformaria o body em
  contêiner de scroll e quebraria scrollY/sticky.

## Possíveis próximas fases

- [ ] GitHub Pages para demo online
- [ ] Área do Paciente (exige backend), materiais para download, página de parcerias
