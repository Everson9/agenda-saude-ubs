import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { subirApi, LOGIN } from '../helpers.js';

let api;
before(async () => { api = await subirApi(); });
after(() => api.fechar());

test('RNF05: login correto devolve token com validade de 8 horas', async () => {
  const { status, corpo } = await api.semLogin('POST', '/api/auth/login', LOGIN);
  assert.equal(status, 200);
  assert.match(corpo.token, /^[\w-]+\.[\w-]+$/);
  assert.equal(corpo.expira_em, new Date(2026, 10, 9, 16, 0).toISOString());
});

test('RNF05: senha ou usuário errados devolvem 401 com a mesma mensagem', async () => {
  const senha = await api.semLogin('POST', '/api/auth/login', { ...LOGIN, senha: 'errada' });
  const usuario = await api.semLogin('POST', '/api/auth/login', { ...LOGIN, usuario: 'outro' });
  assert.equal(senha.status, 401);
  assert.equal(usuario.status, 401);
  assert.equal(senha.corpo.erro, usuario.corpo.erro, 'a mensagem não pode revelar qual campo errou');
});

test('RNF05: sem token a API devolve 401, menos /api/saude', async () => {
  assert.equal((await api.semLogin('GET', '/api/saude')).status, 200);
  for (const rota of ['/api/pacientes', '/api/especialidades', '/api/agendamentos', '/api/relatorios/faltas']) {
    assert.equal((await api.semLogin('GET', rota)).status, 401, rota);
  }
});

test('RNF05: token adulterado devolve 401', async () => {
  const [dados, assinatura] = api.token().split('.');
  const falso = Buffer.from(JSON.stringify({ sub: 'admin', exp: Date.now() * 2 })).toString('base64url');
  for (const token of [`${falso}.${assinatura}`, `${dados}.x${assinatura.slice(1)}`, 'lixo']) {
    const resp = await fetch(`${api.base}/api/pacientes`, { headers: { authorization: `Bearer ${token}` } });
    assert.equal(resp.status, 401, token);
  }
});

test('RNF05: token vence depois de 8 horas', async () => {
  assert.equal((await api.get('/api/pacientes')).status, 200);
  api.relogio.ir(new Date(2026, 10, 9, 16, 1));
  const { status, corpo } = await api.get('/api/pacientes');
  assert.equal(status, 401);
  assert.match(corpo.erro, /expirada/);
});
