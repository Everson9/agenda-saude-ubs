import { Router } from 'express';

export function pacienteRoutes(service) {
  const r = Router();
  r.post('/', (req, res) => res.status(201).json(service.cadastrar(req.body)));
  return r;
}
