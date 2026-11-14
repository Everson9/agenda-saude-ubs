import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { carregarEnv } from '../../src/config/carregarEnv.js';

const pasta = mkdtempSync(join(tmpdir(), 'env-'));

test('ENV-EX: carrega as variáveis do arquivo quando ele existe', () => {
  const arquivo = join(pasta, '.env');
  writeFileSync(arquivo, 'TESTE_ENV_NOVA=valor-do-arquivo\n');
  assert.equal(carregarEnv(arquivo), true);
  assert.equal(process.env.TESTE_ENV_NOVA, 'valor-do-arquivo');
});

test('ENV-EX: variável que já veio do ambiente tem prioridade sobre o arquivo', () => {
  const arquivo = join(pasta, '.env.prioridade');
  writeFileSync(arquivo, 'TESTE_ENV_EXISTENTE=do-arquivo\n');
  process.env.TESTE_ENV_EXISTENTE = 'do-ambiente';
  carregarEnv(arquivo);
  assert.equal(process.env.TESTE_ENV_EXISTENTE, 'do-ambiente');
});

test('ENV-EX: sem arquivo, não falha e devolve false', () => {
  assert.equal(carregarEnv(join(pasta, 'nao-existe.env')), false);
});

test('ENV-EX: o .env.example lista toda variável que o código lê, sem segredo preenchido', () => {
  const exemplo = readFileSync('.env.example', 'utf-8');
  const lidas = new Set();
  const varrer = (dir) => {
    for (const item of readdirSync(dir, { withFileTypes: true })) {
      const caminho = join(dir, item.name);
      if (item.isDirectory()) varrer(caminho);
      else if (item.name.endsWith('.js')) {
        for (const m of readFileSync(caminho, 'utf-8').matchAll(/process\.env\.([A-Z_]+)/g)) lidas.add(m[1]);
      }
    }
  };
  varrer('src');
  lidas.delete('ENV_ARQUIVO'); // só aponta outro arquivo .env, não faz sentido dentro dele
  for (const nome of lidas) assert.match(exemplo, new RegExp(`^${nome}=`, 'm'), `${nome} falta no .env.example`);
  assert.match(exemplo, /^AUTH_SENHA_HASH=$/m);
  assert.match(exemplo, /^AUTH_SEGREDO=$/m);
});
