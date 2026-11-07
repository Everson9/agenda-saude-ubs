import { Router } from 'express';

export function relatorioRoutes(service) {
  const r = Router();
  r.get('/faltas', (req, res) => res.json(service.faltasPorEspecialidade(req.query)));
  return r;
}
