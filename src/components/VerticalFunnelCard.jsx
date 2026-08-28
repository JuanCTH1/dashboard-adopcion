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
      paso: "Paso 1",
      titulo: "Universo de Clientes",
      subtitulo: "Cartera bajo gestión comercial",
      valor: cAsignados,
      unidad: "clientes",
      pctBase: 100,
      icon: Users,
      colorGrad: "from-blue-700 to-blue-900",
      accentBg: "bg-blue-600/10 text-blue-700 dark:text-blue-400",
      fugaCount: null
    },
    {
      id: 2,
      paso: "Paso 2",
      titulo: "Clientes con Onboarding",
      subtitulo: "Con cuenta en la plataforma",
      valor: cOnboarded,
      unidad: "clientes",
      pctBase: pctOnboarding,
      icon: UserCheck,
      colorGrad: "from-emerald-600 to-emerald-800",
      accentBg: "bg-emerald-600/10 text-emerald-700 dark:text-emerald-400",
      fugaCount: sinCuentaCount,
      fugaPct: cAsignados > 0 ? (sinCuentaCount / cAsignados) * 100 : 0,
      fugaLabel: "sin cuenta habilitada"
    },
    {
      id: 3,
      paso: "Paso 3",
      titulo: "Clientes Activos Digitales",
      subtitulo: "Compraron en digital en el periodo",
      valor: cActivos,
      unidad: "clientes",
      pctBase: pctActivos,
      icon: Activity,
      colorGrad: "from-sky-500 to-blue-700",
      accentBg: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
      fugaCount: inactivosCount,
      fugaPct: cOnboarded > 0 ? (inactivosCount / cOnboarded) * 100 : 0,
      fugaLabel: "inactivos / revertidos"
    },
    {
      id: 4,
      paso: "Paso 4",
      titulo: "Adopción Transaccional",
      subtitulo: "Share de pedidos digitales vs Objetivo 90%",
      valor: pctAdopcion,
      isPct: true,
      pctBase: pctAdopcion,
      icon: Target,
      colorGrad: "from-amber-500 to-orange-600",
      accentBg: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
      objetivo: 90.0
    }
  ];

  return (
    <Card className="p-5 bg-card border border-border shadow-xs rounded-xl relative overflow-hidden select-none flex flex-col justify-between h-full">
      {/* Barra de acento */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-500 via-sky-500 to-blue-700" />

      {/* Cabecera */}
      <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary" />
            <h3 className="text-xs font-black uppercase tracking-wider text-foreground font-sans">
              Embudo de Conversión
            </h3>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">
            Flujo vertical de retención de clientes
          </p>
        </div>

        <Badge variant="outline" className="text-[10px] font-bold text-primary border-primary/30 shrink-0">
          Obj: 90%
        </Badge>
      </div>

      {/* FLUJO VERTICAL CON CONECTORES DE FUGA */}
      <div className="space-y-2 flex-1 flex flex-col justify-between">
        {STAGES.map((st, idx) => {
          const Icon = st.icon;
          const isLast = idx === STAGES.length - 1;

          return (
            <div key={st.id} className="space-y-1.5">
              {/* Tarjeta del Paso */}
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
                    {st.isPct ? formatPct(st.valor) : formatNumber(st.valor)}
                    {!st.isPct && <span className="text-[10px] font-normal text-muted-foreground ml-1">cli.</span>}
                  </div>
                  <div className="text-[10px] font-bold text-muted-foreground">
                    {st.isPct ? `Brecha: ${Math.max(0, 90.0 - st.valor).toFixed(1)}%` : `${st.pctBase.toFixed(0)}% base`}
                  </div>
                </div>
              </div>

              {/* Conector de Fuga Vertical (entre pasos) */}
              {!isLast && st.fugaCount != null && (
                <div className="px-3 py-1 flex items-center justify-between text-[10px] bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-600 dark:text-rose-400 font-semibold mx-1">
                  <div className="flex items-center gap-1">
                    <ArrowDown className="w-3 h-3 text-rose-500" />
                    <span>Fuga: <b>-{formatNumber(st.fugaCount)}</b> {st.fugaLabel}</span>
                  </div>
                  <span className="font-bold">(-{st.fugaPct.toFixed(0)}%)</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}