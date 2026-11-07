import express from 'express';
import { rotaNaoEncontrada, tratarErros } from './middlewares/tratarErros.js';

/** Monta a aplicação. As camadas entram nas próximas issues. */
export function criarApp() {
  const app = express();
  app.use(express.json());

  app.get('/api/saude', (req, res) => res.json({ status: 'ok' }));
  app.use('/api', rotaNaoEncontrada);
  app.use(tratarErros);

  return app;
}
