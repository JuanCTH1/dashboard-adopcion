import React, { useState, useEffect, useMemo } from 'react';
import { adopcionRepo } from '@/domain/adopcionRepo';
import { Sidebar } from '@/components/Sidebar';
import { AppHeader } from '@/components/AppHeader';
import { ExecutiveRibbon } from '@/components/ExecutiveRibbon';
import { AdoptionTrendCard } from '@/components/AdoptionTrendCard';
import { VerticalFunnelCard } from '@/components/VerticalFunnelCard';
import { ProgressiveHierarchy } from '@/components/ProgressiveHierarchy';
import { ActionDrawer } from '@/components/ActionDrawer';
import { CommandPalette } from '@/components/CommandPalette';
import { exportToCsv } from '@/lib/exportCsv';

export function App() {
  const filtrosDisponibles = useMemo(() => adopcionRepo.getFiltrosDisponibles(), []);

  // 1. Navigation & UI States
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [isDark, setIsDark] = useState(false);

  // 2. Multidimensional Filters
  const [filtros, setFiltros] = useState({
    anios: [2026],
    meses: ['Aug'],
    lineasNegocio: [],
    regionIds: [],
    plazas: []
  });

  // 3. Modals
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isActionDrawerOpen, setIsActionDrawerOpen] = useState(false);
  const [nodoAccion, setNodoAccion] = useState(null);

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
    setFiltros(prev => ({ ...prev, [key]: val }));
  };

  const handleResetFiltros = () => {
    setFiltros({
      anios: [2026],
      meses: ['Aug'],
      lineasNegocio: [],
      regionIds: [],
      plazas: []
    });
  };

  // Removable Active Chips
  const activeChips = useMemo(() => {
    const chips = [];
    if (filtros.anios?.length) {
      chips.push({ key: 'anios', label: 'Years', value: filtros.anios.join(', ') });
    }
    if (filtros.meses?.length) {
      chips.push({ key: 'meses', label: 'Months', value: filtros.meses.join(', ') });
    }
    if (filtros.lineasNegocio?.length) {
      const labels = filtros.lineasNegocio.map(id => filtrosDisponibles.lineasNegocio.find(l => l.id === id)?.label || id);
      chips.push({ key: 'lineasNegocio', label: 'Lines', value: labels.join(', ') });
    }
    if (filtros.regionIds?.length) {
      const labels = filtros.regionIds.map(id => filtrosDisponibles.regiones.find(r => r.id === id)?.nombre || id);
      chips.push({ key: 'regionIds', label: 'Regions', value: labels.join(', ') });
    }
    if (filtros.plazas?.length) {
      chips.push({ key: 'plazas', label: 'Cities', value: filtros.plazas.join(', ') });
    }
    return chips;
  }, [filtros, filtrosDisponibles]);

  const handleRemoveChip = (key) => {
    if (key === 'anios') setFiltros(prev => ({ ...prev, anios: [2026] }));
    else if (key === 'meses') setFiltros(prev => ({ ...prev, meses: ['Aug'] }));
    else setFiltros(prev => ({ ...prev, [key]: [] }));
  };

  // Data Queries
  const metricasGlobales = useMemo(() => {
    return adopcionRepo.getMetricasGlobales(filtros);
  }, [filtros]);

  const funnelSteps = useMemo(() => {
    return adopcionRepo.getFunnel(filtros, 'clientes');
  }, [filtros]);

  const clientesAccion = useMemo(() => {
    let fAccion = { ...filtros };
    if (nodoAccion) {
      if (nodoAccion.tipo === 'VP') fAccion.vpId = nodoAccion.id;
      else if (nodoAccion.tipo === 'Director') fAccion.directorId = nodoAccion.id;
      else if (nodoAccion.tipo === 'Gerente') fAccion.gerenteId = nodoAccion.id;
      else if (nodoAccion.tipo === 'Vendedor') fAccion.vendedorId = nodoAccion.id;
    }
    return adopcionRepo.getTopClientesAccion(fAccion, 10);
  }, [filtros, nodoAccion]);

  const handleOpenActionDrawer = (nodo) => {
    setNodoAccion(nodo);
    setIsActionDrawerOpen(true);
  };

  const handleExportGlobalCsv = () => {
    const clientes = adopcionRepo._filtrar(filtros).clientes;
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
        filtros={filtros}
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

          {/* ROW 2: DUAL COLUMNS (LEFT: HISTORICAL TREND, RIGHT: VERTICAL FUNNEL) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            {/* Left Column (7 of 12 Cols): Adoption Trend */}
            <div className="lg:col-span-7 flex flex-col">
              <AdoptionTrendCard
                serieHistorica={metricasGlobales.serieHistorica}
                filtros={filtros}
              />
            </div>

            {/* Right Column (5 of 12 Cols): Vertical Funnel */}
            <div className="lg:col-span-5 flex flex-col">
              <VerticalFunnelCard
                funnelSteps={funnelSteps}
              />
            </div>
          </div>

          {/* ROW 3: CASCADED HIERARCHY EXPLORER + EXPANDABLE ACCOUNT PORTFOLIO TABLE */}
          <ProgressiveHierarchy
            filtrosCompuestos={filtros}
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