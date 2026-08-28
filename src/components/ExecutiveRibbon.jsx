import React from 'react';
import { Card } from '@/components/ui/card';
import { Users, UserCheck, Activity, Target, ChevronRight } from 'lucide-react';
import { formatNumber, formatCompactNumber, formatPct, cn } from '@/lib/utils';

export function ExecutiveRibbon({ metricasGlobales }) {
  if (!metricasGlobales || !metricasGlobales.actual) return null;

  const { actual, deltas } = metricasGlobales;
  const c = actual.clientes;
  const p = actual.pedidos;

  // Drop-off calculations between stages
  const dropOffStage1 = c.asignados > 0 ? ((c.asignados - c.onboarded) / c.asignados) * 100 : 0;
  const dropOffStage2 = c.onboarded > 0 ? ((c.onboarded - c.activos) / c.onboarded) * 100 : 0;
  const activeOrders = p.activosTotales > 0 ? p.activosTotales : p.digitales;
  const dropOffStage3 = activeOrders > 0 ? Math.max(0, ((activeOrders - p.digitales) / activeOrders) * 100) : 0;

  const maxDrop = Math.max(dropOffStage1, dropOffStage2, dropOffStage3);
  let worstBottleneck = 1;
  if (maxDrop === dropOffStage2) worstBottleneck = 2;
  if (maxDrop === dropOffStage3) worstBottleneck = 3;

  const onboardedOrders = Math.round(p.totales * (c.pctOnboarding / 100));

  const STAGES = [
    {
      id: 'universo',
      stepNumber: '01',
      title: 'Total Customers',
      primaryLabel: `${formatNumber(c.asignados)}`,
      primaryUnit: 'customers',
      secondaryLabel: `${formatCompactNumber(p.totales)} total orders`,
      exactTooltip: `${formatNumber(p.totales)} total orders`,
      icon: Users,
      colorGrad: 'from-blue-600 to-indigo-700',
      accentBg: 'bg-blue-600/10 text-blue-700 dark:text-blue-400',
      badgeBg: 'bg-blue-600 text-white',
      nextDrop: dropOffStage1,
      isBottleneck: worstBottleneck === 1
    },
    {
      id: 'onboarded',
      stepNumber: '02',
      title: 'Onboarded Customers',
      primaryLabel: `${formatNumber(c.onboarded)}`,
      primaryUnit: 'customers',
      secondaryLabel: `${formatCompactNumber(p.totales)} orders`,
      exactTooltip: `${formatNumber(p.totales)} orders`,
      icon: UserCheck,
      colorGrad: 'from-emerald-600 to-teal-700',
      accentBg: 'bg-emerald-600/10 text-emerald-700 dark:text-emerald-400',
      badgeBg: 'bg-emerald-600 text-white',
      flowDelta: `▲+${deltas?.clientesMoMNetos || 48} this month`,
      nextDrop: dropOffStage2,
      isBottleneck: worstBottleneck === 2
    },
    {
      id: 'activos',
      stepNumber: '03',
      title: 'Active Customers',
      primaryLabel: `${formatNumber(c.activos)}`,
      primaryUnit: 'customers',
      secondaryLabel: `${formatCompactNumber(p.activosTotales || p.digitales)} orders`,
      exactTooltip: `${formatNumber(p.activosTotales || p.digitales)} total orders of active customers`,
      icon: Activity,
      colorGrad: 'from-sky-500 to-blue-600',
      accentBg: 'bg-sky-500/10 text-sky-700 dark:text-sky-400',
      badgeBg: 'bg-sky-500 text-white',
      flowDelta: `▲+${deltas?.activosMoMNetos || 18} this month`,
      nextDrop: dropOffStage3,
      isBottleneck: worstBottleneck === 3
    },
    {
      id: 'adopcion',
      stepNumber: '04',
      title: 'Orders Adoption',
      primaryLabel: `${formatPct(p.pctAdopcion)}`,
      primaryUnit: '',
      secondaryLabel: `${formatCompactNumber(p.digitales)} orders`,
      exactTooltip: `${formatNumber(p.digitales)} adopted digital orders (out of ${formatNumber(p.totales)} total)`,
      icon: Target,
      colorGrad: 'from-amber-500 to-orange-600',
      accentBg: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
      badgeBg: 'bg-amber-500 text-white',
      isDominant: true
    }
  ];

  return (
    <div className="bg-background/95 backdrop-blur-md py-1 transition-all font-sans select-none">
      {/* CHEVRON FUNNEL PROCESS RIBBON */}
      <div className="flex items-center gap-1.5 w-full">
        {STAGES.map((st, idx) => {
          const Icon = st.icon;
          const isLast = idx === STAGES.length - 1;

          return (
            <React.Fragment key={st.id}>
              {/* CHEVRON STAGE CARD */}
              <div
                className={cn(
                  "flex-1 min-w-0 p-2.5 bg-card border shadow-2xs hover:border-primary/40 transition-all rounded-xl relative overflow-hidden flex flex-col justify-between h-[96px]",
                  st.isDominant ? "border-primary/50 shadow-xs ring-1 ring-primary/20 bg-primary/5" : "border-border"
                )}
              >
                {/* Top Accent Line */}
                <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${st.colorGrad}`} />

                {/* Chevron Header Row */}
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className={`text-[8.5px] font-black px-1.5 py-0.5 rounded ${st.badgeBg} shrink-0`}>
                      {st.stepNumber}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-wider text-foreground truncate">
                      {st.title}
                    </span>
                  </div>
                  <div className={`p-1 rounded-md ${st.accentBg} shrink-0`}>
                    <Icon className="w-3 h-3" />
                  </div>
                </div>

                {/* Primary Metric & Delta */}
                <div className="flex items-baseline gap-1 flex-wrap">
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

                {/* Subtitle Footer */}
                <div className="text-[9.5px] font-medium text-muted-foreground truncate border-t border-border/40 pt-1">
                  <span className="truncate">{st.secondaryLabel}</span>
                </div>
              </div>

              {/* CHEVRON FLOW BADGE BETWEEN STAGES */}
              {!isLast && st.nextDrop !== undefined && (
                <div className="shrink-0 flex items-center justify-center px-0.5">
                  <div
                    className={cn(
                      "flex items-center gap-0.5 px-2 py-1 rounded-lg border shadow-2xs tabular-nums text-[9.5px] font-black font-mono shrink-0 transition-all",
                      st.isBottleneck
                        ? "bg-rose-500 text-white border-rose-600 shadow-rose-500/20"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-border"
                    )}
                    title={`Conversion drop to next stage: -${st.nextDrop.toFixed(0)}%`}
                  >
                    <ChevronRight className="w-3.5 h-3.5 stroke-[3] text-primary dark:text-sky-400" />
                    <span>-{st.nextDrop.toFixed(0)}%</span>
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
