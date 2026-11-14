# LGPD: mapa de dados pessoais

Versão 0.5.0 · atualizado em 14/11/2026 · issue #49 (LGPD-001)

O sistema trata dados de pacientes de uma UBS. Dado de saúde é **dado pessoal sensível** (LGPD, art. 5º, II),
então a regra é guardar só o necessário para marcar a consulta e mostrar o mínimo em cada tela.

## Mapa de dados

| Dado | Onde fica | Finalidade | Base legal (LGPD) | Sensível? | Exposição na API |
|---|---|---|---|---|---|
| Nome | `pacientes.nome` | Identificar o paciente na recepção e na agenda | Art. 7º, III e art. 11, II, b (execução de política pública de saúde) | Não | Completo |
| Cartão SUS | `pacientes.cartao_sus` | Identificação única no SUS, evitar cadastro duplicado | Art. 11, II, b e f (política pública; tutela da saúde) | Sim, identifica o usuário do SUS | **Mascarado na listagem** (`898 **** **** 7890`); completo só no cadastro e em `GET /api/pacientes/:id` |
| Telefone | `pacientes.telefone` | Avisar sobre a consulta | Art. 7º, III | Não | Completo |
| Data de nascimento | `pacientes.data_nascimento` | Conferir identidade no balcão | Art. 7º, III | Não | Completo |
| Agendamento (especialidade, data, status, motivo de cancelamento) | `agendamentos` | Organizar o atendimento e medir faltas (RF08) | Art. 11, II, f (tutela da saúde) | **Sim**: revela que a pessoa procura tal especialidade | Só para a recepção logada |

O relatório de faltas (RF08) é agregado por especialidade e não traz nenhum dado de paciente.

## Medidas aplicadas

| Medida | Onde |
|---|---|
| Login obrigatório em toda a API, senha em hash scrypt, token de 8 h | `src/services/authService.js`, `src/middlewares/autenticar.js` (#19) |
| Cartão SUS mascarado na listagem; busca continua usando o número completo no servidor | `src/utils/lgpd.js`, `pacienteService.listar` (#49) |
| `data/` (banco local) e `.env` fora do Git; testes só com dados fictícios | `.gitignore` |
| Varredura de segredos no histórico a cada PR | Gitleaks no CI (#43) |
| Nenhum dado pessoal nos logs | logs estruturados (#57) |

## Direitos do titular e retenção

- **Acesso e correção** (art. 18): feitos no balcão pela recepção. O MVP ainda não tem edição de cadastro;
  fica para uma próxima versão.
- **Retenção:** o prontuário segue as regras do SUS e do CFM. O MVP não apaga agendamentos antigos; a política
  de descarte é decisão da gestão da UBS.
- **Encarregado (DPO):** o da Secretaria Municipal de Saúde responsável pela UBS.

## Fora do escopo do MVP

Criptografia do arquivo em repouso, trilha de auditoria por usuário (hoje há um único login da recepção) e
consentimento eletrônico.
