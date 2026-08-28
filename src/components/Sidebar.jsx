import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Filter,
  RotateCcw,
  Calendar,
  Building2,
  MapPin,
  Users,
  ChevronDown,
  ChevronRight,
  Search,
  Check,
  PanelLeftClose,
  PanelLeft,
  SlidersHorizontal,
  Layers
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Sidebar({
  isOpen,
  onToggle,
  filtros,
  onFiltroChange,
  onResetFiltros,
  filtrosDisponibles,
  periodo,
  onPeriodoChange
}) {
  const [openSections, setOpenSections] = useState({
    periodo: true,
    lineas: true,
    geografia: true,
    jerarquia: true
  });

  const [searchFilter, setSearchFilter] = useState("");

  const toggleSection = (sec) => {
    setOpenSections(prev => ({ ...prev, [sec]: !prev[sec] }));
  };

  const { meses, lineasNegocio, regiones, vps, directores, gerentes } = filtrosDisponibles;

  const totalActiveFilters = Object.values(filtros).filter(Boolean).length;

  const plazasDisponibles = filtros.regionId
    ? regiones.find(r => r.id === filtros.regionId)?.plazas || []
    : regiones.flatMap(r => r.plazas);

  return (
    <aside
      className={cn(
        "h-screen h-[100dvh] flex flex-col bg-card border-r border-border transition-all duration-300 z-40 shrink-0 select-none overflow-hidden",
        isOpen ? "w-72" : "w-14"
      )}
    >
      {/* 1. Header de Sidebar */}
      <div className="h-12 px-3.5 border-b border-border/80 flex items-center justify-between bg-slate-50/90 dark:bg-slate-900/90 shrink-0">
        <div className={cn("flex items-center gap-2.5 overflow-hidden transition-opacity", !isOpen && "opacity-0 pointer-events-none")}>
          <div className="w-6 h-6 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shadow-xs">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <div className="truncate">
            <div className="font-extrabold text-xs tracking-tight text-foreground">ADOPCIÓN CX</div>
            <div className="text-[9px] text-muted-foreground font-semibold">FILTROS & NAVEGACIÓN</div>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
          title={isOpen ? "Colapsar Barra Lateral" : "Expandir Barra Lateral"}
        >
          {isOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4 text-primary" />}
        </Button>
      </div>

      {/* 2. Contenido Colapsable con Acordeones */}
      {isOpen && (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Cabecera de Filtros Activos & Reset */}
          <div className="px-3.5 py-2 border-b border-border/60 flex items-center justify-between bg-slate-100/50 dark:bg-slate-900/40 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300 text-[11px]">
              <Filter className="w-3 h-3 text-primary" />
              <span>Filtros Activos</span>
              {totalActiveFilters > 0 && (
                <Badge variant="info" className="px-1.5 py-0 text-[9px] h-4 min-w-4 justify-center font-bold">
                  {totalActiveFilters}
                </Badge>
              )}
            </div>

            {totalActiveFilters > 0 && (
              <button
                onClick={onResetFiltros}
                className="text-[10px] text-primary hover:underline font-bold flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                Limpiar ({totalActiveFilters})
              </button>
            )}
          </div>

          {/* Lista scrolleable de Acordeones */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 text-left scrollbar-thin">
            {/* Acordeón 1: Periodo Mensual */}
            <div className="rounded-xl border border-border/80 overflow-hidden bg-slate-50/60 dark:bg-slate-900/40">
              <button
                type="button"
                onClick={() => toggleSection("periodo")}
                className="w-full px-3 py-2 flex items-center justify-between text-xs font-bold text-foreground bg-slate-100/70 dark:bg-slate-850 hover:bg-slate-100 transition cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  <span>Periodo de Corte</span>
                </div>
                {openSections.periodo ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>

              {openSections.periodo && (
                <div className="p-2.5 space-y-2">
                  <select
                    value={periodo}
                    onChange={(e) => onPeriodoChange(e.target.value)}
                    className="w-full text-xs font-semibold bg-card border border-border rounded-lg px-2.5 py-1.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer shadow-xxs"
                  >
                    {meses.map(m => (
                      <option key={m.key} value={m.key}>
                        {m.label} ({m.key})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Acordeón 2: Línea de Negocio */}
            <div className="rounded-xl border border-border/80 overflow-hidden bg-slate-50/60 dark:bg-slate-900/40">
              <button
                type="button"
                onClick={() => toggleSection("lineas")}
                className="w-full px-3 py-2 flex items-center justify-between text-xs font-bold text-foreground bg-slate-100/70 dark:bg-slate-850 hover:bg-slate-100 transition cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-primary" />
                  <span>Línea de Negocio</span>
                </div>
                {filtros.lineaNegocio && (
                  <Badge variant="default" className="text-[9px] py-0 px-1.5 uppercase">
                    {filtros.lineaNegocio}
                  </Badge>
                )}
                {openSections.lineas ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>

              {openSections.lineas && (
                <div className="p-2 space-y-1">
                  <button
                    type="button"
                    onClick={() => onFiltroChange("lineaNegocio", null)}
                    className={cn(
                      "w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between cursor-pointer",
                      !filtros.lineaNegocio ? "bg-primary/10 text-primary font-bold" : "hover:bg-muted text-foreground"
                    )}
                  >
                    <span>Todas las Líneas</span>
                    {!filtros.lineaNegocio && <Check className="w-3.5 h-3.5" />}
                  </button>

                  {lineasNegocio.map(ln => {
                    const isSelected = filtros.lineaNegocio === ln.id;
                    return (
                      <button
                        key={ln.id}
                        type="button"
                        onClick={() => onFiltroChange("lineaNegocio", ln.id)}
                        className={cn(
                          "w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between cursor-pointer",
                          isSelected ? "bg-primary/10 text-primary font-bold" : "hover:bg-muted text-foreground"
                        )}
                      >
                        <span>{ln.label} ({ln.unidad})</span>
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Acordeón 3: Región y Plaza */}
            <div className="rounded-xl border border-border/80 overflow-hidden bg-slate-50/60 dark:bg-slate-900/40">
              <button
                type="button"
                onClick={() => toggleSection("geografia")}
                className="w-full px-3 py-2 flex items-center justify-between text-xs font-bold text-foreground bg-slate-100/70 dark:bg-slate-850 hover:bg-slate-100 transition cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  <span>Geografía</span>
                </div>
                {(filtros.regionId || filtros.plaza) && (
                  <Badge variant="info" className="text-[9px] py-0 px-1.5">
                    Activo
                  </Badge>
                )}
                {openSections.geografia ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>

              {openSections.geografia && (
                <div className="p-2.5 space-y-2.5">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-1 block">
                      Región
                    </label>
                    <select
                      value={filtros.regionId || ""}
                      onChange={(e) => {
                        onFiltroChange("regionId", e.target.value || null);
                        onFiltroChange("plaza", null);
                      }}
                      className="w-full text-xs font-medium bg-card border border-border rounded-lg px-2.5 py-1.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer shadow-xxs"
                    >
                      <option value="">Todas las Regiones</option>
                      {regiones.map(r => (
                        <option key={r.id} value={r.id}>{r.nombre}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-1 block">
                      Plaza
                    </label>
                    <select
                      value={filtros.plaza || ""}
                      onChange={(e) => onFiltroChange("plaza", e.target.value || null)}
                      className="w-full text-xs font-medium bg-card border border-border rounded-lg px-2.5 py-1.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer shadow-xxs"
                    >
                      <option value="">Todas las Plazas</option>
                      {plazasDisponibles.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer Colapsado de Iconos Rápidos */}
      {!isOpen && (
        <div className="flex-1 flex flex-col items-center py-4 space-y-3">
          <button
            onClick={onToggle}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Abrir Filtros"
          >
            <Filter className="w-4 h-4" />
          </button>
          {totalActiveFilters > 0 && (
            <Badge variant="info" className="w-5 h-5 rounded-full p-0 flex items-center justify-center text-[10px] font-bold">
              {totalActiveFilters}
            </Badge>
          )}
        </div>
      )}
    </aside>
  );
}