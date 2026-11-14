import { existsSync } from 'node:fs';

/**
 * Lê o arquivo .env, se ele existir (ENV-EX, #52). Usa o leitor nativo do Node (20.12+), sem dependência.
 * Variável que já veio do ambiente (painel da hospedagem, docker compose) tem prioridade sobre o arquivo.
 */
export function carregarEnv(caminho = process.env.ENV_ARQUIVO || '.env') {
  if (!existsSync(caminho)) return false;
  process.loadEnvFile(caminho);
  return true;
}
