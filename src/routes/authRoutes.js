import { Router } from 'express';

export function authRoutes(service) {
  const r = Router();
  r.post('/login', (req, res) => res.json(service.login(req.body)));
  r.get('/opcoes', (req, res) => res.json(service.opcoes()));
  r.post('/avaliacao', (req, res) => res.json(service.entrarComoAvaliador()));
  return r;
}
