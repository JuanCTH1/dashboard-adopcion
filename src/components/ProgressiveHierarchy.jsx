import React, { useState, useMemo, useEffect, startTransition, useDeferredValue } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Clock
} from 'lucide-react';
import { formatNumber, formatPct, cn } from '@/lib/utils';
import { adopcionRepo } from '@/domain/adopcionRepo';

// High-speed fluid transition (0ms startup, GPU hardware-accelerated)
const INSTANT_FLUID_TRANSITION = {
  duration: 0.28,
  ease: [0.16, 1, 0.3, 1]
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

  // Expandable table rows state
  const [expandedRowIds, setExpandedRowIds] = useState(new Set());

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

    let titulo = "USA National Scope";
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
    <Card className="p-5 bg-card border border-border shadow-xs rounded-xl flex flex-col relative overflow-hidden select-none space-y-4 font-sans">
      {/* Top Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-700 via-indigo-500 to-sky-400" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
        <div>
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-primary" />
            <span>Interactive Organizational Hierarchy (Global Dashboard Filter)</span>
          </div>
          <div className="text-xs font-semibold text-foreground flex items-center gap-1.5 flex-wrap">
            <span>Selected Scope:</span>
            <Badge variant="outline" className="text-[10px] font-bold text-primary border-primary/30">
              {activeContext.titulo} ({totalesCartera?.totalClientes || 0} Accounts · {formatNumber(totalesCartera?.totalPedidos || 0)} Total Orders)
            </Badge>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onExportCsv}
          className="gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground shadow-xxs self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-primary" />
          <span>Export Portfolio CSV</span>
        </Button>
      </div>

      {/* HORIZONTAL CASCADED COLUMNS WITH FLUID HARDWARE-ACCELERATED TRANSITIONS */}
      <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin items-stretch min-h-[380px] relative">
        {/* LEVEL 0: COUNTRY */}
        <div className="w-36 shrink-0 bg-slate-50 dark:bg-slate-900/80 p-2.5 rounded-xl border border-border flex flex-col justify-between shadow-2xs">
          <div className="text-[10px] font-bold uppercase text-primary flex items-center gap-1 pb-1 border-b border-border">
            <Globe className="w-3 h-3" />
            <span>Country</span>
          </div>

          <div className="flex-1 flex flex-col justify-center py-2">
            <button
              onClick={() => setIsUsaSelected(!isUsaSelected)}
              className={cn(
                "w-full text-left p-2 rounded-lg border transition-all flex flex-col gap-1 cursor-pointer text-xs",
                isUsaSelected
                  ? "bg-primary text-primary-foreground border-primary font-bold shadow-xs"
                  : "bg-card hover:bg-slate-100 dark:hover:bg-slate-800 text-foreground border-border font-medium"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-[11px]">USA National</span>
                {isUsaSelected && <Check className="w-3 h-3 text-white" />}
              </div>
              <div className={cn("text-[9px]", isUsaSelected ? "text-white/90" : "text-muted-foreground")}>
                3 Product VPs · 1,288 Cli.
              </div>
            </button>
          </div>

          <div className="text-[9px] text-muted-foreground pt-1.5 border-t border-border/80 text-center">
            {isUsaSelected ? "VPs Open ➔" : "Click to Open"}
          </div>
        </div>

        {/* LEVEL 1: VICE PRESIDENCIES */}
        <AnimatePresence mode="sync">
          {isUsaSelected && (
            <motion.div
              key="vp-col"
              initial={{ opacity: 0, width: 0, marginRight: 0 }}
              animate={{ opacity: 1, width: 176, marginRight: 10 }}
              exit={{ opacity: 0, width: 0, marginRight: 0 }}
              transition={INSTANT_FLUID_TRANSITION}
              style={{ willChange: "width, opacity, transform", transform: "translateZ(0)" }}
              className="shrink-0 bg-slate-50 dark:bg-slate-900/80 p-2.5 rounded-xl border border-border flex flex-col shadow-2xs overflow-hidden"
            >
              <div className="w-[156px] text-[10px] font-bold uppercase text-primary flex items-center justify-between pb-1 border-b border-border">
                <div className="flex items-center gap-1">
                  <Building className="w-3 h-3" />
                  <span>VP Divisions</span>
                </div>
                {selectedVpIds.length > 0 && (
                  <button onClick={() => startTransition(() => setSelectedVpIds([]))} className="text-[9px] text-primary hover:underline font-bold">
                    Clear
                  </button>
                )}
              </div>

              <div className="w-[156px] flex-1 flex flex-col justify-center space-y-1.5 py-2 overflow-y-auto scrollbar-thin">
                {vps.map(vp => {
                  const isSelected = selectedVpIds.includes(vp.id);
                  return (
                    <button
                      key={vp.id}
                      onClick={() => toggleSelection(setSelectedVpIds, selectedVpIds, vp.id)}
                      className={cn(
                        "w-full text-left p-2 rounded-lg border transition-all flex flex-col gap-0.5 cursor-pointer text-xs",
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary font-bold shadow-xs"
                          : "bg-card hover:bg-slate-100 dark:hover:bg-slate-800 text-foreground border-border font-medium"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[10px] truncate">{vp.nombre}</span>
                        {isSelected && <Check className="w-3 h-3 text-white shrink-0" />}
                      </div>
                      <div className={cn("text-[9px] flex items-center justify-between", isSelected ? "text-white/90" : "text-muted-foreground")}>
                        <span>{formatPct(vp.metricas.pedidos.pctAdopcion)}</span>
                        <span>{vp.metricas.clientes.asignados} cli.</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* LEVEL 2: REGIONAL DIRECTORS */}
        <AnimatePresence mode="sync">
          {selectedVpIds.length > 0 && (
            <motion.div
              key="dir-col"
              initial={{ opacity: 0, width: 0, marginRight: 0 }}
              animate={{ opacity: 1, width: 176, marginRight: 10 }}
              exit={{ opacity: 0, width: 0, marginRight: 0 }}
              transition={INSTANT_FLUID_TRANSITION}
              style={{ willChange: "width, opacity, transform", transform: "translateZ(0)" }}
              className="shrink-0 bg-slate-50 dark:bg-slate-900/80 p-2.5 rounded-xl border border-border flex flex-col shadow-2xs overflow-hidden"
            >
              <div className="w-[156px] text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400 flex items-center justify-between pb-1 border-b border-border">
                <div className="flex items-center gap-1">
                  <Briefcase className="w-3 h-3" />
                  <span>Directors</span>
                </div>
                {selectedDirIds.length > 0 && (
                  <button onClick={() => startTransition(() => setSelectedDirIds([]))} className="text-[9px] text-indigo-600 hover:underline font-bold">
                    Clear
                  </button>
                )}
              </div>

              <div className="w-[156px] flex-1 flex flex-col justify-center space-y-1.5 py-2 overflow-y-auto scrollbar-thin">
                {directores.map(dir => {
                  const isSelected = selectedDirIds.includes(dir.id);
                  const parentVp = vps.find(v => v.id === dir.parentId);
                  return (
                    <button
                      key={dir.id}
                      onClick={() => toggleSelection(setSelectedDirIds, selectedDirIds, dir.id)}
                      className={cn(
                        "w-full text-left p-2 rounded-lg border transition-all flex flex-col gap-0.5 cursor-pointer text-xs",
                        isSelected
                          ? "bg-indigo-600 text-white border-indigo-700 font-bold shadow-xs"
                          : "bg-card hover:bg-slate-100 dark:hover:bg-slate-800 text-foreground border-border font-medium"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[10px] truncate">{dir.nombre}</span>
                        {isSelected && <Check className="w-3 h-3 text-white shrink-0" />}
                      </div>
                      <div className="flex items-center justify-between gap-1">
                        <span className={cn("text-[8px] px-1 rounded font-bold uppercase truncate max-w-[70px]", isSelected ? "bg-indigo-700 text-white" : "bg-muted text-muted-foreground")}>
                          {parentVp?.lineaNegocio || dir.parentId}
                        </span>
                        <span className={cn("text-[9px]", isSelected ? "text-indigo-100" : "text-muted-foreground")}>
                          {formatPct(dir.metricas.pedidos.pctAdopcion)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* LEVEL 3: PLAZA MANAGERS */}
        <AnimatePresence mode="sync">
          {selectedDirIds.length > 0 && (
            <motion.div
              key="ger-col"
              initial={{ opacity: 0, width: 0, marginRight: 0 }}
              animate={{ opacity: 1, width: 176, marginRight: 10 }}
              exit={{ opacity: 0, width: 0, marginRight: 0 }}
              transition={INSTANT_FLUID_TRANSITION}
              style={{ willChange: "width, opacity, transform", transform: "translateZ(0)" }}
              className="shrink-0 bg-slate-50 dark:bg-slate-900/80 p-2.5 rounded-xl border border-border flex flex-col shadow-2xs overflow-hidden"
            >
              <div className="w-[156px] text-[10px] font-bold uppercase text-sky-600 dark:text-sky-400 flex items-center justify-between pb-1 border-b border-border">
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>Managers</span>
                </div>
                {selectedGerIds.length > 0 && (
                  <button onClick={() => startTransition(() => setSelectedGerIds([]))} className="text-[9px] text-sky-600 hover:underline font-bold">
                    Clear
                  </button>
                )}
              </div>

              <div className="w-[156px] flex-1 flex flex-col justify-center space-y-1.5 py-2 overflow-y-auto scrollbar-thin">
                {gerentes.map(ger => {
                  const isSelected = selectedGerIds.includes(ger.id);
                  const parentDir = directores.find(d => d.id === ger.parentId);
                  return (
                    <button
                      key={ger.id}
                      onClick={() => toggleSelection(setSelectedGerIds, selectedGerIds, ger.id)}
                      className={cn(
                        "w-full text-left p-2 rounded-lg border transition-all flex flex-col gap-0.5 cursor-pointer text-xs",
                        isSelected
                          ? "bg-sky-600 text-white border-sky-700 font-bold shadow-xs"
                          : "bg-card hover:bg-slate-100 dark:hover:bg-slate-800 text-foreground border-border font-medium"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[10px] truncate">{ger.nombre}</span>
                        {isSelected && <Check className="w-3 h-3 text-white shrink-0" />}
                      </div>
                      <div className="flex items-center justify-between gap-1">
                        <span className={cn("text-[8px] px-1 rounded font-bold uppercase truncate max-w-[70px]", isSelected ? "bg-sky-700 text-white" : "bg-muted text-muted-foreground")}>
                          {parentDir?.nombre?.split(' ')[1] || ger.parentId}
                        </span>
                        <span className={cn("text-[9px]", isSelected ? "text-sky-100" : "text-muted-foreground")}>
                          {formatPct(ger.metricas.pedidos.pctAdopcion)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* LEVEL 4: SALES REPRESENTATIVES */}
        <AnimatePresence mode="sync">
          {selectedGerIds.length > 0 && (
            <motion.div
              key="rep-col"
              initial={{ opacity: 0, width: 0, marginRight: 0 }}
              animate={{ opacity: 1, width: 192, marginRight: 10 }}
              exit={{ opacity: 0, width: 0, marginRight: 0 }}
              transition={INSTANT_FLUID_TRANSITION}
              style={{ willChange: "width, opacity, transform", transform: "translateZ(0)" }}
              className="shrink-0 bg-slate-50 dark:bg-slate-900/80 p-2.5 rounded-xl border border-border flex flex-col shadow-2xs overflow-hidden"
            >
              <div className="w-[172px] text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 flex items-center justify-between pb-1 border-b border-border">
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span>Sales Reps</span>
                </div>
                {selectedRepIds.length > 0 && (
                  <button onClick={() => startTransition(() => setSelectedRepIds([]))} className="text-[9px] text-emerald-600 hover:underline font-bold">
                    Clear
                  </button>
                )}
              </div>

              <div className="w-[172px] flex-1 flex flex-col justify-center space-y-1.5 py-2 overflow-y-auto scrollbar-thin">
                {vendedores.map(rep => {
                  const isSelected = selectedRepIds.includes(rep.id);
                  return (
                    <button
                      key={rep.id}
                      onClick={() => toggleSelection(setSelectedRepIds, selectedRepIds, rep.id)}
                      className={cn(
                        "w-full text-left p-2 rounded-lg border transition-all flex flex-col gap-0.5 cursor-pointer text-xs",
                        isSelected
                          ? "bg-emerald-600 text-white border-emerald-700 font-bold shadow-xs"
                          : "bg-card hover:bg-slate-100 dark:hover:bg-slate-800 text-foreground border-border font-medium"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 truncate">
                          <span className="font-bold text-[10px] truncate">{rep.nombre}</span>
                        </div>
                        {isSelected && <Check className="w-3 h-3 text-white shrink-0" />}
                      </div>
                      <div className={cn("text-[9px] flex items-center justify-between", isSelected ? "text-emerald-100" : "text-muted-foreground")}>
                        <span className="truncate max-w-[80px]">{rep.plaza}</span>
                        <span>{formatPct(rep.metricas.pedidos.pctAdopcion)}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* RIGHT HAND PERMANENT TABLE: NATIVE CSS GPU COMPOSITED TRANSITION (ZERO JS MEASUREMENT STUTTER) */}
        <div
          className="flex-1 min-w-[540px] bg-slate-50 dark:bg-slate-900/80 p-3 rounded-xl border border-border flex flex-col justify-between shadow-2xs transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
        >
          <div>
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-border">
              <div>
                <div className="text-xs font-black text-foreground flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-primary" />
                  <span>Account Portfolio ({activeContext.cartera.length} Accounts)</span>
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  Order-based adoption breakdown with instant visual channel badges
                </div>
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

            {/* EXPANDABLE TABLE WITH ZERO REFLOW FIXED LAYOUT */}
            <div className="overflow-y-auto max-h-[310px] scrollbar-thin">
              <table className="w-full text-left text-xs border-collapse table-fixed">
                <thead>
                  <tr className="border-b border-border text-[10px] font-bold text-muted-foreground bg-slate-100 dark:bg-slate-850 sticky top-0 z-10">
                    <th className="py-1.5 px-2 w-[4%]"></th>
                    <th className="py-1.5 px-2 w-[32%] truncate">Account / Company</th>
                    <th className="py-1.5 px-2 w-[18%] text-right font-bold truncate">Total Orders</th>
                    <th className="py-1.5 px-2 w-[16%] text-right font-bold truncate">Adoption %</th>
                    <th className="py-1.5 px-2 w-[16%] text-center font-bold truncate">Primary Channel</th>
                    <th className="py-1.5 px-2 w-[14%] text-center font-bold truncate">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {deferredCartera.slice(0, 50).map(cli => {
                    const isExpanded = expandedRowIds.has(cli.id);
                    return (
                      <React.Fragment key={cli.id}>
                        <tr className={cn("hover:bg-card transition-colors cursor-pointer", isExpanded && "bg-slate-100/80 dark:bg-slate-850")} onClick={() => toggleRowExpanded(cli.id)}>
                          <td className="py-1.5 px-1 text-center">
                            <button
                              type="button"
                              className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-muted-foreground"
                            >
                              {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-primary" /> : <ChevronRight className="w-3.5 h-3.5" />}
                            </button>
                          </td>
                          <td className="py-1.5 px-2">
                            <div className="font-bold text-foreground flex items-center gap-1 text-[11px] truncate max-w-[180px]" title={cli.nombreEmpresa}>
                              {cli.esTopPareto && (
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" title="Top 20% Pareto Account" />
                              )}
                              <span className="truncate">{cli.nombreEmpresa}</span>
                            </div>
                            <div className="text-[9px] text-muted-foreground font-mono">{cli.id} · {cli.lineaLabel}</div>
                          </td>
                          <td className="py-1.5 px-2 text-right font-bold tabular-nums text-foreground">
                            {formatNumber(cli.pedidosTotales)} <span className="text-[9px] text-muted-foreground font-normal">orders</span>
                          </td>
                          <td className="py-1.5 px-2 text-right font-bold tabular-nums">
                            <span className={cn(
                              cli.pctAdopcionPedidos >= 90 ? "text-emerald-600 dark:text-emerald-400" :
                              cli.pctAdopcionPedidos >= 50 ? "text-amber-600 dark:text-amber-400" :
                              "text-rose-600 dark:text-rose-400"
                            )}>
                              {cli.pctAdopcionPedidos.toFixed(1)}%
                            </span>
                          </td>
                          <td className="py-1.5 px-2 text-center">
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[9px] py-0 px-1.5 font-bold uppercase",
                                cli.primaryChannel === 'Phone / Offline'
                                  ? "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700"
                                  : "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30"
                              )}
                            >
                              {cli.primaryChannel === 'Phone / Offline' && <PhoneCall className="w-2.5 h-2.5 mr-1 inline" />}
                              {cli.primaryChannel === 'Web Portal' && <Laptop className="w-2.5 h-2.5 mr-1 inline" />}
                              {cli.primaryChannel === 'Mobile App' && <Smartphone className="w-2.5 h-2.5 mr-1 inline" />}
                              {cli.primaryChannel === 'EDI Integration' && <Server className="w-2.5 h-2.5 mr-1 inline" />}
                              {cli.primaryChannel}
                            </Badge>
                          </td>
                          <td className="py-1.5 px-2 text-center">
                            {cli.estaIncorporado ? (
                              <Badge variant="success" className="text-[9px] py-0 px-1 font-bold">
                                Onboarded
                              </Badge>
                            ) : (
                              <Badge variant="danger" className="text-[9px] py-0 px-1 font-bold">
                                No Account
                              </Badge>
                            )}
                          </td>
                        </tr>

                        {/* EXPANDABLE DRAWER ROW WITH HIGH-CONTRAST VISUAL MICRO-PILLS */}
                        {isExpanded && (
                          <tr className="bg-slate-100/90 dark:bg-slate-950 border-b border-border">
                            <td colSpan={6} className="p-2.5">
                              <div className="bg-card p-3 rounded-lg border border-border shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
                                {/* Digital Channel Pills */}
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-[10px] font-bold text-muted-foreground uppercase mr-1">Digital Channels:</span>
                                  <Badge variant="info" className="gap-1 text-[11px] font-bold py-0.5 px-2 bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30">
                                    <Laptop className="w-3 h-3 text-sky-500" />
                                    <span>Web: <b>{cli.pedidosWeb}</b></span>
                                  </Badge>
                                  <Badge variant="info" className="gap-1 text-[11px] font-bold py-0.5 px-2 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30">
                                    <Smartphone className="w-3 h-3 text-indigo-500" />
                                    <span>App: <b>{cli.pedidosApp}</b></span>
                                  </Badge>
                                  <Badge variant="info" className="gap-1 text-[11px] font-bold py-0.5 px-2 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">
                                    <Server className="w-3 h-3 text-emerald-500" />
                                    <span>EDI: <b>{cli.pedidosEdi}</b></span>
                                  </Badge>
                                </div>

                                {/* Offline & FTTV Pills */}
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-[10px] font-bold text-muted-foreground uppercase mr-1">Offline:</span>
                                  <Badge variant="outline" className="gap-1 text-[11px] font-bold py-0.5 px-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700">
                                    <PhoneCall className="w-3 h-3 text-amber-500" />
                                    <span>Phone: <b>{cli.pedidosAnalogos}</b></span>
                                  </Badge>
                                  <Badge variant="outline" className="gap-1 text-[11px] font-bold py-0.5 px-2 text-muted-foreground border-border">
                                    <Clock className="w-3 h-3 text-primary" />
                                    <span>FTTV: <b>{cli.fttv ? `${cli.fttv} days` : 'Pending'}</b></span>
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
                      <td colSpan={2} className="py-2 px-2">
                        <div className="font-extrabold uppercase text-[10px] text-primary">
                          TOTALS ({totalesCartera.totalClientes} ACCOUNTS)
                        </div>
                        <div className="text-[9px] text-muted-foreground">
                          Onboarding Rate: {totalesCartera.pctOnboarding.toFixed(1)}%
                        </div>
                      </td>
                      <td className="py-2 px-2 text-right tabular-nums text-foreground">
                        {formatNumber(totalesCartera.totalPedidos)} <span className="text-[9px] font-normal">total</span>
                      </td>
                      <td className="py-2 px-2 text-right tabular-nums text-emerald-600 dark:text-emerald-400 font-black text-sm">
                        {totalesCartera.pctAdopcionPonderado.toFixed(1)}%
                      </td>
                      <td className="py-2 px-2 text-center text-[10px] text-muted-foreground">
                        Dig: {formatNumber(totalesCartera.totalDigitales)} | Off: {formatNumber(totalesCartera.totalAnalogos)}
                      </td>
                      <td className="py-2 px-2 text-center">
                        <Badge variant="success" className="text-[9px] py-0.5 px-1.5 font-bold">
                          {totalesCartera.onboardedCount} / {totalesCartera.totalClientes} Active
                        </Badge>
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}