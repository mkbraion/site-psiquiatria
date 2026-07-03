# Site de Psiquiatria — Dra. Helena Martins (nome fictício de exemplo)

Site institucional estático (HTML/CSS/JS puro, sem build) para consultório de psiquiatria, em português do Brasil. Tom acolhedor, paleta calma (verdes suaves e tons neutros), botão flutuante de WhatsApp em todas as páginas.

## Páginas

| Arquivo | Conteúdo |
|---|---|
| `index.html` | Home: hero acolhedor, áreas de atuação, resumo do atendimento, blog, CTA |
| `sobre.html` | A Profissional: bio, formação, CRM/RQE, linha de atuação, filosofia de cuidado |
| `tratamentos.html` | Ansiedade/Burnout, Depressão, TDAH, Sono, Transtornos Alimentares (com âncoras) |
| `atendimento.html` | Presencial + telemedicina, primeira consulta passo a passo, reembolso, mapa |
| `blog.html` | Lista de artigos de educação em saúde mental |
| `blog-sono.html` | Artigo: Higiene do sono |
| `blog-ansiedade.html` | Artigo: Crises de ansiedade no trabalho |
| `blog-diferenca.html` | Artigo: Psiquiatra × psicólogo |
| `faq.html` | 8 dúvidas frequentes em accordion |
| `contato.html` | Formulário que envia via WhatsApp, telefones, mapa, aviso de crise (CVV 188) |
| `privacidade.html` | Política de Privacidade (LGPD) + Aviso Legal |

## Como visualizar

Basta abrir `index.html` no navegador, ou rodar um servidor local:

```
python -m http.server 8000
# ou
npx serve .
```

## O que personalizar antes de publicar (TODOs)

Todos os dados são **fictícios/placeholder**. Buscar e substituir em todos os arquivos:

1. **Nome**: `Dra. Helena Martins` → nome real
2. **CRM/RQE**: `CRM-SP 000.000` e `RQE 00000` → registros reais (obrigatório pela ética médica)
3. **WhatsApp**: `5511999999999` (aparece nos HTML e em `js/main.js`, constante `NUMERO_WHATSAPP`)
4. **Telefone fixo**: `(11) 3333-3333`
5. **E-mail**: `contato@drahelenamartins.com.br`
6. **Endereço**: `[Rua Exemplo, 123 — Sala 45...]` e o `src` dos iframes do Google Maps
7. **Formação**: itens entre colchetes em `sobre.html`
8. **Foto**: os quadros com iniciais "HM" (`.hero-figura`) devem virar `<img>` com foto profissional

## Publicação

Site 100% estático — publica direto em Netlify, Vercel, GitHub Pages ou Cloudflare Pages (arrastar a pasta ou conectar o repositório git). Nenhuma configuração de build necessária.
