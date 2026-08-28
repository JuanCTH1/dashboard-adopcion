import React, { useState, useMemo } from "react";
import {
  Filter,
  RotateCcw,
  Calendar,
  Building2,
  MapPin,
  ChevronDown,
  ChevronRight,
  Search,
  Check,
  PanelLeftClose,
  PanelLeft,
  Layers,
  Sparkles
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NOMBRES_MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const ANIOS_DISPONIBLES = [2024, 2025, 2026];

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
    geografia: true
  });

  const [searchPlaza, setSearchPlaza] = useState("");

  const toggleSection = (sec) => {
    setOpenSections(prev => ({ ...prev, [sec]: !prev[sec] }));
  };

  const { lineasNegocio, regiones } = filtrosDisponibles;

  // Extraer año y mes del periodo activo (ej. "2026-08")
  const [currentYear, currentMonthNum] = useMemo(() => {
    if (!periodo) return [2026, 8];
    const [y, m] = periodo.split("-");
    return [parseInt(y, 10), parseInt(m, 10)];
  }, [periodo]);

  const handleSelectYear = (year) => {
    const mm = String(currentMonthNum).padStart(2, "0");
    onPeriodoChange(`${year}-${mm}`);
  };

  const handleSelectMonth = (monthIdx) => {
    const mm = String(monthIdx + 1).padStart(2, "0");
    onPeriodoChange(`${currentYear}-${mm}`);
  };

  const totalActiveFilters = Object.values(filtros).filter(Boolean).length;

  const plazasDisponibles = useMemo(() => {
    const list = filtros.regionId
      ? regiones.find(r => r.id === filtros.regionId)?.plazas || []
      : regiones.flatMap(r => r.plazas);
    
    if (!searchPlaza) return list;
    return list.filter(p => p.toLowerCase().includes(searchPlaza.toLowerCase()));
  }, [filtros.regionId, regiones, searchPlaza]);

  return (
    <aside
      className={cn(
        "h-screen h-[100dvh] flex flex-col bg-card border-r border-border shadow-xs transition-all duration-300 z-40 shrink-0 select-none overflow-hidden",
        isOpen ? "w-72" : "w-14"
      )}
    >
      {/* 1. Header del Sidebar */}
      <div className="h-12 px-3.5 border-b border-border flex items-center justify-between bg-slate-50 dark:bg-slate-900 shrink-0">
        <div className={cn("flex items-center gap-2.5 overflow-hidden transition-opacity", !isOpen && "opacity-0 pointer-events-none")}>
          <div className="w-6 h-6 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shadow-xs">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <div className="truncate">
            <div className="font-extrabold text-xs tracking-tight text-foreground font-sans">ADOPCIÓN CX</div>
            <div className="text-[9px] text-muted-foreground font-bold">FILTROS ASOCIATIVOS</div>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer rounded-lg"
          title={isOpen ? "Colapsar Barra Lateral" : "Expandir Barra Lateral"}
        >
          {isOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4 text-primary" />}
        </Button>
      </div>

      {/* 2. Contenido con Grid Pills (Estilo Penetron Dash) */}
      {isOpen && (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Cabecera de Conteo y Limpieza */}
          <div className="px-3.5 py-2 border-b border-border flex items-center justify-between bg-slate-100/70 dark:bg-slate-900/60 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-foreground text-[11px]">
              <Filter className="w-3 h-3 text-primary" />
              <span>Panel de Filtros</span>
              {totalActiveFilters > 0 && (
                <Badge variant="default" className="px-1.5 py-0 text-[9px] h-4 min-w-4 justify-center font-bold">
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

          {/* Lista scrolleable de Bloques Asociativos */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3.5 text-left scrollbar-thin">
            {/* GRUPO 1: PERIODO (GRID PILLS: AÑOS Y MESES) */}
            <div className="rounded-xl border border-border overflow-hidden bg-card shadow-2xs">
              <button
                type="button"
                onClick={() => toggleSection("periodo")}
                className="w-full px-3 py-2 flex items-center justify-between text-xs font-bold text-foreground bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 transition cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  <span>Periodo ({currentYear} · {NOMBRES_MESES[currentMonthNum - 1]})</span>
                </div>
                {openSections.periodo ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>

              {openSections.periodo && (
                <div className="p-2.5 space-y-3 bg-card">
                  {/* Grid de Años (3 Columnas) */}
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                      Año
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {ANIOS_DISPONIBLES.map(yr => {
                        const isSelected = currentYear === yr;
                        return (
                          <button
                            key={yr}
                            type="button"
                            onClick={() => handleSelectYear(yr)}
                            className={cn(
                              "py-1 text-center text-xs rounded-lg border font-bold transition-all cursor-pointer select-none",
                              isSelected
                                ? "bg-primary text-primary-foreground border-primary shadow-xs"
                                : "bg-card text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 border-border"
                            )}
                          >
                            '{String(yr).slice(2)}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Grid de Meses (6 Columnas en 2 Filas, como Penetron Dash) */}
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                      Mes
                    </div>
                    <div className="grid grid-cols-6 gap-1">
                      {NOMBRES_MESES.map((mLabel, idx) => {
                        const isSelected = currentMonthNum === idx + 1;
                        return (
                          <button
                            key={mLabel}
                            type="button"
                            onClick={() => handleSelectMonth(idx)}
                            className={cn(
                              "py-1 text-center text-[10px] rounded-lg border font-bold transition-all cursor-pointer select-none",
                              isSelected
                                ? "bg-primary text-primary-foreground border-primary shadow-xs"
                                : "bg-card text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 border-border"
                            )}
                          >
                            {mLabel}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* GRUPO 2: LÍNEAS DE NEGOCIO */}
            <div className="rounded-xl border border-border overflow-hidden bg-card shadow-2xs">
              <button
                type="button"
                onClick={() => toggleSection("lineas")}
                className="w-full px-3 py-2 flex items-center justify-between text-xs font-bold text-foreground bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 transition cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-primary" />
                  <span>Línea de Negocio</span>
                </div>
                {openSections.lineas ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>

              {openSections.lineas && (
                <div className="p-2 space-y-1 bg-card">
                  <button
                    type="button"
                    onClick={() => onFiltroChange("lineaNegocio", null)}
                    className={cn(
                      "w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-between cursor-pointer border",
                      !filtros.lineaNegocio
                        ? "bg-primary text-primary-foreground border-primary font-bold shadow-xs"
                        : "bg-card hover:bg-slate-100 dark:hover:bg-slate-800 text-foreground border-border"
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
                          "w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-between cursor-pointer border",
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary font-bold shadow-xs"
                            : "bg-card hover:bg-slate-100 dark:hover:bg-slate-800 text-foreground border-border"
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

            {/* GRUPO 3: GEOGRAFÍA (REGIÓN Y PLAZAS EN PILLS) */}
            <div className="rounded-xl border border-border overflow-hidden bg-card shadow-2xs">
              <button
                type="button"
                onClick={() => toggleSection("geografia")}
                className="w-full px-3 py-2 flex items-center justify-between text-xs font-bold text-foreground bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 transition cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  <span>Región & Plaza</span>
                </div>
                {openSections.geografia ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>

              {openSections.geografia && (
                <div className="p-2.5 space-y-2.5 bg-card">
                  {/* Regiones */}
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                      Región
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      {regiones.map(r => {
                        const isSelected = filtros.regionId === r.id;
                        return (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => {
                              onFiltroChange("regionId", isSelected ? null : r.id);
                              onFiltroChange("plaza", null);
                            }}
                            className={cn(
                              "p-1.5 text-left text-[11px] rounded-lg border font-semibold transition-all cursor-pointer truncate",
                              isSelected
                                ? "bg-primary text-primary-foreground border-primary shadow-xs"
                                : "bg-card text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 border-border"
                            )}
                            title={r.nombre}
                          >
                            {r.nombre}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Plazas */}
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 flex items-center justify-between">
                      <span>Plaza ({plazasDisponibles.length})</span>
                      {filtros.plaza && (
                        <button
                          onClick={() => onFiltroChange("plaza", null)}
                          className="text-primary hover:underline lowercase font-bold"
                        >
                          Limpiar
                        </button>
                      )}
                    </div>

                    <div className="relative mb-1.5">
                      <Search className="w-3 h-3 text-muted-foreground absolute left-2 top-2" />
                      <input
                        type="text"
                        value={searchPlaza}
                        onChange={e => setSearchPlaza(e.target.value)}
                        placeholder="Filtrar plaza..."
                        className="w-full pl-7 pr-2 py-1 text-[11px] bg-slate-50 dark:bg-slate-900 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-1 max-h-32 overflow-y-auto pr-1">
                      {plazasDisponibles.map(p => {
                        const isSelected = filtros.plaza === p;
                        return (
                          <button
                            key={p}
                            type="button"
                            onClick={() => onFiltroChange("plaza", isSelected ? null : p)}
                            className={cn(
                              "px-2 py-1 text-left text-[10px] rounded-md border font-medium transition-all cursor-pointer truncate",
                              isSelected
                                ? "bg-emerald-600 text-white border-emerald-700 font-bold shadow-xs"
                                : "bg-card text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 border-border"
                            )}
                            title={p}
                          >
                            {p}
                          </button>
                        );
                      })}
                    </div>
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
            <Badge variant="default" className="w-5 h-5 rounded-full p-0 flex items-center justify-center text-[10px] font-bold">
              {totalActiveFilters}
            </Badge>
          )}
        </div>
      )}
    </aside>
  );
}