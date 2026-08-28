import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingDown, Users, UserCheck, Activity, Target, ArrowRight } from 'lucide-react';
import { formatNumber, formatPct, cn } from '@/lib/utils';

export function AdoptionFunnelStrip({ funnelSteps }) {
  if (!funnelSteps || funnelSteps.length === 0) return null;

  const cAsignados = funnelSteps[0]?.valor || 0;
  const cOnboarded = funnelSteps[1]?.valor || 0;
  const cActivos = funnelSteps[2]?.valor || 0;
  const pctAdopcion = funnelSteps[3]?.valor || 0;

  const sinCuentaCount = Math.max(0, cAsignados - cOnboarded);
  const inactivosCount = Math.max(0, cOnboarded - cActivos);

  const pctOnboarding = cAsignados > 0 ? (cOnboarded / cAsignados) * 100 : 0;
  const pctActivos = cAsignados > 0 ? (cActivos / cAsignados) * 100 : 0;
  const pctConversionUso = cOnboarded > 0 ? (cActivos / cOnboarded) * 100 : 0;

  const STAGES = [
    {
      id: 1,
      paso: "Paso 1",
      titulo: "Universo de Clientes",
      subtitulo: "Cartera bajo gestión",
      valor: cAsignados,
      unidad: "clientes",
      pctBase: 100,
      icon: Users,
      colorGrad: "from-blue-700 to-blue-900",
      colorBorder: "border-blue-700/50",
      accentBg: "bg-blue-600/10 text-blue-700 dark:text-blue-400",
      diagnostico: "100% de clientes asignados a la fuerza de ventas."
    },
    {
      id: 2,
      paso: "Paso 2",
      titulo: "Clientes con Onboarding",
      subtitulo: "Con cuenta en plataforma",
      valor: cOnboarded,
      unidad: "clientes",
      pctBase: pctOnboarding,
      convAnterior: pctOnboarding,
      fugaCount: sinCuentaCount,
      fugaPct: 100 - pctOnboarding,
      fugaLabel: "Sin registrar en plataforma",
      icon: UserCheck,
      colorGrad: "from-emerald-600 to-emerald-800",
      colorBorder: "border-emerald-600/50",
      accentBg: "bg-emerald-600/10 text-emerald-700 dark:text-emerald-400",
      diagnostico: `${pctOnboarding.toFixed(1)}% de penetración de registro.`
    },
    {
      id: 3,
      paso: "Paso 3",
      titulo: "Clientes Activos Digitales",
      subtitulo: "Compraron en digital",
      valor: cActivos,
      unidad: "clientes",
      pctBase: pctActivos,
      convAnterior: pctConversionUso,
      fugaCount: inactivosCount,
      fugaPct: 100 - pctConversionUso,
      fugaLabel: "Con cuenta pero inactivos/revertidos",
      icon: Activity,
      colorGrad: "from-sky-500 to-blue-700",
      colorBorder: "border-sky-500/50",
      accentBg: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
      diagnostico: `${pctConversionUso.toFixed(1)}% de activación sobre registrados.`
    },
    {
      id: 4,
      paso: "Paso 4",
      titulo: "Adopción Transaccional",
      subtitulo: "Share digital de pedidos",
      valor: pctAdopcion,
      isPct: true,
      pctBase: pctAdopcion,
      icon: Target,
      objetivo: 90.0,
      colorGrad: "from-amber-500 to-orange-600",
      colorBorder: "border-amber-500/50",
      accentBg: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
      diagnostico: `Objetivo: 90.0% · Brecha: ${Math.max(0, 90.0 - pctAdopcion).toFixed(1)}%`
    }
  ];

  return (
    <Card className="p-5 bg-card border border-border shadow-xs rounded-xl overflow-hidden relative select-none">
      {/* Barra superior de acento */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-700 via-sky-400 to-emerald-500" />

      {/* Cabecera del Embudo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary" />
            <h3 className="text-xs font-black uppercase tracking-wider text-foreground font-sans">
              Embudo de Conversión & Adopción de Clientes
            </h3>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">
            Seguimiento de retención paso a paso: Universo Base ➔ Onboarding Comercial ➔ Uso Digital Activo ➔ Share de Pedidos.
          </p>
        </div>

        <Badge variant="outline" className="text-[11px] font-bold text-primary border-primary/30 w-fit px-2.5 py-0.5 shadow-2xs">
          Objetivo Corporativo: 90.0%
        </Badge>
      </div>

      {/* BLOQUES ESCALONADOS DE EMBUDO (Stepped Flow Pipeline) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative">
        {STAGES.map((st, i) => {
          const Icon = st.icon;
          const isLast = i === STAGES.length - 1;

          return (
            <motion.div
              key={st.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.06 }}
              className={cn(
                "p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border transition-all flex flex-col justify-between relative group shadow-2xs",
                st.colorBorder
              )}
            >
              {/* Encabezado del Paso */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider", st.accentBg)}>
                    {st.paso}
                  </span>
                  <span className="text-[11px] font-black text-foreground tabular-nums">
                    {st.isPct ? `${st.valor.toFixed(1)}%` : `${st.pctBase.toFixed(0)}% base`}
                  </span>
                </div>

                <div className="text-xs font-bold text-foreground">
                  {st.titulo}
                </div>
                <div className="text-[10px] text-muted-foreground font-medium truncate">
                  {st.subtitulo}
                </div>

                {/* Métrica Grande */}
                <div className="my-2.5">
                  <div className="text-2xl font-black text-foreground tracking-tight tabular-nums">
                    {st.isPct ? formatPct(st.valor) : formatNumber(st.valor)}
                    {!st.isPct && (
                      <span className="text-xs font-normal text-muted-foreground ml-1.5 font-sans">
                        {st.unidad}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Barra de Retención & Diagnóstico */}
              <div className="mt-2 pt-2.5 border-t border-border/80 space-y-2">
                {/* Barra de progreso con gradiente */}
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-700 bg-gradient-to-r", st.colorGrad)}
                    style={{ width: `${Math.min(100, Math.max(10, st.pctBase))}%` }}
                  />
                </div>

                {/* Diagnóstico de Fuga / Cumplimiento */}
                {st.fugaCount != null && st.fugaCount > 0 ? (
                  <div className="flex items-center justify-between text-[10px] font-semibold text-rose-600 dark:text-rose-400">
                    <span className="flex items-center gap-1 font-bold">
                      <TrendingDown className="w-3 h-3" />
                      <span>-{st.fugaCount} ({st.fugaPct.toFixed(0)}%)</span>
                    </span>
                    <span className="text-muted-foreground truncate max-w-[120px]" title={st.fugaLabel}>
                      {st.fugaLabel}
                    </span>
                  </div>
                ) : isLast ? (
                  <div className="flex items-center justify-between text-[10px]">
                    <span className={cn("font-bold", st.valor >= 90 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400")}>
                      {st.valor >= 90 ? "✔ Objetivo Cumplido" : `Brecha: ${(90.0 - st.valor).toFixed(1)}%`}
                    </span>
                    <span className="text-muted-foreground font-semibold">Obj: 90%</span>
                  </div>
                ) : (
                  <div className="text-[10px] text-muted-foreground font-medium">
                    {st.diagnostico}
                  </div>
                )}
              </div>

              {/* Flecha conectora entre pasos en Desktop */}
              {!isLast && (
                <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-full bg-card border border-border items-center justify-center text-primary shadow-xs">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}
