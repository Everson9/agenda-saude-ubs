import { conflito, naoEncontrado, requisicaoInvalida } from '../utils/erros.js';
import { dataValida, formatarLocal } from '../utils/datas.js';

export function criarPacienteService({ pacientes, agora }) {
  function validar(corpo) {
    const nome = String(corpo.nome ?? '').trim();
    const cartaoSus = String(corpo.cartao_sus ?? '').replace(/\D/g, '');
    const telefone = String(corpo.telefone ?? '').trim();
    const nascimento = String(corpo.data_nascimento ?? '');

    if (nome.length < 3) throw requisicaoInvalida('nome deve ter ao menos 3 caracteres');
    if (cartaoSus.length !== 15) throw requisicaoInvalida('cartao_sus deve ter 15 dígitos');
    if (!dataValida(nascimento)) throw requisicaoInvalida('data_nascimento deve estar no formato AAAA-MM-DD');
    if (nascimento > formatarLocal(agora()).slice(0, 10)) {
      throw requisicaoInvalida('data_nascimento não pode ser no futuro');
    }
    return { nome, cartao_sus: cartaoSus, telefone, data_nascimento: nascimento };
  }

  return {
    // RF01
    cadastrar(corpo = {}) {
      const dados = validar(corpo);
      if (pacientes.porCartaoSus(dados.cartao_sus)) throw conflito('já existe paciente com este cartão SUS');
      return pacientes.criar(dados);
    },

    // RF02
    listar(busca = '') {
      const termo = busca.trim().toLowerCase();
      return pacientes
        .todos()
        .filter((p) => !termo || p.nome.toLowerCase().includes(termo) || p.cartao_sus.includes(termo))
        .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
    },

    obter(id) {
      const paciente = pacientes.porId(id);
      if (!paciente) throw naoEncontrado('paciente não encontrado');
      return paciente;
    },
  };
}
