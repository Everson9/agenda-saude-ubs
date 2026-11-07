import { Router } from 'express';

// RF03
export function especialidadeRoutes(especialidades) {
  const r = Router();
  r.get('/', (req, res) => res.json(especialidades.todas()));
  return r;
}
