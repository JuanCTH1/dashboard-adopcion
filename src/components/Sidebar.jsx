import React from "react";
import { FilterListbox } from "./FilterListbox";
import {
  Filter,
  RotateCcw,
  Calendar,
  PanelLeftClose,
  PanelLeft,
  SlidersHorizontal
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NOMBRES_MESES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const ANIOS_DISPONIBLES = [2024, 2025, 2026];

export function Sidebar({
  isOpen,
  onToggle,
  filtros,
  onFiltroChange,
  onResetFiltros
}) {
  const isCurrentMonth = (filtros.anios?.length === 1 && filtros.anios[0] === 2026 && filtros.meses?.length === 1 && filtros.meses[0] === 'Aug');
  const isPrevMonth = (filtros.anios?.length === 1 && filtros.anios[0] === 2026 && filtros.meses?.length === 1 && filtros.meses[0] === 'Jul');

  const totalActiveFilters =
    (filtros.anios?.length || 0) +
    (filtros.meses?.length || 0) +
    (filtros.onboarded?.length || 0) +
    (filtros.activos?.length || 0);

  const handleSelectCurrent = () => {
    if (isCurrentMonth) {
      onFiltroChange("anios", []);
      onFiltroChange("meses", []);
    } else {
      onFiltroChange("anios", [2026]);
      onFiltroChange("meses", ["Aug"]);
    }
  };

  const handleSelectPrevious = () => {
    if (isPrevMonth) {
      onFiltroChange("anios", []);
      onFiltroChange("meses", []);
    } else {
      onFiltroChange("anios", [2026]);
      onFiltroChange("meses", ["Jul"]);
    }
  };

  return (
    <aside
      className={cn(
        "h-screen h-[100dvh] flex flex-col bg-slate-50 dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 shadow-xs transition-all duration-250 z-40 shrink-0 select-none overflow-hidden font-sans",
        isOpen ? "w-[172px]" : "w-14"
      )}
    >
      {/* 1. Sidebar Header */}
      <div className="h-11 px-2 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 shrink-0">
        {isOpen ? (
          <>
            <div className="flex items-center gap-2 overflow-hidden min-w-0">
              <div className="w-5 h-5 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                <Filter className="w-3 h-3" />
              </div>
              <span className="font-extrabold text-xs tracking-wider uppercase text-slate-800 dark:text-slate-200 truncate">
                FILTERS
              </span>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="h-6 w-6 text-muted-foreground hover:text-foreground cursor-pointer rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
              title="Collapse Sidebar"
            >
              <PanelLeftClose className="w-3.5 h-3.5" />
            </Button>
          </>
        ) : (
          <button
            type="button"
            onClick={onToggle}
            className="w-full h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer relative"
            title="Expand all filters (Year, Month, Onboarded, Active)"
          >
            <PanelLeft className="w-4 h-4 text-primary" />
            {totalActiveFilters > 0 && (
              <span className="absolute top-0.5 right-1 w-2 h-2 rounded-full bg-primary" />
            )}
          </button>
        )}
      </div>

      {/* 2. Expanded Sidebar Content */}
      {isOpen ? (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-slate-50 dark:bg-slate-950">
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
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={handleSelectCurrent}
                  className={cn(
                    "w-full py-1.5 px-2 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer shadow-2xs",
                    isCurrentMonth
                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                      : "bg-white dark:bg-slate-900 border-border text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800"
                  )}
                  title={isCurrentMonth ? "Click to deselect (Show all)" : "Filter by Current Month (Aug 2026)"}
                >
                  <span className={cn("w-2 h-2 rounded-full shrink-0", isCurrentMonth ? "bg-white" : "bg-emerald-500 animate-pulse")} />
                  <span>August (Live)</span>
                </button>

                <button
                  type="button"
                  onClick={handleSelectPrevious}
                  className={cn(
                    "w-full py-1.5 px-2 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer shadow-2xs",
                    isPrevMonth
                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                      : "bg-white dark:bg-slate-900 border-border text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800"
                  )}
                  title={isPrevMonth ? "Click to deselect (Show all)" : "Filter by Previous Month (July 2026)"}
                >
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  <span>July (Official)</span>
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
          </div>
        </div>
      ) : (
        /* 3. Collapsed State: Quick 2-Button Time Switcher + Intuitive Expand Trigger */
        <div className="flex-1 flex flex-col items-center py-2.5 px-1.5 justify-between min-h-0">
          <div className="flex flex-col items-center gap-2 w-full">
            {/* Quick Button 1: August (Live Sprint / Today) */}
            <button
              type="button"
              onClick={handleSelectCurrent}
              className={cn(
                "w-10 h-12 rounded-xl flex flex-col items-center justify-center gap-0.5 border transition-all cursor-pointer shadow-2xs",
                isCurrentMonth
                  ? "bg-primary text-primary-foreground border-primary shadow-xs ring-2 ring-primary/20"
                  : "bg-white dark:bg-slate-900 border-border text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
              title="Filter by Current Month: August 2026 (Live Sprint)"
            >
              <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", isCurrentMonth ? "bg-white" : "bg-emerald-500 animate-pulse")} />
              <span className="text-[10px] font-black uppercase tracking-tight leading-none">AUG</span>
              <span className={cn("text-[9px] font-bold leading-none", isCurrentMonth ? "text-white/80" : "text-muted-foreground")}>'26</span>
            </button>

            {/* Quick Button 2: July (Official Closed) */}
            <button
              type="button"
              onClick={handleSelectPrevious}
              className={cn(
                "w-10 h-12 rounded-xl flex flex-col items-center justify-center gap-0.5 border transition-all cursor-pointer shadow-2xs",
                isPrevMonth
                  ? "bg-primary text-primary-foreground border-primary shadow-xs ring-2 ring-primary/20"
                  : "bg-white dark:bg-slate-900 border-border text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
              title="Filter by Previous Month: July 2026 (Official Closed)"
            >
              <Calendar className="w-3 h-3 shrink-0 opacity-80" />
              <span className="text-[10px] font-black uppercase tracking-tight leading-none">JUL</span>
              <span className={cn("text-[9px] font-bold leading-none", isPrevMonth ? "text-white/80" : "text-muted-foreground")}>'26</span>
            </button>

            {/* Subtle Divider */}
            <div className="w-6 h-px bg-border/80 my-1" />

            {/* Intuitive "+ Filters" Expand Trigger */}
            <button
              type="button"
              onClick={onToggle}
              className="w-10 h-11 rounded-xl flex flex-col items-center justify-center gap-0.5 border border-dashed border-border/80 text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all cursor-pointer group"
              title="Expand all filters (Year, Month, Onboarded, Active)"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-primary group-hover:scale-110 transition-transform" />
              <span className="text-[9px] font-extrabold uppercase tracking-tight text-muted-foreground group-hover:text-primary leading-none">+More</span>
            </button>
          </div>

          {/* Bottom Reset Button if customized */}
          {totalActiveFilters > 0 && (
            <button
              type="button"
              onClick={onResetFiltros}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </aside>
  );
}

