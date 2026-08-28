import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ChevronRight,
  Download,
  CheckCircle2,
  XCircle,
  PhoneCall,
  Layers,
  Globe,
  Building,
  Briefcase,
  Users,
  User,
  Sparkles
} from 'lucide-react';
import { formatNumber, formatPct, cn } from '@/lib/utils';
import { adopcionRepo } from '@/domain/adopcionRepo';

export function ProgressiveHierarchy({
  filtrosCompuestos,
  onOpenActionDrawer,
  onExportCsv
}) {
  // Estado progresivo de selección: solo se abren columnas cuando el usuario hace clic
  const [selectedCountry, setSelectedCountry] = useState(true);
  const [selectedVpId, setSelectedVpId] = useState(null);
  const [selectedDirId, setSelectedDirId] = useState(null);
  const [selectedGerId, setSelectedGerId] = useState(null);
  const [selectedRepId, setSelectedRepId] = useState(null);

  // Obtener datos dinámicos de cada nivel
  const vps = useMemo(() => {
    return adopcionRepo.getJerarquia('nacional', null, filtrosCompuestos);
  }, [filtrosCompuestos]);

  const directores = useMemo(() => {
    if (!selectedVpId) return [];
    return adopcionRepo.getJerarquia('vp', selectedVpId, filtrosCompuestos);
  }, [selectedVpId, filtrosCompuestos]);

  const gerentes = useMemo(() => {
    if (!selectedDirId) return [];
    return adopcionRepo.getJerarquia('director', selectedDirId, filtrosCompuestos);
  }, [selectedDirId, filtrosCompuestos]);

  const vendedores = useMemo(() => {
    if (!selectedGerId) return [];
    return adopcionRepo.getJerarquia('gerente', selectedGerId, filtrosCompuestos);
  }, [selectedGerId, filtrosCompuestos]);

  // Contexto activo para saber qué clientes mostrar en la tabla inferior
  const activeContext = useMemo(() => {
    let fNode = { ...filtrosCompuestos };
    let titulo = "Consolidado País (Nacional)";
    let badge = "Nacional";

    if (selectedRepId) {
      fNode.vendedorId = selectedRepId;
      const v = vendedores.find(x => x.id === selectedRepId);
      titulo = `Vendedor: ${v?.nombre || selectedRepId}`;
      badge = "Vendedor";
    } else if (selectedGerId) {
      fNode.gerenteId = selectedGerId;
      const g = gerentes.find(x => x.id === selectedGerId);
      titulo = `Gerencia: ${g?.nombre || selectedGerId}`;
      badge = "Gerencia";
    } else if (selectedDirId) {
      fNode.directorId = selectedDirId;
      const d = directores.find(x => x.id === selectedDirId);
      titulo = `Dirección: ${d?.nombre || selectedDirId}`;
      badge = "Dirección";
    } else if (selectedVpId) {
      fNode.vpId = selectedVpId;
      const vp = vps.find(x => x.id === selectedVpId);
      titulo = `Vicepresidencia: ${vp?.nombre || selectedVpId}`;
      badge = "VP";
    }

    const { clientes, transacciones } = adopcionRepo._filtrar(fNode);
    const metricas = adopcionRepo.calculateAggregations ? adopcionRepo.calculateAggregations(transacciones, clientes) : null;
    const cartera = adopcionRepo.getCartera(selectedRepId || null, fNode);

    return {
      fNode,
      titulo,
      badge,
      clientes,
      cartera
    };
  }, [selectedRepId, selectedGerId, selectedDirId, selectedVpId, filtrosCompuestos, vps, directores, gerentes, vendedores]);

  return (
    <Card className="p-5 bg-card border border-border shadow-xs rounded-xl flex flex-col relative overflow-hidden select-none space-y-4">
      {/* Barra superior de acento */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-700 via-indigo-500 to-sky-400" />

      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
        <div>
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-primary" />
            <span>Navegación Progresiva en Cascada (De País a Cartera)</span>
          </div>
          <div className="text-xs font-semibold text-foreground flex items-center gap-1.5 flex-wrap">
            <span>Haz clic en un nivel para abrir el siguiente a la derecha:</span>
            <Badge variant="outline" className="text-[10px] font-bold text-primary border-primary/30">
              {activeContext.titulo}
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
          <span>Exportar Cartera Filtrada CSV</span>
        </Button>
      </div>

      {/* RIELES HORIZONTALES PROGRESIVOS (Miller Columns) */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin items-stretch min-h-[220px]">
        {/* NIVEL 0: PAÍS (NACIONAL) */}
        <div className="w-52 shrink-0 bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-border flex flex-col justify-between shadow-2xs">
          <div>
            <div className="text-[10px] font-bold uppercase text-primary mb-2 flex items-center gap-1.5 pb-1.5 border-b border-border">
              <Globe className="w-3.5 h-3.5" />
              <span>Nivel País</span>
            </div>
            <button
              onClick={() => {
                setSelectedVpId(selectedVpId ? null : 'vp-1');
                setSelectedDirId(null);
                setSelectedGerId(null);
                setSelectedRepId(null);
              }}
              className={cn(
                "w-full text-left p-2.5 rounded-lg border transition-all flex flex-col gap-1 cursor-pointer text-xs",
                selectedCountry && !selectedVpId
                  ? "bg-primary text-primary-foreground border-primary font-bold shadow-xs"
                  : "bg-card hover:bg-slate-100 dark:hover:bg-slate-800 text-foreground border-border font-medium"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold">México Nacional</span>
                <ChevronRight className={cn("w-3.5 h-3.5 shrink-0", selectedVpId ? "text-primary rotate-90" : "text-muted-foreground")} />
              </div>
              <div className="text-[10px] text-muted-foreground">
                2 Vicepresidencias · 1,288 Clientes
              </div>
            </button>
          </div>

          <div className="text-[10px] text-muted-foreground pt-2 border-t border-border/80 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-primary" />
            <span>{selectedVpId ? "VP Abierto ➔" : "Haz clic para abrir VP"}</span>
          </div>
        </div>

        {/* NIVEL 1: VICEPRESIDENCIAS (Solo se abre si se selecciona país) */}
        <AnimatePresence>
          {selectedVpId !== null && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-56 shrink-0 bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-border flex flex-col shadow-2xs"
            >
              <div className="text-[10px] font-bold uppercase text-primary mb-2 flex items-center gap-1.5 pb-1.5 border-b border-border">
                <Building className="w-3.5 h-3.5" />
                <span>Vicepresidencias</span>
              </div>
              <div className="space-y-1.5 overflow-y-auto flex-1 pr-0.5 scrollbar-thin">
                {vps.map(vp => {
                  const isSelected = selectedVpId === vp.id;
                  return (
                    <button
                      key={vp.id}
                      onClick={() => {
                        setSelectedVpId(vp.id);
                        setSelectedDirId(selectedDirId === 'dir-1' && isSelected ? null : 'dir-1');
                        setSelectedGerId(null);
                        setSelectedRepId(null);
                      }}
                      className={cn(
                        "w-full text-left p-2.5 rounded-lg border transition-all flex flex-col gap-1 cursor-pointer text-xs",
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary font-bold shadow-xs"
                          : "bg-card hover:bg-slate-100 dark:hover:bg-slate-800 text-foreground border-border font-medium"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold truncate">{vp.nombre}</span>
                        <ChevronRight className={cn("w-3.5 h-3.5 shrink-0", isSelected ? "text-white" : "text-muted-foreground")} />
                      </div>
                      <div className={cn("text-[10px] flex items-center justify-between", isSelected ? "text-white/90" : "text-muted-foreground")}>
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

        {/* NIVEL 2: DIRECCIONES REGIONALES (Solo se abre si se selecciona VP) */}
        <AnimatePresence>
          {selectedDirId !== null && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-60 shrink-0 bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-border flex flex-col shadow-2xs"
            >
              <div className="text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400 mb-2 flex items-center gap-1.5 pb-1.5 border-b border-border">
                <Briefcase className="w-3.5 h-3.5" />
                <span>Direcciones ({directores.length})</span>
              </div>
              <div className="space-y-1.5 overflow-y-auto flex-1 pr-0.5 scrollbar-thin">
                {directores.map(dir => {
                  const isSelected = selectedDirId === dir.id;
                  return (
                    <button
                      key={dir.id}
                      onClick={() => {
                        setSelectedDirId(dir.id);
                        setSelectedGerId(selectedGerId === 'ger-1' && isSelected ? null : 'ger-1');
                        setSelectedRepId(null);
                      }}
                      className={cn(
                        "w-full text-left p-2.5 rounded-lg border transition-all flex flex-col gap-1 cursor-pointer text-xs",
                        isSelected
                          ? "bg-indigo-600 text-white border-indigo-700 font-bold shadow-xs"
                          : "bg-card hover:bg-slate-100 dark:hover:bg-slate-800 text-foreground border-border font-medium"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold truncate">{dir.nombre}</span>
                        <ChevronRight className={cn("w-3.5 h-3.5 shrink-0", isSelected ? "text-white" : "text-muted-foreground")} />
                      </div>
                      <div className={cn("text-[10px] flex items-center justify-between", isSelected ? "text-indigo-100" : "text-muted-foreground")}>
                        <span>{formatPct(dir.metricas.pedidos.pctAdopcion)}</span>
                        <span>{dir.metricas.clientes.asignados} cli.</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* NIVEL 3: GERENCIAS DE PLAZA (Solo se abre si se selecciona Dirección) */}
        <AnimatePresence>
          {selectedGerId !== null && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-60 shrink-0 bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-border flex flex-col shadow-2xs"
            >
              <div className="text-[10px] font-bold uppercase text-sky-600 dark:text-sky-400 mb-2 flex items-center gap-1.5 pb-1.5 border-b border-border">
                <Users className="w-3.5 h-3.5" />
                <span>Gerencias ({gerentes.length})</span>
              </div>
              <div className="space-y-1.5 overflow-y-auto flex-1 pr-0.5 scrollbar-thin">
                {gerentes.map(ger => {
                  const isSelected = selectedGerId === ger.id;
                  return (
                    <button
                      key={ger.id}
                      onClick={() => {
                        setSelectedGerId(ger.id);
                        setSelectedRepId(selectedRepId === 'rep-1' && isSelected ? null : 'rep-1');
                      }}
                      className={cn(
                        "w-full text-left p-2.5 rounded-lg border transition-all flex flex-col gap-1 cursor-pointer text-xs",
                        isSelected
                          ? "bg-sky-600 text-white border-sky-700 font-bold shadow-xs"
                          : "bg-card hover:bg-slate-100 dark:hover:bg-slate-800 text-foreground border-border font-medium"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold truncate">{ger.nombre}</span>
                        <ChevronRight className={cn("w-3.5 h-3.5 shrink-0", isSelected ? "text-white" : "text-muted-foreground")} />
                      </div>
                      <div className={cn("text-[10px] flex items-center justify-between", isSelected ? "text-sky-100" : "text-muted-foreground")}>
                        <span>{formatPct(ger.metricas.pedidos.pctAdopcion)}</span>
                        <span>{ger.metricas.clientes.asignados} cli.</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* NIVEL 4: VENDEDORES (Solo se abre si se selecciona Gerencia) */}
        <AnimatePresence>
          {selectedRepId !== null && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-64 shrink-0 bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-border flex flex-col shadow-2xs"
            >
              <div className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 mb-2 flex items-center gap-1.5 pb-1.5 border-b border-border">
                <User className="w-3.5 h-3.5" />
                <span>Vendedores ({vendedores.length})</span>
              </div>
              <div className="space-y-1.5 overflow-y-auto flex-1 pr-0.5 scrollbar-thin">
                {vendedores.map(rep => {
                  const isSelected = selectedRepId === rep.id;
                  return (
                    <button
                      key={rep.id}
                      onClick={() => setSelectedRepId(rep.id)}
                      className={cn(
                        "w-full text-left p-2.5 rounded-lg border transition-all flex flex-col gap-1 cursor-pointer text-xs",
                        isSelected
                          ? "bg-emerald-600 text-white border-emerald-700 font-bold shadow-xs"
                          : "bg-card hover:bg-slate-100 dark:hover:bg-slate-800 text-foreground border-border font-medium"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="font-bold truncate">{rep.nombre}</span>
                          {rep.plaza && (
                            <span className={cn("text-[9px] px-1 rounded font-semibold", isSelected ? "bg-emerald-700 text-white" : "bg-muted text-muted-foreground")}>
                              {rep.plaza}
                            </span>
                          )}
                        </div>
                        <ChevronRight className={cn("w-3.5 h-3.5 shrink-0", isSelected ? "text-white" : "text-muted-foreground")} />
                      </div>
                      <div className={cn("text-[10px] flex items-center justify-between", isSelected ? "text-emerald-100" : "text-muted-foreground")}>
                        <span>{formatPct(rep.metricas.pedidos.pctAdopcion)}</span>
                        <span>{rep.metricas.clientes.asignados} cli.</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* TABLA DE CARTERA DE CLIENTES DEL NODO SELECCIONADO (SIEMPRE VISIBLE Y ACTUALIZADA) */}
      <div className="pt-3 border-t border-border">
        <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-bold text-foreground">
              Clientes Bajo el Nivel Activo ({activeContext.cartera.length} cuentas en {activeContext.titulo})
            </span>
          </div>

          <Button
            variant="default"
            size="sm"
            onClick={() => onOpenActionDrawer({ nombre: activeContext.titulo, id: 'context' })}
            className="text-xs font-bold gap-1 shadow-xs"
          >
            Plan Acción para este Nivel
          </Button>
        </div>

        <div className="overflow-x-auto max-h-72 scrollbar-thin">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border text-[10px] font-bold text-muted-foreground bg-slate-100 dark:bg-slate-850 sticky top-0 z-10">
                <th className="py-2 px-3">Cliente ID</th>
                <th className="py-2 px-3">Línea</th>
                <th className="py-2 px-3 text-right">Volumen</th>
                <th className="py-2 px-3 text-center">Onboarding</th>
                <th className="py-2 px-3 text-center">Estatus</th>
                <th className="py-2 px-3 text-right">Pedidos Dig.</th>
                <th className="py-2 px-3 text-right">% Adopción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {activeContext.cartera.slice(0, 50).map(cli => (
                <tr key={cli.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors">
                  <td className="py-2 px-3 font-bold font-mono text-foreground flex items-center gap-1.5">
                    {cli.esTopPareto && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" title="Cuenta Top Pareto (20% volumen)" />
                    )}
                    <span>{cli.id}</span>
                  </td>
                  <td className="py-2 px-3 text-muted-foreground font-medium">{cli.lineaLabel}</td>
                  <td className="py-2 px-3 text-right font-bold tabular-nums text-foreground">
                    {formatNumber(cli.volumenMes)} {cli.unidad}
                  </td>
                  <td className="py-2 px-3 text-center">
                    {cli.estaIncorporado ? (
                      <Badge variant="success" className="text-[9px] py-0 px-1 font-bold">
                        <CheckCircle2 className="w-3 h-3 mr-0.5 inline" /> Onboarded
                      </Badge>
                    ) : (
                      <Badge variant="danger" className="text-[9px] py-0 px-1 font-bold">
                        <XCircle className="w-3 h-3 mr-0.5 inline" /> Sin cuenta
                      </Badge>
                    )}
                  </td>
                  <td className="py-2 px-3 text-center">
                    {cli.esActivo ? (
                      <Badge variant="success" className="text-[9px] py-0 px-1 font-bold">Activo</Badge>
                    ) : cli.esRevertido ? (
                      <Badge variant="warning" className="text-[9px] py-0 px-1 font-bold">
                        <PhoneCall className="w-3 h-3 mr-0.5 inline" /> Revertido
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[9px] py-0 px-1 text-muted-foreground">Inactivo</Badge>
                    )}
                  </td>
                  <td className="py-2 px-3 text-right tabular-nums text-muted-foreground">
                    <span className="font-bold text-foreground">{cli.pedidosDigitales}</span> / {cli.pedidosTotales}
                  </td>
                  <td className="py-2 px-3 text-right font-bold tabular-nums">
                    <span className={cn(
                      cli.pctAdopcionPedidos >= 90 ? "text-emerald-600 dark:text-emerald-400" :
                      cli.pctAdopcionPedidos >= 50 ? "text-amber-600 dark:text-amber-400" :
                      "text-rose-600 dark:text-rose-400"
                    )}>
                      {cli.pctAdopcionPedidos.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
}