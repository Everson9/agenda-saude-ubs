# Acessibilidade da tela da recepção

Versão 0.5.0 · auditado em 14/11/2026 · issue #56 (A11Y-CHK)

## Como auditar

```bash
npm run a11y    # precisa do Google Chrome; outro navegador: CHROME_PATH=/caminho/do/chrome npm run a11y
```

`scripts/auditar-a11y.js` sobe a API com dados fictícios, abre a tela num Chrome sem janela e:

1. Roda o **axe-core 4.14** com as regras WCAG 2.1 A e AA e as boas práticas, em quatro estados: login e tela
   principal (agenda e relatório preenchidos), em 1280 px e em 360 px de largura.
2. Percorre a tela **só com Tab** e confere se cada controle recebe foco com contorno de pelo menos 2 px.
3. Sai com erro se houver violação séria ou crítica, ou controle sem foco visível. O CI roda a auditoria a cada
   PR (job `acessibilidade`).

## Resultado

| | Antes (v0.4.0) | Depois (v0.5.0) |
|---|---|---|
| Violações sérias ou críticas (axe) | 0 | 0 |
| Violações moderadas (axe) | 2: tela de login sem landmark `main` | 0 |
| Controles alcançados com Tab | 20 | 22 (inclui as duas tabelas roláveis) |
| Controles com foco visível de 2 px ou mais | 0 de 20 (só o anel fino do navegador) | 22 de 22 |
| Página rola na horizontal em 360 px | **sim**: a tabela da agenda empurrava a página para 512 px | não: a tabela rola dentro da caixa |

## Checklist

| Item | WCAG | Situação |
|---|---|---|
| Todo campo tem rótulo visível ligado ao campo (`<label>` envolvendo o `input`) | 1.3.1, 3.3.2 | ok |
| Dica do cartão SUS visível e ligada por `aria-describedby` (antes era só `placeholder`, que some ao digitar) | 3.3.2 | corrigido |
| Foco visível: anel de 3 px escuro com folga branca, legível no fundo claro e no verde do cabeçalho | 2.4.7 | corrigido |
| Link "Pular para o conteúdo" no primeiro Tab | 2.4.1 | corrigido |
| Uma região `main` também na tela de login | 1.3.1 | corrigido |
| Botões da agenda dizem de quem são ("Compareceu: Maria da Silva, 09:00"); antes o leitor ouvia "Compareceu" repetido | 2.4.6, 4.1.2 | corrigido |
| Tabelas com `caption` e `th scope="col"` | 1.3.1 | corrigido |
| Agenda vazia diz "Nenhuma consulta neste dia." em vez de tabela em branco | 3.3.1 | corrigido |
| Depois do login o foco vai para "Novo paciente"; depois de sair, para o campo Usuário | 2.4.3 | corrigido |
| Mensagens de sucesso e erro em região `aria-live`; erro de login com `role="alert"` | 4.1.3 | ok |
| Reflow em 320/360 px sem rolagem horizontal da página | 1.4.10 | corrigido |
| Contraste do texto: principal 15,2:1, apoio 7,3:1, botão 6,5:1, erro 6,6:1 | 1.4.3 | ok |
| Contorno dos campos: 3,7:1 (antes `#d4dce3`, 1,4:1) | 1.4.11 | corrigido |
| Idioma da página (`lang="pt-BR"`) e título | 3.1.1, 2.4.2 | ok |
| Alvos de toque com pelo menos 24 px de altura | 2.5.8 | ok (botões com cerca de 42 px) |
| Sem animação na tela | 2.3.3 | ok |

## Limites

- A auditoria automática pega por volta de metade dos problemas possíveis. Ainda falta um percurso com leitor
  de tela real (NVDA no Windows ou TalkBack no celular) nos fluxos de login e agendamento.
- O cancelamento pede o motivo com `prompt()` do navegador: é acessível, mas simples. Um diálogo próprio fica
  para uma próxima versão.
