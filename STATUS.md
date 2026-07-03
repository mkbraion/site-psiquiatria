# STATUS DO PROJETO — Site de Psiquiatria (exemplo/portfólio)

> **Para o Claude (ou qualquer sessão futura):** este arquivo é a fonte da verdade do progresso.
> Se a sessão anterior foi interrompida, leia este arquivo e o README.md e continue de onde
> parou, sem precisar perguntar nada ao usuário.

**Última atualização:** 2026-07-03
**Estado geral:** ✅ CONCLUÍDO (fase 2 — redesign moderno + dados fictícios + GitHub)

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
