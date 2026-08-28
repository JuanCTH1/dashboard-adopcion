import React, { useState, useMemo } from "react";
import { FilterListbox } from "./FilterListbox";
import {
  Filter,
  RotateCcw,
  Calendar,
  Building2,
  MapPin,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
  Layers
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
  filtrosDisponibles
}) {
  const [openSections, setOpenSections] = useState({
    periodo: true,
    lineas: true,
    geografia: true
  });

  const toggleSection = (sec) => {
    setOpenSections(prev => ({ ...prev, [sec]: !prev[sec] }));
  };

  const { lineasNegocio, regiones } = filtrosDisponibles;

  const totalActiveFilters =
    (filtros.anios?.length || 0) +
    (filtros.meses?.length || 0) +
    (filtros.lineasNegocio?.length || 0) +
    (filtros.regionIds?.length || 0) +
    (filtros.plazas?.length || 0);

  // Plazas posibles según la región seleccionada (asociatividad)
  const plazasPosibles = useMemo(() => {
    if (!filtros.regionIds?.length) return regiones.flatMap(r => r.plazas);
    return regiones
      .filter(r => filtros.regionIds.includes(r.id))
      .flatMap(r => r.plazas);
  }, [filtros.regionIds, regiones]);

  const todasLasPlazas = useMemo(() => {
    return regiones.flatMap(r => r.plazas);
  }, [regiones]);

  return (
    <aside
      className={cn(
        "h-screen h-[100dvh] flex flex-col bg-slate-50 dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 shadow-xs transition-all duration-300 z-40 shrink-0 select-none overflow-hidden",
        isOpen ? "w-72" : "w-14"
      )}
    >
      {/* 1. Header del Sidebar */}
      <div className="h-12 px-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 shrink-0">
        <div className={cn("flex items-center gap-2.5 overflow-hidden transition-opacity", !isOpen && "opacity-0 pointer-events-none")}>
          <div className="w-6 h-6 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shadow-xs">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <div className="truncate">
            <div className="font-extrabold text-xs tracking-tight text-slate-800 dark:text-slate-100 font-sans">ADOPCIÓN CX</div>
            <div className="text-[9px] text-muted-foreground font-bold">FILTROS ASOCIATIVOS</div>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          title={isOpen ? "Colapsar Barra Lateral" : "Expandir Barra Lateral"}
        >
          {isOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4 text-primary" />}
        </Button>
      </div>

      {/* 2. Contenido con FilterListbox Multiselección & Arrastre */}
      {isOpen && (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-slate-50 dark:bg-slate-950">
          {/* Cabecera de Conteo y Limpieza */}
          <div className="px-3.5 py-2 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-100/80 dark:bg-slate-900/80 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200 text-[11px]">
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
                className="text-[10px] text-primary dark:text-sky-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                Limpiar ({totalActiveFilters})
              </button>
            )}
          </div>

          {/* Lista scrolleable de Bloques Asociativos */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3.5 text-left scrollbar-thin">
            {/* GRUPO 1: PERIODO (AÑO Y MES CON ARRASTRE MULTISELECCIÓN) */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 shadow-2xs">
              <button
                type="button"
                onClick={() => toggleSection("periodo")}
                className="w-full px-3 py-2 flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-100/70 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  <span>Periodo Temporal</span>
                </div>
                {openSections.periodo ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>

              {openSections.periodo && (
                <div className="p-2.5 space-y-2.5 bg-white dark:bg-slate-900">
                  {/* Año con Drag-to-Select */}
                  <FilterListbox
                    label="Año"
                    options={ANIOS_DISPONIBLES}
                    value={filtros.anios || [2026]}
                    onChange={(val) => onFiltroChange("anios", val)}
                    grid={true}
                    gridCols={3}
                    formatLabel={yr => `'${String(yr).slice(2)}`}
                  />

                  {/* Mes con Drag-to-Select (6 Cols en 2 filas) */}
                  <FilterListbox
                    label="Mes (Arrastra para Rango)"
                    options={NOMBRES_MESES}
                    value={filtros.meses || ["Ago"]}
                    onChange={(val) => onFiltroChange("meses", val)}
                    grid={true}
                    gridCols={6}
                  />
                </div>
              )}
            </div>

            {/* GRUPO 2: LÍNEAS DE NEGOCIO */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 shadow-2xs">
              <button
                type="button"
                onClick={() => toggleSection("lineas")}
                className="w-full px-3 py-2 flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-100/70 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-primary" />
                  <span>Línea de Negocio</span>
                </div>
                {openSections.lineas ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>

              {openSections.lineas && (
                <div className="p-2.5 bg-white dark:bg-slate-900">
                  <FilterListbox
                    label="Líneas de Negocio"
                    options={lineasNegocio.map(l => l.id)}
                    value={filtros.lineasNegocio || []}
                    onChange={(val) => onFiltroChange("lineasNegocio", val)}
                    formatLabel={id => {
                      const ln = lineasNegocio.find(l => l.id === id);
                      return ln ? `${ln.label} (${ln.unidad})` : id;
                    }}
                  />
                </div>
              )}
            </div>

            {/* GRUPO 3: GEOGRAFÍA (REGIÓN Y PLAZA) */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 shadow-2xs">
              <button
                type="button"
                onClick={() => toggleSection("geografia")}
                className="w-full px-3 py-2 flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-100/70 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  <span>Región & Plaza</span>
                </div>
                {openSections.geografia ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>

              {openSections.geografia && (
                <div className="p-2.5 space-y-2.5 bg-white dark:bg-slate-900">
                  <FilterListbox
                    label="Región"
                    options={regiones.map(r => r.id)}
                    value={filtros.regionIds || []}
                    onChange={(val) => {
                      onFiltroChange("regionIds", val);
                      onFiltroChange("plazas", []);
                    }}
                    grid={true}
                    gridCols={2}
                    formatLabel={id => regiones.find(r => r.id === id)?.nombre || id}
                  />

                  <FilterListbox
                    label="Plaza"
                    options={todasLasPlazas}
                    possibleValues={plazasPosibles}
                    value={filtros.plazas || []}
                    onChange={(val) => onFiltroChange("plazas", val)}
                    showSearch={true}
                  />
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