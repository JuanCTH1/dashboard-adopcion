import React from 'react';
import { motion } from 'framer-motion';
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
  tooltipData,
  accentGradient = "from-blue-600 via-sky-400 to-indigo-500",
  children,
  className
}) {
  const { isDark } = useChartTheme();
  const isPositive = deltaMoM != null && deltaMoM >= 0;
  const gradId = `spark-grad-${titulo ? String(titulo).replace(/[^a-zA-Z0-9]/g, "-").toLowerCase() : "kpi"}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      whileHover={{ y: -2 }}
    >
      <Card
        className={cn(
          "p-4 relative bg-card border border-border/90 rounded-xl shadow-xxs hover:shadow-lg transition-all duration-300 group overflow-visible",
          className
        )}
      >
        {/* Barra superior con gradiente y resplandor al hover estilo Penetron */}
        <div
          className={cn(
            "absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r rounded-t-xl transition-all duration-300 group-hover:h-[4px] group-hover:shadow-[0_2px_12px_rgba(56,189,248,0.85)]",
            accentGradient
          )}
        />

        <div className="flex items-center justify-between mb-1.5">
          <div className="text-xs font-semibold text-muted-foreground font-sans uppercase tracking-tight truncate">
            {titulo}
          </div>
          {tooltipData && (
            <MetricInfoTooltip
              titulo={tooltipData.titulo}
              descripcion={tooltipData.descripcion}
              tipo={tooltipData.tipo}
            />
          )}
        </div>

        <div className="flex items-end justify-between gap-2 overflow-hidden">
          <div className="text-2xl font-bold text-foreground tracking-tight leading-none truncate max-w-full tabular-nums">
            {valorPrincipal}
          </div>

          {deltaMoM != null && (
            <div
              className={cn(
                "text-[12px] font-semibold flex items-center gap-0.5 shrink-0 px-2 py-0.5 rounded-full border tabular-nums select-none",
                isPositive
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
              )}
            >
              <span>{isPositive ? "▲" : "▼"}</span>
              <span>{Math.abs(deltaMoM).toFixed(1)}%</span>
            </div>
          )}
        </div>

        {sparklineData && sparklineData.length > 0 && (
          <div className="h-9 mt-2 -mx-1 opacity-90 group-hover:opacity-100 transition-opacity">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineData.map((y, x) => ({ x, y }))} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                <defs>
                  <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={isDark ? "#38bdf8" : "#002B99"} stopOpacity={0.22} />
                    <stop offset="100%" stopColor={isDark ? "#38bdf8" : "#002B99"} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="y"
                  stroke={isDark ? "#38bdf8" : "#002B99"}
                  strokeWidth={2}
                  fill={`url(#${gradId})`}
                  dot={false}
                  activeDot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {subtitulo && (
          <div className="text-[12px] font-medium text-muted-foreground mt-1.5 truncate">
            {subtitulo}
          </div>
        )}

        {children}
      </Card>
    </motion.div>
  );
}
