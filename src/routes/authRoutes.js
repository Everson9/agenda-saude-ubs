import { Router } from 'express';

export function authRoutes(service) {
  const r = Router();
  r.post('/login', (req, res) => res.json(service.login(req.body)));
  return r;
}
