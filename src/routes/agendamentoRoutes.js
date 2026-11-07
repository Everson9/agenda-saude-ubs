import { Router } from 'express';

export function agendamentoRoutes(service) {
  const r = Router();
  r.post('/', (req, res) => res.status(201).json(service.agendar(req.body)));
  r.get('/', (req, res) => res.json(service.listar(req.query)));
  return r;
}
