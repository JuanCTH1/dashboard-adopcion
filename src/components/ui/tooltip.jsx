import React, { useState } from "react"
import { HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export function MetricInfoTooltip({ titulo, descripcion, tipo = "propuesta" }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        className="inline-flex items-center text-slate-400 hover:text-primary transition-colors cursor-help p-0.5"
        aria-label="Ver definición"
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>

      {isVisible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 overflow-hidden rounded-lg bg-slate-900 px-3 py-2 text-xs text-slate-50 shadow-xl border border-slate-700/60 max-w-xs w-64 leading-relaxed pointer-events-none animate-in fade-in-0 zoom-in-95">
          {titulo && <div className="font-semibold text-[11px] text-sky-400 mb-0.5">{titulo}</div>}
          <div className="text-[11px] text-slate-200">{descripcion}</div>
          {tipo === "propuesta" && (
            <div className="mt-1 pt-1 border-t border-slate-700/60 text-[9px] text-amber-300 font-medium uppercase tracking-wider">
              ⚡ Definición propuesta pendiente de ratificar
            </div>
          )}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900" />
        </div>
      )}
    </div>
  );
}

export function TooltipProvider({ children }) {
  return <>{children}</>;
}

export function Tooltip({ children }) {
  return <>{children}</>;
}

export function TooltipTrigger({ asChild, children, ...props }) {
  return <>{children}</>;
}

export function TooltipContent({ children, className, ...props }) {
  return <div className={cn("text-xs", className)} {...props}>{children}</div>;
}