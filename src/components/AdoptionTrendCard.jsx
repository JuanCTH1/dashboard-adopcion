import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { TrendingUp, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChartTheme } from '@/lib/theme';

export const AdoptionTrendCard = React.memo(function AdoptionTrendCard({ serieHistorica = [], filtros }) {
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

  const strokeColor = isDark ? '#38bdf8' : '#0000B3';
  const last = filteredData[filteredData.length - 1];
  const first = filteredData[0];
  const trendUp = last && first ? last.pctAdopcionPedidos >= first.pctAdopcionPedidos : true;
  const delta = last && first ? (last.pctAdopcionPedidos - first.pctAdopcionPedidos).toFixed(1) : '0.0';

  return (
    <Card className="p-4 bg-card border border-border shadow-xs rounded-xl relative overflow-hidden select-none font-sans h-full flex flex-col justify-between">
      {/* Top Accent Bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary via-sky-500 to-indigo-500" />

      {/* CARD HEADER */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h3 className="text-xs font-black uppercase tracking-wider text-foreground font-sans">
              Adoption Trend
            </h3>
          </div>
          <p className="text-[12px] text-muted-foreground mt-0.5 font-medium">
            Historical Trend ({filteredData.length} months)
          </p>
        </div>

        <div className="text-right">
          <div className={cn("text-sm font-black tabular-nums", trendUp ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
            {last ? `${last.pctAdopcionPedidos}%` : '—'}
          </div>
          <div className="text-[12px] font-bold text-muted-foreground">
            {trendUp ? `▲ +${delta} pp` : `▼ ${delta} pp`}
          </div>
        </div>
      </div>

      {/* FULL AREA CHART */}
      <div className="flex-1 min-h-[150px] w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filteredData} margin={{ top: 8, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="trend-grad-full" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={strokeColor} stopOpacity={0.35} />
                <stop offset="100%" stopColor={strokeColor} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 9, fill: isDark ? '#94a3b8' : '#64748b' }}
              domain={['dataMin - 5', 'dataMax + 5']}
              unit="%"
            />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 8.5, fill: isDark ? '#94a3b8' : '#64748b' }}
              interval="preserveStartEnd"
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload?.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-slate-900 text-white px-2.5 py-1.5 rounded-lg text-xs shadow-xl border border-slate-700 font-sans">
                      <div className="font-bold text-[12px] text-sky-400">{d.label}</div>
                      <div className="text-[12px]">Adoption: <b>{d.pctAdopcionPedidos}%</b></div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="pctAdopcionPedidos"
              stroke={strokeColor}
              strokeWidth={2.5}
              fill="url(#trend-grad-full)"
              dot={false}
              activeDot={{ r: 4, fill: strokeColor, stroke: '#fff', strokeWidth: 1.5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
});
