import express from 'express';
import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { SENHA_DESENVOLVIMENTO } from './config/index.js';
import { criarStore } from './database/jsonStore.js';
import { criarPacienteRepository } from './repositories/pacienteRepository.js';
import { criarEspecialidadeRepository } from './repositories/especialidadeRepository.js';
import { criarAgendamentoRepository } from './repositories/agendamentoRepository.js';
import { criarPacienteService } from './services/pacienteService.js';
import { criarAgendamentoService } from './services/agendamentoService.js';
import { criarRelatorioService } from './services/relatorioService.js';
import { criarAuthService } from './services/authService.js';
import { pacienteRoutes } from './routes/pacienteRoutes.js';
import { especialidadeRoutes } from './routes/especialidadeRoutes.js';
import { agendamentoRoutes } from './routes/agendamentoRoutes.js';
import { relatorioRoutes } from './routes/relatorioRoutes.js';
import { authRoutes } from './routes/authRoutes.js';
import { autenticar } from './middlewares/autenticar.js';
import { rotaNaoEncontrada, tratarErros } from './middlewares/tratarErros.js';
import { registrarRequisicao } from './middlewares/registrarRequisicao.js';
import { loggerSilencioso } from './utils/logger.js';
import { gerarHash } from './utils/senha.js';

/**
 * Monta a aplicação ligando as camadas: store -> repositories -> services -> routes.
 * `agora` é injetável para os testes controlarem o relógio.
 * Sem `auth`, usa a senha de desenvolvimento e um segredo aleatório (tokens não sobrevivem a reinício).
 * Sem `logger`, não registra nada (os testes ficam limpos); o server.js passa o logger JSON.
 */
export function criarApp({
  store = criarStore(), agora = () => new Date(), auth = {}, logger = loggerSilencioso,
} = {}) {
  const pacientes = criarPacienteRepository(store);
  const especialidades = criarEspecialidadeRepository(store);
  const agendamentos = criarAgendamentoRepository(store);

  const pacienteService = criarPacienteService({ pacientes, agora });
  const agendamentoService = criarAgendamentoService({ agendamentos, pacientes, especialidades, agora });
  const relatorioService = criarRelatorioService({ agendamentos, especialidades });
  const authService = criarAuthService({
    usuario: auth.usuario || 'recepcao',
    senhaHash: auth.senhaHash || gerarHash(SENHA_DESENVOLVIMENTO),
    segredo: auth.segredo || randomBytes(32).toString('hex'),
    agora,
  });

  const app = express();
  app.use(registrarRequisicao(logger));
  app.use(express.json());
  app.use(express.static(fileURLToPath(new URL('./public', import.meta.url))));

  // rotas públicas
  app.get('/api/saude', (req, res) => res.json({ status: 'ok' }));
  app.use('/api/auth', authRoutes(authService));

  // daqui para baixo, só com login (RNF05)
  app.use('/api', autenticar(authService));
  app.use('/api/pacientes', pacienteRoutes(pacienteService));
  app.use('/api/especialidades', especialidadeRoutes(especialidades));
  app.use('/api/agendamentos', agendamentoRoutes(agendamentoService));
  app.use('/api/relatorios', relatorioRoutes(relatorioService));
  app.use('/api', rotaNaoEncontrada);
  app.use(tratarErros(logger));

  return app;
}
