# Desempenho: baseline do RNF01

Versão 0.5.0 · medido em 14/11/2026 · issue #55 (PERF-BASE)

**RNF01:** as operações da API devem responder em menos de **300 ms** com até **5.000 agendamentos**.

## Como medir

```bash
npm run perf               # 5.000 agendamentos, 50 medições por fluxo
npm run perf -- 20000 30   # carga maior: 20.000 agendamentos, 30 medições
```

O script `scripts/medir-desempenho.js`:

1. Gera um `db.json` válido numa pasta temporária: 600 pacientes e os agendamentos preenchendo todas as vagas
   das 4 especialidades em dias úteis a partir de 01/03/2027, com status variados (agendado, realizado, faltou,
   cancelado).
2. Sobe a API de verdade, com o banco **em arquivo** (cada escrita regrava o JSON inteiro, que é o pior caso
   do projeto), e faz login.
3. Mede pela HTTP cada fluxo principal, depois de uma chamada de aquecimento, e mostra p50, p95 e máximo.
4. Sai com código 1 se algum p95 passar de 300 ms. O CI roda o script a cada PR (job `desempenho`).

## Resultado (máquina de desenvolvimento, Windows 10, Node 24)

5.000 agendamentos, arquivo de 1.034 KB:

| Fluxo | Medições | p50 (ms) | p95 (ms) | Máx (ms) | RNF01 |
|---|---|---|---|---|---|
| RF02 listar pacientes (busca) | 50 | 3,8 | 5,8 | 6,5 | ok |
| RF05 agenda do dia | 50 | 2,3 | 2,9 | 3,6 | ok |
| RF05 agenda do paciente | 50 | 2,2 | 3,3 | 4,0 | ok |
| RF04 agendar (grava o arquivo) | 39 | 9,0 | 11,9 | 21,0 | ok |
| RF06 cancelar (grava o arquivo) | 39 | 9,4 | 11,0 | 11,1 | ok |
| RF08 relatório de faltas (ano) | 50 | 2,0 | 2,9 | 3,4 | ok |

Com **20.000** agendamentos (4 vezes o limite, arquivo de 3,8 MB) o pior p95 foi 27,8 ms, no cancelamento.

## Leitura

- A leitura é barata: tudo fica em memória e os filtros percorrem a lista uma vez.
- O custo que cresce é a **escrita**, porque o `jsonStore` regrava o arquivo inteiro a cada alteração
  (cerca de 2 ms por 1.000 agendamentos). Pela tendência medida, o p95 só chegaria perto de 300 ms com algo
  na casa de 200 mil agendamentos.
- Quando chegar perto disso, o caminho é trocar o JSON por SQLite ou PostgreSQL, que grava só a linha alterada
  (a troca fica restrita a `database/` e `repositories/`, ver `arquitetura.md`).
