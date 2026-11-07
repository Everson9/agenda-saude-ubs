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
