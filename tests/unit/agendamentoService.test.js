import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { criarStore } from '../../src/database/jsonStore.js';
import { criarPacienteRepository } from '../../src/repositories/pacienteRepository.js';
import { criarEspecialidadeRepository } from '../../src/repositories/especialidadeRepository.js';
import { criarAgendamentoRepository } from '../../src/repositories/agendamentoRepository.js';
import { criarAgendamentoService } from '../../src/services/agendamentoService.js';
import { criarRelogio } from '../helpers.js';

let service;
let relogio;
beforeEach(() => {
  const store = criarStore();
  const pacientes = criarPacienteRepository(store);
  pacientes.criar({ nome: 'Maria', cartao_sus: '898001234567890' });
  pacientes.criar({ nome: 'João', cartao_sus: '700000000000001' });
  relogio = criarRelogio();
  service = criarAgendamentoService({
    agendamentos: criarAgendamentoRepository(store),
    pacientes,
    especialidades: criarEspecialidadeRepository(store),
    agora: relogio.agora,
  });
});

const pedido = (extra) => ({ paciente_id: 1, especialidade_id: 1, data_hora: '2026-11-10T09:00', ...extra });
const status = (fn) => {
  try { fn(); return 'ok'; } catch (e) { return e.status; }
};

test('RF04: agenda dentro da grade', () => {
  assert.equal(service.agendar(pedido()).status, 'agendado');
});

test('RF04: horário ocupado e paciente repetido no dia geram conflito', () => {
  service.agendar(pedido());
  assert.equal(status(() => service.agendar(pedido({ paciente_id: 2 }))), 409);
  assert.equal(status(() => service.agendar(pedido({ data_hora: '2026-11-10T10:00' }))), 409);
});

test('RF04: recusa passado, fim de semana, fora do horário e fora da grade', () => {
  for (const dataHora of ['2026-11-06T09:00', '2026-11-14T09:00', '2026-11-10T06:40', '2026-11-10T16:50', '2026-11-10T09:05']) {
    assert.equal(status(() => service.agendar(pedido({ data_hora: dataHora }))), 400, dataHora);
  }
});

test('RF06: cancelamento exige motivo e libera o horário', () => {
  const ag = service.agendar(pedido());
  assert.equal(status(() => service.cancelar(ag.id, '  ')), 400);
  assert.equal(service.cancelar(ag.id, 'Paciente viajou').status, 'cancelado');
  assert.equal(service.agendar(pedido({ paciente_id: 2 })).status, 'agendado');
  assert.equal(status(() => service.cancelar(ag.id, 'de novo')), 409);
});

test('RF07: comparecimento só depois do horário e uma única vez', () => {
  const ag = service.agendar(pedido());
  assert.equal(status(() => service.registrarComparecimento(ag.id, 'realizado')), 400);
  relogio.ir(new Date(2026, 10, 10, 9, 30));
  assert.equal(status(() => service.registrarComparecimento(ag.id, 'talvez')), 400);
  assert.equal(service.registrarComparecimento(ag.id, 'faltou').status, 'faltou');
  assert.equal(status(() => service.registrarComparecimento(ag.id, 'realizado')), 409);
});
