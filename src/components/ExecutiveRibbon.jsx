import React from 'react';
import { Card } from '@/components/ui/card';
import { Users, UserCheck, Activity, Target, ChevronRight, ChevronsRight } from 'lucide-react';
import { formatNumber, formatCompactNumber, formatPct, cn } from '@/lib/utils';

export function ExecutiveRibbon({ metricasGlobales, isActionableBase = false }) {
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
      title: isActionableBase ? 'Viable Customers (SAM)' : 'Total Customers',
      primaryLabel: `${formatNumber(c.asignados)}`,
      primaryUnit: 'customers',
      secondaryLabel: `${formatCompactNumber(p.totales)} ${isActionableBase ? 'viable orders' : 'total orders'}`,
      exactTooltip: `${formatNumber(p.totales)} total orders ${isActionableBase ? '(Actionable SAM Base)' : ''}`,
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
      title: isActionableBase ? 'Actionable Adoption (SAM)' : 'Orders Adoption',
      primaryLabel: `${formatPct(p.pctAdopcion)}`,
      primaryUnit: '',
      secondaryLabel: `${formatCompactNumber(p.digitales)} orders`,
      exactTooltip: `${formatNumber(p.digitales)} adopted digital orders (out of ${formatNumber(p.totales)} ${isActionableBase ? 'viable' : 'total'})`,
      icon: Target,
      colorGrad: 'from-indigo-600 to-violet-600',
      accentBg: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400',
      badgeBg: 'bg-indigo-600 text-white',
      isDominant: true
    }
  ];

  return (
    <div className="bg-background/95 backdrop-blur-md py-1 transition-all font-sans select-none">
      {/* SEPARATED TRUE CHEVRON FUNNEL PROCESS RIBBON */}
      <div className="flex items-center gap-2 sm:gap-2.5 w-full">
        {STAGES.map((st, idx) => {
          const Icon = st.icon;
          const isLast = idx === STAGES.length - 1;

          // True Chevron Clip-Path Geometry with directional right-pointing arrow
          const chevronClip = idx === 0
            ? 'polygon(0% 0%, calc(100% - 13px) 0%, 100% 50%, calc(100% - 13px) 100%, 0% 100%)'
            : isLast
            ? 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 13px 50%)'
            : 'polygon(0% 0%, calc(100% - 13px) 0%, 100% 50%, calc(100% - 13px) 100%, 0% 100%, 13px 50%)';

          return (
            <React.Fragment key={st.id}>
              {/* TRUE CHEVRON STAGE CARD */}
              <div
                className="flex-1 min-w-0 h-[100px] relative transition-all filter drop-shadow-xs hover:drop-shadow-sm"
              >
                {/* Outlined Chevron Layer */}
                <div
                  className={cn(
                    "w-full h-full p-2.5 flex flex-col justify-between relative overflow-hidden transition-all",
                    idx === 0 ? "pl-3 pr-5.5 rounded-l-xl" : isLast ? "pl-5.5 pr-3 rounded-r-xl" : "pl-5.5 pr-5.5",
                    "bg-card border border-border",
                    st.isDominant
                      ? "border-indigo-500/50 dark:border-indigo-500/30 ring-1 ring-indigo-500/20"
                      : "hover:border-slate-400 dark:hover:border-slate-700"
                  )}
                  style={{
                    clipPath: chevronClip
                  }}
                >
                  {/* Top Accent Gradient Bar following chevron */}
                  <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${st.colorGrad}`} />

                  {/* Chevron Header Row */}
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className={`text-xs font-black px-1.5 py-0.5 rounded ${st.badgeBg} shrink-0 shadow-2xs`}>
                        {st.stepNumber}
                      </span>
                      <span className="text-xs font-black uppercase tracking-wider text-foreground truncate">
                        {st.title}
                      </span>
                    </div>
                    <div className={`p-1 rounded-md ${st.accentBg} shrink-0`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Primary Metric & Delta */}
                  <div className="flex items-baseline gap-1.5 flex-wrap">
                    <span className={cn(
                      "font-black tracking-tight tabular-nums",
                      st.isDominant ? "text-2xl text-indigo-600 dark:text-indigo-400" : "text-xl text-foreground"
                    )}>
                      {st.primaryLabel}
                    </span>
                    {st.primaryUnit && <span className="text-xs font-medium text-muted-foreground">{st.primaryUnit}</span>}
                    {st.flowDelta && (
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded shrink-0 tabular-nums">
                        {st.flowDelta}
                      </span>
                    )}
                  </div>

                  {/* Subtitle Footer with clear visual lane divider across all stages */}
                  <div className="text-xs font-semibold truncate pt-1 border-t-2 border-slate-300/90 dark:border-slate-700 text-muted-foreground transition-colors">
                    <span className="truncate">{st.secondaryLabel}</span>
                  </div>
                </div>
              </div>

              {/* DIRECTIONAL FLOW VECTOR BADGE IN THE SEPARATION GAP */}
              {!isLast && st.nextDrop !== undefined && (
                <div className={cn(
                  "shrink-0 z-10 -mx-1.5 sm:-mx-2 transition-all",
                  idx === 2 ? "self-end mb-[8px]" : "self-center"
                )}>
                  <div
                    className={cn(
                      "flex items-center gap-1 px-2 py-0.5 rounded-lg border shadow-xs tabular-nums text-xs font-black shrink-0 transition-all cursor-default select-none",
                      st.isBottleneck
                        ? "bg-rose-500 text-white border-rose-600 shadow-rose-500/30 ring-2 ring-rose-500/25 animate-pulse-subtle"
                        : "bg-card/95 backdrop-blur-xs text-foreground border-slate-300 dark:border-slate-700 hover:border-primary/50 shadow-2xs"
                    )}
                    title={`Funnel conversion drop to next stage: -${st.nextDrop.toFixed(0)}%${st.isBottleneck ? ' (Primary Bottleneck)' : ''}`}
                  >
                    <ChevronsRight className={cn("w-3.5 h-3.5 stroke-[2.5] shrink-0", st.isBottleneck ? "text-white" : "text-primary dark:text-sky-400")} />
                    <span className="tracking-tight">-{st.nextDrop.toFixed(0)}%</span>
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
