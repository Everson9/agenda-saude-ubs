import { criarApp } from '../src/app.js';
import { criarStore } from '../src/database/jsonStore.js';

export const PACIENTE = {
  nome: 'Maria da Silva',
  cartao_sus: '898 0012 3456 7890',
  telefone: '(87) 99999-0000',
  data_nascimento: '1980-05-12',
};

/** Relógio que o teste pode adiantar. Começa na segunda, 09/11/2026 08:00. */
export function criarRelogio(inicio = new Date(2026, 10, 9, 8, 0)) {
  let atual = inicio;
  return {
    agora: () => atual,
    ir: (data) => { atual = data; },
  };
}

/** Sobe a API numa porta livre, com banco em memória. */
export async function subirApi(relogio = criarRelogio()) {
  const app = criarApp({ store: criarStore(), agora: relogio.agora });
  const servidor = await new Promise((ok) => {
    const s = app.listen(0, () => ok(s));
  });
  const base = `http://127.0.0.1:${servidor.address().port}`;

  async function chamar(metodo, caminho, corpo) {
    const resp = await fetch(base + caminho, {
      method: metodo,
      headers: { 'content-type': 'application/json' },
      body: corpo === undefined ? undefined : JSON.stringify(corpo),
    });
    return { status: resp.status, corpo: await resp.json() };
  }

  return {
    base,
    relogio,
    get: (c) => chamar('GET', c),
    post: (c, b) => chamar('POST', c, b),
    patch: (c, b) => chamar('PATCH', c, b),
    fechar: () => new Promise((ok) => servidor.close(ok)),
  };
}
