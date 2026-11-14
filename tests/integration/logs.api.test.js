import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { criarApp } from '../../src/app.js';
import { criarStore } from '../../src/database/jsonStore.js';
import { criarLogger } from '../../src/utils/logger.js';
import { LOGIN, PACIENTE } from '../helpers.js';

// OBS-LOG (#57): log em JSON com nível, rota, status, duração e id da requisição, sem dado pessoal
const linhas = [];
const logger = criarLogger((linha) => linhas.push(JSON.parse(linha)));
let servidor;
let base;
let token;

// store que falha ao listar pacientes, para provocar um 500
function storeQuebrado() {
  const store = criarStore();
  const todos = store.todos;
  store.todos = (colecao) => {
    if (colecao === 'pacientes' && store.quebrar) throw new Error('disco indisponível');
    return todos(colecao);
  };
  return store;
}
const store = storeQuebrado();

async function chamar(metodo, caminho, corpo, headers = {}) {
  const resp = await fetch(base + caminho, {
    method: metodo,
    headers: { 'content-type': 'application/json', authorization: `Bearer ${token}`, ...headers },
    body: corpo === undefined ? undefined : JSON.stringify(corpo),
  });
  return { status: resp.status, id: resp.headers.get('x-request-id'), corpo: await resp.json() };
}

before(async () => {
  const app = criarApp({ store, logger });
  servidor = await new Promise((ok) => { const s = app.listen(0, () => ok(s)); });
  base = `http://127.0.0.1:${servidor.address().port}`;
  token = (await chamar('POST', '/api/auth/login', LOGIN)).corpo.token;
});
after(() => new Promise((ok) => servidor.close(ok)));

const ultimaDa = (id) => linhas.filter((l) => l.requisicao_id === id).at(-1);

test('OBS-LOG: cada requisição gera uma linha JSON com nível, rota, status e duração', async () => {
  const resp = await chamar('GET', '/api/especialidades');
  assert.match(resp.id, /^[\w-]{8,64}$/);
  const linha = ultimaDa(resp.id);
  assert.equal(linha.nivel, 'info');
  assert.equal(linha.metodo, 'GET');
  assert.equal(linha.rota, '/api/especialidades');
  assert.equal(linha.status, 200);
  assert.equal(typeof linha.duracao_ms, 'number');
  assert.ok(linha.ts);
});

test('OBS-LOG: reaproveita o X-Request-Id válido e ignora um inválido', async () => {
  assert.equal((await chamar('GET', '/api/especialidades', undefined, { 'x-request-id': 'proxy-abc-12345' })).id, 'proxy-abc-12345');
  assert.notEqual((await chamar('GET', '/api/especialidades', undefined, { 'x-request-id': 'x' })).id, 'x');
});

test('OBS-LOG: nenhum dado de paciente vai para o log', async () => {
  await chamar('POST', '/api/pacientes', PACIENTE);
  const busca = await chamar('GET', `/api/pacientes?busca=${encodeURIComponent('Maria da Silva')}`);
  assert.equal(ultimaDa(busca.id).rota, '/api/pacientes');
  const tudo = JSON.stringify(linhas);
  for (const dado of ['Maria', '898001234567890', '0012 3456', '99999-0000', '1980-05-12', LOGIN.senha]) {
    assert.ok(!tudo.includes(dado), `o log não pode conter "${dado}"`);
  }
});

test('OBS-LOG: erro 4xx sai como aviso e erro 500 sai como erro com o mesmo id da requisição', async () => {
  const naoAchou = await chamar('GET', '/api/pacientes/99');
  assert.equal(ultimaDa(naoAchou.id).nivel, 'aviso');

  store.quebrar = true;
  const falha = await chamar('GET', '/api/pacientes');
  store.quebrar = false;
  assert.equal(falha.status, 500);
  assert.equal(falha.corpo.codigo, 'ERRO_INTERNO');
  const doErro = linhas.filter((l) => l.requisicao_id === falha.id);
  const interno = doErro.find((l) => l.msg === 'erro_interno');
  assert.equal(interno.nivel, 'erro');
  assert.equal(interno.detalhe, 'disco indisponível');
  assert.equal(doErro.find((l) => l.msg === 'requisicao').status, 500);
});
