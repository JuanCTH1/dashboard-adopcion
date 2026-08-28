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
        <div className={cn("flex items-center gap-1.5 overflow-hidden transition-opacity min-w-0", !isOpen && "opacity-0 pointer-events-none")}>
          <div className="w-5 h-5 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
            <Layers className="w-3 h-3" />
          </div>
          <div className="truncate">
            <div className="font-extrabold text-[10px] tracking-tight text-slate-800 dark:text-slate-100 font-sans truncate">ADOPTION</div>
            <div className="text-[7.5px] text-muted-foreground font-bold uppercase truncate">FILTERS</div>
          </div>
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
                <Badge variant="default" className="px-1 py-0 text-[8px] h-3.5 min-w-3.5 justify-center font-bold">
                  {totalActiveFilters} active
                </Badge>

                <button
                  onClick={onResetFiltros}
                  className="text-[9.5px] text-primary dark:text-sky-400 hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  Reset
                </button>
              </>
            ) : (
              <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Global Filters</span>
            )}
          </div>

          {/* Scrollable Block List — 2-column layout */}
          <div className="flex-1 overflow-y-auto px-2 py-2.5 space-y-2.5 text-left scrollbar-thin">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs p-2 space-y-2">
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
                gridCols={2}
              />
            </div>

            {/* ONBOARDED AND ACTIVE STACKED VERTICALLY */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs p-2 space-y-2">
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
            <Badge variant="default" className="w-5 h-5 rounded-full p-0 flex items-center justify-center text-[10px] font-bold">
              {totalActiveFilters}
            </Badge>
          )}
        </div>
      )}
    </aside>
  );
}
