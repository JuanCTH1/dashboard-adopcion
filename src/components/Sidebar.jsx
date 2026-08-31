import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FilterListbox } from "./FilterListbox";
import {
  Filter,
  RotateCcw,
  Calendar,
  ChevronLeft,
  ChevronRight,
  PanelLeft,
  SlidersHorizontal,
  ShieldAlert,
  Sliders
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { exclusionManager } from "@/domain/exclusionManager";

const NOMBRES_MESES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const ANIOS_DISPONIBLES = [2024, 2025, 2026];

const SIDEBAR_SPRING = {
  type: "spring",
  stiffness: 350,
  damping: 30
};

export const Sidebar = React.memo(function Sidebar({
  isOpen,
  onToggle,
  filtros,
  onFiltroChange,
  onResetFiltros
}) {
  const [excludedCount, setExcludedCount] = useState(exclusionManager.getExcludedCount());

  useEffect(() => {
    return exclusionManager.subscribe(() => {
      setExcludedCount(exclusionManager.getExcludedCount());
    });
  }, []);

  const isCurrentMonth = (filtros.anios?.length === 1 && filtros.anios[0] === 2026 && filtros.meses?.length === 1 && filtros.meses[0] === 'Aug');
  const isPrevMonth = (filtros.anios?.length === 1 && filtros.anios[0] === 2026 && filtros.meses?.length === 1 && filtros.meses[0] === 'Jul');

  const totalActiveFilters =
    (filtros.anios?.length || 0) +
    (filtros.meses?.length || 0) +
    (filtros.onboarded?.length || 0) +
    (filtros.activos?.length || 0) +
    (filtros.excluirNoViables ? 1 : 0);

  const handleSelectCurrent = () => {
    if (isCurrentMonth) {
      onFiltroChange({ anios: [], meses: [] });
    } else {
      onFiltroChange({ anios: [2026], meses: ['Aug'] });
    }
  };

  const handleSelectPrevious = () => {
    if (isPrevMonth) {
      onFiltroChange({ anios: [], meses: [] });
    } else {
      onFiltroChange({ anios: [2026], meses: ['Jul'] });
    }
  };

  return (
    <aside
      className={cn(
        "relative h-screen h-[100dvh] flex flex-col bg-slate-50 dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 shadow-xs z-40 shrink-0 select-none font-sans overflow-visible transition-[width] duration-200 ease-in-out will-change-[width]",
        isOpen ? "w-[180px]" : "w-16"
      )}
    >
      {/* Botón flotante a media altura en el borde divisor (Disponible tanto colapsado como expandido) */}
      <button
        type="button"
        onPointerDown={(e) => {
          if (e.button === 0) {
            e.preventDefault();
            onToggle();
          }
        }}
        onClick={(e) => e.stopPropagation()}
        className="absolute top-1/2 -translate-y-1/2 -right-3.5 z-50 w-7 h-11 rounded-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-md flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-primary hover:border-primary/60 transition-colors cursor-pointer"
        aria-label="Toggle Sidebar"
      >
        {isOpen ? (
          <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-300" />
        ) : (
          <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-300" />
        )}
      </button>

      {/* 1. Sidebar Header */}
      <div className="h-11 px-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 shrink-0 overflow-hidden">
        {isOpen ? (
          <div className="flex items-center gap-2 overflow-hidden min-w-0">
            <div className="w-5 h-5 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
              <Filter className="w-3 h-3" />
            </div>
            <span className="font-extrabold text-xs tracking-wider uppercase text-slate-800 dark:text-slate-200 truncate">
              FILTERS
            </span>
          </div>
        ) : (
          <button
            type="button"
            onPointerDown={(e) => {
              if (e.button === 0) {
                e.preventDefault();
                onToggle();
              }
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-full h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            aria-label="Expand Filters"
          >
            <PanelLeft className="w-4 h-4 text-primary" />
          </button>
        )}
      </div>

      {/* 2. Content with Smooth Crossfade */}
      <AnimatePresence mode="wait" initial={false}>
        {isOpen ? (
          <motion.div
            key="expanded-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="flex-1 flex flex-col min-h-0 overflow-hidden bg-slate-50 dark:bg-slate-950 w-[180px] shrink-0"
          >
            {/* Active Filter Counter & Reset */}
            <div className="h-7 px-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-100/80 dark:bg-slate-900/80 text-xs shrink-0">
              {totalActiveFilters > 0 ? (
                <>
                  <span className="text-xs text-primary dark:text-sky-400 font-bold tabular-nums">
                    {totalActiveFilters} active
                  </span>

                  <button
                    onClick={onResetFiltros}
                    className="text-xs text-primary dark:text-sky-400 hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                    Reset
                  </button>
                </>
              ) : (
                <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">FILTERS</span>
              )}
            </div>

            {/* Scrollable Block List */}
            <div className="flex-1 overflow-y-auto px-2 py-2.5 space-y-2.5 text-left scrollbar-thin">
              <div className="rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shadow-2xs p-2 space-y-2">
                {/* CURRENT & PREVIOUS MONTH PRESETS */}
                <div className="flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={handleSelectCurrent}
                    className={cn(
                      "w-full py-1.5 px-2.5 rounded-lg text-xs font-bold flex items-center justify-between border transition-all cursor-pointer shadow-2xs",
                      isCurrentMonth
                        ? "bg-primary text-primary-foreground border-primary shadow-xs"
                        : "bg-white dark:bg-slate-900 border-border text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800"
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className={cn(
                        "w-2 h-2 rounded-full shrink-0",
                        isCurrentMonth
                          ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)] animate-pulse"
                          : "bg-slate-300 dark:bg-slate-600"
                      )} />
                      <span>August (Live)</span>
                    </div>
                    <span className={cn("text-[10px] font-bold", isCurrentMonth ? "text-white/80" : "text-muted-foreground")}>'26</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSelectPrevious}
                    className={cn(
                      "w-full py-1.5 px-2.5 rounded-lg text-xs font-bold flex items-center justify-between border transition-all cursor-pointer shadow-2xs",
                      isPrevMonth
                        ? "bg-primary text-primary-foreground border-primary shadow-xs"
                        : "bg-white dark:bg-slate-900 border-border text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800"
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                      <span>July (Official)</span>
                    </div>
                    <span className={cn("text-[10px] font-bold", isPrevMonth ? "text-white/80" : "text-muted-foreground")}>'26</span>
                  </button>
                </div>

                <FilterListbox
                  label="Year"
                  options={ANIOS_DISPONIBLES}
                  value={filtros.anios || []}
                  onChange={(val) => onFiltroChange("anios", val)}
                  grid={true}
                  gridCols={3}
                  formatLabel={yr => `'${String(yr).slice(2)}`}
                />
                <FilterListbox
                  label="Month"
                  options={NOMBRES_MESES}
                  value={filtros.meses || []}
                  onChange={(val) => onFiltroChange("meses", val)}
                  grid={true}
                  gridFlow="col"
                  gridRows={6}
                />
              </div>

              {/* ONBOARDED AND ACTIVE STACKED */}
              <div className="rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shadow-2xs p-2 space-y-2">
                <FilterListbox
                  label="Onboarded"
                  options={["Yes", "No"]}
                  value={filtros.onboarded || []}
                  onChange={(val) => onFiltroChange("onboarded", val)}
                  grid={true}
                  gridCols={2}
                />
                <FilterListbox
                  label="Active"
                  options={["Yes", "No"]}
                  value={filtros.activos || []}
                  onChange={(val) => onFiltroChange("activos", val)}
                  grid={true}
                  gridCols={2}
                />
              </div>

              {/* TARGET BASE: TOTAL VS ACTIONABLE (SAM) */}
              <div className="rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shadow-2xs p-2 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Base Target</span>
                  {excludedCount > 0 && (
                    <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                      {excludedCount} excluded
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-1 bg-white dark:bg-slate-900 p-1 rounded-lg border border-border">
                  <button
                    type="button"
                    onClick={() => onFiltroChange("excluirNoViables", false)}
                    className={cn(
                      "py-1 text-[11px] font-bold rounded transition-colors cursor-pointer text-center",
                      !filtros.excluirNoViables
                        ? "bg-primary text-primary-foreground shadow-2xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Total (All)
                  </button>
                  <button
                    type="button"
                    onClick={() => onFiltroChange("excluirNoViables", true)}
                    className={cn(
                      "py-1 text-[11px] font-bold rounded transition-colors cursor-pointer text-center",
                      filtros.excluirNoViables
                        ? "bg-primary text-primary-foreground shadow-2xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Actionable
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          /* 3. Collapsed State: Spacious, Clean 2-Button Time Switcher + Modern Filters Trigger */
          <motion.div
            key="collapsed-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="flex-1 flex flex-col items-center py-3 px-2 justify-between min-h-0 overflow-hidden w-16 shrink-0"
          >
            <div className="flex flex-col items-center gap-2.5 w-full">
              {/* Quick Button 1: August (Live Sprint / Today) */}
              <button
                type="button"
                onClick={handleSelectCurrent}
                className={cn(
                  "w-11 h-13 rounded-xl flex flex-col items-center justify-center gap-1 border transition-all cursor-pointer shadow-2xs",
                  isCurrentMonth
                    ? "bg-primary text-primary-foreground border-primary shadow-xs ring-2 ring-primary/25"
                    : "bg-white dark:bg-slate-900 border-border text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
                aria-label="August 2026 Live Sprint"
              >
                <span className={cn(
                  "w-2 h-2 rounded-full shrink-0",
                  isCurrentMonth
                    ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)] animate-pulse"
                    : "bg-slate-300 dark:bg-slate-600"
                )} />
                <div className="flex flex-col items-center leading-none">
                  <span className="text-xs font-black tracking-tight">AUG</span>
                  <span className={cn("text-[10px] font-bold mt-0.5", isCurrentMonth ? "text-white/80" : "text-muted-foreground")}>'26</span>
                </div>
              </button>

              {/* Quick Button 2: July (Official Closed) */}
              <button
                type="button"
                onClick={handleSelectPrevious}
                className={cn(
                  "w-11 h-13 rounded-xl flex flex-col items-center justify-center gap-1 border transition-all cursor-pointer shadow-2xs",
                  isPrevMonth
                    ? "bg-primary text-primary-foreground border-primary shadow-xs ring-2 ring-primary/25"
                    : "bg-white dark:bg-slate-900 border-border text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
                aria-label="July 2026 Closed Month"
              >
                <Calendar className="w-3.5 h-3.5 shrink-0 opacity-80" />
                <div className="flex flex-col items-center leading-none">
                  <span className="text-xs font-black tracking-tight">JUL</span>
                  <span className={cn("text-[10px] font-bold mt-0.5", isPrevMonth ? "text-white/80" : "text-muted-foreground")}>'26</span>
                </div>
              </button>

              {/* Quick Button 3: Target Base Toggle (ALL vs SAM) */}
              <button
                type="button"
                onClick={() => onFiltroChange("excluirNoViables", !filtros.excluirNoViables)}
                className={cn(
                  "w-11 h-10 rounded-xl flex flex-col items-center justify-center border transition-all cursor-pointer shadow-2xs",
                  filtros.excluirNoViables
                    ? "bg-amber-600 text-white border-amber-600 shadow-xs ring-2 ring-amber-500/25"
                    : "bg-white dark:bg-slate-900 border-border text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
                aria-label="Toggle Target Market Base"
              >
                <span className="text-[11px] font-black leading-none">{filtros.excluirNoViables ? "SAM" : "ALL"}</span>
                <span className={cn("text-[9px] font-semibold mt-0.5", filtros.excluirNoViables ? "text-white/80" : "text-muted-foreground")}>Base</span>
              </button>

              {/* Subtle Divider */}
              <div className="w-7 h-px bg-border/80 my-0.5" />

              {/* Clean, Spacious "Filters" Expander Trigger */}
              <button
                type="button"
                onClick={onToggle}
                className="w-11 h-11 rounded-xl flex flex-col items-center justify-center gap-0.5 bg-white dark:bg-slate-900 border border-border text-slate-700 dark:text-slate-300 hover:border-primary/50 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-2xs group"
                aria-label="Open full filters panel"
              >
                <SlidersHorizontal className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold leading-none text-muted-foreground group-hover:text-primary">More</span>
              </button>
            </div>

            {/* Bottom Reset Button if customized */}
            {totalActiveFilters > 0 && (
              <button
                type="button"
                onClick={onResetFiltros}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                aria-label="Reset all filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
});



