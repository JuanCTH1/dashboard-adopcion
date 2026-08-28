import React, { useMemo } from 'react';
import { ResponsiveContainer, AreaChart, Area, YAxis, Tooltip } from 'recharts';
import { cn } from '@/lib/utils';
import { useChartTheme } from '@/lib/theme';

export function AdoptionTrendCard({ serieHistorica = [], filtros }) {
  const { isDark } = useChartTheme();

  const filteredData = useMemo(() => {
    if (!serieHistorica || serieHistorica.length === 0) return [];
    const anios = filtros?.anios?.length ? filtros.anios.map(Number) : [2024, 2025, 2026];
    const meses = filtros?.meses?.length ? filtros.meses : null;
    return serieHistorica.filter(item => {
      const [y] = item.periodo.split("-");
      const yearMatch = anios.includes(parseInt(y, 10));
      const monthMatch = !meses || meses.some(mName => item.label.startsWith(mName));
      return yearMatch && monthMatch;
    });
  }, [serieHistorica, filtros]);

  const strokeColor = isDark ? '#38bdf8' : '#002B99';
  const last = filteredData[filteredData.length - 1];
  const first = filteredData[0];
  const trendUp = last && first ? last.pctAdopcionPedidos >= first.pctAdopcionPedidos : true;

  return (
    <div className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-2 h-16 shadow-2xs font-sans select-none">
      <div className="shrink-0">
        <div className="text-[9px] font-extrabold uppercase tracking-wider text-muted-foreground">Tendencia Adopción</div>
        <div className={cn("text-sm font-black tabular-nums", trendUp ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
          {last ? `${last.pctAdopcionPedidos}%` : '—'} <span className="text-[10px] font-medium text-muted-foreground">últimos {filteredData.length} meses</span>
        </div>
      </div>
      <div className="flex-1 h-full min-w-[120px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filteredData} margin={{ top: 6, right: 4, left: 4, bottom: 0 }}>
            <defs>
              <linearGradient id="trend-grad-mini" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={strokeColor} stopOpacity={0.3} />
                <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <YAxis hide domain={[0, 100]} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload?.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-slate-900 text-white px-2 py-1 rounded text-[11px] shadow-xl border border-slate-700">
                      <b>{d.label}</b>: {d.pctAdopcionPedidos}%
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area type="monotone" dataKey="pctAdopcionPedidos" stroke={strokeColor} strokeWidth={2} fill="url(#trend-grad-mini)" dot={false} activeDot={{ r: 3, fill: strokeColor }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
