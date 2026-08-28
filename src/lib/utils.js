export function cn(...inputs) {
  return inputs
    .flat()
    .filter(Boolean)
    .join(' ')
    .trim();
}

export function formatNumber(num) {
  if (num == null) return '0';
  return new Intl.NumberFormat('en-US').format(num);
}

export function formatPct(num) {
  if (num == null) return '0.0%';
  return Number(num).toFixed(1) + '%';
}

export function formatCompactNumber(num) {
  if (num == null || isNaN(num)) return '0';
  const val = Number(num);
  if (val >= 1000) {
    return (val / 1000).toFixed(1) + 'k';
  }
  return formatNumber(val);
}