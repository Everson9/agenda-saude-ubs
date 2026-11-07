import express from 'express';
import { criarStore } from './database/jsonStore.js';
import { rotaNaoEncontrada, tratarErros } from './middlewares/tratarErros.js';

/**
 * `agora` é injetável para os testes controlarem o relógio.
 */
export function criarApp({ store = criarStore(), agora = () => new Date() } = {}) {
  const app = express();
  app.use(express.json());

  app.get('/api/saude', (req, res) => res.json({ status: 'ok' }));
  app.use('/api', rotaNaoEncontrada);
  app.use(tratarErros);

  return app;
}
