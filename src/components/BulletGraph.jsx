import React from 'react';
import { cn } from '@/lib/utils';

/**
 * BULLET GRAPH (Stephen Few Standard)
 * Micro-visualización horizontal de 16px de altura para celdas de tabla.
 * Muestra:
 * - Rangos cualitativos de fondo (Rojo <50%, Ámbar 50-75%, Verde >=75%)
 * - Barra de valor real alcanzado
 * - Línea vertical de meta (target 75%)
 */
export function BulletGraph({
  valor = 0,
  meta = 75,
  maximo = 100,
  mostrarValor = true,
  className
}) {
  const pctValor = Math.min(100, Math.max(0, (valor / maximo) * 100));
  const pctMeta = Math.min(100, Math.max(0, (meta / maximo) * 100));

  const isGood = valor >= meta;
  const isPoor = valor < 50;

  return (
    <div className={cn("flex items-center gap-2 w-full select-none", className)}>
      {/* Contenedor del Bullet Graph */}
      <div className="relative flex-1 h-3.5 bg-slate-200 dark:bg-slate-800 rounded overflow-hidden flex items-center">
        {/* Rangos cualitativos de fondo */}
        <div className="absolute inset-0 flex h-full opacity-60">
          <div className="w-1/2 bg-rose-500/15 dark:bg-rose-500/10" />
          <div className="w-1/4 bg-amber-500/15 dark:bg-amber-500/10" />
          <div className="w-1/4 bg-emerald-500/15 dark:bg-emerald-500/10" />
        </div>

        {/* Barra de valor real */}
        <div
          className={cn(
            "h-2 rounded-xs transition-all duration-300 z-10",
            isGood
              ? "bg-emerald-600 dark:bg-emerald-400"
              : isPoor
              ? "bg-rose-600 dark:bg-rose-400"
              : "bg-amber-600 dark:bg-amber-400"
          )}
          style={{ width: `${pctValor}%` }}
        />

        {/* Línea vertical de Meta (Target) */}
        <div
          className="absolute top-0 bottom-0 w-[2px] bg-slate-900 dark:bg-slate-100 z-20 shadow-xs"
          style={{ left: `${pctMeta}%` }}
          title={`Meta: ${meta}%`}
        />
      </div>

      {/* Valor numérico al lado */}
      {mostrarValor && (
        <span
          className={cn(
            "text-xs font-bold tabular-nums min-w-[42px] text-right",
            isGood
              ? "text-emerald-600 dark:text-emerald-400"
              : isPoor
              ? "text-rose-600 dark:text-rose-400"
              : "text-amber-600 dark:text-amber-400"
          )}
        >
          {valor.toFixed(1)}%
        </span>
      )}
    </div>
  );
}
