# Histórias de Usuário

Formato: **Como** [ator], **quero** [ação] **para que** [valor].
Os critérios de aceite estão em Gherkin (Dado / Quando / Então) e viraram testes automatizados.

---

## US01 — Cadastrar paciente ([RF01]) · issue #7

**Como** recepcionista, **quero** cadastrar o paciente com o cartão SUS **para que** eu possa agendar
consultas para ele sem repetir os dados toda vez.

```gherkin
Cenário: cadastro válido
  Dado que não existe paciente com o cartão "898 0012 3456 7890"
  Quando eu cadastro "Maria da Silva", nascida em 12/05/1980, com esse cartão
  Então o paciente é salvo com o cartão "898001234567890"
  E a resposta é 201

Cenário: cartão já cadastrado
  Dado que "Maria da Silva" já tem o cartão "898001234567890"
  Quando eu tento cadastrar outra pessoa com o mesmo cartão
  Então recebo o erro "já existe paciente com este cartão SUS" (409)

Cenário: dados inválidos
  Quando eu informo um nome com menos de 3 letras ou um cartão sem 15 dígitos
  Então recebo um erro 400 explicando o campo
```

## US02 — Encontrar paciente ([RF02]) · issue #8

**Como** recepcionista, **quero** buscar o paciente por parte do nome ou do cartão **para que** eu
encontre o cadastro rápido, com a fila na frente.

```gherkin
Cenário: busca por parte do nome
  Dado que existem "Maria da Silva" e "João Pereira"
  Quando eu busco "joão"
  Então vejo apenas "João Pereira"

Cenário: lista completa
  Quando eu abro a lista sem busca
  Então vejo todos os pacientes em ordem alfabética
```

## US03 — Agendar consulta ([RF03], [RF04]) · issues #9 e #10

**Como** recepcionista, **quero** agendar a consulta num horário livre da especialidade **para que**
o paciente tenha horário garantido e não precise ir para a fila.

```gherkin
Cenário: horário livre na grade
  Dado que hoje é segunda, 09/11/2026, 08:00
  Quando eu agendo Clínico Geral para 10/11/2026 às 09:00
  Então o agendamento fica com status "agendado" (201)

Cenário: horário ocupado
  Dado que já existe Clínico Geral em 10/11/2026 às 09:00
  Quando eu tento agendar outro paciente no mesmo horário
  Então recebo "horário já ocupado para esta especialidade" (409)

Cenário: fora das regras de funcionamento
  Quando eu tento agendar no passado, num sábado, antes das 07:00, terminando depois das 17:00 ou fora da grade
  Então recebo um erro 400 com o motivo

Cenário: data que não existe
  Quando eu tento agendar em 31/11/2026 (novembro tem 30 dias)
  Então recebo um erro 400
```

## US04 — Ver a agenda do dia ([RF05]) · issue #11

**Como** recepcionista, **quero** ver a agenda do dia em ordem de horário **para que** eu chame os
pacientes na ordem certa.

```gherkin
Cenário: agenda ordenada
  Dado que existem consultas às 09:00 e às 07:20 de 10/11/2026
  Quando eu consulto a agenda de 10/11/2026
  Então vejo 07:20 antes de 09:00, com o nome do paciente e da especialidade
```

## US05 — Cancelar consulta ([RF06]) · issue #12

**Como** recepcionista, **quero** cancelar a consulta informando o motivo **para que** o horário volte
a ficar livre e fique registrado por que foi cancelada.

```gherkin
Cenário: cancelamento com motivo
  Dado um agendamento "agendado"
  Quando eu cancelo com o motivo "Paciente viajou"
  Então o status vira "cancelado" e o horário fica livre para outro paciente

Cenário: sem motivo
  Quando eu cancelo sem informar o motivo
  Então recebo um erro 400

Cenário: cancelar duas vezes
  Dado um agendamento já cancelado
  Quando eu tento cancelar de novo
  Então recebo um erro 409
```

## US06 — Registrar comparecimento ([RF07]) · issue #13

**Como** recepcionista, **quero** marcar se o paciente compareceu ou faltou **para que** a coordenação
saiba quantas consultas foram perdidas.

```gherkin
Cenário: depois do horário
  Dado uma consulta às 09:00 de 10/11/2026 e o relógio às 09:30
  Quando eu marco "faltou"
  Então o status vira "faltou"

Cenário: antes do horário
  Dado que a consulta ainda não aconteceu
  Quando eu tento marcar "realizado"
  Então recebo um erro 400
```

## US07 — Relatório de faltas ([RF08]) · issue #18 · planejada para a v0.4.0

**Como** coordenadora da UBS, **quero** ver a taxa de faltas por especialidade no mês **para que** eu
decida onde fazer lembrete ou encaixe.

```gherkin
Cenário: taxa de faltas
  Dado 10 consultas de Odontologia finalizadas em novembro, 3 com "faltou"
  Quando eu peço o relatório de novembro
  Então vejo Odontologia com 30% de faltas
```
