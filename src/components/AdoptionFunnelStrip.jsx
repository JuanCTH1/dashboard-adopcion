import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, AlertTriangle, CheckCircle2, TrendingDown } from 'lucide-react';
import { formatNumber, formatPct, cn } from '@/lib/utils';

export function AdoptionFunnelStrip({ funnelSteps, activeLens = 'clientes' }) {
  if (!funnelSteps || funnelSteps.length === 0) return null;

  return (
    <Card className="p-4 bg-card border-border/90 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Funnel de Conversión Digital
          </h3>
          <span className="text-[11px] text-muted-foreground font-medium">
            (Diagnóstico de Fuga: Onboarding vs Activación)
          </span>
        </div>

        <div className="text-[11px] text-muted-foreground font-semibold">
          Vista: <span className="text-primary capitalize">{activeLens}</span>
        </div>
      </div>

      {/* Tira Horizontal de 4 Pasos Conectados */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 relative">
        {funnelSteps.map((step, idx) => {
          const isFirst = idx === 0;
          const isLast = idx === funnelSteps.length - 1;
          const hasDropOff = step.dropOffPct > 0;
          const isCriticalLeak = step.dropOffPct >= 25;

          return (
            <div key={step.paso} className="relative flex flex-col justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-border/80 hover:border-primary/50 transition-all group">
              {/* Encabezado del Paso */}
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-750 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                    {step.paso}
                  </span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                    {step.etiqueta}
                  </span>
                </div>

                {!isFirst && !isLast && (
                  <span className="text-[10px] font-bold text-muted-foreground tabular-nums">
                    {formatPct(step.pctPasoAnterior)}
                  </span>
                )}
              </div>

              {/* Valor Principal */}
              <div className="flex items-baseline justify-between gap-2 mt-1">
                <div className="text-xl font-bold tracking-tight text-foreground tabular-nums">
                  {step.esPorcentaje ? formatPct(step.valor) : `${formatNumber(step.valor)} ${step.unidad || ''}`}
                </div>

                {hasDropOff && !isLast && (
                  <Badge
                    variant={isCriticalLeak ? "danger" : "warning"}
                    className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 shrink-0"
                  >
                    <TrendingDown className="w-3 h-3" />
                    <span>-{step.dropOffPct.toFixed(1)}% fuga</span>
                  </Badge>
                )}

                {isLast && (
                  <Badge variant="success" className="text-[10px] px-1.5 py-0.5 shrink-0">
                    Meta 75%
                  </Badge>
                )}
              </div>

              {/* Barra de progreso interna visual */}
              <div className="w-full bg-slate-200 dark:bg-slate-750 h-1.5 rounded-full mt-2.5 overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    isLast
                      ? "bg-emerald-500"
                      : isCriticalLeak
                      ? "bg-amber-500"
                      : "bg-primary"
                  )}
                  style={{
                    width: `${Math.min(100, Math.max(8, step.pctPasoAnterior || step.valor))}%`
                  }}
                />
              </div>

              {/* Etiqueta de Causa de Fuga Diagnóstica */}
              {step.motivoFuga && (
                <div className="text-[10px] text-muted-foreground font-medium mt-1.5 flex items-center gap-1 truncate">
                  <AlertTriangle className={cn("w-3 h-3 shrink-0", isCriticalLeak ? "text-rose-500" : "text-amber-500")} />
                  <span className="truncate">{step.motivoFuga}</span>
                </div>
              )}

              {/* Flecha conectora para desktop */}
              {!isLast && (
                <div className="hidden md:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10 w-4 h-4 rounded-full bg-card border border-border items-center justify-center text-muted-foreground shadow-xxs">
                  <ArrowRight className="w-2.5 h-2.5" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
