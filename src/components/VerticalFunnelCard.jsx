import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingDown, Users, UserCheck, Activity, Target, ArrowDown } from 'lucide-react';
import { formatNumber, formatPct, cn } from '@/lib/utils';

export function VerticalFunnelCard({ funnelSteps }) {
  if (!funnelSteps || funnelSteps.length === 0) return null;

  const cAsignados = funnelSteps[0]?.valor || 0;
  const cOnboarded = funnelSteps[1]?.valor || 0;
  const cActivos = funnelSteps[2]?.valor || 0;
  const pctAdopcion = funnelSteps[3]?.valor || 0;

  const sinCuentaCount = Math.max(0, cAsignados - cOnboarded);
  const inactivosCount = Math.max(0, cOnboarded - cActivos);

  const pctOnboarding = cAsignados > 0 ? (cOnboarded / cAsignados) * 100 : 0;
  const pctActivos = cAsignados > 0 ? (cActivos / cAsignados) * 100 : 0;

  const STAGES = [
    {
      id: 1,
      paso: "Step 1",
      titulo: "1. Customer Universe",
      subtitulo: "Total accounts under commercial management",
      valor: cAsignados,
      unidad: "accounts",
      pctBase: 100,
      icon: Users,
      colorGrad: "from-blue-700 to-blue-900",
      accentBg: "bg-blue-600/10 text-blue-700 dark:text-blue-400",
      fugaCount: sinCuentaCount,
      fugaPct: cAsignados > 0 ? (sinCuentaCount / cAsignados) * 100 : 0,
      fugaLabel: "without enabled account"
    },
    {
      id: 2,
      paso: "Step 2",
      titulo: "2. Onboarded Customers",
      subtitulo: "Registered with active digital credentials",
      valor: cOnboarded,
      unidad: "accounts",
      pctBase: pctOnboarding,
      icon: UserCheck,
      colorGrad: "from-emerald-600 to-emerald-800",
      accentBg: "bg-emerald-600/10 text-emerald-700 dark:text-emerald-400",
      fugaCount: inactivosCount,
      fugaPct: cOnboarded > 0 ? (inactivosCount / cOnboarded) * 100 : 0,
      fugaLabel: "inactive / reverted accounts"
    },
    {
      id: 3,
      paso: "Step 3",
      titulo: "3. Active Digital Customers",
      subtitulo: "Placed digital orders in active period",
      valor: cActivos,
      unidad: "accounts",
      pctBase: pctActivos,
      icon: Activity,
      colorGrad: "from-sky-500 to-blue-700",
      accentBg: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
      fugaCount: null
    }
  ];

  return (
    <Card className="p-5 bg-card border border-border shadow-xs rounded-xl relative overflow-hidden select-none flex flex-col justify-between h-full font-sans">
      {/* Accent Top Line */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-500 via-sky-500 to-blue-700" />

      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary" />
            <h3 className="text-xs font-black uppercase tracking-wider text-foreground font-sans">
              Customer Conversion Funnel
            </h3>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">
            3-Stage customer pipeline & drop-off analysis
          </p>
        </div>

        <Badge variant="outline" className="text-[10px] font-bold text-primary border-primary/30 shrink-0">
          Goal: 90%
        </Badge>
      </div>

      {/* VERTICAL PIPELINE WITH DROP-OFF CONNECTORS */}
      <div className="space-y-2 flex-1 flex flex-col justify-between">
        {STAGES.map((st, idx) => {
          const Icon = st.icon;
          const isLast = idx === STAGES.length - 1;

          return (
            <div key={st.id} className="space-y-1.5">
              {/* Stage Card */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-border flex items-center justify-between gap-2 hover:border-primary/50 transition-all shadow-2xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={cn("w-7 h-7 rounded-lg text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs bg-gradient-to-br", st.colorGrad)}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-bold text-foreground truncate">
                      {st.titulo}
                    </div>
                    <div className="text-[10px] text-muted-foreground truncate">
                      {st.subtitulo}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-base font-black text-foreground tabular-nums">
                    {formatNumber(st.valor)}
                    <span className="text-[10px] font-normal text-muted-foreground ml-1">acc.</span>
                  </div>
                  <div className="text-[10px] font-bold text-muted-foreground">
                    {st.pctBase.toFixed(0)}% base
                  </div>
                </div>
              </div>

              {/* Vertical Drop-Off Connector */}
              {!isLast && st.fugaCount != null && (
                <div className="px-3 py-1 flex items-center justify-between text-[10px] bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-600 dark:text-rose-400 font-semibold mx-1">
                  <div className="flex items-center gap-1">
                    <ArrowDown className="w-3 h-3 text-rose-500" />
                    <span>Drop-off: <b>-{formatNumber(st.fugaCount)}</b> {st.fugaLabel}</span>
                  </div>
                  <span className="font-bold">(-{st.fugaPct.toFixed(0)}%)</span>
                </div>
              )}
            </div>
          );
        })}

        {/* ORDER ADOPTION BADGE ATTACHED TO ACTIVE CUSTOMERS */}
        <div className="mt-2 p-2.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 border border-amber-500/30 flex items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Target className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-xs font-bold text-foreground">Order Adoption Rate</div>
              <div className="text-[10px] text-muted-foreground">Digital order share among active customers</div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-sm font-black text-amber-600 dark:text-amber-400 tabular-nums">
              {formatPct(pctAdopcion)}
            </div>
            <div className="text-[9px] font-bold text-muted-foreground">vs 90.0% Goal</div>
          </div>
        </div>
      </div>
    </Card>
  );
}
