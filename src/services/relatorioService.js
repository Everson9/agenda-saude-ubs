import { requisicaoInvalida } from '../utils/erros.js';
import { dataValida } from '../utils/datas.js';

const FINALIZADOS = ['realizado', 'faltou'];

export function criarRelatorioService({ agendamentos, especialidades }) {
  return {
    // RF08
    faltasPorEspecialidade({ inicio, fim } = {}) {
      if (!dataValida(String(inicio ?? '')) || !dataValida(String(fim ?? ''))) {
        throw requisicaoInvalida('informe inicio e fim no formato AAAA-MM-DD');
      }
      if (inicio > fim) throw requisicaoInvalida('inicio não pode ser depois de fim');

      const noPeriodo = agendamentos.todos().filter((a) => FINALIZADOS.includes(a.status)
        && a.data_hora.slice(0, 10) >= inicio && a.data_hora.slice(0, 10) <= fim);

      const linhas = especialidades.todas().map((esp) => {
        const daEsp = noPeriodo.filter((a) => a.especialidade_id === esp.id);
        const faltas = daEsp.filter((a) => a.status === 'faltou').length;
        return {
          especialidade_id: esp.id,
          especialidade: esp.nome,
          finalizados: daEsp.length,
          faltas,
          taxa_faltas_pct: daEsp.length ? Math.round((faltas / daEsp.length) * 1000) / 10 : 0,
        };
      });

      const finalizados = noPeriodo.length;
      const faltas = noPeriodo.filter((a) => a.status === 'faltou').length;
      return {
        periodo: { inicio, fim },
        total: {
          finalizados,
          faltas,
          taxa_faltas_pct: finalizados ? Math.round((faltas / finalizados) * 1000) / 10 : 0,
        },
        por_especialidade: linhas,
      };
    },
  };
}
