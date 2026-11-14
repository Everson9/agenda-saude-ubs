import { corpoErro, ErroAplicacao } from '../utils/erros.js';

export function rotaNaoEncontrada(req, res) {
  res.status(404).json(corpoErro(404, 'rota não encontrada', 'ROTA_NAO_ENCONTRADA'));
}

// o Express reconhece o middleware de erro pelos 4 parâmetros
export function tratarErros(err, req, res, next) {
  if (err instanceof ErroAplicacao) {
    return res.status(err.status).json(corpoErro(err.status, err.message, err.codigo));
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json(corpoErro(400, 'JSON inválido', 'JSON_INVALIDO'));
  }
  console.error(err);
  return res.status(500).json(corpoErro(500, 'erro interno'));
}
