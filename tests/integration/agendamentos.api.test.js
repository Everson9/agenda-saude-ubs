import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { subirApi, PACIENTE } from '../helpers.js';

// relógio começa na segunda, 09/11/2026 08:00
let api;
before(async () => {
  api = await subirApi();
  await api.post('/api/pacientes', PACIENTE);
  await api.post('/api/pacientes', { ...PACIENTE, nome: 'João Pereira', cartao_sus: '700000000000001' });
});
after(() => api.fechar());

const agendar = (extra) => api.post('/api/agendamentos', {
  paciente_id: 1, especialidade_id: 1, data_hora: '2026-11-10T09:00', ...extra,
});

test('RF04: POST /api/agendamentos agenda e devolve 201', async () => {
  const { status, corpo } = await agendar();
  assert.equal(status, 201);
  assert.equal(corpo.status, 'agendado');
});

test('RF04: conflito de horário devolve 409 e data inexistente devolve 400 (#16)', async () => {
  assert.equal((await agendar({ paciente_id: 2 })).status, 409);
  assert.equal((await agendar({ paciente_id: 2, data_hora: '2026-11-31T09:00' })).status, 400);
  assert.equal((await agendar({ paciente_id: 99 })).status, 404);
});

test('RF05: agenda do dia sai em ordem de horário, com nomes', async () => {
  await agendar({ paciente_id: 2, data_hora: '2026-11-10T07:20' });
  const { corpo } = await api.get('/api/agendamentos?data=2026-11-10');
  assert.deepEqual(corpo.map((a) => a.data_hora), ['2026-11-10T07:20', '2026-11-10T09:00']);
  assert.equal(corpo[0].paciente, 'João Pereira');
  assert.equal(corpo[0].especialidade, 'Clínico Geral');
  assert.equal((await api.get('/api/agendamentos?data=10/11/2026')).status, 400);
});

test('RF06: PATCH /cancelar exige motivo', async () => {
  assert.equal((await api.patch('/api/agendamentos/1/cancelar', {})).status, 400);
  const { corpo } = await api.patch('/api/agendamentos/1/cancelar', { motivo: 'Paciente viajou' });
  assert.equal(corpo.status, 'cancelado');
});

test('RF07: PATCH /comparecimento depois do horário', async () => {
  assert.equal((await api.patch('/api/agendamentos/2/comparecimento', { status: 'realizado' })).status, 400);
  api.relogio.ir(new Date(2026, 10, 10, 12, 0));
  const { status, corpo } = await api.patch('/api/agendamentos/2/comparecimento', { status: 'realizado' });
  assert.equal(status, 200);
  assert.equal(corpo.status, 'realizado');
});
