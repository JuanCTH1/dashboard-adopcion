import React from 'react';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Card } from '@/components/ui/card';
import { MetricInfoTooltip } from '@/components/ui/tooltip';
import { formatNumber, formatPct, cn } from '@/lib/utils';
import { useChartTheme } from '@/lib/theme';

export function MetricCard({
  titulo,
  valorPrincipal,
  subtitulo,
  deltaMoM,
  sparklineData,
  tooltipKey,
  tooltipData,
  accentColor,
  className
}) {
  const { primary, isDark } = useChartTheme();
  const isPositive = deltaMoM != null && deltaMoM >= 0;
  const gradId = `grad-${titulo.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <Card className={cn("p-3.5 relative overflow-hidden bg-card border-border/90 hover:shadow-md transition-all group", className)}>
      {/* Barra superior de acento */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-600 via-sky-400 to-indigo-500 opacity-90 group-hover:h-[4px] transition-all"
        style={accentColor ? { background: accentColor } : {}}
      />

      <div className="flex items-center justify-between gap-1 mb-1">
        <span className="text-[11px] font-semibold tracking-tight text-muted-foreground uppercase truncate">
          {titulo}
        </span>
        {tooltipData && (
          <MetricInfoTooltip
            titulo={tooltipData.titulo}
            descripcion={tooltipData.descripcion}
            tipo={tooltipData.tipo}
          />
        )}
      </div>

      <div className="flex items-baseline justify-between gap-2 mt-0.5">
        <div className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
          {valorPrincipal}
        </div>

        {deltaMoM != null && (
          <div
            className={cn(
              "text-[11px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-0.5 tabular-nums shrink-0 select-none",
              isPositive
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
            )}
          >
            <span>{isPositive ? '?' : '?'}</span>
            <span>{Math.abs(deltaMoM).toFixed(1)}%</span>
            <span className="text-[9px] text-muted-foreground font-normal ml-0.5">MoM</span>
          </div>
        )}
      </div>

      {subtitulo && (
        <div className="text-[11px] text-muted-foreground mt-1 truncate">
          {subtitulo}
        </div>
      )}

      {sparklineData && sparklineData.length > 0 && (
        <div className="h-8 mt-2 -mx-1 opacity-90 group-hover:opacity-100 transition-opacity">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparklineData.map((y, x) => ({ x, y }))} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={isDark ? "#38bdf8" : "#00529B"} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={isDark ? "#38bdf8" : "#00529B"} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="y"
                stroke={isDark ? "#38bdf8" : "#00529B"}
                strokeWidth={1.75}
                fill={`url(#${gradId})`}
                dot={false}
                activeDot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
