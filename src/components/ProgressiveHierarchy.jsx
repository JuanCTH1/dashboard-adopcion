import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ChevronRight,
  Download,
  Layers,
  Globe,
  Building,
  Briefcase,
  Users,
  User,
  Sparkles,
  Check,
  ShoppingCart
} from 'lucide-react';
import { formatNumber, formatPct, cn } from '@/lib/utils';
import { adopcionRepo } from '@/domain/adopcionRepo';

export function ProgressiveHierarchy({
  filtrosCompuestos,
  onOpenActionDrawer,
  onExportCsv
}) {
  // Estado de selección multidimensional
  const [isUsaSelected, setIsUsaSelected] = useState(true);
  const [selectedVpIds, setSelectedVpIds] = useState([]);
  const [selectedDirIds, setSelectedDirIds] = useState([]);
  const [selectedGerIds, setSelectedGerIds] = useState([]);
  const [selectedRepIds, setSelectedRepIds] = useState([]);

  // Helpers de multiselección
  const toggleSelection = (setter, currentArr, id) => {
    if (currentArr.includes(id)) {
      setter(currentArr.filter(x => x !== id));
    } else {
      setter([...currentArr, id]);
    }
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

    let titulo = "USA National";
    if (selectedRepIds.length) titulo = `${selectedRepIds.length} Vendedor(es)`;
    else if (selectedGerIds.length) titulo = `${selectedGerIds.length} Gerencia(s)`;
    else if (selectedDirIds.length) titulo = `${selectedDirIds.length} Dirección(es)`;
    else if (selectedVpIds.length) titulo = `${selectedVpIds.length} VP(s)`;

    const cartera = adopcionRepo.getCartera(null, fNode);

    return {
      fNode,
      titulo,
      cartera
    };
  }, [selectedVpIds, selectedDirIds, selectedGerIds, selectedRepIds, filtrosCompuestos]);

  // Cálculo de Totales y Promedio Ponderado de Órdenes
  const totalesCartera = useMemo(() => {
    if (!activeContext.cartera.length) return null;
    let totalPedidos = 0;
    let totalDigitales = 0;
    let onboardedCount = 0;

    activeContext.cartera.forEach(c => {
      totalPedidos += c.pedidosTotales;
      totalDigitales += c.pedidosDigitales;
      if (c.estaIncorporado) onboardedCount++;
    });

    const pctAdopcionPonderado = totalPedidos > 0 ? (totalDigitales / totalPedidos) * 100 : 0;
    const pctOnboarding = (onboardedCount / activeContext.cartera.length) * 100;

    return {
      totalClientes: activeContext.cartera.length,
      totalPedidos,
      totalDigitales,
      onboardedCount,
      pctOnboarding,
      pctAdopcionPonderado
    };
  }, [activeContext.cartera]);

  return (
    <Card className="p-5 bg-card border border-border shadow-xs rounded-xl flex flex-col relative overflow-hidden select-none space-y-4">
      {/* Barra superior de acento */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-700 via-indigo-500 to-sky-400" />

      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
        <div>
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-primary" />
            <span>Navegación Jerárquica & Cartera Medida por Órdenes (Pedidos)</span>
          </div>
          <div className="text-xs font-semibold text-foreground flex items-center gap-1.5 flex-wrap">
            <span>Ámbito:</span>
            <Badge variant="outline" className="text-[10px] font-bold text-primary border-primary/30">
              {activeContext.titulo} ({totalesCartera?.totalClientes || 0} cuentas · {formatNumber(totalesCartera?.totalPedidos || 0)} órdenes)
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
          <span>Exportar Cartera CSV</span>
        </Button>
      </div>

      {/* RIELES HORIZONTALES MÁS ANGOSTOS Y CENTRADOS VERTICALMENTE CON LA TABLA A LA DERECHA */}
      <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin items-stretch min-h-[380px]">
        {/* NIVEL 0: PAÍS (CENTRADO VERTICALMENTE) */}
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
                3 VPs por Línea · 1,288 Cli.
              </div>
            </button>
          </div>

          <div className="text-[9px] text-muted-foreground pt-1.5 border-t border-border/80 text-center">
            {isUsaSelected ? "VPs Abiertos ➔" : "Clic para abrir"}
          </div>
        </div>

        {/* NIVEL 1: VICEPRESIDENCIAS POR LÍNEA DE NEGOCIO */}
        <AnimatePresence>
          {isUsaSelected && (
            <motion.div
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              className="w-44 shrink-0 bg-slate-50 dark:bg-slate-900/80 p-2.5 rounded-xl border border-border flex flex-col shadow-2xs"
            >
              <div className="text-[10px] font-bold uppercase text-primary flex items-center justify-between pb-1 border-b border-border">
                <div className="flex items-center gap-1">
                  <Building className="w-3 h-3" />
                  <span>VP por Línea</span>
                </div>
                {selectedVpIds.length > 0 && (
                  <button onClick={() => setSelectedVpIds([])} className="text-[9px] text-primary hover:underline font-bold">
                    Limpiar
                  </button>
                )}
              </div>

              <div className="flex-1 flex flex-col justify-center space-y-1.5 py-2 overflow-y-auto scrollbar-thin">
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

        {/* NIVEL 2: DIRECCIONES REGIONALES */}
        <AnimatePresence>
          {selectedVpIds.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              className="w-44 shrink-0 bg-slate-50 dark:bg-slate-900/80 p-2.5 rounded-xl border border-border flex flex-col shadow-2xs"
            >
              <div className="text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400 flex items-center justify-between pb-1 border-b border-border">
                <div className="flex items-center gap-1">
                  <Briefcase className="w-3 h-3" />
                  <span>Direcciones</span>
                </div>
                {selectedDirIds.length > 0 && (
                  <button onClick={() => setSelectedDirIds([])} className="text-[9px] text-indigo-600 hover:underline font-bold">
                    Limpiar
                  </button>
                )}
              </div>

              <div className="flex-1 flex flex-col justify-center space-y-1.5 py-2 overflow-y-auto scrollbar-thin">
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

        {/* NIVEL 3: GERENCIAS DE PLAZA */}
        <AnimatePresence>
          {selectedDirIds.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              className="w-44 shrink-0 bg-slate-50 dark:bg-slate-900/80 p-2.5 rounded-xl border border-border flex flex-col shadow-2xs"
            >
              <div className="text-[10px] font-bold uppercase text-sky-600 dark:text-sky-400 flex items-center justify-between pb-1 border-b border-border">
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>Gerencias</span>
                </div>
                {selectedGerIds.length > 0 && (
                  <button onClick={() => setSelectedGerIds([])} className="text-[9px] text-sky-600 hover:underline font-bold">
                    Limpiar
                  </button>
                )}
              </div>

              <div className="flex-1 flex flex-col justify-center space-y-1.5 py-2 overflow-y-auto scrollbar-thin">
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

        {/* NIVEL 4: VENDEDORES */}
        <AnimatePresence>
          {selectedGerIds.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              className="w-48 shrink-0 bg-slate-50 dark:bg-slate-900/80 p-2.5 rounded-xl border border-border flex flex-col shadow-2xs"
            >
              <div className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 flex items-center justify-between pb-1 border-b border-border">
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span>Vendedores</span>
                </div>
                {selectedRepIds.length > 0 && (
                  <button onClick={() => setSelectedRepIds([])} className="text-[9px] text-emerald-600 hover:underline font-bold">
                    Limpiar
                  </button>
                )}
              </div>

              <div className="flex-1 flex flex-col justify-center space-y-1.5 py-2 overflow-y-auto scrollbar-thin">
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

        {/* COLUMNA DERECHA PERMANENTE: TABLA DE CARTERA CON TOTALES SUMARIZADOS Y MEDIDA EN ÓRDENES */}
        <div className="flex-1 min-w-[500px] bg-slate-50 dark:bg-slate-900/80 p-3 rounded-xl border border-border flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-border">
              <div>
                <div className="text-xs font-black text-foreground flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-primary" />
                  <span>Cartera Medida por Órdenes / Pedidos ({activeContext.cartera.length} clientes)</span>
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  Las órdenes son una unidad agnóstica para comparar canales y producto
                </div>
              </div>

              <Button
                variant="default"
                size="sm"
                onClick={() => onOpenActionDrawer({ nombre: activeContext.titulo, id: 'context' })}
                className="text-xs font-bold gap-1 shadow-xs"
              >
                Plan Acción
              </Button>
            </div>

            {/* Tabla de Clientes con Fila de Totales Ponderados al Final */}
            <div className="overflow-y-auto max-h-[310px] scrollbar-thin">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border text-[10px] font-bold text-muted-foreground bg-slate-100 dark:bg-slate-850 sticky top-0 z-10">
                    <th className="py-1.5 px-2">Empresa / Cliente</th>
                    <th className="py-1.5 px-2 text-right font-bold">Órdenes Totales</th>
                    <th className="py-1.5 px-2 text-right font-bold">Órdenes Dig.</th>
                    <th className="py-1.5 px-2 text-center font-bold">Canal Principal</th>
                    <th className="py-1.5 px-2 text-center font-bold">Onboarding</th>
                    <th className="py-1.5 px-2 text-right font-bold">% Adopción Órdenes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {activeContext.cartera.slice(0, 50).map(cli => (
                    <tr key={cli.id} className="hover:bg-card transition-colors">
                      <td className="py-1.5 px-2">
                        <div className="font-bold text-foreground flex items-center gap-1 text-[11px] truncate max-w-[170px]" title={cli.nombreEmpresa}>
                          {cli.esTopPareto && (
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" title="Cuenta Top Pareto (20% volumen)" />
                          )}
                          <span className="truncate">{cli.nombreEmpresa}</span>
                        </div>
                        <div className="text-[9px] text-muted-foreground font-mono">{cli.id} · {cli.lineaLabel.split(' ')[0]}</div>
                      </td>
                      <td className="py-1.5 px-2 text-right font-bold tabular-nums text-foreground">
                        {formatNumber(cli.pedidosTotales)} <span className="text-[9px] text-muted-foreground font-normal">ord.</span>
                      </td>
                      <td className="py-1.5 px-2 text-right font-bold tabular-nums text-primary">
                        {formatNumber(cli.pedidosDigitales)} <span className="text-[9px] text-muted-foreground font-normal">dig.</span>
                      </td>
                      <td className="py-1.5 px-2 text-center">
                        <Badge variant="outline" className="text-[9px] py-0 px-1 font-bold uppercase text-slate-700 dark:text-slate-300">
                          {cli.canalPreferido}
                        </Badge>
                      </td>
                      <td className="py-1.5 px-2 text-center">
                        {cli.estaIncorporado ? (
                          <Badge variant="success" className="text-[9px] py-0 px-1 font-bold">
                            ✔ Onboarded
                          </Badge>
                        ) : (
                          <Badge variant="danger" className="text-[9px] py-0 px-1 font-bold">
                            Sin cuenta
                          </Badge>
                        )}
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
                    </tr>
                  ))}
                </tbody>

                {/* FILA DE TOTALES Y PROMEDIO PONDERADO */}
                {totalesCartera && (
                  <tfoot className="sticky bottom-0 z-10 bg-slate-200 dark:bg-slate-800 font-bold border-t-2 border-primary/40 text-foreground text-xs shadow-md">
                    <tr>
                      <td className="py-2 px-2">
                        <div className="font-extrabold uppercase text-[10px] text-primary">
                          TOTALES ({totalesCartera.totalClientes} CLIENTES)
                        </div>
                        <div className="text-[9px] text-muted-foreground">
                          Onboarding: {totalesCartera.pctOnboarding.toFixed(1)}%
                        </div>
                      </td>
                      <td className="py-2 px-2 text-right tabular-nums text-foreground">
                        {formatNumber(totalesCartera.totalPedidos)} <span className="text-[9px] font-normal">ord.</span>
                      </td>
                      <td className="py-2 px-2 text-right tabular-nums text-primary font-black">
                        {formatNumber(totalesCartera.totalDigitales)} <span className="text-[9px] font-normal">dig.</span>
                      </td>
                      <td className="py-2 px-2 text-center text-[10px] text-muted-foreground">
                        Multi-Canal
                      </td>
                      <td className="py-2 px-2 text-center">
                        <Badge variant="success" className="text-[9px] py-0.5 px-1.5 font-bold">
                          {totalesCartera.onboardedCount} / {totalesCartera.totalClientes} cuentas
                        </Badge>
                      </td>
                      <td className="py-2 px-2 text-right tabular-nums text-emerald-600 dark:text-emerald-400 font-black text-sm">
                        {totalesCartera.pctAdopcionPonderado.toFixed(1)}%
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