# Guia de Venda — Site + Sistema para Consultórios de Psiquiatria

Guia prático para vender este produto para psiquiatras (e, com pequenas adaptações, para
psicólogos e outras clínicas). Leia junto com o `README.md` (parte técnica) e o `STATUS.md`
(estado do projeto).

---

## 1. O que você está vendendo

Um **site profissional + um sistema de gestão de consultório**, tudo em um, pronto para uso:

- **Site institucional** moderno (11 páginas, PT-BR, celular, blog, SEO, botão de WhatsApp).
- **Área restrita** com login por pessoa (psiquiatra + assistentes), com:
  - **Agenda** de consultas
  - **Pacientes** (nome, CPF, RG, telefone, nascimento, medicamentos)
  - **Receituário de controlados** (A/B/C)
  - **Gestão da equipe** (o médico cria/remove logins das assistentes)
- **Segurança real**: senhas criptografadas, cada consultório vê só os próprios dados.
- **Hospedagem** funcionando (grátis para demonstração; paga para produção séria).

> Diferencial de venda: a maioria dos concorrentes vende **ou** o site **ou** um sistema de
> prontuário caro. Aqui é **os dois juntos**, com identidade visual autoral (não parece template).

---

## 2. Para quem vender

- Psiquiatras com consultório particular (o alvo principal).
- Recém-formados / recém-especializados montando o primeiro consultório.
- Psiquiatras que só têm Instagram e nenhum site.
- Clínicas pequenas (2–4 profissionais) — cada um com seu login.
- Psicólogos e outras especialidades (adaptando textos e o receituário).

