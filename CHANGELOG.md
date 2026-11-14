# Changelog

Todas as mudanças relevantes deste projeto. Formato baseado em
[Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/), versões em [SemVer](https://semver.org/lang/pt-BR/).

## [0.5.0] - 2026-11-14

Itens da avaliação técnica Week_01.

### Adicionado
- Cartão SUS mascarado na listagem de pacientes (`898 **** **** 7890`); a busca por cartão continua funcionando e aceita espaços. Mapa de dados pessoais em `docs/lgpd.md` (LGPD-001) (#49).
- Formato único de erro da API `{ erro, codigo, status }`, com códigos estáveis como `HORARIO_OCUPADO` e `CARTAO_SUS_DUPLICADO` (API-ERR) (#54).
- Log estruturado em JSON por requisição, com identificador (`X-Request-Id`), rota, status e duração, sem dado pessoal (OBS-LOG) (#57).
- `.env.example` e leitura automática do `.env` com `process.loadEnvFile` (ENV-EX) (#52).
- `Dockerfile` (Node 22 alpine, usuário não root, volume de dados, healthcheck) e `docker-compose.yml` (DOCK-01) (#58).
- Dependabot semanal para npm e GitHub Actions, com PRs na `develop` (DEP-BOT) (#51).
- `npm run perf`: baseline do RNF01 com 5.000 agendamentos; pior p95 de 11,9 ms. Resultado em `docs/desempenho.md` (PERF-BASE) (#55).
- `npm run a11y`: auditoria axe-core (WCAG 2.1 A/AA) e por teclado no Chrome. Resultado em `docs/acessibilidade.md` (A11Y-CHK) (#56).
- Índice `docs/README.md` com versão e data de cada documento e a regra de sincronização docs ↔ código (DOC-IDX) (#53).
- CI com três jobs novos: desempenho, acessibilidade e Docker.

### Alterado
- Matriz de rastreabilidade aponta o nome exato de cada teste, e um teste falha se a matriz citar teste inexistente (TRC-TST) (#50).
- Node mínimo passa a ser 20.12 (`process.loadEnvFile`).

### Corrigido
- Teste e documentação da concorrência no agendamento: 20 requisições simultâneas no mesmo horário geram um 201 e dezenove 409 (DATA-ATOMIC) (#48).
- Tela: foco visível em todo controle, região `main` no login, botões da agenda com nome completo para leitor de tela e tabela que não empurra mais a página na largura de celular (#56).

## [0.4.0] - 2026-11-07

### Adicionado
- Relatório de faltas por especialidade e período, na API e na tela (RF08) (#18).
- Login da recepção com senha em hash scrypt e token de 8 horas. Toda a API exige login, exceto `/api/saude` (RNF05) (#19).
- Gate de cobertura no CI: linhas e funções acima de 80%, ramos acima de 70% (#42).
- Job de segurança no CI com Gitleaks e `npm audit` (#43).
- Teste de persistência em arquivo e escrita atômica (RNF02) (#42).

### Corrigido
- O atributo `hidden` era ignorado pelo `display: grid` do `main` na tela (#19).

## [0.3.1] - 2026-11-07

### Corrigido
- CI: `npm test` falhava no Node 20 porque o `node --test` dessa versão não expande glob (#40).

## [0.3.0] - 2026-11-07

### Adicionado
- Agendamento com grade da especialidade, horário de funcionamento, dia útil e conflitos (RF04) (#10).
- Agenda filtrada por dia, especialidade ou paciente (RF05) (#11).
- Cancelamento com motivo (RF06) (#12).
- Registro de comparecimento ou falta (RF07) (#13).
- Tela web da recepção (RNF04) (#14).
- 20 testes automatizados (unitários e de integração) e CI no GitHub Actions com Node 20 e 22 (#15).
- Documento de arquitetura (C4, camadas, classes, DER, estados e rotas) e README completo (#17).

### Corrigido
- Agendamento aceitava data inexistente no calendário, como 31/11 (#16).

## [0.2.0] - 2026-11-07

### Adicionado
- Persistência em arquivo JSON com escrita atômica (RNF02) (#6).
- Cadastro de paciente com cartão SUS único (RF01) (#7).
- Listagem e busca de pacientes (RF02) (#8).
- Listagem de especialidades com duração da consulta (RF03) (#9).

## [0.1.0] - 2026-11-07

### Adicionado
- Termo de abertura do projeto com objetivos SMART, escopo e stakeholders (#1).
- Requisitos funcionais RF01 a RF08, regras de negócio e não funcionais RNF01 a RNF07 (#2).
- Casos de uso UC01 a UC05 com fluxos principal, alternativo e de exceção (#3).
- Histórias de usuário US01 a US07 com critérios de aceite em Gherkin (#4).
- Estrutura do projeto: Node.js 20, Express 5, ESLint, EditorConfig, templates de issue e PR (#5).
