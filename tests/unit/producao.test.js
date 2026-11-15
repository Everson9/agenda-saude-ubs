import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { faltasParaProducao } from '../../src/config/index.js';

test('SEC-DEFAULT: fora de produção, nada é exigido', () => {
  assert.deepEqual(faltasParaProducao({}), []);
  assert.deepEqual(faltasParaProducao({ NODE_ENV: 'development' }), []);
});

test('SEC-DEFAULT: em produção sem login, aponta as duas variáveis', () => {
  assert.deepEqual(faltasParaProducao({ NODE_ENV: 'production' }), ['AUTH_SENHA_HASH', 'AUTH_SEGREDO']);
  assert.deepEqual(faltasParaProducao({ NODE_ENV: 'production', AUTH_SENHA_HASH: 'scrypt$x' }), ['AUTH_SEGREDO']);
});

test('SEC-DEFAULT: em produção com as duas variáveis, pode iniciar', () => {
  assert.deepEqual(faltasParaProducao({ NODE_ENV: 'production', AUTH_SENHA_HASH: 'scrypt$x', AUTH_SEGREDO: 'abc' }), []);
});

test('SEC-DEFAULT: o servidor sai com código 1 em produção sem login', () => {
  const env = { ...process.env, NODE_ENV: 'production', ENV_ARQUIVO: 'nao-existe.env', PORT: '0' };
  delete env.AUTH_SENHA_HASH;
  delete env.AUTH_SEGREDO;
  const r = spawnSync(process.execPath, ['src/server.js'], { env, encoding: 'utf-8', timeout: 10000 });
  assert.equal(r.status, 1);
  assert.match(r.stdout + r.stderr, /AUTH_SENHA_HASH/);
});
