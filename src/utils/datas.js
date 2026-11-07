/** AAAA-MM-DD. */
export function dataValida(texto) {
  return /^\d{4}-\d{2}-\d{2}$/.test(texto);
}

/** Data e hora local no formato da API (AAAA-MM-DDTHH:mm). */
export function formatarLocal(d) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}
