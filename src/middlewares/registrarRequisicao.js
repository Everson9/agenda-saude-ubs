import { randomUUID } from 'node:crypto';

const ID_VALIDO = /^[\w-]{8,64}$/;

/**
 * Dá um identificador a cada requisição (reaproveita o X-Request-Id do proxy, se vier válido),
 * devolve no cabeçalho e registra uma linha ao terminar, com rota, status e duração.
 * A rota é registrada sem a query string, porque a busca pode ter nome ou cartão SUS.
 */
export function registrarRequisicao(logger) {
  return (req, res, next) => {
    const recebido = String(req.headers['x-request-id'] ?? '');
    req.id = ID_VALIDO.test(recebido) ? recebido : randomUUID();
    res.setHeader('X-Request-Id', req.id);
    const inicio = process.hrtime.bigint();

    res.on('finish', () => {
      const duracaoMs = Number(process.hrtime.bigint() - inicio) / 1e6;
      const nivel = res.statusCode >= 500 ? 'erro' : res.statusCode >= 400 ? 'aviso' : 'info';
      logger[nivel]('requisicao', {
        requisicao_id: req.id,
        metodo: req.method,
        rota: req.originalUrl.split('?')[0],
        status: res.statusCode,
        duracao_ms: Math.round(duracaoMs * 100) / 100,
      });
    });
    next();
  };
}
