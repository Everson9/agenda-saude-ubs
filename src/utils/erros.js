/** Erro de negócio com o status HTTP que ele deve gerar. */
export class ErroAplicacao extends Error {
  constructor(status, mensagem) {
    super(mensagem);
    this.status = status;
  }
}

export const requisicaoInvalida = (msg) => new ErroAplicacao(400, msg);
export const naoEncontrado = (msg) => new ErroAplicacao(404, msg);
export const conflito = (msg) => new ErroAplicacao(409, msg);
