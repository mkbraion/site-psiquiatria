# Ficha de Dados do Cliente

Envie esta ficha ao médico(a) antes de montar o site. Peça para preencher tudo o que puder — os
campos marcados com ⭐ são **obrigatórios**; os demais podem entrar depois. Ao final há uma parte
interna (não enviar ao cliente), para você controlar a publicação.

> Dica: mande como mensagem/PDF e peça para responder na mesma ordem. Quanto mais completo,
> mais rápido o site fica pronto.

---

## 1. Dados profissionais

- ⭐ Nome como deve aparecer no site (ex.: "Dra. Alessandra Menezes"): _______________________
- ⭐ CRM (com estado, ex.: CRM-RS 45.678): _______________________
- ⭐ RQE (registro de especialista, ex.: RQE 34.512): _______________________
- CNPJ (se atende como pessoa jurídica): _______________________
- ⭐ Público que atende: ( ) adultos ( ) adolescentes ( ) crianças ( ) idosos
- Áreas de atuação que quer destacar (marque):
  ( ) Ansiedade/Burnout ( ) Depressão/Humor ( ) TDAH ( ) Sono ( ) Alimentares
  ( ) Outras: _______________________

## 2. Contato

- ⭐ WhatsApp de agendamento (com DDD): _______________________
- Telefone fixo: _______________________
- ⭐ E-mail: _______________________
- ⭐ Horários de atendimento (ex.: Seg–Sex, 8h às 18h): _______________________
- Instagram / redes (para linkar, opcional): _______________________

## 3. Local de atendimento

- Atende: ( ) presencial ( ) online/telemedicina ( ) ambos
- ⭐ Endereço completo do consultório (rua, número, sala, bairro, cidade/UF, CEP):
  _______________________________________________________________
- Link do Google Maps do consultório (se tiver): _______________________
- Cidade/região a destacar nos textos: _______________________

## 4. Formação (aparece em "Quem sou")

- ⭐ Graduação em Medicina — universidade e ano: _______________________
- Residência em Psiquiatria — instituição e ano: _______________________
- Especializações / pós-graduações: _______________________
- Uma frase pessoal sobre como enxerga o cuidado (opcional, ajuda muito):
  _______________________________________________________________

## 5. Arquivos para enviar

- ⭐ Foto profissional (boa resolução, fundo neutro de preferência) — para o hero e a página "Quem sou"
- Logotipo (se já tiver um): _______________________
- Preferência de cores (se tiver): _______________________
  (padrão do modelo: tons de verde calmo — recomendado para saúde mental)

## 6. Equipe (logins da área restrita)

Liste quem terá acesso ao sistema. O médico é sempre "Psiquiatra"; os demais, "Assistente".

| Nome | Papel | Usuário (login sugerido) |
|---|---|---|
| (médico) | Psiquiatra | |
| | Assistente | |
| | Assistente | |

> As senhas são definidas na entrega e o próprio usuário troca depois (botão "Senha" no painel).

## 7. Domínio (recomendado)

- Já tem um domínio? Qual? _______________________
- Se não, sugestões desejadas (ex.: dralessandramenezes.com.br): _______________________
- (Registro custa ~R$ 40/ano; combinar quem paga.)

## 8. Blog / conteúdo (opcional)

- Quer manter os 3 artigos de exemplo (sono, ansiedade, psiquiatra × psicólogo)? ( ) Sim ( ) Não
- Quer artigos com a sua assinatura/tom? Temas desejados: _______________________

## 9. Ciência sobre dados (LGPD)

- ( ) Estou ciente de que sou o **responsável (controlador)** pelos dados dos meus pacientes e
  autorizo o armazenamento no sistema, com senhas e acesso restrito à minha equipe.
- ( ) Recebi orientação para trocar as senhas padrão na entrega e não compartilhar meu login.

Assinatura/《ok》 do cliente: _______________________  Data: ____/____/______

---
---

# PARTE INTERNA — não enviar ao cliente

Use para controlar a montagem e a publicação deste cliente. **Guarde credenciais em local seguro,
nunca no repositório público.**

## Personalização (buscar/substituir — ver README seção "personalizar")
- [ ] Nome (`Dra. Alessandra Menezes`)
- [ ] CRM / RQE / CNPJ
- [ ] WhatsApp (`5555999112233` nos `.html` e em `js/main.js`) e `(55) 99911-2233`
- [ ] Telefone fixo / e-mail
- [ ] Endereço + `src` dos mapas (`atendimento.html`, `contato.html`)
- [ ] Formação (`sobre.html`)
- [ ] Foto no lugar da ilustração do hero (`index.html`)
- [ ] Cidade/estado nos textos
- [ ] Favicon/cores (opcional)

## Publicação
- [ ] Repositório do cliente criado: _______________________
- [ ] Banco Turso criado (URL): _______________________
- [ ] Turso token gerado e guardado (⚠️ não commitar)
- [ ] Render: Blueprint criado · plano: ( ) Free + keep-alive ( ) Starter US$7/mês
- [ ] Variáveis no Render: TURSO_DATABASE_URL, TURSO_AUTH_TOKEN, `SEED_DEMO=0`
- [ ] Usuário do médico criado + senhas trocadas
- [ ] Domínio próprio ligado (se houver): _______________________
- [ ] Backup agendado / combinado
- [ ] Testado em produção: login, cadastro de paciente, receita, WhatsApp

## Comercial
- [ ] Valor de montagem cobrado: R$ __________  Data: ____/____/______
- [ ] Mensalidade: R$ __________  · Vencimento dia: ____  · Forma: _______________________
- [ ] Contrato/termo de dados assinado
