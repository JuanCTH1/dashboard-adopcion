import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { adopcionRepo } from '@/domain/adopcionRepo';
import { Sidebar } from '@/components/Sidebar';
import { AppHeader } from '@/components/AppHeader';
import { ExecutiveRibbon } from '@/components/ExecutiveRibbon';
import { AdoptionTrendCard } from '@/components/AdoptionTrendCard';
import { LeaderboardCard } from '@/components/LeaderboardCard';
import { ProgressiveHierarchy } from '@/components/ProgressiveHierarchy';
import { ActionDrawer } from '@/components/ActionDrawer';
import { CommandPalette } from '@/components/CommandPalette';
import { exportToCsv } from '@/lib/exportCsv';

export function App() {
  const filtrosDisponibles = useMemo(() => adopcionRepo.getFiltrosDisponibles(), []);
  const mainScrollRef = useRef(null);

  // 1. Navigation & UI States
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [isDark, setIsDark] = useState(false);

  // 2. Multidimensional Context Filters (Sidebar)
  const [filtrosContexto, setFiltrosContexto] = useState({
    anios: [],
    meses: [],
    lineasNegocio: [],
    onboarded: [],
    activos: []
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

  // Fast, beautiful smooth scroll animation (easeOutQuart, ~280ms)
  const smoothScrollTo = useCallback((element, targetY, duration = 280) => {
    if (!element) return;
    const startY = element.scrollTop;
    const diff = targetY - startY;
    if (Math.abs(diff) < 2) return;

    const startTime = performance.now();
    const easeOutQuart = (x) => 1 - Math.pow(1 - x, 4);

    const step = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      element.scrollTop = startY + diff * easeOutQuart(progress);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }, []);

  // Global Keyboard Navigation (Arrow Keys animate directly to top/bottom with snappy curve)
  useEffect(() => {
    const handleGlobalNavKeys = (e) => {
      if (isSearchOpen || isActionDrawerOpen) return;
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

      const el = mainScrollRef.current;
      if (!el) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        smoothScrollTo(el, el.scrollHeight - el.clientHeight, 280);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        smoothScrollTo(el, 0, 280);
      } else if (e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey)) {
        e.preventDefault();
        smoothScrollTo(el, Math.min(el.scrollTop + 500, el.scrollHeight - el.clientHeight), 220);
      } else if (e.key === 'PageUp' || (e.key === ' ' && e.shiftKey)) {
        e.preventDefault();
        smoothScrollTo(el, Math.max(el.scrollTop - 500, 0), 220);
      } else if (e.key === 'Home') {
        e.preventDefault();
        smoothScrollTo(el, 0, 280);
      } else if (e.key === 'End') {
        e.preventDefault();
        smoothScrollTo(el, el.scrollHeight - el.clientHeight, 280);
      }
    };

    window.addEventListener('keydown', handleGlobalNavKeys);
    return () => window.removeEventListener('keydown', handleGlobalNavKeys);
  }, [isSearchOpen, isActionDrawerOpen, smoothScrollTo]);

  const handleFiltroChange = (key, val) => {
    setFiltrosContexto(prev => ({ ...prev, [key]: val }));
  };

  const handleResetFiltros = () => {
    setFiltrosContexto({
      anios: [],
      meses: [],
      lineasNegocio: [],
      onboarded: [],
      activos: []
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
    if (filtrosContexto.activos?.length) {
      chips.push({ key: 'activos', label: 'Active', value: filtrosContexto.activos.join(', ') });
    }
    if (filtrosJerarquia.vpIds?.length) {
      chips.push({ key: 'vps', label: 'Business Line', value: `${filtrosJerarquia.vpIds.length} sel` });
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
    } else if (key === 'activos') {
      setFiltrosContexto(prev => ({ ...prev, activos: [] }));
    } else if (key === 'vps') {
      setFiltrosJerarquia(prev => ({
        ...prev,
        vpIds: [],
        directorIds: [],
        gerenteIds: [],
        vendedorIds: []
      }));
    } else if (key === 'directors') {
      setFiltrosJerarquia(prev => ({
        ...prev,
        directorIds: [],
        gerenteIds: [],
        vendedorIds: []
      }));
    } else if (key === 'gerentes') {
      setFiltrosJerarquia(prev => ({
        ...prev,
        gerenteIds: [],
        vendedorIds: []
      }));
    } else if (key === 'vendedores') {
      setFiltrosJerarquia(prev => ({ ...prev, vendedorIds: [] }));
    }
  };

  const metricasGlobales = useMemo(() => {
    return adopcionRepo.getMetricasGlobales(filtrosCompuestos);
  }, [filtrosCompuestos]);

  const leaderboardData = useMemo(() => {
    return adopcionRepo.getLeaderboard(filtrosCompuestos);
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
    const clientes = adopcionRepo.getCartera(null, filtrosCompuestos);
    exportToCsv(`Adoption_Customer_Report`, clientes, [
      { key: 'nombreEmpresa', label: 'Customer Name' },
      { key: 'lineaLabel', label: 'Business Line' },
      { key: 'volumenBase', label: 'Base Volume' },
      { key: 'unidad', label: 'Unit' },
      { key: 'estaIncorporado', label: 'Onboarded' },
      { key: 'esActivo', label: 'Digital Active' }
    ]);
  };

  // 5. Omni-Search Command Palette Data & Handler
  const commandPaletteData = useMemo(() => {
    return {
      vps: [
        { id: 'vp-readymix', nombre: 'Ready Mix', persona: 'VP Roberto Garza' },
        { id: 'vp-cemento', nombre: 'Cemento', persona: 'VP Alejandro Domínguez' },
        { id: 'vp-agregados', nombre: 'Agregados', persona: 'VP Mariana Treviño' }
      ],
      directores: filtrosDisponibles.directores || [],
      gerentes: filtrosDisponibles.gerentes || [],
      vendedores: filtrosDisponibles.vendedores || [],
      clientes: adopcionRepo.getCartera(null, {}) || []
    };
  }, [filtrosDisponibles]);

  const handleSelectCommand = useCallback((tipo, item) => {
    setIsSearchOpen(false);
    if (tipo === 'cliente') {
      const nextVps = item.vpId ? [item.vpId] : [];
      const nextDirs = item.regionNombre ? [item.regionNombre] : (item.regionId ? [item.regionId] : []);
      const nextGers = item.plaza ? [item.plaza] : (item.gerenteId ? [item.gerenteId] : []);
      const nextReps = item.vendedorId ? [item.vendedorId] : [];

      setFiltrosJerarquia({
        vpIds: nextVps,
        directorIds: nextDirs,
        gerenteIds: nextGers,
        vendedorIds: nextReps
      });
    } else if (tipo === 'vendedor') {
      const nextVps = item.vpId ? [item.vpId] : [];
      const nextDirs = item.regionNombre ? [item.regionNombre] : [];
      const nextGers = item.plaza ? [item.plaza] : [];

      setFiltrosJerarquia({
        vpIds: nextVps,
        directorIds: nextDirs,
        gerenteIds: nextGers,
        vendedorIds: [item.id]
      });
    } else if (tipo === 'gerente') {
      const marketRegionMap = {
        'New York': 'Atlantic', 'Boston': 'Atlantic',
        'Dallas': 'Sunbelt', 'Houston': 'Sunbelt',
        'Chicago': 'Midwest', 'St. Louis': 'Midwest',
        'Denver': 'Mountain', 'Salt Lake': 'Mountain',
        'Los Angeles': 'Pacific NW', 'Phoenix': 'Pacific NW'
      };
      const region = marketRegionMap[item.nombre] || item.regionNombre;

      setFiltrosJerarquia({
        vpIds: [],
        directorIds: region ? [region] : [],
        gerenteIds: [item.nombre || item.id],
        vendedorIds: []
      });
    } else if (tipo === 'director') {
      setFiltrosJerarquia({
        vpIds: [],
        directorIds: [item.nombre || item.id],
        gerenteIds: [],
        vendedorIds: []
      });
    } else if (tipo === 'vp') {
      setFiltrosJerarquia({
        vpIds: [item.id],
        directorIds: [],
        gerenteIds: [],
        vendedorIds: []
      });
    } else if (tipo === 'action') {
      if (item.id === 'open_action_plan') {
        setNodoAccion({ id: 'national', nombre: 'National Overview', tipo: 'National' });
        setIsActionDrawerOpen(true);
      } else if (item.id === 'export_csv') {
        handleExportGlobalCsv();
      } else if (item.id === 'toggle_theme') {
        setIsDark(prev => !prev);
      } else if (item.id === 'reset_filters') {
        handleResetFiltros();
      } else if (item.id === 'filter_pending') {
        setFiltrosContexto(prev => ({ ...prev, onboarded: ['No'] }));
      } else if (item.id === 'filter_active') {
        setFiltrosContexto(prev => ({ ...prev, activos: ['Yes'] }));
      }
    }
  }, [handleExportGlobalCsv]);

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
        <div ref={mainScrollRef} className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-4 font-sans">
          {/* ROW 1: EXECUTIVE KPI RIBBON */}
          <ExecutiveRibbon
            metricasGlobales={metricasGlobales}
          />

          {/* ROW 2: CASCADED HIERARCHY EXPLORER + EXPANDABLE ACCOUNT PORTFOLIO TABLE */}
          <ProgressiveHierarchy
            filtrosCompuestos={filtrosCompuestos}
            onHierarchyFilterChange={handleHierarchyFilterChange}
            onOpenActionDrawer={handleOpenActionDrawer}
            onExportCsv={handleExportGlobalCsv}
          />

          {/* ROW 3: DUAL COLUMNS (LEFT: HISTORICAL ADOPTION TREND, RIGHT: COMMERCIAL RANKING) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            {/* Left Column (6 of 12 Cols): Adoption Trend */}
            <div className="lg:col-span-6 flex flex-col">
              <AdoptionTrendCard
                serieHistorica={metricasGlobales.serieHistorica}
                filtros={filtrosCompuestos}
              />
            </div>

            {/* Right Column (6 of 12 Cols): Commercial Ranking */}
            <div className="lg:col-span-6 flex flex-col">
              <LeaderboardCard
                leaderboardData={leaderboardData}
                onOpenActionDrawer={handleOpenActionDrawer}
              />
            </div>
          </div>
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
        data={commandPaletteData}
        onSelectItem={handleSelectCommand}
      />
    </div>
  );
}

export default App;
