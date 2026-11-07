import { test } from 'node:test';
import assert from 'node:assert/strict';
import { conferirSenha, gerarHash } from '../../src/utils/senha.js';

test('gerarHash nunca guarda a senha e usa sal diferente a cada vez', () => {
  const a = gerarHash('senha-forte-123');
  const b = gerarHash('senha-forte-123');
  assert.match(a, /^scrypt\$[0-9a-f]{32}\$[0-9a-f]{128}$/);
  assert.notEqual(a, b);
  assert.equal(a.includes('senha-forte-123'), false);
});

test('conferirSenha aceita a senha certa e recusa a errada ou hash malformado', () => {
  const hash = gerarHash('senha-forte-123');
  assert.equal(conferirSenha('senha-forte-123', hash), true);
  assert.equal(conferirSenha('senha-forte-124', hash), false);
  assert.equal(conferirSenha('qualquer', 'md5$abc'), false);
  assert.equal(conferirSenha('qualquer', undefined), false);
});
