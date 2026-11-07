import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { criarStore } from '../../src/database/jsonStore.js';

test('RNF02: os dados sobrevivem a uma nova abertura do arquivo', () => {
  const pasta = mkdtempSync(join(tmpdir(), 'agenda-'));
  const arquivo = join(pasta, 'sub', 'db.json');
  try {
    const store = criarStore(arquivo);
    store.inserir('pacientes', { nome: 'Maria' });
    store.atualizar('pacientes', 1, { nome: 'Maria da Silva' });

    const reaberto = criarStore(arquivo);
    assert.deepEqual(reaberto.porId('pacientes', 1), { id: 1, nome: 'Maria da Silva' });
    assert.equal(reaberto.todos('especialidades').length, 4);
    assert.equal(existsSync(`${arquivo}.tmp`), false, 'o arquivo temporário da escrita atômica não pode sobrar');
  } finally {
    rmSync(pasta, { recursive: true, force: true });
  }
});

test('store sem caminho fica só em memória e devolve null para id inexistente', () => {
  const store = criarStore();
  assert.equal(store.porId('pacientes', 99), null);
  assert.equal(store.inserir('agendamentos', { status: 'agendado' }).id, 1);
});
