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
      accentBg: 'bg-blue-600/10 text-blue-700 dark:text-blue-400'
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
      flowDelta: `▲+${deltas?.clientesMoM || 2.1}% this month`
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5 items-center relative">
        {STAGES.map((st, idx) => {
          const Icon = st.icon;
          const isLast = idx === STAGES.length - 1;
          const isBottleneck = (idx === 0 && worstBottleneck === 1) || (idx === 1 && worstBottleneck === 2);
          const dropPct = (idx === 0 ? dropOffStage1 : dropOffStage2).toFixed(0);

          return (
            <div key={st.id} className="relative flex items-center">
              <Card
                className={cn(
                  "w-full p-2.5 bg-card border shadow-2xs hover:border-primary/40 transition-all rounded-xl relative overflow-hidden flex flex-col justify-center",
                  st.isDominant ? "border-primary/50 shadow-xs ring-1 ring-primary/20" : "border-border"
                )}
              >
                <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${st.colorGrad}`} />
                <div className="flex items-center justify-between gap-1.5 mb-0.5">
                  <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-muted-foreground truncate">
                    {st.title}
                  </span>
                  <div className={`p-1 rounded-md ${st.accentBg} shrink-0`}>
                    <Icon className="w-3 h-3" />
                  </div>
                </div>
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
                <div className="text-[9.5px] font-medium text-muted-foreground mt-0.5 truncate">
                  {st.secondaryLabel}
                </div>
                {st.isDominant && (
                  <div className="text-[8.5px] font-bold text-primary mt-0.5">vs 90.0% Goal</div>
                )}
              </Card>

              {/* INTEGRATED INTER-STAGE CONNECTOR (STATIC, CLEAN, NO OVERLAP) */}
              {!isLast && (
                <div className="hidden md:flex items-center justify-center absolute -right-3.5 z-20 pointer-events-none">
                  <div
                    className={cn(
                      "flex items-center gap-0.5 px-1.5 py-0.5 rounded-md border shadow-xs tabular-nums text-[9px] font-black font-mono shrink-0",
                      isBottleneck
                        ? "bg-rose-600 text-white border-rose-700 shadow-rose-600/30"
                        : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700"
                    )}
                  >
                    <ArrowRight className="w-2.5 h-2.5 stroke-[2.5]" />
                    <span>-{dropPct}%</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
