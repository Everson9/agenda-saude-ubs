import { carregarEnv } from './carregarEnv.js';

carregarEnv();

export const config = {
  porta: Number(process.env.PORT) || 3000,
  arquivoBanco: process.env.DB_ARQUIVO || 'data/db.json',
};

/** Regras de funcionamento da UBS (RNF e regras de negócio do docs/requisitos.md). */
export const funcionamento = {
  abertura: '07:00',
  fechamento: '17:00',
  diasUteis: [1, 2, 3, 4, 5], // segunda a sexta
};

/** Senha só para rodar localmente. Em qualquer ambiente publicado, defina AUTH_SENHA_HASH. */
export const SENHA_DESENVOLVIMENTO = 'recepcao123';

/** Login da recepção (RNF05). Sem as variáveis, o servidor usa a senha de desenvolvimento e avisa no log
 * (só fora de produção: em produção ele nem inicia, ver faltasParaProducao). */
export const auth = {
  usuario: process.env.AUTH_USUARIO || 'recepcao',
  senhaHash: process.env.AUTH_SENHA_HASH || null,
  segredo: process.env.AUTH_SEGREDO || null,
};

/**
 * Variáveis de login que faltam para rodar em produção (SEC-DEFAULT, #76).
 * Com NODE_ENV=production, a senha de desenvolvimento e o segredo aleatório não são aceitos:
 * o servidor recusa iniciar em vez de abrir a agenda com a senha publicada no README.
 * @param {NodeJS.ProcessEnv} env
 * @returns {string[]} nomes das variáveis ausentes (vazio = pode iniciar)
 */
export function faltasParaProducao(env = process.env) {
  if (env.NODE_ENV !== 'production') return [];
  return ['AUTH_SENHA_HASH', 'AUTH_SEGREDO'].filter((nome) => !env[nome]);
}
