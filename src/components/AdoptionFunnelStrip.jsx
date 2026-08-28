import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, AlertTriangle, TrendingDown, Users, UserCheck, Activity, Target } from 'lucide-react';
import { formatNumber, formatPct, cn } from '@/lib/utils';

export function AdoptionFunnelStrip({ funnelSteps }) {
  if (!funnelSteps || funnelSteps.length === 0) return null;

  const ICONS = [Users, UserCheck, Activity, Target];
  const COLORS = ["#002B99", "#53CC80", "#398EF4", "#FFB000"];

  return (
    <Card className="p-5 bg-card border border-border shadow-xs rounded-xl overflow-hidden relative">
      {/* Barra superior */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary via-sky-400 to-emerald-500" />

      {/* Encabezado del Funnel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground font-sans">
              Embudo Visual de Adopción Comercial
            </h3>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">
            Diagnóstico secuencial de fugas: Cartera Asignada ➔ Onboarding con Cuenta ➔ Uso Digital Activo
          </p>
        </div>

        <Badge variant="outline" className="text-[10px] font-bold text-primary border-primary/30 w-fit">
          Meta Objetivo: 75%
        </Badge>
      </div>

      {/* REPRESENTACIÓN GRÁFICA REAL DE EMBUDO (Trapezoid Stepped Pipeline) */}
      <div className="relative py-2 px-1">
        {/* Barra de Flujo Cónico Horizontal */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5 relative items-stretch">
          {funnelSteps.map((step, idx) => {
            const Icon = ICONS[idx] || Users;
            const isFirst = idx === 0;
            const isLast = idx === funnelSteps.length - 1;
            const hasDropOff = step.dropOffPct > 0;
            const isCriticalLeak = step.dropOffPct >= 25;
            const stepColor = COLORS[idx] || "#002B99";

            return (
              <motion.div
                key={step.paso}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="relative flex flex-col justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-border/90 hover:border-primary/60 hover:shadow-sm transition-all group"
              >
                {/* Cabecera del Paso */}
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-lg text-white flex items-center justify-center text-[11px] font-bold shadow-2xs"
                        style={{ backgroundColor: stepColor }}
                      >
                        {step.paso}
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-bold text-foreground truncate">
                          {step.etiqueta}
                        </div>
                        <div className="text-[10px] text-muted-foreground truncate">
                          {step.descripcion}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Valor Principal */}
                  <div className="flex items-baseline justify-between gap-2 mt-2">
                    <div className="text-2xl font-extrabold tracking-tight text-foreground tabular-nums font-sans">
                      {step.esPorcentaje ? formatPct(step.valor) : formatNumber(step.valor)}
                    </div>

                    {!isFirst && !isLast && (
                      <div className="text-right">
                        <div className="text-[10px] font-bold text-muted-foreground tabular-nums">
                          {formatPct(step.pctPasoAnterior)}
                        </div>
                        <div className="text-[9px] text-muted-foreground">de paso anterior</div>
                      </div>
                    )}

                    {isLast && (
                      <Badge variant="success" className="text-[10px] font-bold">
                        {step.valor >= 75 ? "Cumple Meta" : "Brecha activa"}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Barra de Embudo Proporcional */}
                <div className="mt-3">
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.min(100, Math.max(10, step.widthPct || step.pctPasoAnterior || 100))}%`,
                        backgroundColor: stepColor
                      }}
                    />
                  </div>

                  {/* Alerta de Fuga entre Pasos */}
                  {hasDropOff && !isLast ? (
                    <div className="mt-2 flex items-center justify-between gap-1 text-[10px]">
                      <span className={cn("font-bold flex items-center gap-1", isCriticalLeak ? "text-rose-600 dark:text-rose-400" : "text-amber-600 dark:text-amber-400")}>
                        <TrendingDown className="w-3 h-3" />
                        <span>-{step.dropOffPct.toFixed(1)}% fuga</span>
                      </span>
                      <span className="text-muted-foreground truncate max-w-[120px]" title={step.motivoFuga}>
                        {step.motivoFuga?.split('/')[0]}
                      </span>
                    </div>
                  ) : isFirst ? (
                    <div className="mt-2 text-[10px] text-muted-foreground font-medium">
                      100% Universo Base
                    </div>
                  ) : null}
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
      </div>
    </Card>
  );
}