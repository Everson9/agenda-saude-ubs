export function criarPacienteRepository(store) {
  return {
    criar: (dados) => store.inserir('pacientes', dados),
    porId: (id) => store.porId('pacientes', id),
    porCartaoSus: (cartao) => store.todos('pacientes').find((p) => p.cartao_sus === cartao) ?? null,
    todos: () => [...store.todos('pacientes')],
  };
}
