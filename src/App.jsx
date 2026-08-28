import React, { useState, useEffect, useMemo } from 'react';
import { adopcionRepo } from '@/domain/adopcionRepo';
import { Sidebar } from '@/components/Sidebar';
import { AppHeader } from '@/components/AppHeader';
import { ExecutiveRibbon } from '@/components/ExecutiveRibbon';
import { AdoptionFunnelStrip } from '@/components/AdoptionFunnelStrip';
import { HierarchyTable } from '@/components/HierarchyTable';
import { ActionDrawer } from '@/components/ActionDrawer';
import { CommandPalette } from '@/components/CommandPalette';
import { exportToCsv } from '@/lib/exportCsv';
import { LENTES } from '@/domain/definiciones';

export function App() {
  const filtrosDisponibles = useMemo(() => adopcionRepo.getFiltrosDisponibles(), []);

  // 1. Estados de Navegación y UI
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [periodo, setPeriodo] = useState(filtrosDisponibles.periodoActual);
  const [activeLens, setActiveLens] = useState(LENTES.CLIENTES);
  const [isDark, setIsDark] = useState(false);

  // 2. Jerarquía Activa
  const [nivelJerarquia, setNivelJerarquia] = useState('nacional');
  const [selectedParentId, setSelectedParentId] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [selectedVendedorId, setSelectedVendedorId] = useState(null);

  // 3. Filtros Globales (Sidebar)
  const [filtros, setFiltros] = useState({
    lineaNegocio: null,
    regionId: null,
    plaza: null
  });

  // 4. Modales
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isActionDrawerOpen, setIsActionDrawerOpen] = useState(false);
  const [nodoAccion, setNodoAccion] = useState(null);

  // Sincronizar Modo Oscuro con clase <html>
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

  // Chips Activos Removibles
  const activeChips = useMemo(() => {
    const chips = [];
    if (filtros.lineaNegocio) {
      const ln = filtrosDisponibles.lineasNegocio.find(l => l.id === filtros.lineaNegocio);
      chips.push({ key: 'lineaNegocio', label: 'Línea', value: ln?.label || filtros.lineaNegocio });
    }
    if (filtros.regionId) {
      const reg = filtrosDisponibles.regiones.find(r => r.id === filtros.regionId);
      chips.push({ key: 'regionId', label: 'Región', value: reg?.nombre || filtros.regionId });
    }
    if (filtros.plaza) {
      chips.push({ key: 'plaza', label: 'Plaza', value: filtros.plaza });
    }
    if (selectedVendedorId) {
      const vend = filtrosDisponibles.vendedores.find(v => v.id === selectedVendedorId);
      chips.push({ key: 'vendedorId', label: 'Vendedor', value: vend?.nombre || selectedVendedorId });
    }
    return chips;
  }, [filtros, selectedVendedorId, filtrosDisponibles]);

  const handleRemoveChip = (key) => {
    if (key === 'vendedorId') {
      setSelectedVendedorId(null);
      setBreadcrumbs(prev => prev.slice(0, 3));
    } else {
      setFiltros(prev => ({ ...prev, [key]: null }));
    }
  };

  const handleClearAllChips = () => {
    setFiltros({ lineaNegocio: null, regionId: null, plaza: null });
    setSelectedVendedorId(null);
  };

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

  return (
    <div className="flex h-screen h-[100dvh] w-full overflow-hidden bg-background text-foreground font-sans transition-colors duration-150 select-none">
      {/* 1. SIDEBAR PERSISTENTE COLAPSABLE (Estilo Penetron Dash) */}
      <Sidebar
        isOpen={desktopSidebarOpen}
        onToggle={() => setDesktopSidebarOpen(!desktopSidebarOpen)}
        filtros={filtros}
        onFiltroChange={(k, v) => setFiltros(prev => ({ ...prev, [k]: v }))}
        onResetFiltros={() => setFiltros({ lineaNegocio: null, regionId: null, plaza: null })}
        filtrosDisponibles={filtrosDisponibles}
        periodo={periodo}
        onPeriodoChange={setPeriodo}
      />

      {/* 2. ÁREA DE CONTENIDO PRINCIPAL */}
      <main className="flex-1 min-w-0 flex flex-col relative h-full overflow-hidden">
        {/* HEADER MULTI-CAPA CON CHIPS REMOVIBLES Y BÚSQUEDA */}
        <AppHeader
          sidebarOpen={desktopSidebarOpen}
          onToggleSidebar={() => setDesktopSidebarOpen(!desktopSidebarOpen)}
          activeChips={activeChips}
          onRemoveChip={handleRemoveChip}
          onClearAllChips={handleClearAllChips}
          onOpenSearch={() => setIsSearchOpen(true)}
          isDark={isDark}
          onToggleDark={() => setIsDark(!isDark)}
          onExportCsv={handleExportCsv}
        />

        {/* WORKSTATION PRINCIPAL CON SCROLL INTERNO */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-4">
          {/* FRUPO 1: FRANJA EJECUTIVA (Sticky Ribbon) & TRIPLE LENTE */}
          <ExecutiveRibbon
            metricasGlobales={metricasGlobales}
            activeLens={activeLens}
            onLensChange={setActiveLens}
            periodoSeleccionado={periodo}
            mesesDisponibles={filtrosDisponibles.meses}
            onPeriodoChange={setPeriodo}
            onOpenSearch={() => setIsSearchOpen(true)}
            onToggleFilters={() => setDesktopSidebarOpen(true)}
            filtrosActivosCount={activeChips.length}
          />

          {/* GRUPO 2: FUNNEL DE FLUJO CONECTADO */}
          <AdoptionFunnelStrip
            funnelSteps={funnelSteps}
            activeLens={activeLens}
          />

          {/* GRUPO 3: TABLA DE JERARQUÍA & DRILLDOWN MASTER-DETAIL */}
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
        </div>
      </main>

      {/* 3. ACTION DRAWER LATERAL SLIDE-IN ("The Money View") */}
      <ActionDrawer
        isOpen={isActionDrawerOpen}
        onClose={() => setIsActionDrawerOpen(false)}
        nodoSeleccionado={nodoAccion}
        clientesAccion={clientesAccion}
        onExportActionCsv={handleExportCsv}
      />

      {/* 4. BUSCADOR OMNIBOX CTRL+K */}
      <CommandPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        items={filtrosDisponibles}
        onSelectItem={handleSelectItemOmnibox}
      />
    </div>
  );
}

export default App;