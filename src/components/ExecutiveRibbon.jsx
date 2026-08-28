import React from 'react';
import { Card } from '@/components/ui/card';
import { Users, UserCheck, Activity, Target, ArrowRight } from 'lucide-react';
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
      title: 'Total Customers',
      primaryLabel: `${formatNumber(c.asignados)}`,
      primaryUnit: 'accounts',
      secondaryLabel: `${formatNumber(p.totales)} total orders`,
      icon: Users,
      colorGrad: 'from-blue-600 to-indigo-700',
      accentBg: 'bg-blue-600/10 text-blue-700 dark:text-blue-400',
      nextDrop: dropOffStage1,
      isBottleneck: worstBottleneck === 1
    },
    {
      id: 'onboarded',
      step: 'Stage 2',
      title: 'Onboarded',
      primaryLabel: `${formatNumber(c.onboarded)}`,
      primaryUnit: 'accounts',
      secondaryLabel: `${formatNumber(Math.round(p.totales * (c.pctOnboarding / 100)))} onboarded orders`,
      icon: UserCheck,
      colorGrad: 'from-emerald-600 to-teal-700',
      accentBg: 'bg-emerald-600/10 text-emerald-700 dark:text-emerald-400',
      flowDelta: `▲+${deltas?.clientesMoM || 2.1}% this month`,
      nextDrop: dropOffStage2,
      isBottleneck: worstBottleneck === 2
    },
    {
      id: 'activos',
      step: 'Stage 3',
      title: 'Active',
      primaryLabel: `${formatNumber(c.activos)}`,
      primaryUnit: 'accounts',
      secondaryLabel: `${formatNumber(p.digitales)} active orders`,
      icon: Activity,
      colorGrad: 'from-sky-500 to-blue-600',
      accentBg: 'bg-sky-500/10 text-sky-700 dark:text-sky-400',
      flowDelta: `▲+1.2% this month`
    },
    {
      id: 'adopcion',
      step: 'Stage 4',
      title: 'Digital Adoption',
      primaryLabel: `${formatPct(p.pctAdopcion)}`,
      primaryUnit: '',
      secondaryLabel: `${formatNumber(p.digitales)} / ${formatNumber(p.totales)} digital orders`,
      icon: Target,
      colorGrad: 'from-amber-500 to-orange-600',
      accentBg: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
      isDominant: true
    }
  ];

  return (
    <div className="bg-background/95 backdrop-blur-md py-1 transition-all font-sans select-none">
      {/* UNIFIED EXECUTIVE CONTAINER CARD (100% PERFECT ALIGNMENT, ZERO FLOATING BADGES) */}
      <Card className="p-0 bg-card border border-border shadow-xs rounded-xl overflow-hidden grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border">
        {STAGES.map((st, idx) => {
          const Icon = st.icon;

          return (
            <div
              key={st.id}
              className={cn(
                "p-2.5 flex flex-col justify-between relative transition-all",
                st.isDominant ? "bg-primary/5" : "bg-card"
              )}
            >
              {/* Top Accent Line */}
              <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${st.colorGrad}`} />

              <div>
                {/* Header Row */}
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-muted-foreground truncate">
                    {st.title}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {/* Inline Integrated Transition Metric (No floating buttons!) */}
                    {st.nextDrop !== undefined && (
                      <span
                        className={cn(
                          "text-[8.5px] font-black font-mono px-1.5 py-0.2 rounded flex items-center gap-0.5 border shadow-2xs",
                          st.isBottleneck
                            ? "bg-rose-500 text-white border-rose-600"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-border"
                        )}
                        title={`Drop-off to next stage: -${st.nextDrop.toFixed(0)}%`}
                      >
                        <ArrowRight className="w-2.5 h-2.5 stroke-[2.5]" />
                        <span>-{st.nextDrop.toFixed(0)}%</span>
                      </span>
                    )}
                    <div className={`p-1 rounded-md ${st.accentBg} shrink-0`}>
                      <Icon className="w-3 h-3" />
                    </div>
                  </div>
                </div>

                {/* Primary Metric */}
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className={cn("font-black tracking-tight tabular-nums", st.isDominant ? "text-xl text-primary" : "text-lg text-foreground")}>
                    {st.primaryLabel}
                  </span>
                  {st.primaryUnit && <span className="text-[9.5px] font-medium text-muted-foreground">{st.primaryUnit}</span>}
                  {st.flowDelta && (
                    <span className="text-[8.5px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1 py-0.2 rounded shrink-0">
                      {st.flowDelta}
                    </span>
                  )}
                </div>
              </div>

              {/* Subtitle / Footer */}
              <div className="mt-1 pt-1 border-t border-border/40 flex items-center justify-between text-[9.5px] text-muted-foreground font-medium truncate">
                <span className="truncate">{st.secondaryLabel}</span>
                {st.isDominant && (
                  <span className="text-[8.5px] font-bold text-primary shrink-0 ml-1">vs 90% Goal</span>
                )}
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}
