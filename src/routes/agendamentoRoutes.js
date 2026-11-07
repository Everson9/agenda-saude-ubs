import { Router } from 'express';

export function agendamentoRoutes(service) {
  const r = Router();
  r.post('/', (req, res) => res.status(201).json(service.agendar(req.body)));
  r.get('/', (req, res) => res.json(service.listar(req.query)));
  r.patch('/:id/cancelar', (req, res) => res.json(service.cancelar(req.params.id, req.body?.motivo)));
  r.patch('/:id/comparecimento', (req, res) => res.json(service.registrarComparecimento(req.params.id, req.body?.status)));
  return r;
}
