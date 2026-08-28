import React, { useState, useRef } from "react"
import { HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export function CustomTooltip({ text, children, position = "top" }) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const triggerRef = useRef(null);

  if (!text) return children;

  const handleMouseEnter = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        x: rect.left + rect.width / 2,
        y: position === "bottom" ? rect.bottom + 6 : rect.top - 6
      });
    }
    setIsVisible(true);
  };

  return (
    <>
      <span
        ref={triggerRef}
        className="inline-block cursor-default"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </span>

      {isVisible && (
        <div
          style={{
            position: "fixed",
            left: `${coords.x}px`,
            top: `${coords.y}px`,
            transform: position === "bottom" ? "translate(-50%, 0)" : "translate(-50%, -100%)"
          }}
          className="z-[9999] pointer-events-none whitespace-nowrap rounded-lg bg-slate-900 dark:bg-slate-800 text-slate-100 px-2.5 py-1 text-[10px] font-extrabold shadow-xl border border-slate-700/80 backdrop-blur-md animate-in fade-in-0 zoom-in-95 duration-100"
        >
          {text}
        </div>
      )}
    </>
  );
}

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
