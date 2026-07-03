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

## Área restrita (demo de sistema interno)

Acesse pelo link "🔒 Área restrita" no rodapé ou por `login.html`. Cada membro da equipe tem seu
próprio login, e **cada consultório só enxerga os próprios dados** (pacientes, agenda e receituário
são filtrados pelo médico responsável):

| Usuário | Senha | Papel |
|---|---|---|
| `alessandra` | `demo123` | Psiquiatra |
| `carla` | `demo123` | Assistente da Dra. Alessandra (vê os mesmos dados dela) |
| `ricardo` | `demo123` | Outro psiquiatra — dados totalmente separados |

Abas do painel: **Agenda** (consultas com status), **Pacientes** (nome, CPF, RG, telefone,
nascimento com idade calculada, medicamentos com marcação de controlado, ficha completa) e
**Remédios controlados** (receituário A/B/C com numeração).

> ⚠️ **É uma simulação 100% front-end**: usuários definidos em `js/auth.js` e dados fictícios
> em `localStorage`. Serve para demonstrar UX/fluxo. Um sistema real com dados de pacientes
> (dados sensíveis — LGPD) exige backend com autenticação segura, criptografia e auditoria.

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
