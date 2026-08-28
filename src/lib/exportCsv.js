/**
 * UTILIDAD DE EXPORTACIÓN A CSV CON COMPATIBILIDAD UTF-8 EXCEL
 */

export function exportToCsv(filename, rows = [], headers = []) {
  if (!rows || rows.length === 0) return;

  const separator = ',';
  const headerKeys = headers.map(h => h.key || h);
  const headerLabels = headers.map(h => h.label || h);

  const csvRows = [
    headerLabels.map(l => `"${String(l).replace(/"/g, '""')}"`).join(separator)
  ];

  rows.forEach(row => {
    const values = headerKeys.map(k => {
      const val = row[k] != null ? row[k] : '';
      return `"${String(val).replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(separator));
  });

  const csvContent = '\uFEFF' + csvRows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
