import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, RotateCcw, Filter, Check } from 'lucide-react';
import { LINEAS_NEGOCIO } from '@/domain/definiciones';

export function FilterSidebar({
  isOpen,
  onClose,
  filtros,
  onFiltroChange,
  onResetFiltros,
  filtrosDisponibles
}) {
  if (!isOpen) return null;

  const { lineasNegocio, regiones } = filtrosDisponibles;

  // Plazas correspondientes a la región seleccionada
  const plazasDisponibles = filtros.regionId
    ? regiones.find(r => r.id === filtros.regionId)?.plazas || []
    : regiones.flatMap(r => r.plazas);

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-full max-w-xs bg-card border-r border-border shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
      {/* Header */}
      <div className="p-4 border-b border-border/80 bg-slate-50/80 dark:bg-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-bold text-foreground">Filtros Avanzados</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Contenido de Filtros */}
      <div className="p-4 flex-1 overflow-y-auto space-y-4 text-xs">
        {/* 1. Línea de Negocio */}
        <div>
          <label className="block text-[12px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
            Línea de Negocio
          </label>
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => onFiltroChange('lineaNegocio', null)}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg font-medium transition-colors flex items-center justify-between cursor-pointer ${
                !filtros.lineaNegocio ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-muted text-foreground'
              }`}
            >
              <span>Todas las Líneas</span>
              {!filtros.lineaNegocio && <Check className="w-3.5 h-3.5" />}
            </button>
            {lineasNegocio.map(ln => (
              <button
                key={ln.id}
                type="button"
                onClick={() => onFiltroChange('lineaNegocio', ln.id)}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg font-medium transition-colors flex items-center justify-between cursor-pointer ${
                  filtros.lineaNegocio === ln.id ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-muted text-foreground'
                }`}
              >
                <span>{ln.label} ({ln.unidad})</span>
                {filtros.lineaNegocio === ln.id && <Check className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Región Geográfica */}
        <div>
          <label className="block text-[12px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
            Región
          </label>
          <select
            value={filtros.regionId || ''}
            onChange={(e) => {
              onFiltroChange('regionId', e.target.value || null);
              onFiltroChange('plaza', null); // reset plaza if region changes
            }}
            className="w-full bg-card border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer shadow-xxs"
          >
            <option value="">Todas las Regiones</option>
            {regiones.map(r => (
              <option key={r.id} value={r.id}>{r.nombre}</option>
            ))}
          </select>
        </div>

        {/* 3. Plaza / Ciudad */}
        <div>
          <label className="block text-[12px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
            Plaza / Ciudad
          </label>
          <select
            value={filtros.plaza || ''}
            onChange={(e) => onFiltroChange('plaza', e.target.value || null)}
            className="w-full bg-card border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer shadow-xxs"
          >
            <option value="">Todas las Plazas</option>
            {plazasDisponibles.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border/80 bg-slate-50/90 dark:bg-slate-800/90 flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onResetFiltros}
          className="flex-1 gap-1.5 text-xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Limpiar Todo</span>
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={onClose}
          className="flex-1 text-xs font-bold"
        >
          Listo
        </Button>
      </div>
    </div>
  );
}
