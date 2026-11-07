import { criarApp } from './app.js';
import { config } from './config/index.js';

const app = criarApp();

app.listen(config.porta, () => {
  console.log(`Agenda Saúde UBS rodando em http://localhost:${config.porta}`);
});
