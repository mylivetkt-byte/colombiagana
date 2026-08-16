export function formatMoney(amount: number, currency: string = 'COP') {
  const decimals = currency === 'COP' ? 0 : 2;
  const value = new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(Number(amount) || 0);
  return `$${value}`;
}
