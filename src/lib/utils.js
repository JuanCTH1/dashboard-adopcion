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
  if (val >= 10000) {
    return Math.round(val / 1000) + 'k';
  }
  if (val >= 1000) {
    const formatted = (val / 1000).toFixed(1);
    return (formatted.endsWith('.0') ? formatted.slice(0, -2) : formatted) + 'k';
  }
  return formatNumber(val);
}