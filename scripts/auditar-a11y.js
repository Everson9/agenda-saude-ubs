// Auditoria de acessibilidade da tela (A11Y-CHK, #56).
// Uso: npm run a11y   (precisa do Google Chrome instalado; outro navegador: CHROME_PATH=/caminho/do/chrome)
// Sobe a API com dados fictícios, abre a tela num Chrome sem janela e roda o axe-core (WCAG 2.1 A e AA +
// boas práticas) no login, na tela principal com agenda e relatório preenchidos e na largura de celular.
// Também percorre a tela só com Tab e confere se todo controle recebe foco visível.
// Sai com código 1 se houver violação séria ou crítica.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { chromium } from 'playwright-core';
import { criarApp } from '../src/app.js';
import { criarStore } from '../src/database/jsonStore.js';

const require = createRequire(import.meta.url);
const AXE = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf-8');
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'];

/** Próxima segunda-feira, às 09:00, para o agendamento de exemplo. */
function proximaSegunda() {
  const d = new Date();
  d.setDate(d.getDate() + ((8 - d.getDay()) % 7 || 7));
  return d.toLocaleDateString('sv-SE');
}

async function prepararDados(base) {
  const json = { 'content-type': 'application/json' };
  const login = await (await fetch(`${base}/api/auth/login`, {
    method: 'POST', headers: json, body: JSON.stringify({ usuario: 'recepcao', senha: 'recepcao123' }),
  })).json();
  const headers = { ...json, authorization: `Bearer ${login.token}` };
  const post = (c, b) => fetch(base + c, { method: 'POST', headers, body: JSON.stringify(b) });
  await post('/api/pacientes', { nome: 'Maria da Silva', cartao_sus: '898001234567890', telefone: '(87) 99999-0000', data_nascimento: '1980-05-12' });
  await post('/api/pacientes', { nome: 'João Pereira', cartao_sus: '700000000000001', telefone: '', data_nascimento: '1975-01-20' });
  const dia = proximaSegunda();
  await post('/api/agendamentos', { paciente_id: 1, especialidade_id: 1, data_hora: `${dia}T09:00` });
  await post('/api/agendamentos', { paciente_id: 2, especialidade_id: 2, data_hora: `${dia}T10:00` });
  return dia;
}

async function rodarAxe(pagina, nome) {
  await pagina.addScriptTag({ content: AXE });
  const r = await pagina.evaluate((tags) => window.axe.run(document, { runOnly: { type: 'tag', values: tags } }), TAGS);
  return r.violations.map((v) => ({ tela: nome, regra: v.id, impacto: v.impact, ocorrencias: v.nodes.length, ajuda: v.help }));
}

/** Aperta Tab até voltar ao começo e anota cada controle focado e se o foco aparece. */
async function percorrerComTab(pagina) {
  await pagina.evaluate(() => { document.activeElement?.blur(); window.scrollTo(0, 0); });
  await pagina.mouse.click(5, 5); // clique no cabeçalho: o Tab começa do topo
  const passos = [];
  for (let i = 0; i < 150; i += 1) {
    await pagina.keyboard.press('Tab');
    const info = await pagina.evaluate((n) => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      // campo de data tem sub-campos (dia, mês, ano): o Tab passa por eles sem trocar de elemento
      const repetido = el.dataset.a11yPasso !== undefined;
      if (!repetido) el.dataset.a11yPasso = String(n);
      const s = getComputedStyle(el);
      const rotulo = el.getAttribute('aria-label') || el.labels?.[0]?.textContent?.trim() || el.textContent;
      return {
        repetido,
        primeiro: el.dataset.a11yPasso === '0',
        controle: `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''} "${rotulo.replace(/\s+/g, ' ').trim().slice(0, 45)}"`,
        focoVisivel: (s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) >= 2) || s.boxShadow !== 'none',
      };
    }, passos.length);
    if (!info || (info.repetido && info.primeiro && passos.length > 1)) break;
    if (!info.repetido) passos.push({ controle: info.controle, focoVisivel: info.focoVisivel });
  }
  return passos;
}

async function main() {
  const app = criarApp({ store: criarStore() });
  const servidor = await new Promise((ok) => { const s = app.listen(0, () => ok(s)); });
  const base = `http://127.0.0.1:${servidor.address().port}`;
  const dia = await prepararDados(base);

  const navegador = await chromium.launch(process.env.CHROME_PATH
    ? { executablePath: process.env.CHROME_PATH } : { channel: 'chrome' });
  const violacoes = [];
  let teclado = [];
  try {
    for (const [largura, sufixo] of [[1280, ''], [360, ' (celular 360px)']]) {
      const pagina = await navegador.newPage({ viewport: { width: largura, height: 900 } });
      await pagina.goto(base);
      await pagina.waitForSelector('#tela-login:not([hidden])');
      violacoes.push(...await rodarAxe(pagina, `login${sufixo}`));

      await pagina.fill('[name=usuario]', 'recepcao');
      await pagina.fill('[name=senha]', 'recepcao123');
      await pagina.click('#form-login button');
      await pagina.waitForSelector('#app:not([hidden])');
      await pagina.fill('#filtro-dia', dia);
      await pagina.dispatchEvent('#filtro-dia', 'change');
      await pagina.waitForSelector('#agenda tr');
      await pagina.fill('[name=inicio]', '2026-01-01');
      await pagina.fill('[name=fim]', '2026-12-31');
      await pagina.click('#form-relatorio button');
      await pagina.waitForSelector('#relatorio tr');
      violacoes.push(...await rodarAxe(pagina, `principal${sufixo}`));

      if (!sufixo) teclado = await percorrerComTab(pagina);
      if (process.env.A11Y_PRINT) await pagina.screenshot({ path: `${process.env.A11Y_PRINT}/tela-${largura}.png`, fullPage: true });
      await pagina.close();
    }
  } finally {
    await navegador.close();
    await new Promise((ok) => servidor.close(ok));
  }

  console.log('Violações do axe-core (WCAG 2.1 A/AA + boas práticas):');
  if (violacoes.length) console.table(violacoes); else console.log('  nenhuma');
  console.log(`\nTeclado: ${teclado.length} controles alcançados com Tab`);
  console.table(teclado);

  const graves = violacoes.filter((v) => ['serious', 'critical'].includes(v.impacto));
  const semFoco = teclado.filter((p) => !p.focoVisivel);
  if (graves.length || semFoco.length || teclado.length === 0) {
    console.log(`REPROVADO: ${graves.length} violação(ões) séria(s)/crítica(s), ${semFoco.length} controle(s) sem foco visível`);
    process.exitCode = 1;
  } else {
    console.log('APROVADO: nenhuma violação séria ou crítica e foco visível em todo controle');
  }
}

main();
