import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dataHoraValida, dataValida, diaDaSemana, formatarLocal, paraMinutos } from '../../src/utils/datas.js';

test('dataValida aceita datas reais e recusa formato errado', () => {
  assert.equal(dataValida('2026-11-09'), true);
  assert.equal(dataValida('09/11/2026'), false);
  assert.equal(dataValida('2026-13-01'), false);
});

test('dataHoraValida confere data e hora', () => {
  assert.equal(dataHoraValida('2026-11-10T09:00'), true);
  assert.equal(dataHoraValida('2026-11-10T24:00'), false);
  assert.equal(dataHoraValida('2026-11-10 09:00'), false);
});

test('formatarLocal, paraMinutos e diaDaSemana', () => {
  assert.equal(formatarLocal(new Date(2026, 10, 9, 7, 5)), '2026-11-09T07:05');
  assert.equal(paraMinutos('07:20'), 440);
  assert.equal(diaDaSemana('2026-11-09T10:00'), 1); // segunda
});
