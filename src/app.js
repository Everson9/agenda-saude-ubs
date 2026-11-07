import express from 'express';
import { criarStore } from './database/jsonStore.js';
import { criarPacienteRepository } from './repositories/pacienteRepository.js';
import { criarPacienteService } from './services/pacienteService.js';
import { pacienteRoutes } from './routes/pacienteRoutes.js';
import { rotaNaoEncontrada, tratarErros } from './middlewares/tratarErros.js';

/**
 * Monta a aplicação ligando as camadas: store -> repositories -> services -> routes.
 * `agora` é injetável para os testes controlarem o relógio.
 */
export function criarApp({ store = criarStore(), agora = () => new Date() } = {}) {
  const pacientes = criarPacienteRepository(store);

  const pacienteService = criarPacienteService({ pacientes, agora });

  const app = express();
  app.use(express.json());

  app.get('/api/saude', (req, res) => res.json({ status: 'ok' }));
  app.use('/api/pacientes', pacienteRoutes(pacienteService));
  app.use('/api', rotaNaoEncontrada);
  app.use(tratarErros);

  return app;
}
