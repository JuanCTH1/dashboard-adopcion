import React from 'react';
import { Package, Users, Weight, AlertCircle } from 'lucide-react';
import { LENTES } from '@/domain/definiciones';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';

export function LensSelector({ activeLens, onLensChange, volumeCompatible, volumeMessage }) {
  const options = [
    {
      id: LENTES.PEDIDOS,
      label: 'Por Pedidos',
      sub: 'Fricción operativa',
      icon: Package,
      disabled: false
    },
    {
      id: LENTES.CLIENTES,
      label: 'Por Clientes',
      sub: 'Penetración de cuentas',
      icon: Users,
      disabled: false
    },
    {
      id: LENTES.VOLUMEN,
      label: 'Ponderado por Volumen',
      sub: 'Impacto económico',
      icon: Weight,
      disabled: !volumeCompatible,
      tooltip: !volumeCompatible ? volumeMessage : null
    }
  ];

  return (
    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-850 p-1 rounded-xl border border-border/80 select-none">
      <div className="text-[10px] font-bold text-muted-foreground uppercase px-2 tracking-wider hidden sm:block">
        Lente:
      </div>

      <div className="flex items-center gap-1">
        {options.map(opt => {
          const Icon = opt.icon;
          const isActive = activeLens === opt.id;

          const buttonNode = (
            <button
              key={opt.id}
              type="button"
              disabled={opt.disabled}
              onClick={() => !opt.disabled && onLensChange(opt.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                isActive
                  ? "bg-white dark:bg-slate-900 text-foreground shadow-xs border border-border/60"
                  : "text-muted-foreground hover:text-foreground hover:bg-slate-200/60 dark:hover:bg-slate-800/60",
                opt.disabled && "opacity-40 cursor-not-allowed hover:bg-transparent"
              )}
            >
              <Icon className={cn("w-3.5 h-3.5", isActive ? "text-primary" : "text-muted-foreground")} />
              <span>{opt.label}</span>
              {opt.disabled && <AlertCircle className="w-3 h-3 text-amber-500 ml-0.5" />}
            </button>
          );

          if (opt.tooltip) {
            return (
              <TooltipProvider key={opt.id} delayDuration={150}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>{buttonNode}</span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs text-xs bg-slate-900 text-slate-100 p-2.5">
                    <div className="flex items-start gap-1.5 text-amber-400 font-semibold mb-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>Lente de Volumen Deshabilitado</span>
                    </div>
                    <div className="text-[11px] text-slate-300 leading-normal">{opt.tooltip}</div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          }

          return buttonNode;
        })}
      </div>
    </div>
  );
}
