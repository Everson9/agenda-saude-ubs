# Termo de Abertura do Projeto (Project Charter)

| Campo | Valor |
|---|---|
| Projeto | Agenda Saúde UBS |
| Responsável | Everson José |
| Início | 07/11/2026 |
| Entrega desta etapa | 14/11/2026 (próxima aula) |
| Versão do documento | 1.0 |

## 1. Justificativa

Em muitas Unidades Básicas de Saúde (UBS) do interior, como as de Tacaratu (PE), a marcação de
consultas ainda é feita em caderno ou planilha. Isso gera três problemas recorrentes:

- **Fila na porta de madrugada**: o paciente precisa ir até a UBS só para marcar.
- **Horário marcado duas vezes**: sem uma grade única, dois pacientes ficam com o mesmo horário.
- **Falta sem registro**: ninguém sabe quantas consultas foram perdidas, então a gestão não consegue agir.

## 2. Visão do produto

Um sistema web simples, usado pela **recepção da UBS**, que mantém uma agenda única por
especialidade, impede conflito de horário e registra se o paciente compareceu. É uma base pequena
e bem testada, que pode crescer depois para o agendamento feito pelo próprio paciente (WhatsApp ou app).

## 3. Objetivos SMART

| # | Objetivo | Específico / Mensurável | Prazo |
|---|---|---|---|
| O1 | Eliminar horário duplicado | 0 agendamentos ativos no mesmo horário e especialidade, garantido por regra e por teste automatizado | v0.3.0 (07/11/2026) |
| O2 | Agilizar a marcação | Cadastrar o paciente e agendar em menos de 1 minuto pela tela da recepção | v0.3.0 |
| O3 | Medir as faltas | Registrar "realizado" ou "faltou" em 100% das consultas passadas | v0.3.0 (registro) / v0.4.0 (relatório) |
| O4 | Qualidade contínua | Todo PR passa por lint e testes no GitHub Actions antes do merge | v0.3.0 |

## 4. Escopo preliminar

### Dentro do escopo (esta semana)

- Cadastro e busca de pacientes (nome, cartão SUS, telefone e data de nascimento).
- Lista fixa de especialidades com duração da consulta.
- Agendamento com validação de grade, horário de funcionamento, dia útil e conflitos.
- Agenda do dia, cancelamento com motivo e registro de comparecimento.
- Tela web simples para a recepção.
- API REST documentada, testes automatizados e CI.

### Fora do escopo (expressamente)

- Login e perfis de acesso (planejado para a v0.4.0, issue #19).
- Relatório de faltas (planejado para a v0.4.0, issue #18).
- Agendamento feito pelo próprio paciente, lembretes por WhatsApp ou SMS.
- Prontuário eletrônico e integração com o e-SUS / CADSUS.
- Banco de dados relacional e hospedagem em produção.

## 5. Stakeholders e público-alvo

| Stakeholder | Papel | Interesse |
|---|---|---|
| Recepcionista da UBS | **Usuário principal** | Marcar rápido, sem conflito, e ver a agenda do dia |
| Paciente | Beneficiário | Ter horário garantido sem fila |
| Coordenação da UBS | Gestor | Saber a ocupação e as faltas para planejar |
| Professor da disciplina | Avaliador | Especificação, rastreabilidade e boas práticas de Git |
| Everson José | Desenvolvedor | Entregar um MVP funcional e bem documentado |

## 6. Premissas e restrições

- Uma UBS, de segunda a sexta, das 07:00 às 17:00.
- Os dados de teste são fictícios. Dado real de paciente não entra no repositório.
- Stack: Node.js 20+ e Express 5, com persistência em arquivo JSON e testes com `node:test`.

## 7. Riscos

| Risco | Impacto | Resposta |
|---|---|---|
| Arquivo JSON corromper numa queda | Perda da agenda | Escrita atômica (arquivo temporário + renomear), RNF02 |
| Escopo crescer durante a semana | Atraso | Fora do escopo escrito acima; ideias novas viram issue para depois |
| Dados pessoais expostos | Problema com a LGPD | `data/` no `.gitignore`, só dados fictícios nos testes |
