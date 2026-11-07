import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { criarStore } from '../../src/database/jsonStore.js';
import { criarAgendamentoRepository } from '../../src/repositories/agendamentoRepository.js';
import { criarEspecialidadeRepository } from '../../src/repositories/especialidadeRepository.js';
import { criarRelatorioService } from '../../src/services/relatorioService.js';

let service;
let agendamentos;
beforeEach(() => {
  const store = criarStore();
  agendamentos = criarAgendamentoRepository(store);
  service = criarRelatorioService({ agendamentos, especialidades: criarEspecialidadeRepository(store) });
});

const consulta = (especialidadeId, dia, status) => agendamentos.criar({
  paciente_id: 1, especialidade_id: especialidadeId, data_hora: `2026-11-${dia}T09:00`, status,
});
const status = (fn) => {
  try { fn(); return 'ok'; } catch (e) { return e.status; }
};

test('RF08: 3 faltas em 10 consultas de Odontologia dão 30% (US07)', () => {
  for (let i = 0; i < 10; i += 1) consulta(2, String(10 + i), i < 3 ? 'faltou' : 'realizado');
  const rel = service.faltasPorEspecialidade({ inicio: '2026-11-01', fim: '2026-11-30' });
  const odonto = rel.por_especialidade.find((l) => l.especialidade === 'Odontologia');
  assert.deepEqual(odonto, { especialidade_id: 2, especialidade: 'Odontologia', finalizados: 10, faltas: 3, taxa_faltas_pct: 30 });
  assert.deepEqual(rel.total, { finalizados: 10, faltas: 3, taxa_faltas_pct: 30 });
});

test('RF08: só conta realizado e faltou, e só dentro do período', () => {
  consulta(1, '10', 'faltou');
  consulta(1, '11', 'agendado');
  consulta(1, '12', 'cancelado');
  consulta(1, '25', 'faltou'); // fora do período
  const rel = service.faltasPorEspecialidade({ inicio: '2026-11-01', fim: '2026-11-15' });
  assert.deepEqual(rel.total, { finalizados: 1, faltas: 1, taxa_faltas_pct: 100 });
  assert.equal(rel.por_especialidade.find((l) => l.especialidade_id === 3).taxa_faltas_pct, 0, 'sem consultas = 0%');
});

test('RF08: período inválido gera 400', () => {
  assert.equal(status(() => service.faltasPorEspecialidade({ inicio: '2026-11-01' })), 400);
  assert.equal(status(() => service.faltasPorEspecialidade({ inicio: '01/11/2026', fim: '2026-11-30' })), 400);
  assert.equal(status(() => service.faltasPorEspecialidade({ inicio: '2026-11-30', fim: '2026-11-01' })), 400);
});
