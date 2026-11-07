import { criarApp } from './app.js';
import { auth, config, SENHA_DESENVOLVIMENTO } from './config/index.js';
import { criarStore } from './database/jsonStore.js';

if (!auth.senhaHash) {
  console.warn(`AVISO: AUTH_SENHA_HASH não definida. Login local: ${auth.usuario} / ${SENHA_DESENVOLVIMENTO}`);
}
if (!auth.segredo) {
  console.warn('AVISO: AUTH_SEGREDO não definido. As sessões caem quando o servidor reinicia.');
}

const app = criarApp({ store: criarStore(config.arquivoBanco), auth });

app.listen(config.porta, () => {
  console.log(`Agenda Saúde UBS rodando em http://localhost:${config.porta}`);
});
