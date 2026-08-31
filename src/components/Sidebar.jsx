import React, { useState } from "react";
import { FilterListbox } from "./FilterListbox";
import {
  Filter,
  RotateCcw,
  Calendar,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
  Layers,
  Network,
  UserCheck
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
  const [openSections, setOpenSections] = useState({
    periodo: true,
    onboarding: true
  });

  const toggleSection = (sec) => {
    setOpenSections(prev => ({ ...prev, [sec]: !prev[sec] }));
  };

  const totalActiveFilters =
    (filtros.anios?.length || 0) +
    (filtros.meses?.length || 0) +
    (filtros.onboarded?.length || 0) +
    (filtros.activos?.length || 0);

  return (
    <aside
      className={cn(
        "h-screen h-[100dvh] flex flex-col bg-slate-50 dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 shadow-xs transition-all duration-300 z-40 shrink-0 select-none overflow-hidden font-sans",
        isOpen ? "w-[168px]" : "w-11"
      )}
    >
      {/* 1. Sidebar Header */}
      <div className="h-11 px-2 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 shrink-0">
        <div className={cn("flex items-center gap-2 overflow-hidden transition-opacity min-w-0", !isOpen && "opacity-0 pointer-events-none")}>
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
          title={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
        >
          {isOpen ? <PanelLeftClose className="w-3.5 h-3.5" /> : <PanelLeft className="w-3.5 h-3.5 text-primary" />}
        </Button>
      </div>

      {/* 2. Global Context Filter Content */}
      {isOpen && (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-slate-50 dark:bg-slate-950">
          {/* Active Filter Counter & Reset (Locked h-7 height, zero layout shift) */}
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

          {/* Scrollable Block List — 2-column layout */}
          <div className="flex-1 overflow-y-auto px-2 py-2.5 space-y-2.5 text-left scrollbar-thin">
            <div className="rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shadow-2xs p-2 space-y-2">
              {/* CURRENT & PREVIOUS MONTH PRESETS (TOGGLEABLE) */}
              <div className="flex flex-col gap-1">
                {(() => {
                  const isCurrentMonth = (filtros.anios?.length === 1 && filtros.anios[0] === 2026 && filtros.meses?.length === 1 && filtros.meses[0] === 'Aug');
                  const isPrevMonth = (filtros.anios?.length === 1 && filtros.anios[0] === 2026 && filtros.meses?.length === 1 && filtros.meses[0] === 'Jul');

                  return (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          if (isCurrentMonth) {
                            onFiltroChange("anios", []);
                            onFiltroChange("meses", []);
                          } else {
                            onFiltroChange("anios", [2026]);
                            onFiltroChange("meses", ["Aug"]);
                          }
                        }}
                        className={cn(
                          "w-full py-1.5 px-2 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer shadow-2xs",
                          isCurrentMonth
                            ? "bg-primary text-primary-foreground border-primary shadow-xs"
                            : "bg-white dark:bg-slate-900 border-border text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800"
                        )}
                        title={isCurrentMonth ? "Click to deselect (Show all)" : "Filter by Current Month"}
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Current Month</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (isPrevMonth) {
                            onFiltroChange("anios", []);
                            onFiltroChange("meses", []);
                          } else {
                            onFiltroChange("anios", [2026]);
                            onFiltroChange("meses", ["Jul"]);
                          }
                        }}
                        className={cn(
                          "w-full py-1.5 px-2 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer shadow-2xs",
                          isPrevMonth
                            ? "bg-primary text-primary-foreground border-primary shadow-xs"
                            : "bg-white dark:bg-slate-900 border-border text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800"
                        )}
                        title={isPrevMonth ? "Click to deselect (Show all)" : "Filter by Previous Month"}
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Previous Month</span>
                      </button>
                    </>
                  );
                })()}
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

            {/* ONBOARDED AND ACTIVE STACKED VERTICALLY */}
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
      )}

      {/* Collapsed Footer */}
      {!isOpen && (
        <div className="flex-1 flex flex-col items-center py-4 space-y-3">
          <button
            onClick={onToggle}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Open Filters"
          >
            <Filter className="w-4 h-4" />
          </button>
          {totalActiveFilters > 0 && (
            <Badge variant="default" className="w-5 h-5 rounded-full p-0 flex items-center justify-center text-[12px] font-bold">
              {totalActiveFilters}
            </Badge>
          )}
        </div>
      )}
    </aside>
  );
}
