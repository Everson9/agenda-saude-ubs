const $ = (sel) => document.querySelector(sel);

// o token vive só nesta aba (sessionStorage): fechar o navegador encerra a sessão
const sessao = {
  ler: () => { try { return sessionStorage.getItem('token'); } catch { return null; } },
  gravar: (t) => { try { sessionStorage.setItem('token', t); } catch { /* sem storage: vale só até recarregar */ } },
  limpar: () => { try { sessionStorage.removeItem('token'); } catch { /* idem */ } },
};
let token = sessao.ler();

function mostrarLogin(mensagem = '') {
  token = null;
  sessao.limpar();
  $('#app').hidden = true;
  $('#sair').hidden = true;
  $('#tela-login').hidden = false;
  $('#aviso-login').textContent = mensagem;
}

async function api(metodo, caminho, corpo) {
  const headers = { 'content-type': 'application/json' };
  if (token) headers.authorization = `Bearer ${token}`;
  const resp = await fetch(caminho, {
    method: metodo,
    headers,
    body: corpo ? JSON.stringify(corpo) : undefined,
  });
  const dados = await resp.json();
  if (resp.status === 401 && !caminho.startsWith('/api/auth')) mostrarLogin(dados.erro);
  if (!resp.ok) throw new Error(dados.erro);
  return dados;
}

function avisar(texto, erro = false) {
  const el = $('#aviso');
  el.textContent = texto;
  el.className = erro ? 'erro' : '';
}

function opcoes(select, itens, rotulo) {
  select.replaceChildren(...itens.map((i) => new Option(rotulo(i), i.id)));
}

async function carregarListas() {
  opcoes($('[name=paciente_id]'), await api('GET', '/api/pacientes'), (p) => p.nome);
  opcoes($('[name=especialidade_id]'), await api('GET', '/api/especialidades'), (e) => `${e.nome} (${e.duracao_min} min)`);
}

async function carregarAgenda() {
  const dia = $('#filtro-dia').value;
  const lista = await api('GET', `/api/agendamentos?data=${dia}`);
  $('#agenda').replaceChildren(...lista.map((a) => {
    const tr = document.createElement('tr');
    for (const texto of [a.data_hora.slice(11), a.paciente, a.especialidade, a.status]) {
      const td = document.createElement('td');
      td.textContent = texto;
      tr.append(td);
    }
    const acoes = document.createElement('td');
    if (a.status === 'agendado') {
      const div = document.createElement('div');
      div.className = 'acoes';
      for (const [rotulo, acao] of [['Compareceu', 'realizado'], ['Faltou', 'faltou'], ['Cancelar', 'cancelar']]) {
        const b = document.createElement('button');
        b.className = 'secundario';
        b.textContent = rotulo;
        b.onclick = () => agir(a.id, acao);
        div.append(b);
      }
      acoes.append(div);
    }
    tr.append(acoes);
    return tr;
  }));
}

async function agir(id, acao) {
  try {
    if (acao === 'cancelar') {
      const motivo = prompt('Motivo do cancelamento:');
      if (!motivo) return;
      await api('PATCH', `/api/agendamentos/${id}/cancelar`, { motivo });
    } else {
      await api('PATCH', `/api/agendamentos/${id}/comparecimento`, { status: acao });
    }
    avisar('Agenda atualizada.');
    await carregarAgenda();
  } catch (e) {
    avisar(e.message, true);
  }
}

function enviar(form, fn) {
  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    try {
      await fn(Object.fromEntries(new FormData(form)));
      form.reset();
    } catch (e) {
      avisar(e.message, true);
    }
  });
}

enviar($('#form-paciente'), async (dados) => {
  const p = await api('POST', '/api/pacientes', dados);
  avisar(`Paciente ${p.nome} cadastrado.`);
  await carregarListas();
});

enviar($('#form-agendar'), async (dados) => {
  const ag = await api('POST', '/api/agendamentos', dados);
  avisar(`Consulta agendada para ${ag.data_hora.replace('T', ' às ')}.`);
  $('#filtro-dia').value = ag.data_hora.slice(0, 10);
  await carregarAgenda();
});

function linha(celulas) {
  const tr = document.createElement('tr');
  for (const texto of celulas) {
    const td = document.createElement('td');
    td.textContent = texto;
    tr.append(td);
  }
  return tr;
}

$('#form-relatorio').addEventListener('submit', async (ev) => {
  ev.preventDefault();
  const { inicio, fim } = Object.fromEntries(new FormData(ev.target));
  try {
    const rel = await api('GET', `/api/relatorios/faltas?inicio=${inicio}&fim=${fim}`);
    const pct = (n) => `${String(n).replace('.', ',')}%`;
    const total = linha(['Total', rel.total.finalizados, rel.total.faltas, pct(rel.total.taxa_faltas_pct)]);
    total.style.fontWeight = '700';
    $('#relatorio').replaceChildren(
      ...rel.por_especialidade.map((l) => linha([l.especialidade, l.finalizados, l.faltas, pct(l.taxa_faltas_pct)])),
      total,
    );
    avisar('Relatório gerado.');
  } catch (e) {
    avisar(e.message, true);
  }
});

async function iniciar() {
  $('#tela-login').hidden = true;
  $('#app').hidden = false;
  $('#sair').hidden = false;
  try {
    await carregarListas();
    await carregarAgenda();
  } catch (e) {
    avisar(e.message, true);
  }
}

$('#form-login').addEventListener('submit', async (ev) => {
  ev.preventDefault();
  try {
    const { token: novo } = await api('POST', '/api/auth/login', Object.fromEntries(new FormData(ev.target)));
    token = novo;
    sessao.gravar(novo);
    ev.target.reset();
    await iniciar();
  } catch (e) {
    $('#aviso-login').textContent = e.message;
  }
});

$('#sair').addEventListener('click', () => mostrarLogin());
$('#filtro-dia').value = new Date().toLocaleDateString('sv-SE');
$('#filtro-dia').addEventListener('change', carregarAgenda);
if (token) iniciar(); else mostrarLogin();
