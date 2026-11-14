/**
 * Log estruturado: uma linha JSON por evento (OBS-LOG, #57).
 * Regra: nunca passar corpo de requisição, query string ou dado de paciente no contexto.
 */
export function criarLogger(escrever = (linha) => process.stdout.write(`${linha}\n`), agora = () => new Date()) {
  const registrar = (nivel) => (msg, contexto = {}) => {
    escrever(JSON.stringify({ ts: agora().toISOString(), nivel, msg, ...contexto }));
  };
  return { info: registrar('info'), aviso: registrar('aviso'), erro: registrar('erro') };
}

/** Logger que descarta tudo (padrão nos testes). */
export const loggerSilencioso = criarLogger(() => {});
