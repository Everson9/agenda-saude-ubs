import { corpoErro, ErroAplicacao } from '../utils/erros.js';
import { loggerSilencioso } from '../utils/logger.js';

export function rotaNaoEncontrada(req, res) {
  res.status(404).json(corpoErro(404, 'rota não encontrada', 'ROTA_NAO_ENCONTRADA'));
}

// o Express reconhece o middleware de erro pelos 4 parâmetros
export function tratarErros(logger = loggerSilencioso) {
  return (err, req, res, next) => {
    if (err instanceof ErroAplicacao) {
      return res.status(err.status).json(corpoErro(err.status, err.message, err.codigo));
    }
    if (err.type === 'entity.parse.failed') {
      return res.status(400).json(corpoErro(400, 'JSON inválido', 'JSON_INVALIDO'));
    }
    // só tipo, mensagem e pilha: nada do corpo da requisição
    logger.erro('erro_interno', {
      requisicao_id: req.id,
      rota: req.originalUrl.split('?')[0],
      erro: err.name,
      detalhe: err.message,
      pilha: err.stack,
    });
    return res.status(500).json(corpoErro(500, 'erro interno'));
  };
}
