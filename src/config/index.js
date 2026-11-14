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

/** Login da recepção (RNF05). Sem as variáveis, o servidor usa a senha de desenvolvimento e avisa no log. */
export const auth = {
  usuario: process.env.AUTH_USUARIO || 'recepcao',
  senhaHash: process.env.AUTH_SENHA_HASH || null,
  segredo: process.env.AUTH_SEGREDO || null,
};
