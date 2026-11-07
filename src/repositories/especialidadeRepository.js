export function criarEspecialidadeRepository(store) {
  return {
    porId: (id) => store.porId('especialidades', id),
    todas: () => [...store.todos('especialidades')],
  };
}
