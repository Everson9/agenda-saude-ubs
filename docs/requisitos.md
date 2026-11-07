# Requisitos

Cada requisito tem um código único usado nas issues, nos commits e nos testes
(ex.: o teste `RF04: agenda dentro da grade` cobre o [RF04]).

## Requisitos Funcionais (RF)

| Código | Requisito | Prioridade | Issue | Status |
|---|---|---|---|---|
| [RF01] | O sistema deve permitir cadastrar paciente com nome, cartão SUS (15 dígitos, único), telefone e data de nascimento. | Alta | #7 | 📋 Planejado |
| [RF02] | O sistema deve permitir listar pacientes em ordem alfabética e buscar por parte do nome ou do cartão SUS. | Alta | #8 | 📋 Planejado |
| [RF03] | O sistema deve listar as especialidades atendidas e a duração da consulta de cada uma. | Média | #9 | 📋 Planejado |
| [RF04] | O sistema deve permitir agendar uma consulta para um paciente numa especialidade, numa data e hora. | Alta | #10 | 📋 Planejado |
| [RF05] | O sistema deve exibir a agenda filtrando por dia, especialidade ou paciente, em ordem de horário. | Alta | #11 | 📋 Planejado |
| [RF06] | O sistema deve permitir cancelar um agendamento informando o motivo, liberando o horário. | Alta | #12 | 📋 Planejado |
| [RF07] | O sistema deve permitir registrar se o paciente compareceu (`realizado`) ou faltou (`faltou`). | Média | #13 | 📋 Planejado |
| [RF08] | O sistema deve gerar um relatório de faltas por especialidade e período. | Baixa | #18 | 📋 Planejado |

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
