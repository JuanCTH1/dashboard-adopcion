import React, { useState, useEffect, useMemo } from 'react';
import { adopcionRepo } from '@/domain/adopcionRepo';
import { Sidebar } from '@/components/Sidebar';
import { AppHeader } from '@/components/AppHeader';
import { ExecutiveRibbon } from '@/components/ExecutiveRibbon';
import { AdoptionFunnelStrip } from '@/components/AdoptionFunnelStrip';
import { AdoptionTrendCard } from '@/components/AdoptionTrendCard';
import { HierarchyTable } from '@/components/HierarchyTable';
import { ActionDrawer } from '@/components/ActionDrawer';
import { CommandPalette } from '@/components/CommandPalette';
import { exportToCsv } from '@/lib/exportCsv';

export function App() {
  const filtrosDisponibles = useMemo(() => adopcionRepo.getFiltrosDisponibles(), []);

  // 1. Estados de Navegación y UI
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [isDark, setIsDark] = useState(false);

  // 2. Filtros Multidimensionales (Arrays)
  const [filtros, setFiltros] = useState({
    anios: [2026],
    meses: ['Ago'],
    lineasNegocio: [],
    regionIds: [],
    plazas: []
  });

  // 3. Modales
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isActionDrawerOpen, setIsActionDrawerOpen] = useState(false);
  const [nodoAccion, setNodoAccion] = useState(null);

  // Sincronizar Modo Oscuro
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Atajo Ctrl+K
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
      meses: ['Ago'],
      lineasNegocio: [],
      regionIds: [],
      plazas: []
    });
  };

  // Chips Activos Removibles
  const activeChips = useMemo(() => {
    const chips = [];
    if (filtros.anios?.length) {
      chips.push({ key: 'anios', label: 'Años', value: filtros.anios.join(', ') });
    }
    if (filtros.meses?.length) {
      chips.push({ key: 'meses', label: 'Meses', value: filtros.meses.join(', ') });
    }
    if (filtros.lineasNegocio?.length) {
      const labels = filtros.lineasNegocio.map(id => filtrosDisponibles.lineasNegocio.find(l => l.id === id)?.label || id);
      chips.push({ key: 'lineasNegocio', label: 'Líneas', value: labels.join(', ') });
    }
    if (filtros.regionIds?.length) {
      const labels = filtros.regionIds.map(id => filtrosDisponibles.regiones.find(r => r.id === id)?.nombre || id);
      chips.push({ key: 'regionIds', label: 'Regiones', value: labels.join(', ') });
    }
    if (filtros.plazas?.length) {
      chips.push({ key: 'plazas', label: 'Plazas', value: filtros.plazas.join(', ') });
    }
    return chips;
  }, [filtros, filtrosDisponibles]);

  const handleRemoveChip = (key) => {
    if (key === 'anios') setFiltros(prev => ({ ...prev, anios: [2026] }));
    else if (key === 'meses') setFiltros(prev => ({ ...prev, meses: ['Ago'] }));
    else setFiltros(prev => ({ ...prev, [key]: [] }));
  };

  // Consultas al Puerto de Datos
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
    exportToCsv(`Reporte_Adopcion_Clientes`, clientes, [
      { key: 'id', label: 'Cliente ID' },
      { key: 'lineaLabel', label: 'Línea de Negocio' },
      { key: 'volumenBase', label: 'Volumen Base' },
      { key: 'unidad', label: 'Unidad' },
      { key: 'estaIncorporado', label: 'Onboarded' },
      { key: 'esActivo', label: 'Activo Digital' },
      { key: 'fttv', label: 'FTTV Días' }
    ]);
  };

  return (
    <div className="flex h-screen h-[100dvh] w-full overflow-hidden bg-background text-foreground font-sans transition-colors duration-150 select-none">
      {/* 1. SIDEBAR CON FILTRADO ASOCIATIVO Y ARRASTRE */}
      <Sidebar
        isOpen={desktopSidebarOpen}
        onToggle={() => setDesktopSidebarOpen(!desktopSidebarOpen)}
        filtros={filtros}
        onFiltroChange={handleFiltroChange}
        onResetFiltros={handleResetFiltros}
        filtrosDisponibles={filtrosDisponibles}
      />

      {/* 2. CONTENIDO PRINCIPAL */}
      <main className="flex-1 min-w-0 flex flex-col relative h-full overflow-hidden">
        {/* HEADER MULTICAPA */}
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

        {/* WORKSTATION */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-4">
          {/* SECCIÓN 1: KPIS EJECUTIVOS DE ALTO CONTRASTE */}
          <ExecutiveRibbon
            metricasGlobales={metricasGlobales}
          />

          {/* SECCIÓN 2: EMBUDO CÓNICO REAL CON POLÍGONOS CONECTADOS */}
          <AdoptionFunnelStrip
            funnelSteps={funnelSteps}
          />

          {/* SECCIÓN 3: TENDENCIA TEMPORAL HISTÓRICA RECHARTS (24 MESES) */}
          <AdoptionTrendCard
            serieHistorica={metricasGlobales.serieHistorica}
          />

          {/* SECCIÓN 4: EXPLORADOR DE ÁRBOL JERÁRQUICO MULTICOLUMNA (MILLER COLUMNS) */}
          <HierarchyTable
            filtrosCompuestos={filtros}
            onOpenActionDrawer={handleOpenActionDrawer}
            onExportCsv={handleExportGlobalCsv}
          />
        </div>
      </main>

      {/* 3. ACTION DRAWER LATERAL SLIDE-IN */}
      <ActionDrawer
        isOpen={isActionDrawerOpen}
        onClose={() => setIsActionDrawerOpen(false)}
        nodoSeleccionado={nodoAccion}
        clientesAccion={clientesAccion}
        onExportActionCsv={handleExportGlobalCsv}
      />

      {/* 4. BUSCADOR OMNIBOX CTRL+K */}
      <CommandPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        items={filtrosDisponibles}
        onSelectItem={(tipo, item) => {
          if (tipo === 'vendedor') {
            setNodoAccion({ id: item.id, nombre: item.nombre, tipo: 'Vendedor' });
            setIsActionDrawerOpen(true);
          }
        }}
      />
    </div>
  );
}

export default App;