import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { criarRelogio, subirApi, PACIENTE } from '../helpers.js';

const desligado = await subirApi();
const ligado = await subirApi(criarRelogio(), { avaliacao: true });
after(() => Promise.all([desligado.fechar(), ligado.fechar()]));

test('EVAL-ACCESS: desligado por padrão, a tela não oferece e a rota responde 404', async () => {
  assert.deepEqual((await desligado.semLogin('GET', '/api/auth/opcoes')).corpo, { avaliacao: false });
  const r = await desligado.semLogin('POST', '/api/auth/avaliacao');
  assert.equal(r.status, 404);
  assert.equal(r.corpo.codigo, 'ROTA_NAO_ENCONTRADA');
});

test('EVAL-ACCESS: ligado, o avaliador entra sem senha e usa a API', async () => {
  assert.deepEqual((await ligado.semLogin('GET', '/api/auth/opcoes')).corpo, { avaliacao: true });
  const { status, corpo } = await ligado.semLogin('POST', '/api/auth/avaliacao');
  assert.equal(status, 200);
  assert.equal(corpo.expira_em, new Date(2026, 10, 9, 16, 0).toISOString(), 'mesma validade de 8 h da recepção');

  const resp = await fetch(`${ligado.base}/api/pacientes`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${corpo.token}` },
    body: JSON.stringify(PACIENTE),
  });
  assert.equal(resp.status, 201);
});

test('EVAL-ACCESS: ligado, a senha da recepção continua valendo e a errada continua barrada', async () => {
  assert.equal((await ligado.semLogin('POST', '/api/auth/login', { usuario: 'recepcao', senha: 'recepcao123' })).status, 200);
  assert.equal((await ligado.semLogin('POST', '/api/auth/login', { usuario: 'avaliador', senha: 'x' })).status, 401);
});
