export function cn(...inputs) {
  return inputs
    .flat()
    .filter(Boolean)
    .join(' ')
    .trim();
}

export function formatNumber(num) {
  if (num == null) return '0';
  return new Intl.NumberFormat('es-MX').format(num);
}

export function formatPct(num) {
  if (num == null) return '0.0%';
  return Number(num).toFixed(1) + '%';
}