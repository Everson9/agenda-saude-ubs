const $ = (sel) => document.querySelector(sel);

async function api(metodo, caminho, corpo) {
  const resp = await fetch(caminho, {
    method: metodo,
    headers: { 'content-type': 'application/json' },
    body: corpo ? JSON.stringify(corpo) : undefined,
  });
  const dados = await resp.json();
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

$('#filtro-dia').value = new Date().toLocaleDateString('sv-SE');
$('#filtro-dia').addEventListener('change', carregarAgenda);
carregarListas().then(carregarAgenda).catch((e) => avisar(e.message, true));
