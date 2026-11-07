import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

/** Gera "scrypt$<sal>$<hash>" (hex). A senha em texto puro nunca é guardada. */
export function gerarHash(senha) {
  const sal = randomBytes(16).toString('hex');
  return `scrypt$${sal}$${scryptSync(senha, sal, 64).toString('hex')}`;
}

/** Compara em tempo constante, para não vazar informação pelo tempo de resposta. */
export function conferirSenha(senha, hashGuardado) {
  const [algoritmo, sal, hash] = String(hashGuardado).split('$');
  if (algoritmo !== 'scrypt' || !sal || !hash) return false;
  const esperado = Buffer.from(hash, 'hex');
  const calculado = scryptSync(String(senha), sal, esperado.length);
  return timingSafeEqual(esperado, calculado);
}
