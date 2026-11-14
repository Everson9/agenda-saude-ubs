import { funcionamento } from '../config/index.js';
import { conflito, naoEncontrado, requisicaoInvalida } from '../utils/erros.js';
import { dataHoraValida, dataValida, diaDaSemana, formatarLocal, paraMinutos } from '../utils/datas.js';

const ABERTURA = paraMinutos(funcionamento.abertura);
const FECHAMENTO = paraMinutos(funcionamento.fechamento);
const STATUS_FINAIS = ['realizado', 'faltou'];

export function criarAgendamentoService({ agendamentos, pacientes, especialidades, agora }) {
  const agoraTexto = () => formatarLocal(agora());

  function validarHorario(dataHora, esp) {
    if (!dataHoraValida(String(dataHora ?? ''))) {
      throw requisicaoInvalida('data_hora deve estar no formato AAAA-MM-DDTHH:mm');
    }
    if (dataHora <= agoraTexto()) throw requisicaoInvalida('não é possível agendar no passado', 'HORARIO_NO_PASSADO');
    if (!funcionamento.diasUteis.includes(diaDaSemana(dataHora))) {
      throw requisicaoInvalida('a UBS só atende de segunda a sexta', 'FORA_DO_FUNCIONAMENTO');
    }
    const inicio = paraMinutos(dataHora.slice(11));
    if (inicio < ABERTURA || inicio + esp.duracao_min > FECHAMENTO) {
      throw requisicaoInvalida(`horário fora do funcionamento (${funcionamento.abertura} às ${funcionamento.fechamento})`, 'FORA_DO_FUNCIONAMENTO');
    }
    if ((inicio - ABERTURA) % esp.duracao_min !== 0) {
      throw requisicaoInvalida(`horário deve seguir a grade de ${esp.duracao_min} min a partir das ${funcionamento.abertura}`, 'FORA_DA_GRADE');
    }
  }

  function obterAtivo(id) {
    const ag = agendamentos.porId(id);
    if (!ag) throw naoEncontrado('agendamento não encontrado');
    if (ag.status !== 'agendado') throw conflito(`agendamento já está ${ag.status}`, 'AGENDAMENTO_FINALIZADO');
    return ag;
  }

  return {
    // RF04
    // DATA-ATOMIC (#48): da verificação de conflito até agendamentos.criar não pode haver `await`.
    // O Node roda este trecho inteiro sem ceder a vez, então duas requisições não se intercalam.
    agendar({ paciente_id: pacienteId, especialidade_id: especialidadeId, data_hora: dataHora } = {}) {
      const paciente = pacientes.porId(pacienteId);
      if (!paciente) throw naoEncontrado('paciente não encontrado');
      const esp = especialidades.porId(especialidadeId);
      if (!esp) throw naoEncontrado('especialidade não encontrada');
      validarHorario(dataHora, esp);

      const ativos = agendamentos.ativos();
      if (ativos.some((a) => a.especialidade_id === esp.id && a.data_hora === dataHora)) {
        throw conflito('horário já ocupado para esta especialidade', 'HORARIO_OCUPADO');
      }
      const mesmoDia = (a) => a.data_hora.slice(0, 10) === dataHora.slice(0, 10);
      if (ativos.some((a) => a.paciente_id === paciente.id && a.especialidade_id === esp.id && mesmoDia(a))) {
        throw conflito('paciente já tem agendamento nesta especialidade neste dia', 'PACIENTE_JA_AGENDADO_NO_DIA');
      }

      return agendamentos.criar({
        paciente_id: paciente.id,
        especialidade_id: esp.id,
        data_hora: dataHora,
        status: 'agendado',
        criado_em: agoraTexto(),
      });
    },

    // RF05
    listar({ data, especialidade_id: especialidadeId, paciente_id: pacienteId } = {}) {
      if (data && !dataValida(data)) throw requisicaoInvalida('data deve estar no formato AAAA-MM-DD');
      return agendamentos
        .todos()
        .filter((a) => !data || a.data_hora.startsWith(data))
        .filter((a) => !especialidadeId || a.especialidade_id === Number(especialidadeId))
        .filter((a) => !pacienteId || a.paciente_id === Number(pacienteId))
        .sort((a, b) => a.data_hora.localeCompare(b.data_hora))
        .map((a) => ({
          ...a,
          paciente: pacientes.porId(a.paciente_id)?.nome,
          especialidade: especialidades.porId(a.especialidade_id)?.nome,
        }));
    },

    // RF06
    cancelar(id, motivo = '') {
      const ag = obterAtivo(id);
      if (!String(motivo).trim()) throw requisicaoInvalida('informe o motivo do cancelamento');
      return agendamentos.atualizar(ag.id, { status: 'cancelado', motivo_cancelamento: String(motivo).trim() });
    },

    // RF07
    registrarComparecimento(id, status) {
      const ag = obterAtivo(id);
      if (!STATUS_FINAIS.includes(status)) throw requisicaoInvalida('status deve ser "realizado" ou "faltou"');
      if (ag.data_hora > agoraTexto()) {
        throw requisicaoInvalida('só é possível registrar comparecimento depois do horário marcado');
      }
      return agendamentos.atualizar(ag.id, { status });
    },
  };
}
