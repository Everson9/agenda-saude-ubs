import { criarApp } from './app.js';
import { auth, config, faltasParaProducao, SENHA_DESENVOLVIMENTO } from './config/index.js';
import { criarStore } from './database/jsonStore.js';
import { criarLogger } from './utils/logger.js';

const logger = criarLogger();

const faltas = faltasParaProducao();
if (faltas.length) {
  logger.erro('NODE_ENV=production exige login configurado; o servidor não vai iniciar', { faltam: faltas });
  process.exit(1);
}

if (!auth.senhaHash) {
  logger.aviso('AUTH_SENHA_HASH não definida', { usuario: auth.usuario, senha_local: SENHA_DESENVOLVIMENTO });
}
if (!auth.segredo) {
  logger.aviso('AUTH_SEGREDO não definido: as sessões caem quando o servidor reinicia');
}

const app = criarApp({ store: criarStore(config.arquivoBanco), auth, logger });

app.listen(config.porta, () => {
  logger.info('servidor iniciado', { url: `http://localhost:${config.porta}` });
});
