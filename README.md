# Site de Psiquiatria — exemplo de site institucional

> **Site de demonstração/portfólio.** Todos os dados são fictícios: nome (Dra. Alessandra Menezes),
> CRM-RS 45.678, RQE 34.512, CNPJ 38.475.912/0001-92, telefones, e-mail e endereço
> (Santa Maria/RS) foram gerados apenas como exemplo e não pertencem a nenhuma pessoa real.

Site institucional estático (HTML/CSS/JS puro, sem build) para consultório de psiquiatria, em português do Brasil. Design moderno com navbar flutuante estilo "pill" com glassmorphism, animações de scroll (os elementos surgem ao entrar na tela e se desfazem ao sair), blobs animados em gradiente, contadores animados, barra de progresso de leitura e botão flutuante de WhatsApp com pulso.

## Destaques técnicos

- **Animações de scroll** via `IntersectionObserver`, com efeito cascata em grades e
  rede de segurança (se o observer não disparar, nada fica invisível)
- **Acessibilidade**: respeita `prefers-reduced-motion`, foco visível, HTML semântico
- **Zero dependências**: sem frameworks, sem build — abre direto no navegador
- **Formulário sem backend**: monta a mensagem e abre no WhatsApp
- **FAQ em accordion nativo** (`<details>/<summary>`), sem JavaScript

## Sistema de gestão (área restrita) — funcional de verdade

O projeto inclui um **backend real** (`server.js` — Node.js + Express + SQLite) que serve o site
público e a API do painel. Login com **senhas criptografadas (scrypt)**, sessão em **cookie
HttpOnly**, proteção contra força-bruta e **isolamento por consultório imposto no servidor**:
cada psiquiatra (e suas assistentes) só acessa os próprios pacientes, agenda e receituário.

### Como rodar

```bash
npm install
npm start            # http://localhost:3000  (ou: node server.js 8080)
```

O banco (`dados/clinica.db`) é criado sozinho no primeiro start, com os usuários iniciais abaixo.
Para começar **sem** os pacientes fictícios de demonstração: `SEED_DEMO=0 npm start`.

| Usuário | Senha | Papel |
|---|---|---|
| `alessandra` | `demo123` | Psiquiatra |
| `carla` | `demo123` | Assistente da Dra. Alessandra (mesmo consultório) |
| `ricardo` | `demo123` | Outro psiquiatra — dados totalmente separados |

> **Troque as senhas no primeiro acesso** (botão "Senha" no painel).

### Abas do painel

- **📅 Agenda** — consultas (paciente, data, hora, presencial/online), concluir/reabrir/excluir
- **🧑‍⚕️ Pacientes** — nome, CPF, RG, telefone, nascimento (idade calculada), medicamentos com
  marcação de "controlado", ficha completa, edição e exclusão em cascata
- **💊 Remédios controlados** — receituário tipo A/B/C com numeração e data
- **👥 Equipe** (só psiquiatras) — criar/remover logins de assistentes do próprio consultório

### Dois modos, detectados automaticamente

O painel (`js/api.js`) detecta onde está rodando:

- **Com o servidor** (`npm start`): dados reais no SQLite, autenticação verificada no backend.
- **Hospedagem estática** (ex.: GitHub Pages): cai no **modo demonstração** — simulação em
  `localStorage`, com aviso na tela. Útil para mostrar o produto a clientes sem custo.

### Hospedagem GRÁTIS (Render + Turso) — passo a passo

Hospedagens grátis não têm disco permanente, então o banco vai para o **Turso**
(SQLite na nuvem, plano grátis generoso). O servidor detecta sozinho: com as variáveis
`TURSO_DATABASE_URL`/`TURSO_AUTH_TOKEN` usa a nuvem; sem elas, usa o arquivo local.
As duas contas são grátis, com **login via GitHub e sem cartão de crédito**:

1. **Turso** (banco): crie conta em [turso.tech](https://turso.tech) → *Create Database*
   (região mais próxima do Brasil disponível: **US East / Virginia**) → copie a **URL**
   (`libsql://...`) e gere um **token** (*Create Token*).
2. **Render** (servidor): crie conta em [render.com](https://render.com) → *New → Blueprint* →
   conecte o repositório `mkbraion/site-psiquiatria` (o arquivo `render.yaml` configura tudo) →
   cole as duas variáveis do Turso quando o painel pedir → *Apply*.
3. Em ~2 minutos o site inteiro (público + painel) estará em `https://site-psiquiatria.onrender.com`
   com HTTPS automático.

**Limitação do plano grátis do Render:** o servidor "dorme" após 15 min sem visitas e o
primeiro acesso seguinte demora ~50 s para acordar. Os dados ficam intactos no Turso.
Para eliminar isso depois: Render Starter (~US$ 7/mês) ou uma VPS.

### Publicando em hospedagem paga (entrega a cliente)

1. **VPS** (Hostinger, Contabo, DigitalOcean — a partir de ~R$ 20/mês): `git clone`, `npm install`,
   rode com `pm2 start server.js` e coloque Nginx/Caddy na frente com HTTPS (obrigatório).
   Sem Turso: o banco fica no arquivo local `dados/clinica.db` (faça backup com `npm run backup`).
2. **Railway / Fly.io**: deploy pelo git; anexe um *volume* persistente montado em `dados/`,
   ou use o mesmo Turso.
3. O site público continua igual; a única exigência do painel é o processo Node no ar.

**Checklist por cliente:** trocar nome/CRM/contatos nos HTML, criar o usuário do médico no banco,
`SEED_DEMO=0` no primeiro start, HTTPS ativo e backup periódico do arquivo `dados/clinica.db`.

> **LGPD:** dados de pacientes são dados sensíveis. Para uso real: HTTPS sempre, senhas fortes,
> backups criptografados e contrato de tratamento de dados com o cliente. Para evolução futura:
> trilha de auditoria e criptografia do banco em repouso.

## Páginas

| Arquivo | Conteúdo |
|---|---|
| `index.html` | Home: hero com chips flutuantes, estatísticas animadas, áreas de atuação, CTA |
| `login.html` / `painel.html` | Área restrita da equipe (demo): agenda, pacientes, controlados |
| `sobre.html` | A Profissional: bio, formação, CRM/RQE, filosofia de cuidado |
| `tratamentos.html` | Ansiedade/Burnout, Depressão, TDAH, Sono, Transtornos Alimentares |
| `atendimento.html` | Presencial + telemedicina, primeira consulta passo a passo, reembolso, mapa |
| `blog.html` + `blog-*.html` | 3 artigos de educação em saúde mental |
| `faq.html` | 8 dúvidas frequentes em accordion |
| `contato.html` | Formulário via WhatsApp, telefones, mapa, aviso de crise (CVV 188) |
| `privacidade.html` | Política de Privacidade (LGPD) + Aviso Legal |

## Como visualizar

Basta abrir `index.html` no navegador, ou rodar um servidor local:

```
npx serve .
# ou
python -m http.server 8000
```

## Publicação

Site 100% estático — publica direto em Netlify, Vercel, GitHub Pages ou Cloudflare Pages, sem configuração de build.
