import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { subirApi, PACIENTE } from '../helpers.js';

// API-ERR (#54): todo erro da API segue { erro, codigo, status }
let api;
before(async () => {
  api = await subirApi();
  await api.post('/api/pacientes', PACIENTE);
});
after(() => api.fechar());

function conferirFormato(resp, status, codigo) {
  assert.equal(resp.status, status);
  assert.deepEqual(Object.keys(resp.corpo).sort(), ['codigo', 'erro', 'status']);
  assert.equal(resp.corpo.status, status);
  assert.equal(resp.corpo.codigo, codigo);
  assert.equal(typeof resp.corpo.erro, 'string');
}

test('API-ERR: 400 de validação, 404 de recurso e 404 de rota usam o mesmo esquema', async () => {
  conferirFormato(await api.post('/api/pacientes', { nome: 'Jo' }), 400, 'REQUISICAO_INVALIDA');
  conferirFormato(await api.get('/api/pacientes/99'), 404, 'NAO_ENCONTRADO');
  conferirFormato(await api.get('/api/nao-existe'), 404, 'ROTA_NAO_ENCONTRADA');
});

test('API-ERR: conflitos de negócio têm código próprio e estável', async () => {
  conferirFormato(await api.post('/api/pacientes', PACIENTE), 409, 'CARTAO_SUS_DUPLICADO');
  const marcar = (extra) => api.post('/api/agendamentos', {
    paciente_id: 1, especialidade_id: 1, data_hora: '2026-11-10T09:00', ...extra,
  });
  assert.equal((await marcar()).status, 201);
  conferirFormato(await marcar(), 409, 'HORARIO_OCUPADO');
  conferirFormato(await marcar({ data_hora: '2026-11-10T10:00' }), 409, 'PACIENTE_JA_AGENDADO_NO_DIA');
  conferirFormato(await marcar({ data_hora: '2026-11-14T09:00' }), 400, 'FORA_DO_FUNCIONAMENTO');
  conferirFormato(await marcar({ data_hora: '2026-11-11T09:05' }), 400, 'FORA_DA_GRADE');
  conferirFormato(await marcar({ data_hora: '2026-11-02T09:00' }), 400, 'HORARIO_NO_PASSADO');
});

test('API-ERR: 401 sem login e JSON malformado seguem o esquema', async () => {
  conferirFormato(await api.semLogin('GET', '/api/pacientes'), 401, 'NAO_AUTORIZADO');
  conferirFormato(
    await api.semLogin('POST', '/api/auth/login', { usuario: 'recepcao', senha: 'errada' }),
    401,
    'CREDENCIAIS_INVALIDAS',
  );
  const resp = await fetch(`${api.base}/api/pacientes`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${api.token()}` },
    body: '{nome:',
  });
  conferirFormato({ status: resp.status, corpo: await resp.json() }, 400, 'JSON_INVALIDO');
});
