/** AAAA-MM-DD que existe no calendário (rejeita 2026-02-31). */
export function dataValida(texto) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(texto)) return false;
  const [a, m, d] = texto.split('-').map(Number);
  const data = new Date(Date.UTC(a, m - 1, d));
  return data.getUTCFullYear() === a && data.getUTCMonth() === m - 1 && data.getUTCDate() === d;
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
