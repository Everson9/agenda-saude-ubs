// Gera o valor de AUTH_SENHA_HASH. Uso: npm run hash-senha -- "minha senha forte"
import { gerarHash } from '../src/utils/senha.js';

const senha = process.argv[2];
if (!senha || senha.length < 8) {
  console.error('Informe uma senha com ao menos 8 caracteres: npm run hash-senha -- "minha senha"');
  process.exit(1);
}
console.log(gerarHash(senha));
