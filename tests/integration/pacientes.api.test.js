import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { subirApi, PACIENTE } from '../helpers.js';

let api;
before(async () => { api = await subirApi(); });
after(() => api.fechar());

test('GET /api/saude responde ok', async () => {
  assert.deepEqual((await api.get('/api/saude')).corpo, { status: 'ok' });
});

test('RF01: POST /api/pacientes cadastra e normaliza o cartão SUS', async () => {
  const { status, corpo } = await api.post('/api/pacientes', PACIENTE);
  assert.equal(status, 201);
  assert.equal(corpo.cartao_sus, '898001234567890');
});

test('RF01: recusa cartão SUS duplicado, nome curto e cartão com tamanho errado', async () => {
  assert.equal((await api.post('/api/pacientes', { ...PACIENTE, nome: 'Outra Pessoa' })).status, 409);
  assert.equal((await api.post('/api/pacientes', { ...PACIENTE, nome: 'Jo' })).status, 400);
  assert.equal((await api.post('/api/pacientes', { ...PACIENTE, cartao_sus: '123' })).status, 400);
});

test('RF02: GET /api/pacientes busca por parte do nome', async () => {
  await api.post('/api/pacientes', { ...PACIENTE, nome: 'João Pereira', cartao_sus: '700000000000001' });
  const { corpo } = await api.get('/api/pacientes?busca=joão');
  assert.deepEqual(corpo.map((p) => p.nome), ['João Pereira']);
  assert.equal((await api.get('/api/pacientes/99')).status, 404);
});

test('LGPD-001: a listagem devolve o cartão SUS mascarado e a busca pelo cartão continua funcionando', async () => {
  const lista = (await api.get('/api/pacientes')).corpo;
  assert.ok(lista.length > 0);
  assert.ok(lista.every((p) => /^\d{3} \*{4} \*{4} \d{4}$/.test(p.cartao_sus)));
  assert.ok(!JSON.stringify(lista).includes('898001234567890'));

  const porCartao = (await api.get(`/api/pacientes?busca=${encodeURIComponent('898 0012 3456')}`)).corpo;
  assert.deepEqual(porCartao.map((p) => p.nome), ['Maria da Silva']);
  assert.equal(porCartao[0].cartao_sus, '898 **** **** 7890');
});

test('RF03: GET /api/especialidades lista as 4 especialidades', async () => {
  const { corpo } = await api.get('/api/especialidades');
  assert.equal(corpo.length, 4);
});

test('JSON malformado e rota inexistente', async () => {
  const resp = await fetch(`${api.base}/api/pacientes`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: '{nome:',
  });
  assert.equal(resp.status, 400);
  assert.equal((await api.get('/api/nao-existe')).status, 404);
});
