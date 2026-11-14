import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mascararCartaoSus } from '../../src/utils/lgpd.js';

test('LGPD-001: mascara o cartão SUS mantendo 3 primeiros e 4 últimos dígitos', () => {
  assert.equal(mascararCartaoSus('898001234567890'), '898 **** **** 7890');
  assert.equal(mascararCartaoSus('898 0012 3456 7890'), '898 **** **** 7890');
});

test('LGPD-001: valor fora do formato não vaza nenhum dígito', () => {
  assert.equal(mascararCartaoSus('123'), '***');
  assert.equal(mascararCartaoSus(undefined), '***');
});
