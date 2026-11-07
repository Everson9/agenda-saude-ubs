# Arquitetura

## Visão geral (C4 — nível 1 e 2)

```mermaid
flowchart TB
    rec([Recepcionista])
    subgraph UBS["Agenda Saúde UBS"]
      web["Tela web<br/>HTML + JS (src/public)"]
      api["API REST<br/>Node.js + Express 5"]
      db[("data/db.json<br/>arquivo JSON")]
    end
    rec -->|navegador| web
    web -->|fetch JSON /api/*| api
    api -->|leitura e escrita atômica| db
```

## Camadas (C4 — nível 3)

A requisição desce pelas camadas, e cada uma só conhece a de baixo:

```mermaid
flowchart LR
    R["routes/<br/>HTTP: lê req, devolve res"] --> S["services/<br/>regras de negócio (RN01 a RN07)"]
    S --> P["repositories/<br/>acesso aos dados"]
    P --> D["database/jsonStore<br/>persistência"]
    M["middlewares/tratarErros"] -.->|converte ErroAplicacao em 400/404/409| R
    U["utils/<br/>datas, erros"] -.-> S
```

| Pasta | Responsabilidade | Não pode |
|---|---|---|
| `src/routes` | Traduzir HTTP para chamada de service | Ter regra de negócio |
| `src/services` | Validar e aplicar as regras (RN01 a RN07) | Conhecer `req`/`res` |
| `src/repositories` | Ler e gravar entidades | Validar regra |
| `src/database` | Guardar em arquivo de forma atômica | Conhecer as entidades |
| `src/middlewares` | Tratar erros e rota inexistente | — |
| `src/utils` | Funções puras (datas, erros) | Ter estado |
| `src/config` | Porta, arquivo do banco e horário da UBS | — |
| `src/public` | Tela da recepção | Acessar o banco direto |

**Por que assim:** as regras ficam nos services, que recebem as dependências por parâmetro (injeção
de dependência). Isso deixa os testes unitários rodarem sem HTTP e com o relógio controlado
(`agora`). Trocar o JSON por PostgreSQL depois só muda `database/` e `repositories/`.

## Diagrama de classes (domínio)

```mermaid
classDiagram
    class Paciente {
      +int id
      +string nome
      +string cartao_sus
      +string telefone
      +date data_nascimento
    }
    class Especialidade {
      +int id
      +string nome
      +int duracao_min
    }
    class Agendamento {
      +int id
      +int paciente_id
      +int especialidade_id
      +datetime data_hora
      +Status status
      +string motivo_cancelamento
      +datetime criado_em
    }
    class Status {
      <<enumeration>>
      agendado
      cancelado
      realizado
      faltou
    }
    Paciente "1" --> "0..*" Agendamento
    Especialidade "1" --> "0..*" Agendamento
    Agendamento --> Status
```

## Modelo de dados (DER)

```mermaid
erDiagram
    PACIENTE ||--o{ AGENDAMENTO : "tem"
    ESPECIALIDADE ||--o{ AGENDAMENTO : "recebe"
    PACIENTE {
      int id PK
      string nome
      string cartao_sus UK "15 dígitos"
      string telefone
      date data_nascimento
    }
    ESPECIALIDADE {
      int id PK
      string nome
      int duracao_min
    }
    AGENDAMENTO {
      int id PK
      int paciente_id FK
      int especialidade_id FK
      datetime data_hora
      string status
      string motivo_cancelamento
      datetime criado_em
    }
```

## Ciclo de vida do agendamento

```mermaid
stateDiagram-v2
    [*] --> agendado: RF04 agendar
    agendado --> cancelado: RF06 cancelar (com motivo)
    agendado --> realizado: RF07 depois do horário
    agendado --> faltou: RF07 depois do horário
    cancelado --> [*]
    realizado --> [*]
    faltou --> [*]
```

## API

| Método | Rota | Requisito | Respostas |
|---|---|---|---|
| GET | `/api/saude` | — | 200 |
| POST | `/api/pacientes` | RF01 | 201, 400, 409 |
| GET | `/api/pacientes?busca=` | RF02 | 200 |
| GET | `/api/pacientes/:id` | RF02 | 200, 404 |
| GET | `/api/especialidades` | RF03 | 200 |
| POST | `/api/agendamentos` | RF04 | 201, 400, 404, 409 |
| GET | `/api/agendamentos?data=&especialidade_id=&paciente_id=` | RF05 | 200, 400 |
| PATCH | `/api/agendamentos/:id/cancelar` | RF06 | 200, 400, 404, 409 |
| PATCH | `/api/agendamentos/:id/comparecimento` | RF07 | 200, 400, 404, 409 |

Erros sempre no formato `{ "erro": "mensagem em português" }`.
