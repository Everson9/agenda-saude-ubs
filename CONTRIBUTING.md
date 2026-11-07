# Como contribuir

## Fluxo

1. Toda mudança começa numa **issue**, com o requisito e os critérios de aceite.
2. Crie a branch a partir da `develop`:
   - `feature/issue-NN-descricao-curta` para funcionalidade ou documento
   - `fix/issue-NN-descricao-curta` para bug
3. Faça **commits atômicos** no padrão [Conventional Commits](https://www.conventionalcommits.org/pt-br/),
   sempre com o número da issue no final:

   ```text
   feat(agendamento): impedir horário duplicado na especialidade (#10)
   fix(datas): recusar data inexistente no calendário (#16)
   docs(requisitos): detalhar requisitos não funcionais (#2)
   test(agendamento): cobrir regras de grade e horário (#15)
   ```

   | Tipo | Quando usar |
   |---|---|
   | `feat` | Nova funcionalidade |
   | `fix` | Correção de bug |
   | `docs` | Somente documentação |
   | `test` | Somente testes |
   | `refactor` | Muda o código sem mudar o comportamento |
   | `chore` | Configuração, dependências, versão |
   | `ci` | Pipeline do GitHub Actions |

4. Abra o **Pull Request para a `develop`** com `Closes #NN` na descrição. O CI precisa passar.
5. **Release:** `release/X.Y.Z` sai da `develop`, atualiza o `CHANGELOG.md` e o `package.json`, entra
   na `main` por PR e recebe a **tag anotada** `vX.Y.Z` ([SemVer](https://semver.org/lang/pt-BR/)).

## Versionamento (SemVer)

- `MAJOR`: quebra a API (ex.: muda o formato de uma rota)
- `MINOR`: nova funcionalidade compatível
- `PATCH`: correção compatível

Enquanto o projeto estiver em `0.x`, cada marco da semana é uma versão `MINOR`.

## Antes de abrir o PR

```bash
npm run lint
npm test
```