**Onde achar:** Instagram (busque #psiquiatra + cidade), grupos de medicina, indicação boca a boca,
Doctoralia, catálogos de CRM. Comece pela sua região (Santa Maria/RS e cidades próximas).

---

## 3. Como precificar

O modelo mais saudável é **taxa de montagem (uma vez) + mensalidade (recorrente)**.

### Sugestão de tabela (ajuste à sua realidade)

| Plano | Montagem (única) | Mensalidade | O que inclui |
|---|---|---|---|
| **Site simples** | R$ 700 – 1.200 | R$ 40 – 70/mês | Só o site institucional + WhatsApp, sem área restrita |
| **Site + Sistema** | R$ 1.500 – 2.500 | R$ 90 – 150/mês | Tudo: site + agenda + pacientes + controlados |
| **Personalização extra** | R$ 150 – 400 | — | Foto/identidade, textos sob medida, domínio próprio |

### A conta que garante lucro (importante)

Seu **custo real** por cliente em produção:
- Hospedagem Render (plano Starter, sempre ligado): **~US$ 7/mês ≈ R$ 40/mês**
- Banco Turso: **grátis** no início (plano free cobre um consultório pequeno)
- Domínio próprio (opcional): **~R$ 40/ano** (pago pelo cliente, ou repassado)

Ou seja: cobrando **R$ 100/mês** e pagando **~R$ 40** de hospedagem, sobra **~R$ 60/mês por
cliente** de margem recorrente. Com 10 clientes = ~R$ 600/mês passivos, além das montagens.

> Regra de ouro: **nunca** cobre só a montagem. A mensalidade é o que paga a hospedagem e vira
> renda recorrente. Deixe isso claro na proposta: "a mensalidade cobre hospedagem, manutenção,
> backup e pequenos ajustes".

### Dica de fechamento
Ofereça a **demonstração grátis** (o site atual, https://site-psiquiatria.onrender.com) como
isca. "Fiz este modelo funcionando — posso deixar igual a esse, com o seu nome, em 2 dias."

---

## 4. O que personalizar por cliente (checklist técnico)

Todos os dados hoje são fictícios (Dra. Alessandra Menezes). Para cada cliente, troque:

- [ ] **Nome** — buscar/substituir `Dra. Alessandra Menezes` em todos os `.html`
- [ ] **CRM e RQE** — `CRM-RS 45.678` e `RQE 34.512` (peça os números reais; é exigência ética)
- [ ] **CNPJ** (se houver) — `38.475.912/0001-92` no rodapé
- [ ] **WhatsApp** — `5555999112233` (aparece nos `.html` **e** em `js/main.js`) e `(55) 99911-2233`
- [ ] **Telefone fixo** — `(55) 3232-4455`
- [ ] **E-mail** — `dra.alessandramenezes@gmail.com`
- [ ] **Endereço** — `Rua do Acampamento, 380 — Sala 204, Centro, Santa Maria/RS`
- [ ] **Mapa** — o `src` dos iframes do Google Maps (em `atendimento.html` e `contato.html`)
- [ ] **Cidade/estado** nos textos (Santa Maria/RS)
- [ ] **Formação** — os itens em `sobre.html` (universidade, residência, títulos)
- [ ] **Foto** — trocar a ilustração botânica do hero (`index.html`) por foto profissional real
- [ ] **Textos do blog** — opcional: adaptar ou adicionar artigos com a voz do cliente
- [ ] **Cores** — opcional: as variáveis no topo de `css/styles.css` (`--verde`, etc.)
- [ ] **Favicon/monograma** — o `ψ` serve para qualquer psiquiatra; personalizar se quiser

> Atalho: quase tudo é um "buscar e substituir". Peça ao cliente uma ficha com esses dados
> antes de começar. Veja a lista completa no `README.md`.

---

## 5. Como colocar no ar para um cliente

Cada cliente precisa da **própria instância** (site + banco separados). Passo a passo:

1. **Copie o projeto** para um repositório novo (um por cliente), ou uma pasta/branch dedicada.
2. **Personalize** os dados (seção 4) e troque a ilustração pela foto.
3. **Banco Turso**: crie um banco novo para o cliente (turso.tech) → URL + token.
4. **Render**: novo Blueprint apontando pro repositório do cliente → cole as 2 variáveis do Turso.
   - Para produção séria, mude o serviço para o plano **Starter (US$ 7/mês)** — sem hibernação.
   - Se ficar no grátis, ative o keep-alive (workflow `.github/workflows/keepalive.yml`).
5. **Banco limpo**: no Render, defina `SEED_DEMO=0` para começar **sem** os pacientes fictícios.
6. **Crie o usuário do médico** e **troque todas as senhas `demo123`** (botão "Senha" no painel).
7. **Domínio próprio** (recomendado para vender): registre `nomedomedico.com.br` (~R$ 40/ano) e
   ligue no Render (Settings → Custom Domain). Passa muito mais credibilidade que `.onrender.com`.
8. **Backup**: rode `npm run backup` periodicamente (ou agende) para guardar cópia do banco.

---

## 6. Modelos de mensagem

**Abordagem (Instagram/WhatsApp):**
> Olá, Dr(a). [Nome]! Sou desenvolvedor(a) de sites para consultórios. Montei um modelo de site
> de psiquiatria com **agenda e prontuário integrados** (agendamento pelo WhatsApp, área restrita
> com pacientes e receituário). Posso te mostrar funcionando? Fica com a sua cara e some com aquela
> dependência de secretária pra tudo. Sem compromisso — te mando o link da demonstração.

**Proposta (resumo):**
> - Site profissional + sistema de gestão (agenda, pacientes, controlados)
> - Identidade visual própria + otimizado para Google e celular
> - Montagem: R$ [valor] (uma vez) · Mensalidade: R$ [valor] (hospedagem + manutenção + backup)
> - Entrega em [X] dias. Demonstração: https://site-psiquiatria.onrender.com

---

## 7. Respostas a objeções

- **"Está caro."** → "A mensalidade cobre hospedagem, segurança, backup e ajustes. É menos que o
  custo de uma consulta, e o site paga sozinho com 1 paciente novo por mês."
- **"Já tenho Instagram."** → "Ótimo — o site complementa: aparece no Google, passa credibilidade,
  e o Instagram você linka no perfil. Além disso, o Instagram não organiza sua agenda nem prontuário."
- **"Meus dados de paciente estão seguros?"** → "Sim: senhas criptografadas, acesso só da sua
  equipe, banco na nuvem com backup. Falamos de LGPD na seção abaixo." (veja seção 8)
- **"E se eu quiser mudar algo depois?"** → "Pequenos ajustes entram na mensalidade; mudanças
  grandes são orçadas à parte."
- **"Preciso saber mexer em computador?"** → "Não. O painel é simples, e eu configuro tudo. Você
  só usa o dia a dia: agenda, pacientes, receitas."

---

## 8. LGPD e responsabilidade (leia com atenção)

Dados de pacientes de saúde mental são **dados pessoais sensíveis** (LGPD). Ao vender um sistema
que os armazena, você entra na cadeia de tratamento de dados. Proteja-se e proteja o cliente:

- **HTTPS sempre** (Render já entrega, inclusive em domínio próprio). Nunca rode sem HTTPS.
- **Senhas fortes** — obrigue a troca das senhas padrão na entrega.
- **Contrato/termo** entre você e o cliente definindo: quem é o **controlador** dos dados (o médico)
  e quem é o **operador** (você/hospedagem), responsabilidades e o que acontece no fim do contrato.
- **Backup** periódico e combinado com o cliente.
- **Não use dados reais em ambiente de demonstração.**
- Recomende ao cliente ter uma **Política de Privacidade** própria (o site já traz uma base em
  `privacidade.html`).
- Se o cliente exigir garantias fortes (auditoria, criptografia do banco em repouso, retenção),
  isso é um upgrade — cobre à parte e ajuste a infraestrutura.

> Não dê garantias que você não pode cumprir. Seja honesto: "o sistema segue boas práticas de
> segurança; a responsabilidade clínica e legal pelos dados é do médico (controlador)."

---

## 9. Pós-venda (o que sustenta a mensalidade)

- **Manutenção**: manter o site no ar, atualizar dependências, corrigir eventuais falhas.
- **Backup** do banco (combine a frequência).
- **Pequenos ajustes** de texto/horário/preço (dentro do razoável).
- **Suporte** por WhatsApp para dúvidas de uso.
- Ofereça **evoluções pagas**: novos artigos de blog, integração com agenda do Google,
  lembretes automáticos, área do paciente, relatórios.

---

## 10. Roteiro de demonstração (o que mostrar, em ordem)

1. Abra a **home** no celular — mostre o visual, o menu pessoal e o botão de WhatsApp flutuante.
2. Clique em **"Vamos conversar"** → mostre o formulário que já abre o WhatsApp pronto.
3. Entre na **Área restrita** (`/login.html`, usuário `alessandra` / senha `demo123`).
4. Mostre a **Agenda**, cadastre um **paciente** (com medicamento controlado), registre uma **receita**.
5. Mostre que a **assistente** tem acesso, mas cada consultório vê só os próprios dados.
6. Encerre: "Tudo isso com a sua identidade, no seu domínio, em poucos dias."

---

### Resumo em uma frase para vender
> "Um site bonito que também organiza sua agenda, seus pacientes e suas receitas — com segurança,
> pelo preço de uma mensalidade baixa, e com a sua cara."
