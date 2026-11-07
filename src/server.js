import { criarApp } from './app.js';
import { config } from './config/index.js';
import { criarStore } from './database/jsonStore.js';

const app = criarApp({ store: criarStore(config.arquivoBanco) });

app.listen(config.porta, () => {
  console.log(`Agenda Saúde UBS rodando em http://localhost:${config.porta}`);
});
