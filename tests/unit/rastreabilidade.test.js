import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

// TRC-TST (#50): a matriz de rastreabilidade aponta testes que existem de verdade
const doc = readFileSync('docs/requisitos.md', 'utf-8');
const matriz = doc.slice(doc.indexOf('## Matriz de rastreabilidade'));
const linhas = matriz.split('\n').filter((l) => /^\| (RF|RNF)\d+ \|/.test(l));

test('TRC-TST: todo RF de RF01 a RF08 e os RNF02 e RNF05 estão na matriz', () => {
  const codigos = linhas.map((l) => l.split('|')[1].trim());
  for (const c of ['RF01', 'RF02', 'RF03', 'RF04', 'RF05', 'RF06', 'RF07', 'RF08', 'RNF02', 'RNF05']) {
    assert.ok(codigos.includes(c), `${c} falta na matriz`);
  }
});

test('TRC-TST: cada teste citado na matriz existe no arquivo indicado', () => {
  let citados = 0;
  for (const linha of linhas) {
    const coluna = linha.split('|').at(-2);
    // cada trecho: `arquivo` › «nome» · «nome»
    for (const trecho of coluna.split(';')) {
      const arquivo = trecho.match(/`([^`]+\.test\.js)`/)?.[1];
      assert.ok(arquivo, `linha sem arquivo de teste: ${linha.slice(0, 40)}`);
      const caminho = `tests/${arquivo}`;
      assert.ok(existsSync(caminho), `${caminho} não existe`);
      const fonte = readFileSync(caminho, 'utf-8');
      for (const [, nome] of trecho.matchAll(/«([^»]+)»/g)) {
        assert.ok(fonte.includes(`'${nome}'`), `teste «${nome}» não encontrado em ${caminho}`);
        citados += 1;
      }
    }
  }
  assert.ok(citados >= 20);
});
