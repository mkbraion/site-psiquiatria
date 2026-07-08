# STATUS DO PROJETO — Site de Psiquiatria (exemplo/portfólio)

> **Para o Claude (ou qualquer sessão futura):** este arquivo é a fonte da verdade do progresso.
> Se a sessão anterior foi interrompida, leia este arquivo e o README.md e continue de onde
> parou, sem precisar perguntar nada ao usuário.

**Última atualização:** 2026-07-04
**Estado geral:** ✅✅ NO AR — sistema completo publicado e funcional em produção (grátis)

## 🌐 PRODUÇÃO (Render + Turso)
- URL: https://site-psiquiatria.onrender.com  (site público + área restrita /login.html)
- Banco: Turso libsql://psiquiatria-mkbraion.aws-us-east-1.turso.io (região Virginia)
- Testado em produção 2026-07-04: login 200, listar/criar/apagar paciente com persistência real no Turso.
- Causa das 2 falhas iniciais: (1) node:sqlite experimental dependia da versão do Node → trocado por
  @libsql/client nos dois modos; (2) erro 400 do Turso por espaço/quebra no token → resolvido com .trim().
- Plano grátis do Render dorme após 15 min (1º acesso ~50s). Dados ficam no Turso, não somem.
- PENDENTE (recomendado): trocar as senhas demo123 no painel (botão "Senha"); personalizar
  nome/CRM/contatos para o cliente final; SEED_DEMO=0 se quiser começar sem pacientes fictícios.

## Fase 7 — Redesign do cabeçalho (menos "cara de IA")
- Menu em voz pessoal: Início · Quem sou · Como ajudo · A consulta · Reflexões · Dúvidas · Vamos conversar
- Barra editorial (removida a "pílula" flutuante glassmorphism); hairline no scroll
- Marca com monograma ψ (gradiente) + wordmark em serifa Fraunces (adicionada ao link de fontes)
- Nav com sublinhado animado; CTA "Vamos conversar" retangular com seta →
- H1 de contato.html → "Vamos conversar"; labels trocados também no rodapé (consistência)
- Verificado por inspect (screenshots do preview travando por animações) + confirmado no ar em produção

## Fase 9 — Servidor sempre no ar (keep-alive gratuito)
- Endpoint leve GET /healthz ("ok", sem tocar no banco)
- Workflow .github/workflows/keepalive.yml: cron */10 min + workflow_dispatch pinga /healthz
  para o plano free do Render não hibernar → consultório 24/7, sem custo
- Validado 2026-07-08: run manual concluída com "Resposta: 200"
- Caveat: cron do GitHub pode atrasar alguns min (raramente dorme e acorda em ~50s);
  para cliente pagante, Render Starter US$7/mês é à prova de falhas. Domínio próprio = passo opcional.

## Fase 8 — Fim da "cara de IA": ícones desenhados + hero editorial
- Emojis dos cards trocados por ícones de linha SVG (stroke currentColor):
  index (ondas/broto/alvo/lua/tigela), sobre (ouvido/frasco/nós), atendimento (pin/monitor)
- .card .icone: selo suave (verde-claro, canto assimétrico como o monograma), ícone verde,
  hover preenche; etapas de atendimento viraram dígitos em serifa (1–4)
- Hero: h1 em serifa Fraunces (clamp 2.4–3.7rem); .selo virou kicker editorial (régua + caixa-alta)
- hero-chips com ícone SVG no lugar de 💻/🌿
- Confirmado no ar: 7 svgs de ícone na home, Fraunces no <head>. (Emojis mantidos só nas abas do
  painel interno e no link "🔒 Área restrita" do rodapé — contexto interno, sem impacto na vitrine.)

## Fase 6 — Hospedagem grátis (Render + Turso)

- [x] server.js refatorado para camada de banco dual: TURSO_DATABASE_URL definida → @libsql/client
      (nuvem, async); sem a variável → node:sqlite local. Todas as rotas assíncronas + tratador de erros
- [x] `render.yaml` (blueprint: plan free, NODE_VERSION 24, envvars Turso com sync:false)
- [x] Dependência @libsql/client adicionada
- [x] Regressão local completa: 13/13 testes de API passaram (auth, CRUD, cascata, equipe, escopo, 404)
- [x] Turso: banco criado (libsql://psiquiatria-mkbraion.aws-us-east-1.turso.io, região Virginia)
- [x] Render: Blueprint conectado ao repo (ID exs-d947m76q1p3s73b19fv0)
- [x] 1º deploy FALHOU (exit 1 no start) — causa: node:sqlite experimental dependia da versão do Node
- [x] CORREÇÃO (commit 548e089): server.js usa @libsql/client nos DOIS modos (Turso ou file: local);
      NODE_VERSION 22. Regressão local 14/14 ok. Push feito → Render redeploya sozinho.
- [ ] PENDENTE: confirmar que o redeploy passou; conferir se TURSO_DATABASE_URL e TURSO_AUTH_TOKEN
      estão setadas no Render (Environment). Se vazias, app roda em modo file efêmero — setar as 2.
- [ ] Depois: testar login em produção (onrender.com) e trocar senhas demo123

## Fase 5 — Pronto para produção

- [x] Segurança: cabeçalhos (nosniff, X-Frame-Options DENY, Referrer-Policy, Permissions-Policy),
      trust proxy (cookies Secure atrás de Nginx/Railway), desligamento limpo (SIGINT/SIGTERM)
- [x] 404: página amigável (404.html) + JSON para /api/*
- [x] `Dockerfile` + `.dockerignore` + `Procfile` — deploy em qualquer host (volume em /app/dados)
- [x] `iniciar.bat` — dois cliques no Windows (instala deps, abre navegador, sobe servidor)
- [x] `npm run backup` — cópia datada do banco em backups/ (gitignored)
- [x] favicon.svg (ψ em gradiente) em todas as páginas; Open Graph na home
- [x] robots.txt (bloqueia painel/login/api) + sitemap.xml
- [x] Verificado após reinício: headers ok, 404 ok, login ok, dados persistidos no SQLite

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
