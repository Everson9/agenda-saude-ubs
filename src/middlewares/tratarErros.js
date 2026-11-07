import { ErroAplicacao } from '../utils/erros.js';

export function rotaNaoEncontrada(req, res) {
  res.status(404).json({ erro: 'rota não encontrada' });
}

// o Express reconhece o middleware de erro pelos 4 parâmetros
export function tratarErros(err, req, res, next) {
  if (err instanceof ErroAplicacao) return res.status(err.status).json({ erro: err.message });
  if (err.type === 'entity.parse.failed') return res.status(400).json({ erro: 'JSON inválido' });
  console.error(err);
  return res.status(500).json({ erro: 'erro interno' });
}
