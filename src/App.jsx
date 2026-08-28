import React, { useState, useEffect, useMemo } from 'react';
import { adopcionRepo } from '@/domain/adopcionRepo';
import { ExecutiveRibbon } from '@/components/ExecutiveRibbon';
import { AdoptionFunnelStrip } from '@/components/AdoptionFunnelStrip';
import { HierarchyTable } from '@/components/HierarchyTable';
import { ActionDrawer } from '@/components/ActionDrawer';
import { CommandPalette } from '@/components/CommandPalette';
import { FilterSidebar } from '@/components/FilterSidebar';
import { BrandRibbon } from '@/components/ui/BrandRibbon';
import { exportToCsv } from '@/lib/exportCsv';
import { Sun, Moon, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LENTES } from '@/domain/definiciones';

export function App() {
  const filtrosDisponibles = useMemo(() => adopcionRepo.getFiltrosDisponibles(), []);

  // Estados de Control
  const [periodo, setPeriodo] = useState(filtrosDisponibles.periodoActual);
  const [activeLens, setActiveLens] = useState(LENTES.CLIENTES);
  
  // Jerarquía
  const [nivelJerarquia, setNivelJerarquia] = useState('nacional');
  const [selectedParentId, setSelectedParentId] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [selectedVendedorId, setSelectedVendedorId] = useState(null);

  // Filtros Globales
  const [filtros, setFiltros] = useState({
    lineaNegocio: null,
    regionId: null,
    plaza: null
  });

  // Modales y Drawers
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isActionDrawerOpen, setIsActionDrawerOpen] = useState(false);
  const [nodoAccion, setNodoAccion] = useState(null);

  // Modo Oscuro
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Atajo de Teclado Ctrl+K para Buscador
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Construir filtros compuestos activos
  const filtrosCompuestos = useMemo(() => {
    return {
      ...filtros,
      periodo,
      vendedorId: selectedVendedorId
    };
  }, [filtros, periodo, selectedVendedorId]);

  // Consultas al Puerto de Datos (adopcionRepo)
  const metricasGlobales = useMemo(() => {
    return adopcionRepo.getMetricasGlobales(filtrosCompuestos);
  }, [filtrosCompuestos]);

  const funnelSteps = useMemo(() => {
    return adopcionRepo.getFunnel(filtrosCompuestos, activeLens);
  }, [filtrosCompuestos, activeLens]);

  const nodosJerarquia = useMemo(() => {
    return adopcionRepo.getJerarquia(nivelJerarquia, selectedParentId, filtrosCompuestos);
  }, [nivelJerarquia, selectedParentId, filtrosCompuestos]);

  const carteraVendedor = useMemo(() => {
    if (selectedVendedorId) {
      return adopcionRepo.getCartera(selectedVendedorId, filtrosCompuestos);
    }
    return null;
  }, [selectedVendedorId, filtrosCompuestos]);

  const clientesAccion = useMemo(() => {
    let fAccion = { ...filtrosCompuestos };
    if (nodoAccion) {
      if (nodoAccion.tipo === 'VP') fAccion.vpId = nodoAccion.id;
      else if (nodoAccion.tipo === 'Director') fAccion.directorId = nodoAccion.id;
      else if (nodoAccion.tipo === 'Gerente') fAccion.gerenteId = nodoAccion.id;
      else if (nodoAccion.tipo === 'Vendedor') fAccion.vendedorId = nodoAccion.id;
    }
    return adopcionRepo.getTopClientesAccion(fAccion, 10);
  }, [filtrosCompuestos, nodoAccion]);

  // Handlers de Navegación Jerárquica
  const handleSelectNodo = (nodo) => {
    if (nodo.tipo === 'VP') {
      setNivelJerarquia('vp');
      setSelectedParentId(nodo.id);
      setBreadcrumbs([{ nivel: 'vp', id: nodo.id, nombre: nodo.nombre }]);
    } else if (nodo.tipo === 'Director') {
      setNivelJerarquia('director');
      setSelectedParentId(nodo.id);
      setBreadcrumbs(prev => [...prev.slice(0, 1), { nivel: 'director', id: nodo.id, nombre: nodo.nombre }]);
    } else if (nodo.tipo === 'Gerente') {
      setNivelJerarquia('gerente');
      setSelectedParentId(nodo.id);
      setBreadcrumbs(prev => [...prev.slice(0, 2), { nivel: 'gerente', id: nodo.id, nombre: nodo.nombre }]);
    } else if (nodo.tipo === 'Vendedor') {
      setSelectedVendedorId(nodo.id);
      setBreadcrumbs(prev => [...prev.slice(0, 3), { nivel: 'vendedor', id: nodo.id, nombre: nodo.nombre }]);
    }
  };

  const handleBreadcrumbClick = (nivel, id) => {
    if (nivel === 'nacional') {
      setNivelJerarquia('nacional');
      setSelectedParentId(null);
      setSelectedVendedorId(null);
      setBreadcrumbs([]);
    } else if (nivel === 'vp') {
      setNivelJerarquia('vp');
      setSelectedParentId(id);
      setSelectedVendedorId(null);
      setBreadcrumbs(prev => prev.slice(0, 1));
    } else if (nivel === 'director') {
      setNivelJerarquia('director');
      setSelectedParentId(id);
      setSelectedVendedorId(null);
      setBreadcrumbs(prev => prev.slice(0, 2));
    } else if (nivel === 'gerente') {
      setNivelJerarquia('gerente');
      setSelectedParentId(id);
      setSelectedVendedorId(null);
      setBreadcrumbs(prev => prev.slice(0, 3));
    }
  };

  const handleSelectItemOmnibox = (tipo, item) => {
    if (tipo === 'vendedor') {
      setSelectedVendedorId(item.id);
      setNivelJerarquia('gerente');
      setSelectedParentId(item.gerenteId);
      setBreadcrumbs([
        { nivel: 'vp', id: item.vpId, nombre: item.vpId },
        { nivel: 'director', id: item.directorId, nombre: item.directorId },
        { nivel: 'gerente', id: item.gerenteId, nombre: item.gerenteId },
        { nivel: 'vendedor', id: item.id, nombre: item.nombre }
      ]);
    } else if (tipo === 'gerente') {
      setNivelJerarquia('gerente');
      setSelectedParentId(item.id);
      setSelectedVendedorId(null);
      setBreadcrumbs([
        { nivel: 'director', id: item.directorId, nombre: item.directorId },
        { nivel: 'gerente', id: item.id, nombre: item.nombre }
      ]);
    } else if (tipo === 'director') {
      setNivelJerarquia('director');
      setSelectedParentId(item.id);
      setSelectedVendedorId(null);
      setBreadcrumbs([
        { nivel: 'director', id: item.id, nombre: item.nombre }
      ]);
    }
  };

  const handleOpenActionDrawer = (nodo) => {
    setNodoAccion(nodo);
    setIsActionDrawerOpen(true);
  };

  const handleExportCsv = () => {
    if (carteraVendedor) {
      exportToCsv(`Cartera_${selectedVendedorId}`, carteraVendedor, [
        { key: 'id', label: 'Cliente ID' },
        { key: 'lineaLabel', label: 'Línea Negocio' },
        { key: 'volumenMes', label: 'Volumen' },
        { key: 'unidad', label: 'Unidad' },
        { key: 'estaIncorporado', label: 'Incorporado' },
        { key: 'esActivo', label: 'Activo' },
        { key: 'pedidosTotales', label: 'Pedidos Totales' },
        { key: 'pedidosDigitales', label: 'Pedidos Digitales' },
        { key: 'pctAdopcionPedidos', label: '% Adopción' }
      ]);
    } else {
      exportToCsv(`Jerarquia_${nivelJerarquia}`, nodosJerarquia.map(n => ({
        nombre: n.nombre,
        tipo: n.tipo,
        plaza: n.plaza || '',
        pedidosTotales: n.metricas.pedidos.totales,
        pedidosDigitales: n.metricas.pedidos.digitales,
        pctAdopcion: n.metricas.pedidos.pctAdopcion.toFixed(1),
        clientesAsignados: n.metricas.clientes.asignados,
        clientesIncorporados: n.metricas.clientes.incorporados,
        clientesActivos: n.metricas.clientes.activos
      })), [
        { key: 'nombre', label: 'Nombre' },
        { key: 'tipo', label: 'Nivel' },
        { key: 'plaza', label: 'Plaza' },
        { key: 'pedidosTotales', label: 'Pedidos Totales' },
        { key: 'pedidosDigitales', label: 'Pedidos Digitales' },
        { key: 'pctAdopcion', label: '% Adopción' },
        { key: 'clientesAsignados', label: 'Clientes Asignados' },
        { key: 'clientesIncorporados', label: 'Onboarded' },
        { key: 'clientesActivos', label: 'Activos' }
      ]);
    }
  };

  const filtrosActivosCount = Object.values(filtros).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Barra de Navegación Global */}
      <header className="h-12 border-b border-border/80 bg-card px-4 sm:px-6 flex items-center justify-between shadow-xxs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <BrandRibbon />
            <div>
              <span className="font-extrabold text-sm tracking-tight text-foreground font-sans">
                CEMEX
              </span>
              <span className="text-[11px] text-muted-foreground ml-1.5 font-medium">
                Tablero de Adopción Digital CX
              </span>
            </div>
          </div>

          <Badge variant="outline" className="text-[9px] py-0 px-1.5 text-sky-600 dark:text-sky-400 border-sky-500/30 hidden md:flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" />
            <span>Datos Sintéticos SPCS Ready</span>
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {/* Alternador Modo Oscuro / Claro */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDark(!isDark)}
            className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
            title={isDark ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </Button>
        </div>
      </header>

      {/* Franja Ejecutiva Fija (Sticky Ribbon) */}
      <ExecutiveRibbon
        metricasGlobales={metricasGlobales}
        activeLens={activeLens}
        onLensChange={setActiveLens}
        periodoSeleccionado={periodo}
        mesesDisponibles={filtrosDisponibles.meses}
        onPeriodoChange={setPeriodo}
        onOpenSearch={() => setIsSearchOpen(true)}
        onToggleFilters={() => setIsFiltersOpen(true)}
        filtrosActivosCount={filtrosActivosCount}
      />

      {/* Contenido Principal */}
      <main className="flex-1 p-4 sm:p-6 space-y-4 max-w-7xl w-full mx-auto">
        {/* Piso 2: Funnel de Flujo Conectado */}
        <AdoptionFunnelStrip
          funnelSteps={funnelSteps}
          activeLens={activeLens}
        />

        {/* Piso 3: Estación de Trabajo Jerárquica */}
        <HierarchyTable
          nivelActivo={nivelJerarquia}
          nodosJerarquia={nodosJerarquia}
          breadcrumbs={breadcrumbs}
          onSelectNodo={handleSelectNodo}
          onBreadcrumbClick={handleBreadcrumbClick}
          onOpenActionDrawer={handleOpenActionDrawer}
          carteraVendedor={carteraVendedor}
          activeLens={activeLens}
          onExportCsv={handleExportCsv}
        />
      </main>

      {/* Action Drawer Lateral ("The Money View") */}
      <ActionDrawer
        isOpen={isActionDrawerOpen}
        onClose={() => setIsActionDrawerOpen(false)}
        nodoSeleccionado={nodoAccion}
        clientesAccion={clientesAccion}
        onExportActionCsv={handleExportCsv}
      />

      {/* Buscador Omnibox Ctrl+K */}
      <CommandPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        items={filtrosDisponibles}
        onSelectItem={handleSelectItemOmnibox}
      />

      {/* Sidebar de Filtros */}
      <FilterSidebar
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        filtros={filtros}
        onFiltroChange={(k, v) => setFiltros(prev => ({ ...prev, [k]: v }))}
        onResetFiltros={() => setFiltros({ lineaNegocio: null, regionId: null, plaza: null })}
        filtrosDisponibles={filtrosDisponibles}
      />
    </div>
  );
}
export default App;