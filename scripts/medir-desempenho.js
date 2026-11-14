// Baseline de desempenho (PERF-BASE, #55) para o RNF01: < 300 ms com até 5.000 agendamentos.
// Uso: npm run perf            (5.000 agendamentos, 50 medições por fluxo)
//      npm run perf -- 10000 30
// Sobe a API de verdade, com banco em ARQUIVO (inclui o custo de gravar o JSON a cada escrita),
// e mede cada fluxo principal pela HTTP, como a tela faz.
import { mkdtempSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { performance } from 'node:perf_hooks';
import { criarApp } from '../src/app.js';
import { criarStore } from '../src/database/jsonStore.js';
import { ESPECIALIDADES_PADRAO } from '../src/database/seed.js';

const TOTAL = Number(process.argv[2]) || 5000;
const REPETICOES = Number(process.argv[3]) || 50;
const LIMITE_MS = 300;
const PACIENTES = 600;
const ABERTURA = 7 * 60;
const FECHAMENTO = 17 * 60;

const doisDigitos = (n) => String(n).padStart(2, '0');
const dia = (d) => `${d.getFullYear()}-${doisDigitos(d.getMonth() + 1)}-${doisDigitos(d.getDate())}`;
const hora = (min) => `${doisDigitos(Math.floor(min / 60))}:${doisDigitos(min % 60)}`;

/** Gera um banco válido: dias úteis a partir de 01/03/2027, todas as vagas de cada especialidade. */
function gerarBanco() {
  const pacientes = Array.from({ length: PACIENTES }, (_, i) => ({
    id: i + 1,
    nome: `Paciente Sintético ${i + 1}`,
    cartao_sus: String(700000000000000 + i),
    telefone: '(87) 90000-0000',
    data_nascimento: '1990-01-01',
  }));
  const agendamentos = [];
  const data = new Date(2027, 2, 1);
  while (agendamentos.length < TOTAL) {
    if (data.getDay() >= 1 && data.getDay() <= 5) {
      for (const esp of ESPECIALIDADES_PADRAO) {
        for (let m = ABERTURA, vaga = 0; m + esp.duracao_min <= FECHAMENTO; m += esp.duracao_min, vaga += 1) {
          if (agendamentos.length >= TOTAL) break;
          agendamentos.push({
            id: agendamentos.length + 1,
            paciente_id: vaga + 1, // vaga diferente = paciente diferente no dia (RN04)
            especialidade_id: esp.id,
            data_hora: `${dia(data)}T${hora(m)}`,
            status: ['agendado', 'realizado', 'faltou', 'cancelado'][agendamentos.length % 4],
            criado_em: '2026-11-14T08:00',
          });
        }
      }
    }
    data.setDate(data.getDate() + 1);
  }
  return {
    seq: { pacientes: PACIENTES, agendamentos: agendamentos.length },
    pacientes,
    especialidades: structuredClone(ESPECIALIDADES_PADRAO),
    agendamentos,
  };
}

function resumo(nome, tempos) {
  const ord = [...tempos].sort((a, b) => a - b);
  const pct = (p) => ord[Math.min(ord.length - 1, Math.ceil((p / 100) * ord.length) - 1)];
  return { fluxo: nome, n: ord.length, p50: pct(50), p95: pct(95), max: ord.at(-1) };
}

async function main() {
  const pasta = mkdtempSync(join(tmpdir(), 'perf-ubs-'));
  const arquivo = join(pasta, 'db.json');
  writeFileSync(arquivo, JSON.stringify(gerarBanco(), null, 2));
  const tamanhoKb = Math.round(statSync(arquivo).size / 1024);

  const app = criarApp({ store: criarStore(arquivo) });
  const servidor = await new Promise((ok) => { const s = app.listen(0, () => ok(s)); });
  const base = `http://127.0.0.1:${servidor.address().port}`;
  let token = '';
  const chamar = async (metodo, caminho, corpo) => {
    const inicio = performance.now();
    const resp = await fetch(base + caminho, {
      method: metodo,
      headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
      body: corpo === undefined ? undefined : JSON.stringify(corpo),
    });
    const dados = await resp.json();
    return { ms: performance.now() - inicio, status: resp.status, dados };
  };
  token = await (await fetch(`${base}/api/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ usuario: 'recepcao', senha: 'recepcao123' }),
  })).json().then((c) => c.token);

  // escritas: Enfermagem (15 min) tem 40 vagas por dia; os novos caem em 2028, fora do período gerado,
  // e cada vaga usa um paciente diferente. O cancelamento desfaz os agendamentos criados.
  const ESCRITAS = Math.min(REPETICOES, 39);
  const novos = [];
  const fluxos = [
    ['RF02 listar pacientes (busca)', REPETICOES, () => chamar('GET', '/api/pacientes?busca=sint')],
    ['RF05 agenda do dia', REPETICOES, () => chamar('GET', '/api/agendamentos?data=2027-03-01')],
    ['RF05 agenda do paciente', REPETICOES, () => chamar('GET', '/api/agendamentos?paciente_id=1')],
    ['RF04 agendar (grava o arquivo)', ESCRITAS, async (i) => {
      const r = await chamar('POST', '/api/agendamentos', {
        paciente_id: i + 1, especialidade_id: 3, data_hora: `2028-03-01T${hora(ABERTURA + i * 15)}`,
      });
      novos.push(r.dados.id);
      return r;
    }],
    ['RF06 cancelar (grava o arquivo)', ESCRITAS, (i) => chamar('PATCH', `/api/agendamentos/${novos[i + 1]}/cancelar`, { motivo: 'teste de carga' })],
    ['RF08 relatório de faltas (ano)', REPETICOES, () => chamar('GET', '/api/relatorios/faltas?inicio=2027-01-01&fim=2027-12-31')],
  ];

  const resultados = [];
  for (const [nome, vezes, fluxo] of fluxos) {
    const aquecer = nome.startsWith('RF06') ? () => chamar('PATCH', `/api/agendamentos/${novos[0]}/cancelar`, { motivo: 'aquecimento' }) : () => fluxo(0);
    await aquecer(); // fora da medição
    const tempos = [];
    for (let i = nome.startsWith('RF04') ? 1 : 0; tempos.length < vezes; i += 1) {
      const { ms, status } = await fluxo(i);
      if (status >= 400) throw new Error(`${nome} devolveu ${status}`);
      tempos.push(ms);
    }
    resultados.push(resumo(nome, tempos));
  }

  await new Promise((ok) => servidor.close(ok));
  rmSync(pasta, { recursive: true, force: true });

  const linhas = resultados.map((r) => ({
    ...r, p50: r.p50.toFixed(1), p95: r.p95.toFixed(1), max: r.max.toFixed(1), rnf01: r.p95 < LIMITE_MS ? 'ok' : 'ESTOURA',
  }));
  console.log(`Agendamentos: ${TOTAL} · arquivo: ${tamanhoKb} KB · Node ${process.version} · ${process.platform}`);
  console.table(linhas);
  const estourou = resultados.some((r) => r.p95 >= LIMITE_MS);
  console.log(estourou ? `RNF01 REPROVADO: algum p95 >= ${LIMITE_MS} ms` : `RNF01 aprovado: todo p95 < ${LIMITE_MS} ms`);
  process.exitCode = estourou ? 1 : 0;
}

main();
