import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { ESPECIALIDADES_PADRAO } from './seed.js';

function estadoInicial() {
  return {
    seq: { pacientes: 0, agendamentos: 0 },
    pacientes: [],
    especialidades: structuredClone(ESPECIALIDADES_PADRAO),
    agendamentos: [],
  };
}

/**
 * Armazenamento em arquivo JSON (RNF02). Sem caminho, fica só em memória (usado nos testes).
 * Cada escrita grava num arquivo temporário e renomeia, para o arquivo nunca ficar pela metade.
 */
export function criarStore(caminho = null) {
  const estado = caminho && existsSync(caminho)
    ? JSON.parse(readFileSync(caminho, 'utf-8'))
    : estadoInicial();

  function persistir() {
    if (!caminho) return;
    mkdirSync(dirname(caminho), { recursive: true });
    const tmp = `${caminho}.tmp`;
    writeFileSync(tmp, JSON.stringify(estado, null, 2));
    renameSync(tmp, caminho);
  }

  return {
    todos: (colecao) => estado[colecao],
    porId: (colecao, id) => estado[colecao].find((item) => item.id === Number(id)) ?? null,
    inserir(colecao, dados) {
      estado.seq[colecao] += 1;
      const item = { id: estado.seq[colecao], ...dados };
      estado[colecao].push(item);
      persistir();
      return item;
    },
    atualizar(colecao, id, campos) {
      const item = this.porId(colecao, id);
      Object.assign(item, campos);
      persistir();
      return item;
    },
  };
}
