import { Router } from 'express';

export function pacienteRoutes(service) {
  const r = Router();
  r.post('/', (req, res) => res.status(201).json(service.cadastrar(req.body)));
  r.get('/', (req, res) => res.json(service.listar(String(req.query.busca ?? ''))));
  r.get('/:id', (req, res) => res.json(service.obter(req.params.id)));
  return r;
}
