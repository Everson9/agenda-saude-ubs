import express from 'express';
import { fileURLToPath } from 'node:url';
import { criarStore } from './database/jsonStore.js';
import { criarPacienteRepository } from './repositories/pacienteRepository.js';
import { criarEspecialidadeRepository } from './repositories/especialidadeRepository.js';
import { criarAgendamentoRepository } from './repositories/agendamentoRepository.js';
import { criarPacienteService } from './services/pacienteService.js';
import { criarAgendamentoService } from './services/agendamentoService.js';
import { pacienteRoutes } from './routes/pacienteRoutes.js';
import { especialidadeRoutes } from './routes/especialidadeRoutes.js';
import { agendamentoRoutes } from './routes/agendamentoRoutes.js';
import { rotaNaoEncontrada, tratarErros } from './middlewares/tratarErros.js';

/**
 * Monta a aplicação ligando as camadas: store -> repositories -> services -> routes.
 * `agora` é injetável para os testes controlarem o relógio.
 */
export function criarApp({ store = criarStore(), agora = () => new Date() } = {}) {
  const pacientes = criarPacienteRepository(store);
  const especialidades = criarEspecialidadeRepository(store);
  const agendamentos = criarAgendamentoRepository(store);

  const pacienteService = criarPacienteService({ pacientes, agora });
  const agendamentoService = criarAgendamentoService({ agendamentos, pacientes, especialidades, agora });

  const app = express();
  app.use(express.json());
  app.use(express.static(fileURLToPath(new URL('./public', import.meta.url))));

  app.get('/api/saude', (req, res) => res.json({ status: 'ok' }));
  app.use('/api/pacientes', pacienteRoutes(pacienteService));
  app.use('/api/especialidades', especialidadeRoutes(especialidades));
  app.use('/api/agendamentos', agendamentoRoutes(agendamentoService));
  app.use('/api', rotaNaoEncontrada);
  app.use(tratarErros);

  return app;
}
