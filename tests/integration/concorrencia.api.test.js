import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { subirApi, PACIENTE } from '../helpers.js';

// DATA-ATOMIC (#48): requisições simultâneas para o mesmo horário não podem gerar dois agendamentos.
let api;
before(async () => {
  api = await subirApi();
  for (let i = 0; i < 20; i += 1) {
    const cartao = String(700000000000000 + i);
    await api.post('/api/pacientes', { ...PACIENTE, nome: `Paciente ${i}`, cartao_sus: cartao });
  }
});
after(() => api.fechar());

const agendar = (pacienteId, dataHora) => api.post('/api/agendamentos', {
  paciente_id: pacienteId, especialidade_id: 1, data_hora: dataHora,
});

test('DATA-ATOMIC: 20 requisições simultâneas no mesmo horário geram um 201 e dezenove 409', async () => {
  const respostas = await Promise.all(
    Array.from({ length: 20 }, (_, i) => agendar(i + 1, '2026-11-10T09:00')),
  );
  const status = respostas.map((r) => r.status);
  assert.equal(status.filter((s) => s === 201).length, 1);
  assert.equal(status.filter((s) => s === 409).length, 19);

  const { corpo } = await api.get('/api/agendamentos?data=2026-11-10');
  assert.equal(corpo.filter((a) => a.data_hora === '2026-11-10T09:00').length, 1);
});

test('DATA-ATOMIC: o mesmo paciente em paralelo na mesma especialidade e dia fica com um agendamento só', async () => {
  const horarios = ['2026-11-11T07:00', '2026-11-11T07:20', '2026-11-11T07:40', '2026-11-11T08:00'];
  const respostas = await Promise.all(horarios.map((h) => agendar(1, h)));
  assert.equal(respostas.filter((r) => r.status === 201).length, 1);
  assert.equal(respostas.filter((r) => r.status === 409).length, 3);
});

test('DATA-ATOMIC: horários diferentes em paralelo são todos aceitos e os ids não se repetem', async () => {
  const horarios = ['2026-11-12T07:00', '2026-11-12T07:20', '2026-11-12T07:40', '2026-11-12T08:00'];
  const respostas = await Promise.all(horarios.map((h, i) => agendar(i + 2, h)));
  assert.ok(respostas.every((r) => r.status === 201));
  const ids = respostas.map((r) => r.corpo.id);
  assert.equal(new Set(ids).size, ids.length);
});
