# Documentação

Índice dos documentos do projeto, com a versão do sistema em que cada um foi alterado por último.
Ordem sugerida para quem chega agora: termo de abertura, requisitos, user stories, casos de uso e arquitetura.

| Documento | O que tem | Versão | Atualizado em |
|---|---|---|---|
| [project-charter.md](project-charter.md) | Termo de abertura: problema, objetivo, escopo, fora do escopo, partes interessadas e riscos | 0.1.0 | 07/11/2026 |
| [requisitos.md](requisitos.md) | RF01 a RF08, regras de negócio, RNF01 a RNF07 e a matriz de rastreabilidade até o teste exato | 0.5.0 | 14/11/2026 |
| [user-stories.md](user-stories.md) | US01 a US07 com critérios de aceite em Gherkin | 0.4.0 | 07/11/2026 |
| [casos-de-uso.md](casos-de-uso.md) | UC01 a UC05 com fluxo principal e alternativos | 0.1.0 | 07/11/2026 |
| [arquitetura.md](arquitetura.md) | C4, camadas, classes, DER, ciclo de vida, concorrência, logs, API e códigos de erro | 0.5.0 | 14/11/2026 |
| [lgpd.md](lgpd.md) | Mapa de dados pessoais, finalidade, base legal e medidas aplicadas | 0.5.0 | 14/11/2026 |
| [desempenho.md](desempenho.md) | Baseline do RNF01 com 5.000 e 20.000 agendamentos | 0.5.0 | 14/11/2026 |
| [acessibilidade.md](acessibilidade.md) | Auditoria axe-core e teclado, antes e depois, e checklist WCAG | 0.5.0 | 14/11/2026 |

Fora desta pasta: [README](../README.md) (como rodar), [CONTRIBUTING](../CONTRIBUTING.md) (fluxo de Git) e
[CHANGELOG](../CHANGELOG.md) (o que mudou em cada versão).

## Regra de sincronização docs ↔ código

1. **PR que muda comportamento muda o documento no mesmo PR.** Regra nova ou alterada (RF, RN, RNF) atualiza
   `requisitos.md`; rota, código de erro ou camada nova atualiza `arquitetura.md`; dado pessoal novo atualiza
   `lgpd.md`.
2. **Teste novo de requisito entra na matriz de rastreabilidade** com o nome exato. O teste
   `tests/unit/rastreabilidade.test.js` falha se a matriz citar um teste que não existe.
3. **Documento novo entra neste índice.** O teste `tests/unit/indice-docs.test.js` falha se algum arquivo de
   `docs/` ficar de fora.
4. Ao mexer num documento, atualizar a linha dele aqui (versão e data).
5. O checklist do pull request tem o item "Documentação em `docs/` atualizada"; o revisor confere antes do merge.
