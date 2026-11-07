export function criarAgendamentoRepository(store) {
  return {
    criar: (dados) => store.inserir('agendamentos', dados),
    porId: (id) => store.porId('agendamentos', id),
    atualizar: (id, campos) => store.atualizar('agendamentos', id, campos),
    todos: () => [...store.todos('agendamentos')],
    ativos: () => store.todos('agendamentos').filter((a) => a.status === 'agendado'),
  };
}
