# Requisitos

Cada requisito tem um código único usado nas issues, nos commits e nos testes
(ex.: o teste `RF04: agenda dentro da grade` cobre o [RF04]).

## Requisitos Funcionais (RF)

| Código | Requisito | Prioridade | Issue | Status |
|---|---|---|---|---|
| [RF01] | O sistema deve permitir cadastrar paciente com nome, cartão SUS (15 dígitos, único), telefone e data de nascimento. | Alta | #7 | ✅ v0.2.0 |
| [RF02] | O sistema deve permitir listar pacientes em ordem alfabética e buscar por parte do nome ou do cartão SUS. | Alta | #8 | ✅ v0.2.0 |
| [RF03] | O sistema deve listar as especialidades atendidas e a duração da consulta de cada uma. | Média | #9 | ✅ v0.2.0 |
| [RF04] | O sistema deve permitir agendar uma consulta para um paciente numa especialidade, numa data e hora. | Alta | #10 | ✅ v0.3.0 |
| [RF05] | O sistema deve exibir a agenda filtrando por dia, especialidade ou paciente, em ordem de horário. | Alta | #11 | ✅ v0.3.0 |
| [RF06] | O sistema deve permitir cancelar um agendamento informando o motivo, liberando o horário. | Alta | #12 | ✅ v0.3.0 |
| [RF07] | O sistema deve permitir registrar se o paciente compareceu (`realizado`) ou faltou (`faltou`). | Média | #13 | ✅ v0.3.0 |
| [RF08] | O sistema deve gerar um relatório de faltas por especialidade e período. | Baixa | #18 | ✅ v0.4.0 |

## Regras de negócio (RN)

| Código | Regra | Usada em |
|---|---|---|
| [RN01] | A UBS atende de segunda a sexta, das 07:00 às 17:00. A consulta precisa terminar até as 17:00. | RF04 |
| [RN02] | O horário segue a grade da especialidade, a partir das 07:00 (ex.: Odontologia de 30 em 30 min). | RF04 |
| [RN03] | Não pode haver dois agendamentos ativos na mesma especialidade e no mesmo horário. | RF04 |
| [RN04] | O mesmo paciente não pode ter dois agendamentos ativos na mesma especialidade no mesmo dia. | RF04 |
| [RN05] | Não se agenda no passado. | RF04 |
| [RN06] | Só agendamento com status `agendado` pode ser cancelado ou ter comparecimento registrado, e uma única vez. | RF06, RF07 |
| [RN07] | O comparecimento só pode ser registrado depois do horário marcado. | RF07 |

## Requisitos Não Funcionais (RNF)

