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

  const STAGES = [
    {
      id: 1,
      titulo: "1. Cartera Total",
      subtitulo: "Clientes Asignados",
      valor: cAsignados,
      unidad: "clientes",
      pctTotal: 100,
      colorGrad: "from-blue-700 to-blue-900",
      colorSolid: "#002B99",
      icon: Users,
      descripcion: "100% Universo gestionado"
    },
    {
      id: 2,
      titulo: "2. Con Onboarding",
      subtitulo: "Cuentas Creadas",
      valor: cOnboarded,
      unidad: "clientes",
      pctTotal: cAsignados > 0 ? (cOnboarded / cAsignados) * 100 : 0,
      colorGrad: "from-emerald-600 to-emerald-800",
      colorSolid: "#10b981",
      icon: UserCheck,
      fugaCount: sinCuentaCount,
      fugaPct: cAsignados > 0 ? (sinCuentaCount / cAsignados) * 100 : 0,
      fugaLabel: "Sin registrar en plataforma"
    },
    {
      id: 3,
      titulo: "3. Clientes Activos",
      subtitulo: "Compraron en Digital",
      valor: cActivos,
      unidad: "clientes",
      pctTotal: cAsignados > 0 ? (cActivos / cAsignados) * 100 : 0,
      colorGrad: "from-sky-500 to-blue-700",
      colorSolid: "#398EF4",
      icon: Activity,
      fugaCount: inactivosCount,
      fugaPct: cOnboarded > 0 ? (inactivosCount / cOnboarded) * 100 : 0,
      fugaLabel: "Con cuenta pero inactivos/revertidos"
    },
    {
      id: 4,
      titulo: "4. Adopción Digital",
      subtitulo: "Share Transaccional",
      valor: pctAdopcion,
      unidad: "%",
      isPct: true,
      pctTotal: pctAdopcion,
      colorGrad: "from-amber-500 to-orange-600",
      colorSolid: "#FFB000",
      icon: Target,
      objetivo: 75.0,
      descripcion: "Objetivo Corporativo: 75%"
    }
  ];

  return (
    <Card className="p-5 bg-card border border-border shadow-xs rounded-xl overflow-hidden relative select-none">
      {/* Barra superior de acento */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-700 via-sky-400 to-emerald-500" />

      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-foreground font-sans">
              Embudo Visual de Adopción (De Cartera a Uso Real)
            </h3>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">
            Visualización cónica de retención: identifica cuántos clientes se van quedando en cada fase del proceso.
          </p>
        </div>

        <Badge variant="outline" className="text-[11px] font-bold text-primary border-primary/30 w-fit px-2.5 py-0.5">
          Objetivo Corporativo: 75.0%
        </Badge>
      </div>

      {/* REPRESENTACIÓN DE EMBUDO CÓNICO REAL (Visual Tapered Stages) */}
      <div className="space-y-3">
        {/* 1. Diagrama de Barras de Ancho Cónico Proporcional */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {STAGES.map((st, i) => {
            const Icon = st.icon;
            const isLast = i === STAGES.length - 1;

            return (
              <motion.div
                key={st.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.06 }}
                className="flex flex-col justify-between p-3.5 rounded-xl bg-slate-50/90 dark:bg-slate-900/80 border border-border hover:border-primary/50 transition-all shadow-2xs group relative"
              >
                {/* Cabecera del Paso */}
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-6 h-6 rounded-lg text-white flex items-center justify-center font-bold text-xs shadow-xs bg-gradient-to-br", st.colorGrad)}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-xs text-foreground truncate">
                        {st.titulo}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground tabular-nums">
                      {st.isPct ? `${st.valor.toFixed(1)}%` : `${st.pctTotal.toFixed(0)}% base`}
                    </span>
                  </div>

                  {/* Valor Principal & Subtítulo */}
                  <div className="my-2">
                    <div className="text-2xl font-black text-foreground tracking-tight tabular-nums">
                      {st.isPct ? formatPct(st.valor) : formatNumber(st.valor)}
                      <span className="text-xs font-semibold text-muted-foreground ml-1.5 font-normal">
                        {st.unidad}
                      </span>
                    </div>
                    <div className="text-[10px] text-muted-foreground font-medium truncate">
                      {st.subtitulo}
                    </div>
                  </div>
                </div>

                {/* Barra Proporcional de Embudo (Se estrecha visiblemente) */}
                <div className="mt-2 pt-2 border-t border-border/70">
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5">
                    <div
                      className={cn("h-full rounded-full transition-all duration-700 bg-gradient-to-r", st.colorGrad)}
                      style={{ width: `${Math.min(100, Math.max(12, st.pctTotal))}%` }}
                    />
                  </div>

                  {/* Estado de Fuga o Meta */}
                  {st.fugaCount != null && st.fugaCount > 0 ? (
                    <div className="mt-2 flex items-center justify-between text-[10px] font-semibold text-rose-600 dark:text-rose-400">
                      <span className="flex items-center gap-1">
                        <TrendingDown className="w-3 h-3" />
                        <span>-{st.fugaCount} ({st.fugaPct.toFixed(0)}%)</span>
                      </span>
                      <span className="text-muted-foreground truncate max-w-[110px]" title={st.fugaLabel}>
                        {st.fugaLabel}
                      </span>
                    </div>
                  ) : isLast ? (
                    <div className="mt-2 flex items-center justify-between text-[10px]">
                      <span className={cn("font-bold", st.valor >= 75 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400")}>
                        {st.valor >= 75 ? "✔ Objetivo Cumplido" : `Brecha: ${(75 - st.valor).toFixed(1)}%`}
                      </span>
                      <span className="text-muted-foreground">Obj: 75%</span>
                    </div>
                  ) : (
                    <div className="mt-2 text-[10px] text-muted-foreground font-medium">
                      {st.descripcion}
                    </div>
                  )}
                </div>

                {/* Flecha conectora para desktop */}
                {!isLast && (
                  <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-full bg-card border border-border items-center justify-center text-primary shadow-xs">
                    <ArrowRight className="w-3 h-3" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}