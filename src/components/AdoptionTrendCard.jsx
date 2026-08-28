import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceLine, CartesianGrid } from 'recharts';
import { formatNumber, formatPct, cn } from '@/lib/utils';
import { useChartTheme } from '@/lib/theme';

export function AdoptionTrendCard({ serieHistorica = [], filtros }) {
  const [metricMode, setMetricMode] = useState('adopcion'); // 'adopcion' | 'concreto' | 'cemento'
  const { isDark } = useChartTheme();

  const filteredData = useMemo(() => {
    if (!serieHistorica || serieHistorica.length === 0) return [];
    
    const anios = filtros?.anios?.length ? filtros.anios.map(Number) : [2024, 2025, 2026];
    const meses = filtros?.meses?.length ? filtros.meses : null;

    return serieHistorica.filter(item => {
      const [y, m] = item.periodo.split("-");
      const anioNum = parseInt(y, 10);
      const yearMatch = anios.includes(anioNum);
      const monthMatch = !meses || meses.some(mName => item.label.startsWith(mName));
      return yearMatch && monthMatch;
    });
  }, [serieHistorica, filtros]);

  const dataKey = metricMode === 'adopcion'
    ? 'pctAdopcionPedidos'
    : metricMode === 'concreto'
    ? 'volumenConcreto'
    : 'volumenCemento';

  const strokeColor = metricMode === 'adopcion'
    ? (isDark ? '#38bdf8' : '#002B99')
    : metricMode === 'concreto'
    ? '#10b981'
    : '#f59e0b';

  return (
    <Card className="p-5 bg-card border border-border shadow-xs rounded-xl relative overflow-hidden select-none flex flex-col justify-between h-full font-sans">
      {/* Accent Top Line */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-sky-400 via-blue-600 to-indigo-600" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-3 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary" />
            <h3 className="text-xs font-black uppercase tracking-wider text-foreground font-sans">
              Historical Adoption Trend
            </h3>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">
            Showing {filteredData.length} selected monthly periods with realistic seasonality
          </p>
        </div>

        {/* Metric Switcher */}
        <div className="inline-flex rounded-lg bg-slate-100 dark:bg-slate-900 p-0.5 border border-border text-xs font-semibold">
          <button
            type="button"
            onClick={() => setMetricMode('adopcion')}
            className={cn(
              "px-2 py-1 text-[11px] rounded-md transition-all cursor-pointer",
              metricMode === 'adopcion' ? "bg-card text-primary font-bold shadow-xxs" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Adoption %
          </button>
          <button
            type="button"
            onClick={() => setMetricMode('concreto')}
            className={cn(
              "px-2 py-1 text-[11px] rounded-md transition-all cursor-pointer",
              metricMode === 'concreto' ? "bg-card text-emerald-600 font-bold shadow-xxs" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Concrete (cu yd)
          </button>
          <button
            type="button"
            onClick={() => setMetricMode('cemento')}
            className={cn(
              "px-2 py-1 text-[11px] rounded-md transition-all cursor-pointer",
              metricMode === 'cemento' ? "bg-card text-amber-600 font-bold shadow-xxs" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Cement (Tons)
          </button>
        </div>
      </div>

      {/* Recharts Area Chart */}
      <div className="h-64 w-full pt-1 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="trend-grad-dynamic" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={strokeColor} stopOpacity={0.35} />
                <stop offset="100%" stopColor={strokeColor} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#f1f5f9'} vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: isDark ? '#94a3b8' : '#64748b' }}
              axisLine={{ stroke: isDark ? '#334155' : '#cbd5e1' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: isDark ? '#94a3b8' : '#64748b' }}
              axisLine={{ stroke: isDark ? '#334155' : '#cbd5e1' }}
              tickLine={false}
              domain={metricMode === 'adopcion' ? [0, 100] : ['auto', 'auto']}
              tickFormatter={(v) => metricMode === 'adopcion' ? `${v}%` : formatNumber(v)}
            />
            {metricMode === 'adopcion' && (
              <ReferenceLine y={90} stroke="#10b981" strokeDasharray="4 4" label={{ value: "Target 90%", fill: "#10b981", fontSize: 10, position: "top" }} />
            )}
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-slate-900 text-white p-2.5 rounded-lg text-xs shadow-xl border border-slate-700">
                      <div className="font-bold text-sky-400 mb-1">{d.label}</div>
                      <div>Adoption %: <b className="text-white">{d.pctAdopcionPedidos}%</b></div>
                      <div>Concrete Vol: <b className="text-emerald-400">{formatNumber(d.volumenConcreto)} cu yd</b></div>
                      <div>Cement Vol: <b className="text-amber-400">{formatNumber(d.volumenCemento)} tons</b></div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={strokeColor}
              strokeWidth={2.5}
              fill="url(#trend-grad-dynamic)"
              dot={{ r: 3, fill: strokeColor }}
              activeDot={{ r: 5, fill: strokeColor }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}