| Código | Categoria | Requisito | Como é verificado |
|---|---|---|---|
| [RNF01] | Desempenho | As operações da API devem responder em menos de 300 ms com até 5.000 agendamentos. | `npm run perf` no CI: p95 abaixo de 300 ms em todos os fluxos ([desempenho.md](desempenho.md), #55) |
| [RNF02] | Persistência / Confiabilidade | Os dados devem sobreviver a reinicializações, e uma queda no meio da escrita não pode corromper o arquivo. | `jsonStore` grava em `.tmp` e renomeia |
| [RNF03] | Portabilidade | Deve rodar em Windows, Linux e macOS com Node.js 20.12 ou superior, sem banco externo. | CI no Ubuntu e desenvolvimento no Windows |
| [RNF04] | Usabilidade | A tela da recepção deve funcionar no celular e no computador, com mensagens de erro em português. | Layout responsivo e erros da API em português |
| [RNF05] | Segurança / LGPD | Dados reais de pacientes não podem ir para o repositório, e a API deve validar toda entrada. | `data/` no `.gitignore`, validação nos services e login com senha em hash scrypt e token de 8 h (v0.4.0, #19) |
| [RNF06] | Manutenibilidade | O código deve ser separado em camadas (rotas, services, repositories) e passar no ESLint. | `npm run lint` no CI |
| [RNF07] | Testabilidade | As regras de negócio devem ter testes automatizados rodando a cada PR. | `npm test` no GitHub Actions |

## Matriz de rastreabilidade

Cada linha liga o requisito à user story, ao caso de uso, à issue, ao código e ao **teste exato que o prova**,
pelo nome que aparece na saída do `npm test`. O teste `tests/unit/rastreabilidade.test.js` lê esta tabela e
falha se algum nome citado aqui não existir mais nos testes, então a matriz não fica desatualizada em silêncio.

| Requisito | User story | Caso de uso | Issue | Código | Teste (arquivo › nome) |
|---|---|---|---|---|---|
| RF01 | US01 | UC01 | #7 | `services/pacienteService.js` `cadastrar` | `integration/pacientes.api.test.js` › «RF01: POST /api/pacientes cadastra e normaliza o cartão SUS» · «RF01: recusa cartão SUS duplicado, nome curto e cartão com tamanho errado» |
| RF02 | US02 | UC01 | #8, #49 | `pacienteService.listar` | `integration/pacientes.api.test.js` › «RF02: GET /api/pacientes busca por parte do nome» · «LGPD-001: a listagem devolve o cartão SUS mascarado e a busca pelo cartão continua funcionando» |
| RF03 | US03 | UC02 | #9 | `routes/especialidadeRoutes.js` | `integration/pacientes.api.test.js` › «RF03: GET /api/especialidades lista as 4 especialidades» |
| RF04 | US03 | UC02 | #10, #16, #48 | `services/agendamentoService.js` `agendar` | `unit/agendamentoService.test.js` › «RF04: agenda dentro da grade» · «RF04: horário ocupado e paciente repetido no dia geram conflito» · «RF04: recusa passado, fim de semana, fora do horário e fora da grade»; `integration/agendamentos.api.test.js` › «RF04: POST /api/agendamentos agenda e devolve 201» · «RF04: conflito de horário devolve 409 e data inexistente devolve 400 (#16)»; `integration/concorrencia.api.test.js` › «DATA-ATOMIC: 20 requisições simultâneas no mesmo horário geram um 201 e dezenove 409» |
| RF05 | US04 | UC03 | #11 | `agendamentoService.listar` | `integration/agendamentos.api.test.js` › «RF05: agenda do dia sai em ordem de horário, com nomes» |
| RF06 | US05 | UC04 | #12 | `agendamentoService.cancelar` | `unit/agendamentoService.test.js` › «RF06: cancelamento exige motivo e libera o horário»; `integration/agendamentos.api.test.js` › «RF06: PATCH /cancelar exige motivo» |
| RF07 | US06 | UC05 | #13 | `agendamentoService.registrarComparecimento` | `unit/agendamentoService.test.js` › «RF07: comparecimento só depois do horário e uma única vez»; `integration/agendamentos.api.test.js` › «RF07: PATCH /comparecimento depois do horário» |
| RF08 | US07 | — | #18 | `services/relatorioService.js` | `unit/relatorioService.test.js` › «RF08: 3 faltas em 10 consultas de Odontologia dão 30% (US07)» · «RF08: só conta realizado e faltou, e só dentro do período» · «RF08: período inválido gera 400»; `integration/agendamentos.api.test.js` › «RF08: GET /api/relatorios/faltas soma o comparecimento registrado» |
| RNF02 | — | — | #6, #48 | `database/jsonStore.js` | `unit/jsonStore.test.js` › «RNF02: os dados sobrevivem a uma nova abertura do arquivo»; `integration/concorrencia.api.test.js` › «DATA-ATOMIC: horários diferentes em paralelo são todos aceitos e os ids não se repetem» |
| RNF04 | — | — | #54 | `utils/erros.js`, `middlewares/tratarErros.js` | `integration/erros.api.test.js` › «API-ERR: 400 de validação, 404 de recurso e 404 de rota usam o mesmo esquema» · «API-ERR: conflitos de negócio têm código próprio e estável» |
| RNF05 | — | — | #19, #49, #52, #57 | `services/authService.js`, `utils/lgpd.js`, `middlewares/registrarRequisicao.js` | `integration/auth.api.test.js` › «RNF05: login correto devolve token com validade de 8 horas» · «RNF05: sem token a API devolve 401, menos /api/saude» · «RNF05: token adulterado devolve 401» · «RNF05: token vence depois de 8 horas»; `unit/senha.test.js` › «gerarHash nunca guarda a senha e usa sal diferente a cada vez»; `unit/lgpd.test.js` › «LGPD-001: valor fora do formato não vaza nenhum dígito»; `integration/logs.api.test.js` › «OBS-LOG: nenhum dado de paciente vai para o log»; `unit/carregarEnv.test.js` › «ENV-EX: o .env.example lista toda variável que o código lê, sem segredo preenchido» |
