import { createHmac, timingSafeEqual } from 'node:crypto';
import { naoAutorizado } from '../utils/erros.js';
import { conferirSenha } from '../utils/senha.js';

const VALIDADE_MS = 8 * 60 * 60 * 1000; // 8 horas: um turno da recepção

const b64 = (texto) => Buffer.from(texto).toString('base64url');

/**
 * Login da recepção (RNF05). O token é "<dados>.<assinatura>", com os dados em base64url
 * e a assinatura HMAC-SHA256 feita com o segredo do servidor.
 */
export function criarAuthService({ usuario, senhaHash, segredo, agora }) {
  const assinar = (dados) => createHmac('sha256', segredo).update(dados).digest('base64url');

  return {
    login({ usuario: u, senha } = {}) {
      // confere a senha mesmo com usuário errado, para o tempo de resposta não revelar qual dos dois errou
      const senhaOk = conferirSenha(senha ?? '', senhaHash);
      if (u !== usuario || !senhaOk) throw naoAutorizado('usuário ou senha inválidos', 'CREDENCIAIS_INVALIDAS');
      const expiraEm = agora().getTime() + VALIDADE_MS;
      const dados = b64(JSON.stringify({ sub: usuario, exp: expiraEm }));
      return { token: `${dados}.${assinar(dados)}`, expira_em: new Date(expiraEm).toISOString() };
    },

    validar(token = '') {
      const [dados, assinatura] = String(token).split('.');
      if (!dados || !assinatura) throw naoAutorizado('faça login para continuar');
      const esperada = Buffer.from(assinar(dados));
      const recebida = Buffer.from(assinatura);
      if (esperada.length !== recebida.length || !timingSafeEqual(esperada, recebida)) {
        throw naoAutorizado('sessão inválida, faça login de novo');
      }
      const { sub, exp } = JSON.parse(Buffer.from(dados, 'base64url').toString());
      if (exp <= agora().getTime()) throw naoAutorizado('sessão expirada, faça login de novo', 'SESSAO_EXPIRADA');
      return { usuario: sub };
    },
  };
}
