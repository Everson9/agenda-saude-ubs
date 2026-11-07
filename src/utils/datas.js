/** AAAA-MM-DD. */
export function dataValida(texto) {
  return /^\d{4}-\d{2}-\d{2}$/.test(texto);
}

/** AAAA-MM-DDTHH:mm com data existente e hora válida. */
export function dataHoraValida(texto) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(texto)) return false;
  const [data, hora] = texto.split('T');
  const [h, m] = hora.split(':').map(Number);
  return dataValida(data) && h < 24 && m < 60;
}

/** Data e hora local no formato da API (AAAA-MM-DDTHH:mm). */
export function formatarLocal(d) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

/** "HH:mm" -> minutos desde 00:00. */
export function paraMinutos(hora) {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
}

/** Dia da semana de "AAAA-MM-DD..." (0 = domingo). */
export function diaDaSemana(dataHora) {
  const [a, m, d] = dataHora.slice(0, 10).split('-').map(Number);
  return new Date(Date.UTC(a, m - 1, d)).getUTCDay();
}
