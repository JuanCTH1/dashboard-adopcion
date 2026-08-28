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
  filtrosDisponibles,
  periodo,
  onPeriodoChange
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

  // Extraer año y mes activo
  const [currentYear, currentMonthNum] = useMemo(() => {
    if (!periodo) return [2026, 8];
    const [y, m] = periodo.split("-");
    return [parseInt(y, 10), parseInt(m, 10)];
  }, [periodo]);

  const handleYearChange = (valArr) => {
    const yr = valArr[valArr.length - 1] || currentYear;
    const mm = String(currentMonthNum).padStart(2, "0");
    onPeriodoChange(`${yr}-${mm}`);
  };

  const handleMonthChange = (valArr) => {
    const mStr = valArr[valArr.length - 1] || NOMBRES_MESES[currentMonthNum - 1];
    const mIdx = NOMBRES_MESES.indexOf(mStr);
    const mm = String(mIdx >= 0 ? mIdx + 1 : currentMonthNum).padStart(2, "0");
    onPeriodoChange(`${currentYear}-${mm}`);
  };

  const totalActiveFilters = Object.values(filtros).filter(Boolean).length;

  const plazasDisponibles = useMemo(() => {
    return filtros.regionId
      ? regiones.find(r => r.id === filtros.regionId)?.plazas || []
      : regiones.flatMap(r => r.plazas);
  }, [filtros.regionId, regiones]);

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
            <div className="text-[9px] text-muted-foreground font-bold">FILTRADO CON ARRASTRE</div>
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

      {/* 2. Contenido con FilterListbox (Arrastre y Selección) */}
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
            {/* GRUPO 1: PERIODO (AÑO Y MES CON ARRASTRE) */}
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
                <div className="p-2.5 space-y-2.5 bg-card">
                  {/* Año con Drag-to-Select */}
                  <FilterListbox
                    label="Año (Arrastra o Haz Clic)"
                    options={ANIOS_DISPONIBLES}
                    value={[currentYear]}
                    onChange={handleYearChange}
                    grid={true}
                    gridCols={3}
                    formatLabel={yr => `'${String(yr).slice(2)}`}
                  />

                  {/* Mes con Drag-to-Select (6 Cols en 2 filas) */}
                  <FilterListbox
                    label="Mes (Arrastra para Rango)"
                    options={NOMBRES_MESES}
                    value={[NOMBRES_MESES[currentMonthNum - 1]]}
                    onChange={handleMonthChange}
                    grid={true}
                    gridCols={6}
                  />
                </div>
              )}
            </div>

            {/* GRUPO 2: LÍNEAS DE NEGOCIO CON SELECCIÓN */}
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
                <div className="p-2.5 bg-card">
                  <FilterListbox
                    label="Líneas Disponibles"
                    options={lineasNegocio.map(l => l.id)}
                    value={filtros.lineaNegocio ? [filtros.lineaNegocio] : []}
                    onChange={(selected) => onFiltroChange("lineaNegocio", selected[selected.length - 1] || null)}
                    formatLabel={id => {
                      const ln = lineasNegocio.find(l => l.id === id);
                      return ln ? `${ln.label} (${ln.unidad})` : id;
                    }}
                  />
                </div>
              )}
            </div>

            {/* GRUPO 3: GEOGRAFÍA (REGIÓN Y PLAZA) */}
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
                  <FilterListbox
                    label="Región"
                    options={regiones.map(r => r.id)}
                    value={filtros.regionId ? [filtros.regionId] : []}
                    onChange={(selected) => {
                      onFiltroChange("regionId", selected[selected.length - 1] || null);
                      onFiltroChange("plaza", null);
                    }}
                    grid={true}
                    gridCols={2}
                    formatLabel={id => regiones.find(r => r.id === id)?.nombre || id}
                  />

                  <FilterListbox
                    label="Plaza"
                    options={plazasDisponibles}
                    value={filtros.plaza ? [filtros.plaza] : []}
                    onChange={(selected) => onFiltroChange("plaza", selected[selected.length - 1] || null)}
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