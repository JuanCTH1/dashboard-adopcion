import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceLine, CartesianGrid } from 'recharts';
import { formatNumber, formatPct, cn } from '@/lib/utils';
import { useChartTheme } from '@/lib/theme';

export function AdoptionTrendCard({ serieHistorica = [] }) {
  const [metricMode, setMetricMode] = useState('adopcion'); // 'adopcion' | 'concreto' | 'cemento'
  const { isDark } = useChartTheme();

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
    <Card className="p-5 bg-card border border-border shadow-xs rounded-xl relative overflow-hidden select-none">
      {/* Barra de acento */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-sky-400 via-blue-600 to-indigo-600" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary" />
            <h3 className="text-xs font-black uppercase tracking-wider text-foreground font-sans">
              Tendencia Histórica de Adopción (2024 - 2026)
            </h3>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">
            Curva de penetración digital a lo largo de 24 meses (de 12% inicial a 75%+ con estacionalidad).
          </p>
        </div>

        {/* Selector de Métrica */}
        <div className="inline-flex rounded-lg bg-slate-100 dark:bg-slate-900 p-0.5 border border-border text-xs font-semibold">
          <button
            type="button"
            onClick={() => setMetricMode('adopcion')}
            className={cn(
              "px-2.5 py-1 rounded-md transition-all cursor-pointer",
              metricMode === 'adopcion' ? "bg-card text-primary font-bold shadow-xxs" : "text-muted-foreground hover:text-foreground"
            )}
          >
            % Adopción
          </button>
          <button
            type="button"
            onClick={() => setMetricMode('concreto')}
            className={cn(
              "px-2.5 py-1 rounded-md transition-all cursor-pointer",
              metricMode === 'concreto' ? "bg-card text-emerald-600 font-bold shadow-xxs" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Concreto (m³)
          </button>
          <button
            type="button"
            onClick={() => setMetricMode('cemento')}
            className={cn(
              "px-2.5 py-1 rounded-md transition-all cursor-pointer",
              metricMode === 'cemento' ? "bg-card text-amber-600 font-bold shadow-xxs" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Cemento (Tons)
          </button>
        </div>
      </div>

      {/* Gráfica Recharts */}
      <div className="h-56 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={serieHistorica} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="trend-grad" x1="0" y1="0" x2="0" y2="1">
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
              interval={2}
            />
            <YAxis
              tick={{ fontSize: 10, fill: isDark ? '#94a3b8' : '#64748b' }}
              axisLine={{ stroke: isDark ? '#334155' : '#cbd5e1' }}
              tickLine={false}
              domain={metricMode === 'adopcion' ? [0, 100] : ['auto', 'auto']}
              tickFormatter={(v) => metricMode === 'adopcion' ? `${v}%` : formatNumber(v)}
            />
            {metricMode === 'adopcion' && (
              <ReferenceLine y={90} stroke="#10b981" strokeDasharray="4 4" label={{ value: "Objetivo 90%", fill: "#10b981", fontSize: 10, position: "top" }} />
            )}
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-slate-900 text-white p-2.5 rounded-lg text-xs shadow-xl border border-slate-700">
                      <div className="font-bold text-sky-400 mb-1">{d.label}</div>
                      <div>% Adopción: <b className="text-white">{d.pctAdopcionPedidos}%</b></div>
                      <div>Vol. Concreto: <b className="text-emerald-400">{formatNumber(d.volumenConcreto)} m³</b></div>
                      <div>Vol. Cemento: <b className="text-amber-400">{formatNumber(d.volumenCemento)} tons</b></div>
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
              fill="url(#trend-grad)"
              dot={{ r: 2, fill: strokeColor }}
              activeDot={{ r: 5, fill: strokeColor }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}