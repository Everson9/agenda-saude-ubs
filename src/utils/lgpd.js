/**
 * Mascara o cartão SUS para listagens (LGPD-001, #49).
 * Mantém os 3 primeiros e os 4 últimos dígitos: 898001234567890 -> "898 **** **** 7890".
 */
export function mascararCartaoSus(cartao) {
  const digitos = String(cartao ?? '').replace(/\D/g, '');
  if (digitos.length !== 15) return '***';
  return `${digitos.slice(0, 3)} **** **** ${digitos.slice(-4)}`;
}
