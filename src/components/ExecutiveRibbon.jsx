import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, UserCheck, Activity, Target, ArrowRight, TrendingUp } from 'lucide-react';
import { formatNumber, formatPct, cn } from '@/lib/utils';

export function ExecutiveRibbon({ metricasGlobales }) {
  if (!metricasGlobales || !metricasGlobales.actual) return null;

  const { actual, deltas } = metricasGlobales;
  const c = actual.clientes;
  const p = actual.pedidos;

  // Drop-off calculations between stages
  const dropOffStage1 = c.asignados > 0 ? ((c.asignados - c.onboarded) / c.asignados) * 100 : 0;
  const dropOffStage2 = c.onboarded > 0 ? ((c.onboarded - c.activos) / c.onboarded) * 100 : 0;

  const worstBottleneck = dropOffStage1 >= dropOffStage2 ? 1 : 2;

  const STAGES = [
    {
      id: 'universo',
      step: 'Stage 1',
      title: 'Universo asignado',
      primaryLabel: `${formatNumber(c.asignados)}`,
      primaryUnit: 'cuentas',
      secondaryLabel: `${formatNumber(p.totales)} órdenes totales`,
      icon: Users,
      colorGrad: 'from-blue-600 to-indigo-700',
      accentBg: 'bg-blue-600/10 text-blue-700 dark:text-blue-400'
    },
    {
      id: 'onboarded',
      step: 'Stage 2',
      title: 'Onboarded',
      primaryLabel: `${formatNumber(c.onboarded)}`,
      primaryUnit: 'cuentas',
      secondaryLabel: `${formatNumber(Math.round(p.totales * (c.pctOnboarding / 100)))} órdenes de onboardeados`,
      icon: UserCheck,
      colorGrad: 'from-emerald-600 to-teal-700',
      accentBg: 'bg-emerald-600/10 text-emerald-700 dark:text-emerald-400',
      flowDelta: `▲+${deltas?.clientesMoM || 2.1}% este mes`
    },
    {
      id: 'activos',
      step: 'Stage 3',
      title: 'Activos',
      primaryLabel: `${formatNumber(c.activos)}`,
      primaryUnit: 'cuentas',
      secondaryLabel: `${formatNumber(p.digitales)} órdenes de activos`,
      icon: Activity,
      colorGrad: 'from-sky-500 to-blue-600',
      accentBg: 'bg-sky-500/10 text-sky-700 dark:text-sky-400',
      flowDelta: `▲+1.2% este mes`
    },
    {
      id: 'adopcion',
      step: 'Stage 4',
      title: 'Adopción digital',
      primaryLabel: `${formatPct(p.pctAdopcion)}`,
      primaryUnit: '',
      secondaryLabel: `${formatNumber(p.digitales)} / ${formatNumber(p.totales)} órdenes digitales`,
      icon: Target,
      colorGrad: 'from-amber-500 to-orange-600',
      accentBg: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
      isDominant: true
    }
  ];

  return (
    <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md pt-1 pb-2 -mx-1 px-1 transition-all shadow-xs border-b border-border/40 font-sans select-none">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 relative">
        {STAGES.map((st, idx) => {
          const Icon = st.icon;
          const isLast = idx === STAGES.length - 1;

          // Drop-off connector info
          let connectorLabel = null;
          let isBottleneck = false;

          if (idx === 0) {
            connectorLabel = `-${dropOffStage1.toFixed(1)}% caída`;
            isBottleneck = worstBottleneck === 1;
          } else if (idx === 1) {
            connectorLabel = `-${dropOffStage2.toFixed(1)}% caída`;
            isBottleneck = worstBottleneck === 2;
          }

          return (
            <Card
              key={st.id}
              className={cn(
                "p-3.5 bg-card border shadow-2xs hover:border-primary/40 transition-all rounded-xl relative overflow-hidden flex flex-col justify-between",
                st.isDominant ? "border-primary/50 shadow-xs ring-1 ring-primary/20" : "border-border"
              )}
            >
              {/* Top Accent Line */}
              <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${st.colorGrad}`} />

              <div>
                {/* Header */}
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground truncate">
                    {st.title}
                  </span>
                  <div className={`p-1 rounded-lg ${st.accentBg} shrink-0`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Primary Metric Renglón 1 */}
                <div className="flex items-baseline gap-1.5">
                  <span className={cn(
                    "font-black tracking-tight tabular-nums",
                    st.isDominant ? "text-2xl text-primary" : "text-xl text-foreground"
                  )}>
                    {st.primaryLabel}
                  </span>
                  {st.primaryUnit && (
                    <span className="text-[10px] font-medium text-muted-foreground">
                      {st.primaryUnit}
                    </span>
                  )}
                  {st.flowDelta && (
                    <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1 py-0.2 rounded shrink-0">
                      {st.flowDelta}
                    </span>
                  )}
                </div>

                {/* Secondary Metric Renglón 2 */}
                <div className="text-[10px] font-medium text-muted-foreground mt-0.5 truncate">
                  {st.secondaryLabel}
                </div>
              </div>

              {/* Inter-stage Drop-off / Connection Indicator */}
              {!isLast && connectorLabel && (
                <div className="mt-2 pt-2 border-t border-border/60 flex items-center justify-between text-[9.5px]">
                  <span className="text-muted-foreground font-semibold flex items-center gap-1">
                    <ArrowRight className="w-3 h-3 text-muted-foreground/70" />
                    Transición {idx + 1}→{idx + 2}
                  </span>
                  <span className={cn(
                    "px-1.5 py-0.2 rounded font-bold border tabular-nums",
                    isBottleneck
                      ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 animate-pulse"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                  )}>
                    {connectorLabel}
                  </span>
                </div>
              )}

              {st.isDominant && (
                <div className="mt-2 pt-2 border-t border-border/60 flex items-center justify-between text-[9.5px]">
                  <span className="text-muted-foreground font-semibold flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-emerald-500" />
                    Meta Global
                  </span>
                  <span className="font-bold text-primary px-1.5 py-0.2 rounded bg-primary/10 border border-primary/20">
                    90.0% Goal
                  </span>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
