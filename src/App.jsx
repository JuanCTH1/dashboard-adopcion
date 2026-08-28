import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { adopcionRepo } from '@/domain/adopcionRepo';
import { Sidebar } from '@/components/Sidebar';
import { AppHeader } from '@/components/AppHeader';
import { ExecutiveRibbon } from '@/components/ExecutiveRibbon';
import { AdoptionTrendCard } from '@/components/AdoptionTrendCard';
import { ProgressiveHierarchy } from '@/components/ProgressiveHierarchy';
import { ActionDrawer } from '@/components/ActionDrawer';
import { CommandPalette } from '@/components/CommandPalette';
import { exportToCsv } from '@/lib/exportCsv';

export function App() {
  const filtrosDisponibles = useMemo(() => adopcionRepo.getFiltrosDisponibles(), []);

  // 1. Navigation & UI States
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [isDark, setIsDark] = useState(false);

  // 2. Multidimensional Context Filters (Sidebar)
  const [filtrosContexto, setFiltrosContexto] = useState({
    anios: [],
    meses: [],
    lineasNegocio: [],
    onboarded: []
  });

  // 3. Hierarchy Active Selection (Tree Canvas)
  const [filtrosJerarquia, setFiltrosJerarquia] = useState({
    vpIds: [],
    directorIds: [],
    gerenteIds: [],
    vendedorIds: []
  });

  // 4. Modals
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isActionDrawerOpen, setIsActionDrawerOpen] = useState(false);
  const [nodoAccion, setNodoAccion] = useState(null);

  // Combinación unificada de filtros para todo el tablero
  const filtrosCompuestos = useMemo(() => {
    return {
      ...filtrosContexto,
      ...filtrosJerarquia
    };
  }, [filtrosContexto, filtrosJerarquia]);

  // Sync Dark Mode Class
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Shortcut Ctrl+K
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

  const handleFiltroChange = (key, val) => {
    setFiltrosContexto(prev => ({ ...prev, [key]: val }));
  };

  const handleResetFiltros = () => {
    setFiltrosContexto({
      anios: [],
      meses: [],
      lineasNegocio: [],
      onboarded: []
    });
    setFiltrosJerarquia({
      vpIds: [],
      directorIds: [],
      gerenteIds: [],
      vendedorIds: []
    });
  };

  const handleHierarchyFilterChange = useCallback((jerarquiaSelection) => {
    setFiltrosJerarquia(jerarquiaSelection);
  }, []);

  // Removable Active Chips
  const activeChips = useMemo(() => {
    const chips = [];
    if (filtrosContexto.anios?.length) {
      chips.push({ key: 'anios', label: 'Years', value: filtrosContexto.anios.join(', ') });
    }
    if (filtrosContexto.meses?.length) {
      chips.push({ key: 'meses', label: 'Months', value: filtrosContexto.meses.join(', ') });
    }
    if (filtrosContexto.lineasNegocio?.length) {
      chips.push({ key: 'lineasNegocio', label: 'Lines', value: filtrosContexto.lineasNegocio.join(', ') });
    }
    if (filtrosContexto.onboarded?.length) {
      chips.push({ key: 'onboarded', label: 'Onboarded', value: filtrosContexto.onboarded.join(', ') });
    }
    if (filtrosJerarquia.vpIds?.length) {
      chips.push({ key: 'vps', label: 'VPs', value: `${filtrosJerarquia.vpIds.length} sel` });
    }
    if (filtrosJerarquia.directorIds?.length) {
      chips.push({ key: 'directors', label: 'Regions', value: `${filtrosJerarquia.directorIds.length} sel` });
    }
    if (filtrosJerarquia.gerenteIds?.length) {
      chips.push({ key: 'gerentes', label: 'Markets', value: `${filtrosJerarquia.gerenteIds.length} sel` });
    }
    if (filtrosJerarquia.vendedorIds?.length) {
      chips.push({ key: 'vendedores', label: 'Reps', value: `${filtrosJerarquia.vendedorIds.length} sel` });
    }
    return chips;
  }, [filtrosContexto, filtrosJerarquia]);

  const handleRemoveChip = (key) => {
    if (key === 'anios') {
      setFiltrosContexto(prev => ({ ...prev, anios: [] }));
    } else if (key === 'meses') {
      setFiltrosContexto(prev => ({ ...prev, meses: [] }));
    } else if (key === 'lineasNegocio') {
      setFiltrosContexto(prev => ({ ...prev, lineasNegocio: [] }));
    } else if (key === 'onboarded') {
      setFiltrosContexto(prev => ({ ...prev, onboarded: [] }));
    } else if (key === 'vps') {
      setFiltrosJerarquia(prev => ({ ...prev, vpIds: [] }));
    } else if (key === 'directors') {
      setFiltrosJerarquia(prev => ({ ...prev, directorIds: [] }));
    } else if (key === 'gerentes') {
      setFiltrosJerarquia(prev => ({ ...prev, gerenteIds: [] }));
    } else if (key === 'vendedores') {
      setFiltrosJerarquia(prev => ({ ...prev, vendedorIds: [] }));
    }
  };

  // Data Queries UNIFICADAS QUE AFECTAN TODO EL TABLERO
  const metricasGlobales = useMemo(() => {
    return adopcionRepo.getMetricasGlobales(filtrosCompuestos);
  }, [filtrosCompuestos]);

  const funnelSteps = useMemo(() => {
    return adopcionRepo.getFunnel(filtrosCompuestos, 'clientes');
  }, [filtrosCompuestos]);

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

  const handleOpenActionDrawer = (nodo) => {
    setNodoAccion(nodo);
    setIsActionDrawerOpen(true);
  };

  const handleExportGlobalCsv = () => {
    const clientes = adopcionRepo._filtrar(filtrosCompuestos).clientes;
    exportToCsv(`CX_Adoption_Account_Report`, clientes, [
      { key: 'id', label: 'Account ID' },
      { key: 'nombreEmpresa', label: 'Company Name' },
      { key: 'lineaLabel', label: 'Business Line' },
      { key: 'volumenBase', label: 'Base Volume' },
      { key: 'unidad', label: 'Unit' },
      { key: 'estaIncorporado', label: 'Onboarded' },
      { key: 'esActivo', label: 'Digital Active' },
      { key: 'fttv', label: 'FTTV Days' }
    ]);
  };

  return (
    <div className="flex h-screen h-[100dvh] w-full overflow-hidden bg-background text-foreground font-sans transition-colors duration-150 select-none">
      {/* 1. SIDEBAR WITH GLOBAL CONTEXT FILTERS */}
      <Sidebar
        isOpen={desktopSidebarOpen}
        onToggle={() => setDesktopSidebarOpen(!desktopSidebarOpen)}
        filtros={filtrosContexto}
        onFiltroChange={handleFiltroChange}
        onResetFiltros={handleResetFiltros}
        filtrosDisponibles={filtrosDisponibles}
      />

      {/* 2. MAIN CANVAS WORKSTATION */}
      <main className="flex-1 min-w-0 flex flex-col relative h-full overflow-hidden">
        {/* MULTI-LAYER HEADER */}
        <AppHeader
          sidebarOpen={desktopSidebarOpen}
          onToggleSidebar={() => setDesktopSidebarOpen(!desktopSidebarOpen)}
          activeChips={activeChips}
          onRemoveChip={handleRemoveChip}
          onClearAllChips={handleResetFiltros}
          onOpenSearch={() => setIsSearchOpen(true)}
          isDark={isDark}
          onToggleDark={() => setIsDark(!isDark)}
          onExportCsv={handleExportGlobalCsv}
        />

        {/* WORKSTATION CANVAS */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-4 font-sans">
          {/* ROW 1: EXECUTIVE KPI RIBBON */}
          <ExecutiveRibbon
            metricasGlobales={metricasGlobales}
          />

          {/* ROW 2: HISTORICAL ADOPTION TREND */}
          <AdoptionTrendCard
            serieHistorica={metricasGlobales.serieHistorica}
            filtros={filtrosCompuestos}
          />

          {/* ROW 3: CASCADED HIERARCHY EXPLORER + EXPANDABLE ACCOUNT PORTFOLIO TABLE */}
          <ProgressiveHierarchy
            filtrosCompuestos={filtrosCompuestos}
            onHierarchyFilterChange={handleHierarchyFilterChange}
            onOpenActionDrawer={handleOpenActionDrawer}
            onExportCsv={handleExportGlobalCsv}
          />
        </div>
      </main>

      {/* 3. SLIDE-IN COMMERCIAL ACTION DRAWER */}
      <ActionDrawer
        isOpen={isActionDrawerOpen}
        onClose={() => setIsActionDrawerOpen(false)}
        nodoSeleccionado={nodoAccion}
        clientesAccion={clientesAccion}
        onExportActionCsv={handleExportGlobalCsv}
      />

      {/* 4. OMNIBOX SEARCH PALETTE (CTRL+K) */}
      <CommandPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        items={filtrosDisponibles}
        onSelectItem={(tipo, item) => {
          if (tipo === 'vendedor') {
            setNodoAccion({ id: item.id, nombre: item.nombre, tipo: 'Sales Rep' });
            setIsActionDrawerOpen(true);
          }
        }}
      />
    </div>
  );
}

export default App;
