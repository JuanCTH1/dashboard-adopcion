import React, { useState, useRef } from "react"
import { HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export function CustomTooltip({ text, content, children, position = "top", delay = 320, className = "", style }) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0, isBottom: false });
  const triggerRef = useRef(null);
  const timerRef = useRef(null);

  if (!text && !content) return children;

  const handleMouseEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const isBottom = position === "bottom";
        setCoords({
          x: rect.left + rect.width / 2,
          y: isBottom ? rect.bottom + 8 : rect.top - 8,
          isBottom
        });
        setIsVisible(true);
      }
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsVisible(false);
  };

  const winHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
  const winWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;

  return (
    <>
      <span
        ref={triggerRef}
        className={cn("inline-flex items-center", className)}
        style={style}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </span>

      {isVisible && (
        <div
          style={{
            position: "fixed",
            left: `${Math.max(140, Math.min(winWidth - 140, coords.x))}px`,
            ...(coords.isBottom ? { top: `${coords.y}px` } : { bottom: `${Math.max(10, winHeight - coords.y)}px` }),
            transform: "translateX(-50%)"
          }}
          className="z-[999999] pointer-events-none rounded-xl bg-card/98 dark:bg-slate-900/98 text-foreground dark:text-slate-100 px-3 py-2 text-xs font-semibold shadow-2xl border-2 border-slate-300 dark:border-slate-600 backdrop-blur-md max-w-xs text-left leading-snug select-none font-sans transition-opacity duration-150"
        >
          {content || text}
        </div>
      )}
    </>
  );
}

export function MetricInfoTooltip({ titulo, descripcion, tipo = "propuesta" }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-flex items-center select-none font-sans">
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
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-[9999] overflow-hidden rounded-xl bg-card/98 dark:bg-slate-900/98 p-3 text-xs text-foreground dark:text-slate-100 shadow-2xl border-2 border-slate-300 dark:border-slate-600 max-w-xs w-68 leading-relaxed pointer-events-none backdrop-blur-md animate-in fade-in-0 zoom-in-95">
          {titulo && (
            <div className="font-bold text-[12px] text-primary dark:text-sky-300 uppercase tracking-wider pb-1 mb-1.5 border-b border-border/80 flex items-center justify-between">
              <span>{titulo}</span>
              <span className="text-[10px] text-muted-foreground font-semibold">KPI Details</span>
            </div>
          )}
          <div className="text-[12px] text-muted-foreground leading-normal">{descripcion}</div>
          {tipo === "propuesta" && (
            <div className="mt-2 pt-1.5 border-t border-border/60 text-[11px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <span>⚡</span>
              <span>Definición propuesta pendiente de ratificar</span>
            </div>
          )}
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
  return (
    <div
      className={cn(
        "rounded-xl bg-card/98 dark:bg-slate-900/98 text-foreground dark:text-slate-100 p-3 text-xs font-medium shadow-2xl border-2 border-slate-300 dark:border-slate-600 backdrop-blur-md animate-in fade-in-0 zoom-in-95 font-sans select-none",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
