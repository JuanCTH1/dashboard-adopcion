import React, { useState, useMemo, useEffect, startTransition, useDeferredValue } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ChevronRight,
  ChevronDown,
  Download,
  Layers,
  Globe,
  Building,
  Briefcase,
  Users,
  User,
  Sparkles,
  Check,
  ShoppingCart,
  PhoneCall,
  Laptop,
  Smartphone,
  Server,
  Clock,
  Info,
  ArrowRight,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { formatNumber, formatCompactNumber, formatPct, cn } from '@/lib/utils';
import { adopcionRepo } from '@/domain/adopcionRepo';

// Unified single-clock FLIP transition
const FLIP_TRANSITION = {
  type: 'spring',
  stiffness: 350,
  damping: 30
};

export function ProgressiveHierarchy({
  filtrosCompuestos,
  onHierarchyFilterChange,
  onOpenActionDrawer,
  onExportCsv
}) {
  // Multidimensional selection states
  const [isUsaSelected, setIsUsaSelected] = useState(true);
  const [selectedVpIds, setSelectedVpIds] = useState([]);
  const [selectedDirIds, setSelectedDirIds] = useState([]);
  const [selectedGerIds, setSelectedGerIds] = useState([]);
  const [selectedRepIds, setSelectedRepIds] = useState([]);

  // Focus Table View Mode (Option 2)
  const [isFocusTableMode, setIsFocusTableMode] = useState(false);

  // Drag-to-select state
  const [isDragging, setIsDragging] = useState(false);

  // Fixed body-level popover state (100% immune to clipping)
  const [hoveredPopover, setHoveredPopover] = useState(null);

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  const handleCardMouseDown = (setFn, currentSelected, id, e) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    toggleSelection(setFn, currentSelected, id);
  };

  const handleCardMouseEnter = (setFn, currentSelected, id) => {
    if (!isDragging) return;
    if (!currentSelected.includes(id)) {
      startTransition(() => setFn(prev => [...prev, id]));
    }
  };

  // Expandable table rows state
  const [expandedRowIds, setExpandedRowIds] = useState(new Set());

  // Sincronizar estado interno si se deselecciona externamente (ej. botón X de los chips del header)
  useEffect(() => {
    if (filtrosCompuestos?.vpIds !== undefined && filtrosCompuestos.vpIds.length !== selectedVpIds.length) {
      setSelectedVpIds(filtrosCompuestos.vpIds);
    }
    if (filtrosCompuestos?.directorIds !== undefined && filtrosCompuestos.directorIds.length !== selectedDirIds.length) {
      setSelectedDirIds(filtrosCompuestos.directorIds);
    }
    if (filtrosCompuestos?.gerenteIds !== undefined && filtrosCompuestos.gerenteIds.length !== selectedGerIds.length) {
      setSelectedGerIds(filtrosCompuestos.gerenteIds);
    }
    if (filtrosCompuestos?.vendedorIds !== undefined && filtrosCompuestos.vendedorIds.length !== selectedRepIds.length) {
      setSelectedRepIds(filtrosCompuestos.vendedorIds);
    }
  }, [filtrosCompuestos?.vpIds, filtrosCompuestos?.directorIds, filtrosCompuestos?.gerenteIds, filtrosCompuestos?.vendedorIds]);

  // Propagar selección al tablero completo sin bloquear el render principal
  useEffect(() => {
    if (onHierarchyFilterChange) {
      startTransition(() => {
        onHierarchyFilterChange({
          vpIds: selectedVpIds,
          directorIds: selectedDirIds,
          gerenteIds: selectedGerIds,
          vendedorIds: selectedRepIds
        });
      });
    }
  }, [selectedVpIds, selectedDirIds, selectedGerIds, selectedRepIds, onHierarchyFilterChange]);

  const toggleRowExpanded = (id) => {
    setExpandedRowIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Instant non-blocking toggle
  const toggleSelection = (setter, currentArr, id) => {
    startTransition(() => {
      if (currentArr.includes(id)) {
        setter(currentArr.filter(x => x !== id));
      } else {
        setter([...currentArr, id]);
      }
    });
  };

  const vps = useMemo(() => {
    return adopcionRepo.getJerarquia('nacional', null, filtrosCompuestos);
  }, [filtrosCompuestos]);

  const directores = useMemo(() => {
    if (selectedVpIds.length === 0) return [];
    return adopcionRepo.getJerarquia('vp', selectedVpIds, filtrosCompuestos);
  }, [selectedVpIds, filtrosCompuestos]);

  const gerentes = useMemo(() => {
    if (selectedDirIds.length === 0) return [];
    return adopcionRepo.getJerarquia('director', selectedDirIds, filtrosCompuestos);
  }, [selectedDirIds, filtrosCompuestos]);

  const vendedores = useMemo(() => {
    if (selectedGerIds.length === 0) return [];
    return adopcionRepo.getJerarquia('gerente', selectedGerIds, filtrosCompuestos);
  }, [selectedGerIds, filtrosCompuestos]);

  const activeContext = useMemo(() => {
    let fNode = {
      ...filtrosCompuestos,
      vpIds: selectedVpIds,
      directorIds: selectedDirIds,
      gerenteIds: selectedGerIds,
      vendedorIds: selectedRepIds
    };

    let titulo = "USA";
    if (selectedRepIds.length) titulo = `${selectedRepIds.length} Sales Rep(s)`;
    else if (selectedGerIds.length) titulo = `${selectedGerIds.length} Manager(s)`;
    else if (selectedDirIds.length) titulo = `${selectedDirIds.length} Director(s)`;
    else if (selectedVpIds.length) titulo = `${selectedVpIds.length} VP Division(s)`;

    const cartera = adopcionRepo.getCartera(null, fNode);

    return {
      fNode,
      titulo,
      cartera
    };
  }, [selectedVpIds, selectedDirIds, selectedGerIds, selectedRepIds, filtrosCompuestos]);

  // DEFERRED CARTERA FOR SMOOTH 60FPS COLLAPSE ANIMATION WITHOUT MAIN THREAD DOM THRASHING
  const deferredCartera = useDeferredValue(activeContext.cartera);

  // Weighted totals calculation for footer
  const totalesCartera = useMemo(() => {
    if (!activeContext.cartera.length) return null;
    let totalPedidos = 0;
    let totalDigitales = 0;
    let totalAnalogos = 0;
    let onboardedCount = 0;

    activeContext.cartera.forEach(c => {
      totalPedidos += c.pedidosTotales;
      totalDigitales += c.pedidosDigitales;
      totalAnalogos += c.pedidosAnalogos;
      if (c.estaIncorporado) onboardedCount++;
    });

    const pctAdopcionPonderado = totalPedidos > 0 ? (totalDigitales / totalPedidos) * 100 : 0;
    const pctOnboarding = (onboardedCount / activeContext.cartera.length) * 100;

    return {
      totalClientes: activeContext.cartera.length,
      totalPedidos,
      totalDigitales,
      totalAnalogos,
      onboardedCount,
      pctOnboarding,
      pctAdopcionPonderado
    };
  }, [activeContext.cartera]);

  return (
    <Card className="p-3.5 bg-card border border-border shadow-xs rounded-xl flex flex-col relative overflow-hidden select-none space-y-2.5 font-sans">
      {/* Top Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-700 via-indigo-500 to-sky-400" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-primary shrink-0" />
          <h2 className="text-sm font-black text-foreground tracking-tight">
            {activeContext.titulo}
            <span className="ml-2 text-[11px] font-semibold text-muted-foreground">
              {totalesCartera?.totalClientes || 0} customers · {formatNumber(totalesCartera?.totalPedidos || 0)} orders
            </span>
          </h2>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant={isFocusTableMode ? "default" : "outline"}
            size="sm"
            onClick={() => setIsFocusTableMode(!isFocusTableMode)}
            className="gap-1.5 text-xs font-semibold shadow-xxs"
          >
            {isFocusTableMode ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Show All Columns</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-primary" />
                <span>Focus Table</span>
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onExportCsv}
            className="gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground shadow-xxs"
          >
            <Download className="w-3.5 h-3.5 text-primary" />
            <span>Export Portfolio CSV</span>
          </Button>
        </div>
      </div>

      {/* FOCUS TABLE MODE BREADCRUMB SUMMARY RIBBON */}
      {isFocusTableMode && (
        <div className="bg-slate-100 dark:bg-slate-900/90 p-2 px-3 rounded-lg border border-border text-xs font-medium flex items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-primary flex items-center gap-1 text-[11px] uppercase">
              <Globe className="w-3.5 h-3.5" /> USA National
            </span>
            <span className="text-muted-foreground">›</span>
            <div className="flex items-center gap-1 flex-wrap">
              {selectedVpIds.length === 0 ? (
                <Badge variant="outline" className="text-[10px] font-bold text-muted-foreground">
                  All VP Divisions Active
                </Badge>
              ) : (
                vps.filter(v => selectedVpIds.includes(v.id)).map(v => (
                  <Badge key={v.id} className="text-[10px] font-bold bg-primary/10 text-primary border-primary/30">
                    {v.nombre}
                  </Badge>
                ))
              )}
            </div>
          </div>
          <span className="text-[10px] text-muted-foreground font-semibold hidden md:inline">
            (Country & VPs collapsed to focus on Markets & Table)
          </span>
        </div>
      )}

      {/* HORIZONTAL CASCADED COLUMNS UNIFIED WITH LAYOUTGROUP AND POPLAYOUT */}
      <LayoutGroup>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin items-stretch h-[375px] max-h-[375px] relative">
          {/* LEVEL 1: VICE PRESIDENCIES (STAGE 1 - FIRST COLUMN) */}
          <AnimatePresence mode="popLayout">
            {!isFocusTableMode && (
              <motion.div
                layout
                key="vp-col"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={FLIP_TRANSITION}
                className="w-[150px] h-[365px] shrink-0 bg-slate-50 dark:bg-slate-900/80 p-2 rounded-xl border border-border flex flex-col shadow-2xs overflow-hidden"
              >
                <div className="w-[134px] text-[10px] font-bold uppercase text-primary flex items-center justify-between pb-1 border-b border-border">
                  <div className="flex items-center gap-1">
                    <Building className="w-3 h-3" />
                    <span>VP Division</span>
                  </div>
                  {selectedVpIds.length > 0 && (
                    <button onClick={() => startTransition(() => setSelectedVpIds([]))} className="text-[9px] text-primary hover:underline font-bold cursor-pointer">
                      Clear
                    </button>
                  )}
                </div>

                <div className="w-[134px] flex-1 flex flex-col justify-start space-y-1 py-1.5 overflow-y-auto scrollbar-thin select-none max-h-[305px] min-h-0">
                  {vps.map((vp) => {
                    const isSelected = selectedVpIds.includes(vp.id);
                    return (
                      <button
                        key={vp.id}
                        onClick={() => toggleSelection(setSelectedVpIds, selectedVpIds, vp.id)}
                        className={cn(
                          "w-full text-left p-1.5 rounded-lg border transition-all flex flex-col gap-0.5 cursor-pointer text-xs select-none",
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary font-bold shadow-xs"
                            : "bg-card hover:bg-slate-100 dark:hover:bg-slate-800 text-foreground border-border font-medium"
                        )}
                      >
                        {/* RENG LÓN 1: NOMBRE */}
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[11px] truncate">{vp.nombre}</span>
                          {isSelected && <Check className="w-3 h-3 text-white shrink-0" />}
                        </div>

                        {/* RENGLÓN 2: PERSONA / LÍNEA */}
                        <div className={cn("text-[9px] truncate font-medium", isSelected ? "text-white/90" : "text-muted-foreground")}>
                          {vp.persona}
                        </div>

                        {/* RENGLÓN 3: 2 COMPACT LINES (CUSTOMERS & ORDERS) */}
                        <div className={cn("text-[8.5px] pt-1 mt-0.5 border-t flex flex-col gap-0.5 font-sans leading-tight", isSelected ? "border-white/20 text-white" : "border-border/60 text-foreground")}>
                          <div className="truncate flex items-center justify-between gap-1">
                            <span className={cn("truncate", isSelected ? "text-white/80" : "text-muted-foreground")}>{vp.metricas.clientes?.asignados || 0} cust</span>
                            <span className="font-bold shrink-0">{formatPct(vp.metricas.clientes?.pctOnboarding || 0)} onboard</span>
                          </div>
                          <div className="truncate flex items-center justify-between gap-1">
                            <span className={cn("truncate cursor-help", isSelected ? "text-white/80" : "text-muted-foreground")} title={`${formatNumber(vp.metricas.pedidos?.totales || 0)} total orders`}>{formatCompactNumber(vp.metricas.pedidos?.totales || 0)} orders</span>
                            <span className="font-bold shrink-0">{formatPct(vp.metricas.pedidos?.pctAdopcion || 0)} adopt</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* LEVEL 2: REGIONS */}
        <AnimatePresence mode="popLayout">
          {selectedVpIds.length > 0 && (
            <motion.div
              layout
              key="dir-col"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={FLIP_TRANSITION}
              className="w-[150px] h-[365px] shrink-0 bg-slate-50 dark:bg-slate-900/80 p-2 rounded-xl border border-border flex flex-col shadow-2xs overflow-hidden"
            >
              <div className="w-[134px] text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400 flex items-center justify-between pb-1 border-b border-border">
                <div className="flex items-center gap-1">
                  <Briefcase className="w-3 h-3" />
                  <span>Regions</span>
                </div>
                {selectedDirIds.length > 0 && (
                  <button onClick={() => startTransition(() => setSelectedDirIds([]))} className="text-[9px] text-indigo-600 hover:underline font-bold cursor-pointer">
                    Clear
                  </button>
                )}
              </div>

              <div className="w-[134px] flex-1 flex flex-col justify-start space-y-1 py-1.5 overflow-y-auto scrollbar-thin select-none max-h-[305px] min-h-0">
                {directores.map((dir) => {
                  const isSelected = selectedDirIds.includes(dir.id);
                  return (
                    <div key={dir.id} className="relative group">
                      <button
                        onClick={() => toggleSelection(setSelectedDirIds, selectedDirIds, dir.id)}
                        className={cn(
                          "w-full text-left p-1.5 rounded-lg border transition-all flex flex-col gap-0.5 cursor-pointer text-xs select-none",
                          isSelected
                            ? "bg-indigo-600 text-white border-indigo-700 font-bold shadow-xs"
                            : "bg-card hover:bg-slate-100 dark:hover:bg-slate-800 text-foreground border-border font-medium"
                        )}
                      >
                        {/* RENGLÓN 1: NOMBRE + INFO */}
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[11px] truncate">{dir.nombre}</span>
                          <div className="flex items-center gap-1">
                            {isSelected && <Check className="w-3 h-3 text-white shrink-0" />}
                            <button
                              type="button"
                              onMouseEnter={(e) => {
                                e.stopPropagation();
                                const rect = e.currentTarget.getBoundingClientRect();
                                setHoveredPopover({
                                  title: `${dir.nombre} Region`,
                                  tipo: 'Leadership',
                                  personasDetalle: dir.personasDetalle,
                                  totales: dir.metricas.pedidos.totales,
                                  pctAdopcion: dir.metricas.pedidos.pctAdopcion,
                                  x: rect.left + rect.width / 2,
                                  y: rect.top < 260 ? rect.bottom + 8 : rect.top - 8,
                                  pos: rect.top < 260 ? 'bottom' : 'top'
                                });
                              }}
                              onMouseLeave={() => setHoveredPopover(null)}
                              onClick={(e) => {
                                e.stopPropagation();
                                const rect = e.currentTarget.getBoundingClientRect();
                                setHoveredPopover(prev => prev ? null : {
                                  title: `${dir.nombre} Region`,
                                  tipo: 'Leadership',
                                  personasDetalle: dir.personasDetalle,
                                  totales: dir.metricas.pedidos.totales,
                                  pctAdopcion: dir.metricas.pedidos.pctAdopcion,
                                  x: rect.left + rect.width / 2,
                                  y: rect.top < 260 ? rect.bottom + 8 : rect.top - 8,
                                  pos: rect.top < 260 ? 'bottom' : 'top'
                                });
                              }}
                              className={cn(
                                "p-0.5 rounded transition-colors cursor-pointer shrink-0",
                                isSelected ? "hover:bg-indigo-700 text-indigo-200" : "hover:bg-slate-200 dark:hover:bg-slate-700 text-muted-foreground hover:text-primary"
                              )}
                              title="Leadership Breakdown"
                            >
                              <Info className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* RENGLÓN 2: PERSONA O PILLS POR LÍNEA */}
                        {dir.isSingleVp ? (
                          <div className={cn("text-[9px] truncate font-medium", isSelected ? "text-indigo-100" : "text-muted-foreground")}>
                            {dir.persona}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 flex-wrap">
                            {dir.blPills?.map(pill => (
                              <span
                                key={pill}
                                className={cn(
                                  "text-[8px] font-black px-1.5 py-0.2 rounded border uppercase shadow-2xs",
                                  pill === 'RMX'
                                    ? (isSelected ? "bg-sky-300 text-slate-950 border-white/40" : "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30")
                                    : pill === 'CEM'
                                    ? (isSelected ? "bg-purple-300 text-slate-950 border-white/40" : "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30")
                                    : (isSelected ? "bg-amber-300 text-slate-950 border-white/40" : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30")
                                )}
                              >
                                {pill}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* RENGLÓN 3: 2 COMPACT LINES (CUSTOMERS & ORDERS) */}
                        <div className={cn("text-[8.5px] pt-1 mt-0.5 border-t flex flex-col gap-0.5 font-sans leading-tight", isSelected ? "border-indigo-400/30 text-indigo-100" : "border-border/60 text-foreground")}>
                          <div className="truncate flex items-center justify-between gap-1">
                            <span className={cn("truncate", isSelected ? "text-indigo-200" : "text-muted-foreground")}>{dir.metricas.clientes?.asignados || 0} cust</span>
                            <span className="font-bold shrink-0">{formatPct(dir.metricas.clientes?.pctOnboarding || 0)} onboard</span>
                          </div>
                          <div className="truncate flex items-center justify-between gap-1">
                            <span className={cn("truncate cursor-help", isSelected ? "text-indigo-200" : "text-muted-foreground")} title={`${formatNumber(dir.metricas.pedidos?.totales || 0)} total orders`}>{formatCompactNumber(dir.metricas.pedidos?.totales || 0)} orders</span>
                            <span className="font-bold shrink-0">{formatPct(dir.metricas.pedidos?.pctAdopcion || 0)} adopt</span>
                          </div>
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* LEVEL 3: MARKETS */}
        <AnimatePresence mode="popLayout">
          {selectedDirIds.length > 0 && (
            <motion.div
              layout
              key="ger-col"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={FLIP_TRANSITION}
              className="w-[150px] h-[365px] shrink-0 bg-slate-50 dark:bg-slate-900/80 p-2 rounded-xl border border-border flex flex-col shadow-2xs overflow-hidden"
            >
              <div className="w-[134px] text-[10px] font-bold uppercase text-sky-600 dark:text-sky-400 flex items-center justify-between pb-1 border-b border-border">
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>Markets</span>
                </div>
                {selectedGerIds.length > 0 && (
                  <button onClick={() => startTransition(() => setSelectedGerIds([]))} className="text-[9px] text-sky-600 hover:underline font-bold cursor-pointer">
                    Clear
                  </button>
                )}
              </div>

              <div className="w-[134px] flex-1 flex flex-col justify-start space-y-1 py-1.5 overflow-y-auto scrollbar-thin select-none max-h-[305px] min-h-0">
                {gerentes.map((ger) => {
                  const isSelected = selectedGerIds.includes(ger.id);
                  return (
                    <div key={ger.id} className="relative group">
                      <button
                        onClick={() => toggleSelection(setSelectedGerIds, selectedGerIds, ger.id)}
                        className={cn(
                          "w-full text-left p-1.5 rounded-lg border transition-all flex flex-col gap-0.5 cursor-pointer text-xs select-none",
                          isSelected
                            ? "bg-sky-600 text-white border-sky-700 font-bold shadow-xs"
                            : "bg-card hover:bg-slate-100 dark:hover:bg-slate-800 text-foreground border-border font-medium"
                        )}
                      >
                        {/* RENGLÓN 1: NOMBRE + INFO */}
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[11px] truncate">{ger.nombre}</span>
                          <div className="flex items-center gap-1">
                            {isSelected && <Check className="w-3 h-3 text-white shrink-0" />}
                            <button
                              type="button"
                              onMouseEnter={(e) => {
                                e.stopPropagation();
                                const rect = e.currentTarget.getBoundingClientRect();
                                setHoveredPopover({
                                  title: `${ger.nombre} Market`,
                                  tipo: 'Managers',
                                  personasDetalle: ger.personasDetalle,
                                  totales: ger.metricas.pedidos.totales,
                                  pctAdopcion: ger.metricas.pedidos.pctAdopcion,
                                  x: rect.left + rect.width / 2,
                                  y: rect.top < 260 ? rect.bottom + 8 : rect.top - 8,
                                  pos: rect.top < 260 ? 'bottom' : 'top'
                                });
                              }}
                              onMouseLeave={() => setHoveredPopover(null)}
                              onClick={(e) => {
                                e.stopPropagation();
                                const rect = e.currentTarget.getBoundingClientRect();
                                setHoveredPopover(prev => prev ? null : {
                                  title: `${ger.nombre} Market`,
                                  tipo: 'Managers',
                                  personasDetalle: ger.personasDetalle,
                                  totales: ger.metricas.pedidos.totales,
                                  pctAdopcion: ger.metricas.pedidos.pctAdopcion,
                                  x: rect.left + rect.width / 2,
                                  y: rect.top < 260 ? rect.bottom + 8 : rect.top - 8,
                                  pos: rect.top < 260 ? 'bottom' : 'top'
                                });
                              }}
                              className={cn(
                                "p-0.5 rounded transition-colors cursor-pointer shrink-0",
                                isSelected ? "hover:bg-sky-700 text-sky-200" : "hover:bg-slate-200 dark:hover:bg-slate-700 text-muted-foreground hover:text-primary"
                              )}
                              title="Managers Breakdown"
                            >
                              <Info className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* RENGLÓN 2: PERSONA O PILLS POR LÍNEA */}
                        {ger.isSingleVp ? (
                          <div className={cn("text-[9px] truncate font-medium", isSelected ? "text-sky-100" : "text-muted-foreground")}>
                            {ger.persona}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 flex-wrap">
                            {ger.blPills?.map(pill => (
                              <span
                                key={pill}
                                className={cn(
                                  "text-[8px] font-black px-1.5 py-0.2 rounded border uppercase shadow-2xs",
                                  pill === 'RMX'
                                    ? (isSelected ? "bg-sky-300 text-slate-950 border-white/40" : "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30")
                                    : pill === 'CEM'
                                    ? (isSelected ? "bg-purple-300 text-slate-950 border-white/40" : "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30")
                                    : (isSelected ? "bg-amber-300 text-slate-950 border-white/40" : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30")
                                )}
                              >
                                {pill}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* RENGLÓN 3: 2 COMPACT LINES (CUSTOMERS & ORDERS) */}
                        <div className={cn("text-[8.5px] pt-1 mt-0.5 border-t flex flex-col gap-0.5 font-sans leading-tight", isSelected ? "border-sky-400/30 text-sky-100" : "border-border/60 text-foreground")}>
                          <div className="truncate flex items-center justify-between gap-1">
                            <span className={cn("truncate", isSelected ? "text-sky-200" : "text-muted-foreground")}>{ger.metricas.clientes?.asignados || 0} cust</span>
                            <span className="font-bold shrink-0">{formatPct(ger.metricas.clientes?.pctOnboarding || 0)} onboard</span>
                          </div>
                          <div className="truncate flex items-center justify-between gap-1">
                            <span className={cn("truncate cursor-help", isSelected ? "text-sky-200" : "text-muted-foreground")} title={`${formatNumber(ger.metricas.pedidos?.totales || 0)} total orders`}>{formatCompactNumber(ger.metricas.pedidos?.totales || 0)} orders</span>
                            <span className="font-bold shrink-0">{formatPct(ger.metricas.pedidos?.pctAdopcion || 0)} adopt</span>
                          </div>
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

          {/* LEVEL 4: SALES REPRESENTATIVES */}
          <AnimatePresence mode="popLayout">
            {selectedGerIds.length > 0 && (
              <motion.div
                layout
                key="rep-col"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={FLIP_TRANSITION}
                className="w-[150px] h-[365px] shrink-0 bg-slate-50 dark:bg-slate-900/80 p-2 rounded-xl border border-border flex flex-col shadow-2xs overflow-hidden"
              >
                <div className="w-[134px] text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 flex items-center justify-between pb-1 border-b border-border">
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>Sales Reps</span>
                  </div>
                  {selectedRepIds.length > 0 && (
                    <button onClick={() => startTransition(() => setSelectedRepIds([]))} className="text-[9px] text-emerald-600 hover:underline font-bold cursor-pointer">
                      Clear
                    </button>
                  )}
                </div>

                <div className="w-[134px] flex-1 flex flex-col justify-start space-y-1 py-1.5 overflow-y-auto scrollbar-thin select-none max-h-[305px] min-h-0">
                  {vendedores.map(rep => {
                    const isSelected = selectedRepIds.includes(rep.id);
                    return (
                      <button
                        key={rep.id}
                        onClick={() => toggleSelection(setSelectedRepIds, selectedRepIds, rep.id)}
                        className={cn(
                          "w-full text-left p-1.5 rounded-lg border transition-all flex flex-col gap-0.5 cursor-pointer text-xs select-none",
                          isSelected
                            ? "bg-emerald-600 text-white border-emerald-700 font-bold shadow-xs"
                            : "bg-card hover:bg-slate-100 dark:hover:bg-slate-800 text-foreground border-border font-medium"
                        )}
                      >
                        {/* RENGLÓN 1: NOMBRE */}
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[11px] truncate">{rep.nombre}</span>
                          {isSelected && <Check className="w-3 h-3 text-white shrink-0" />}
                        </div>

                        {/* RENGLÓN 2: PLAZA Y BL MICRO-PILL */}
                        <div className="flex items-center justify-between gap-1 text-[9px] my-0.5">
                          <span className={cn("truncate font-semibold", isSelected ? "text-white/90" : "text-muted-foreground")}>{rep.plaza}</span>
                          <span
                            className={cn(
                              "text-[8px] font-black px-1.5 py-0.2 rounded border uppercase shrink-0 shadow-2xs",
                              rep.bl === 'RMX'
                                ? (isSelected ? "bg-sky-300 text-slate-950 border-white/40" : "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30")
                                : rep.bl === 'CEM'
                                ? (isSelected ? "bg-purple-300 text-slate-950 border-white/40" : "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30")
                                : (isSelected ? "bg-amber-300 text-slate-950 border-white/40" : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30")
                            )}
                          >
                            {rep.bl}
                          </span>
                        </div>

                        {/* RENGLÓN 3: 2 COMPACT LINES (CUSTOMERS & ORDERS) */}
                        <div className={cn("text-[8.5px] pt-1 mt-0.5 border-t flex flex-col gap-0.5 font-sans leading-tight", isSelected ? "border-emerald-400/30 text-emerald-100" : "border-border/60 text-foreground")}>
                          <div className="truncate flex items-center justify-between gap-1">
                            <span className={cn("truncate", isSelected ? "text-emerald-200" : "text-muted-foreground")}>{rep.metricas.clientes?.asignados || 0} cust</span>
                            <span className="font-bold shrink-0">{formatPct(rep.metricas.clientes?.pctOnboarding || 0)} onboard</span>
                          </div>
                          <div className="truncate flex items-center justify-between gap-1">
                            <span className={cn("truncate cursor-help", isSelected ? "text-emerald-200" : "text-muted-foreground")} title={`${formatNumber(rep.metricas.pedidos?.totales || 0)} total orders`}>{formatCompactNumber(rep.metricas.pedidos?.totales || 0)} orders</span>
                            <span className="font-bold shrink-0">{formatPct(rep.metricas.pedidos?.pctAdopcion || 0)} adopt</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* RIGHT HAND PERMANENT TABLE: UNIFIED FRAMER MOTION FLIP SYSTEM */}
          <motion.div
            layout
            transition={FLIP_TRANSITION}
            className="flex-1 min-w-[380px] h-full bg-slate-50 dark:bg-slate-900/80 p-3 rounded-xl border border-border flex flex-col shadow-2xs overflow-hidden"
          >
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-border shrink-0">
              <div className="text-xs font-black text-foreground flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-primary" />
                <span>Account Portfolio ({activeContext.cartera.length} Accounts)</span>
              </div>

              <Button
                variant="default"
                size="sm"
                onClick={() => onOpenActionDrawer({ nombre: activeContext.titulo, id: 'context' })}
                className="text-xs font-bold gap-1 shadow-xs"
              >
                Action Plan
              </Button>
            </div>

            {/* EXPANDABLE TABLE FILLING FULL VERTICAL CONTAINER HEIGHT */}
            <div className="overflow-y-auto flex-1 min-h-0 scrollbar-thin">
              <table className="w-full text-left text-xs border-collapse table-fixed">
                <thead>
                  <tr className="border-b border-border text-xs font-bold text-muted-foreground bg-slate-100 dark:bg-slate-800 sticky top-0 z-10 h-8">
                    <th className="py-2 px-1 w-[3%]"></th>
                    <th className="py-2 px-2 w-[34%] font-bold truncate">Account / Company</th>
                    <th className="py-2 px-2 w-[15%] text-right font-bold truncate text-sky-700 dark:text-sky-400">Online</th>
                    <th className="py-2 px-2 w-[15%] text-right font-bold truncate text-slate-500 dark:text-slate-400">Offline</th>
                    <th className="py-2 px-2 w-[14%] text-right font-bold truncate">Total</th>
                    <th className="py-2 px-2 w-[11%] text-right font-bold truncate">Adoption %</th>
                    <th className="py-2 px-2 w-[8%] text-center font-bold truncate">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {deferredCartera.slice(0, 50).map(cli => {
                    const isExpanded = expandedRowIds.has(cli.id);
                    const shortBl = cli.lineaNegocio === 'readymix' ? 'RMX' : cli.lineaNegocio === 'cemento' ? 'CEM' : 'AGG';

                    return (
                      <React.Fragment key={cli.id}>
                        <tr className={cn("hover:bg-card transition-colors cursor-pointer", isExpanded && "bg-slate-100/80 dark:bg-slate-800")} onClick={() => toggleRowExpanded(cli.id)}>
                          <td className="py-2 px-1 text-center">
                            <button
                              type="button"
                              className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-muted-foreground"
                            >
                              {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-primary" /> : <ChevronRight className="w-3.5 h-3.5" />}
                            </button>
                          </td>
                          <td className="py-2 px-2">
                            <div className="font-bold text-foreground flex items-center gap-1.5 text-xs truncate max-w-[170px]" title={cli.nombreEmpresa}>
                              {cli.esTopPareto && (
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" title="Top 20% Pareto Account" />
                              )}
                              <span className="truncate">{cli.nombreEmpresa}</span>
                            </div>
                            <div className="text-[10px] text-muted-foreground font-mono mt-0.5"><b className="uppercase">{shortBl}</b></div>
                          </td>
                          <td className="py-2 px-2 text-right font-bold tabular-nums text-sky-700 dark:text-sky-400 text-xs whitespace-nowrap">
                            {formatNumber(cli.pedidosDigitales)}
                          </td>
                          <td className="py-2 px-2 text-right font-bold tabular-nums text-slate-500 dark:text-slate-400 text-xs whitespace-nowrap">
                            {formatNumber(cli.pedidosAnalogos)}
                          </td>
                          <td className="py-2 px-2 text-right font-bold tabular-nums text-foreground text-xs whitespace-nowrap">
                            {formatNumber(cli.pedidosTotales)}
                          </td>
                          <td className="py-2 px-2 text-right font-bold tabular-nums text-xs whitespace-nowrap">
                            <span className={cn(
                              cli.pctAdopcionPedidos >= 90 ? "text-emerald-600 dark:text-emerald-400" :
                              cli.pctAdopcionPedidos >= 50 ? "text-amber-600 dark:text-amber-400" :
                              "text-rose-600 dark:text-rose-400"
                            )}>
                              {cli.pctAdopcionPedidos.toFixed(1)}%
                            </span>
                          </td>
                          <td className="py-2 px-2 text-center whitespace-nowrap">
                            {!cli.estaIncorporado ? (
                              <Badge variant="danger" className="text-[10px] py-0.5 px-1.5 font-bold">
                                Pending
                              </Badge>
                            ) : cli.pedidosDigitales > 0 ? (
                              <Badge variant="success" className="text-[10px] py-0.5 px-1.5 font-bold">
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-[10px] py-0.5 px-1.5 font-bold bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30">
                                Onboarded
                              </Badge>
                            )}
                          </td>
                        </tr>

                        {/* EXPANDABLE DRAWER ROW WITH HIGH-CONTRAST VISUAL MICRO-PILLS */}
                        {isExpanded && (
                          <tr className="bg-slate-100/90 dark:bg-slate-950 border-b border-border">
                            <td colSpan={7} className="p-3">
                              <div className="bg-card p-3 rounded-lg border border-border shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
                                {/* Digital Channel Pills */}
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-[11px] font-bold text-muted-foreground uppercase mr-1">Digital Channels:</span>
                                  <Badge variant="info" className="gap-1 text-xs font-bold py-0.5 px-2.5 bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30">
                                    <Laptop className="w-3.5 h-3.5 text-sky-500" />
                                    <span>Web: <b>{cli.pedidosWeb}</b></span>
                                  </Badge>
                                  <Badge variant="info" className="gap-1 text-xs font-bold py-0.5 px-2.5 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30">
                                    <Smartphone className="w-3.5 h-3.5 text-indigo-500" />
                                    <span>App: <b>{cli.pedidosApp}</b></span>
                                  </Badge>
                                  <Badge variant="info" className="gap-1 text-xs font-bold py-0.5 px-2.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">
                                    <Server className="w-3.5 h-3.5 text-emerald-500" />
                                    <span>EDI: <b>{cli.pedidosEdi}</b></span>
                                  </Badge>
                                </div>

                                {/* Offline Pill */}
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-[11px] font-bold text-muted-foreground uppercase mr-1">Offline:</span>
                                  <Badge variant="outline" className="gap-1 text-xs font-bold py-0.5 px-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700">
                                    <PhoneCall className="w-3.5 h-3.5 text-amber-500" />
                                    <span>Phone: <b>{cli.pedidosAnalogos}</b></span>
                                  </Badge>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>

                {/* FOOTER ROW FOR WEIGHTED TOTALS */}
                {totalesCartera && (
                  <tfoot className="sticky bottom-0 z-10 bg-slate-200 dark:bg-slate-800 font-bold border-t-2 border-primary/40 text-foreground text-xs shadow-md">
                    <tr>
                      <td colSpan={2} className="py-1.5 px-2">
                        <div className="font-black uppercase text-[11px] text-primary truncate">
                          TOTALS ({totalesCartera.totalClientes} CUSTOMERS)
                        </div>
                      </td>
                      <td className="py-1.5 px-2 text-right tabular-nums text-sky-700 dark:text-sky-400 font-black text-xs whitespace-nowrap">
                        {formatNumber(totalesCartera.totalDigitales)}
                      </td>
                      <td className="py-1.5 px-2 text-right tabular-nums text-slate-500 dark:text-slate-400 font-bold text-xs whitespace-nowrap">
                        {formatNumber(totalesCartera.totalAnalogos)}
                      </td>
                      <td className="py-1.5 px-2 text-right tabular-nums text-foreground font-black text-xs whitespace-nowrap">
                        {formatNumber(totalesCartera.totalPedidos)}
                      </td>
                      <td className="py-1.5 px-2 text-right tabular-nums text-emerald-600 dark:text-emerald-400 font-black text-xs whitespace-nowrap">
                        {totalesCartera.pctAdopcionPonderado.toFixed(1)}%
                      </td>
                      <td className="py-1.5 px-2 text-center text-muted-foreground font-normal">—</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </motion.div>
      </div>
    </LayoutGroup>

    {/* ZERO-CLIPPING VIEWPORT FIXED POPOVER */}
    {hoveredPopover && (
      <div
        style={{
          position: 'fixed',
          left: `${hoveredPopover.x}px`,
          top: `${hoveredPopover.y}px`,
          transform: hoveredPopover.pos === 'top' ? 'translate(-50%, -100%)' : 'translate(-50%, 0)'
        }}
        className="z-[9999] w-64 p-3 bg-slate-900 text-slate-100 dark:bg-slate-800 dark:text-slate-100 rounded-xl shadow-xl dark:shadow-2xl border border-slate-700/80 dark:border-slate-600 pointer-events-none backdrop-blur-md animate-in fade-in-0 zoom-in-95 duration-150"
      >
        <div className="font-extrabold text-sky-400 dark:text-sky-300 uppercase tracking-wider text-[9px] pb-1 border-b border-slate-800 dark:border-slate-700 flex items-center justify-between">
          <span>{hoveredPopover.title}</span>
          <span className="text-slate-400 font-normal">{hoveredPopover.tipo}</span>
        </div>

        <div className="space-y-1.5 pt-2">
          {hoveredPopover.personasDetalle?.map(p => (
            <div key={p.bl} className="flex items-center justify-between gap-2 text-[10px]">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <span className={cn(
                  "text-[8px] font-black px-1.5 py-0.5 rounded uppercase border",
                  p.bl === 'RMX' ? "bg-sky-500/20 text-sky-300 border-sky-500/40" :
                  p.bl === 'CEM' ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40" :
                  "bg-amber-500/20 text-amber-300 border-amber-500/40"
                )}>
                  {p.bl}
                </span>
                <span className="truncate max-w-[95px] text-slate-200">{p.persona}</span>
              </span>
              <span className="font-mono text-emerald-400 font-bold shrink-0">
                {formatNumber(p.totales)} ord · {formatPct(p.pctAdopcion)}
              </span>
            </div>
          ))}
        </div>
      </div>
    )}
  </Card>
  );
}
