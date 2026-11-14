/** Código padrão de cada status, usado quando o erro não tem um código próprio (API-ERR, #54). */
export const CODIGO_PADRAO = {
  400: 'REQUISICAO_INVALIDA',
  401: 'NAO_AUTORIZADO',
  404: 'NAO_ENCONTRADO',
  409: 'CONFLITO',
  500: 'ERRO_INTERNO',
};

/** Erro de negócio com o status HTTP que ele deve gerar e um código estável para o cliente. */
export class ErroAplicacao extends Error {
  constructor(status, mensagem, codigo = CODIGO_PADRAO[status]) {
    super(mensagem);
    this.status = status;
    this.codigo = codigo;
  }
}

export const requisicaoInvalida = (msg, codigo) => new ErroAplicacao(400, msg, codigo);
export const naoEncontrado = (msg, codigo) => new ErroAplicacao(404, msg, codigo);
export const conflito = (msg, codigo) => new ErroAplicacao(409, msg, codigo);
export const naoAutorizado = (msg, codigo) => new ErroAplicacao(401, msg, codigo);

/** Corpo único de erro da API: { erro, codigo, status }. */
export const corpoErro = (status, erro, codigo = CODIGO_PADRAO[status]) => ({ erro, codigo, status });
