import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';

// DOC-IDX (#53): todo documento de docs/ aparece no índice, com versão e data
test('DOC-IDX: o índice docs/README.md lista todo documento da pasta com versão e data', () => {
  const indice = readFileSync('docs/README.md', 'utf-8');
  const documentos = readdirSync('docs').filter((f) => f.endsWith('.md') && f !== 'README.md');
  assert.ok(documentos.length >= 8);
  for (const doc of documentos) {
    const linha = indice.split('\n').find((l) => l.startsWith(`| [${doc}](${doc})`));
    assert.ok(linha, `${doc} falta no índice docs/README.md`);
    assert.match(linha, /\| \d+\.\d+\.\d+ \| \d{2}\/\d{2}\/\d{4} \|$/, `${doc} sem versão ou data no índice`);
  }
});
