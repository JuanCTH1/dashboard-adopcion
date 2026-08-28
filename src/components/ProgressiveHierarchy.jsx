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
  Sparkles,
  Check
} from 'lucide-react';
import { formatNumber, formatPct, cn } from '@/lib/utils';
import { adopcionRepo } from '@/domain/adopcionRepo';

export function ProgressiveHierarchy({
  filtrosCompuestos,
  onOpenActionDrawer,
  onExportCsv
}) {
  // Estado de selección multidimensional (Arrays) para multiselección síncrona
  const [isUsaSelected, setIsUsaSelected] = useState(true);
  const [selectedVpIds, setSelectedVpIds] = useState([]);
  const [selectedDirIds, setSelectedDirIds] = useState([]);
  const [selectedGerIds, setSelectedGerIds] = useState([]);
  const [selectedRepIds, setSelectedRepIds] = useState([]);

  // Helpers de multiselección en array
  const toggleSelection = (setter, currentArr, id) => {
    if (currentArr.includes(id)) {
      setter(currentArr.filter(x => x !== id));
    } else {
      setter([...currentArr, id]);
    }
  };

  // 1. Obtener Vicepresidencias
  const vps = useMemo(() => {
    return adopcionRepo.getJerarquia('nacional', null, filtrosCompuestos);
  }, [filtrosCompuestos]);

  // 2. Obtener Direcciones de las VPs seleccionadas (Muestra de ambas VPs si ambas están elegidas)
  const directores = useMemo(() => {
    if (selectedVpIds.length === 0) return [];
    return adopcionRepo.getJerarquia('vp', selectedVpIds, filtrosCompuestos);
  }, [selectedVpIds, filtrosCompuestos]);

  // 3. Obtener Gerencias de las Direcciones seleccionadas
  const gerentes = useMemo(() => {
    if (selectedDirIds.length === 0) return [];
    return adopcionRepo.getJerarquia('director', selectedDirIds, filtrosCompuestos);
  }, [selectedDirIds, filtrosCompuestos]);

  // 4. Obtener Vendedores de las Gerencias seleccionadas
  const vendedores = useMemo(() => {
    if (selectedGerIds.length === 0) return [];
    return adopcionRepo.getJerarquia('gerente', selectedGerIds, filtrosCompuestos);
  }, [selectedGerIds, filtrosCompuestos]);

  // 5. Cartera de clientes combinada de todo lo seleccionado
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
    else if (selectedVpIds.length) titulo = `${selectedVpIds.length} Vicepresidencia(s)`;

    const cartera = adopcionRepo.getCartera(null, fNode);

    return {
      fNode,
      titulo,
      cartera
    };
  }, [selectedVpIds, selectedDirIds, selectedGerIds, selectedRepIds, filtrosCompuestos]);

  return (
    <Card className="p-5 bg-card border border-border shadow-xs rounded-xl flex flex-col relative overflow-hidden select-none space-y-4">
      {/* Barra superior de acento */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-700 via-indigo-500 to-sky-400" />

      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
        <div>
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-primary" />
            <span>Explorador de Árbol Jerárquico Multiselección (USA Operations)</span>
          </div>
          <div className="text-xs font-semibold text-foreground flex items-center gap-1.5 flex-wrap">
            <span>Haz clic para abrir columnas y seleccionar múltiples nodos. Contexto activo:</span>
            <Badge variant="outline" className="text-[10px] font-bold text-primary border-primary/30">
              {activeContext.titulo} ({activeContext.cartera.length} clientes)
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

      {/* RIELES HORIZONTALES EN CASCADA CON LA TABLA A LA DERECHA */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin items-stretch min-h-[380px]">
        {/* NIVEL 0: PAÍS (USA NATIONAL) */}
        <div className="w-48 shrink-0 bg-slate-50 dark:bg-slate-900/80 p-3 rounded-xl border border-border flex flex-col justify-between shadow-2xs">
          <div>
            <div className="text-[10px] font-bold uppercase text-primary mb-2 flex items-center gap-1.5 pb-1.5 border-b border-border">
              <Globe className="w-3.5 h-3.5" />
              <span>Country Level</span>
            </div>
            <button
              onClick={() => setIsUsaSelected(!isUsaSelected)}
              className={cn(
                "w-full text-left p-2.5 rounded-lg border transition-all flex flex-col gap-1 cursor-pointer text-xs",
                isUsaSelected
                  ? "bg-primary text-primary-foreground border-primary font-bold shadow-xs"
                  : "bg-card hover:bg-slate-100 dark:hover:bg-slate-800 text-foreground border-border font-medium"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold">USA National</span>
                {isUsaSelected && <Check className="w-3.5 h-3.5 text-white" />}
              </div>
              <div className={cn("text-[10px]", isUsaSelected ? "text-white/90" : "text-muted-foreground")}>
                2 Vicepresidencias · 1,288 Clientes
              </div>
            </button>
          </div>

          <div className="text-[10px] text-muted-foreground pt-2 border-t border-border/80 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-primary" />
            <span>{isUsaSelected ? "VPs Abiertos ➔" : "Haz clic para abrir VPs"}</span>
          </div>
        </div>

        {/* NIVEL 1: VICEPRESIDENCIAS */}
        <AnimatePresence>
          {isUsaSelected && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-52 shrink-0 bg-slate-50 dark:bg-slate-900/80 p-3 rounded-xl border border-border flex flex-col shadow-2xs"
            >
              <div className="text-[10px] font-bold uppercase text-primary mb-2 flex items-center justify-between pb-1.5 border-b border-border">
                <div className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5" />
                  <span>Vicepresidencias</span>
                </div>
                {selectedVpIds.length > 0 && (
                  <button onClick={() => setSelectedVpIds([])} className="text-[9px] text-primary hover:underline font-bold">
                    Limpiar
                  </button>
                )}
              </div>
              <div className="space-y-1.5 overflow-y-auto flex-1 pr-0.5 scrollbar-thin">
                {vps.map(vp => {
                  const isSelected = selectedVpIds.includes(vp.id);
                  return (
                    <button
                      key={vp.id}
                      onClick={() => toggleSelection(setSelectedVpIds, selectedVpIds, vp.id)}
                      className={cn(
                        "w-full text-left p-2.5 rounded-lg border transition-all flex flex-col gap-1 cursor-pointer text-xs",
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary font-bold shadow-xs"
                          : "bg-card hover:bg-slate-100 dark:hover:bg-slate-800 text-foreground border-border font-medium"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold truncate">{vp.nombre}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
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

        {/* NIVEL 2: DIRECCIONES REGIONALES (Muestra Direcciones de TODAS las VPs seleccionadas, agrupadas con Badges) */}
        <AnimatePresence>
          {selectedVpIds.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-56 shrink-0 bg-slate-50 dark:bg-slate-900/80 p-3 rounded-xl border border-border flex flex-col shadow-2xs"
            >
              <div className="text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400 mb-2 flex items-center justify-between pb-1.5 border-b border-border">
                <div className="flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Direcciones ({directores.length})</span>
                </div>
                {selectedDirIds.length > 0 && (
                  <button onClick={() => setSelectedDirIds([])} className="text-[9px] text-indigo-600 hover:underline font-bold">
                    Limpiar
                  </button>
                )}
              </div>
              <div className="space-y-1.5 overflow-y-auto flex-1 pr-0.5 scrollbar-thin">
                {directores.map(dir => {
                  const isSelected = selectedDirIds.includes(dir.id);
                  const parentVp = vps.find(v => v.id === dir.parentId);
                  return (
                    <button
                      key={dir.id}
                      onClick={() => toggleSelection(setSelectedDirIds, selectedDirIds, dir.id)}
                      className={cn(
                        "w-full text-left p-2.5 rounded-lg border transition-all flex flex-col gap-1 cursor-pointer text-xs",
                        isSelected
                          ? "bg-indigo-600 text-white border-indigo-700 font-bold shadow-xs"
                          : "bg-card hover:bg-slate-100 dark:hover:bg-slate-800 text-foreground border-border font-medium"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold truncate">{dir.nombre}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                      </div>
                      <div className="flex items-center justify-between gap-1">
                        <span className={cn("text-[9px] px-1 py-0.2 rounded font-bold uppercase", isSelected ? "bg-indigo-700 text-white" : "bg-muted text-muted-foreground")}>
                          {parentVp?.nombre?.split(' ')[1] || dir.parentId}
                        </span>
                        <span className={cn("text-[10px]", isSelected ? "text-indigo-100" : "text-muted-foreground")}>
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
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-56 shrink-0 bg-slate-50 dark:bg-slate-900/80 p-3 rounded-xl border border-border flex flex-col shadow-2xs"
            >
              <div className="text-[10px] font-bold uppercase text-sky-600 dark:text-sky-400 mb-2 flex items-center justify-between pb-1.5 border-b border-border">
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  <span>Gerencias ({gerentes.length})</span>
                </div>
                {selectedGerIds.length > 0 && (
                  <button onClick={() => setSelectedGerIds([])} className="text-[9px] text-sky-600 hover:underline font-bold">
                    Limpiar
                  </button>
                )}
              </div>
              <div className="space-y-1.5 overflow-y-auto flex-1 pr-0.5 scrollbar-thin">
                {gerentes.map(ger => {
                  const isSelected = selectedGerIds.includes(ger.id);
                  const parentDir = directores.find(d => d.id === ger.parentId);
                  return (
                    <button
                      key={ger.id}
                      onClick={() => toggleSelection(setSelectedGerIds, selectedGerIds, ger.id)}
                      className={cn(
                        "w-full text-left p-2.5 rounded-lg border transition-all flex flex-col gap-1 cursor-pointer text-xs",
                        isSelected
                          ? "bg-sky-600 text-white border-sky-700 font-bold shadow-xs"
                          : "bg-card hover:bg-slate-100 dark:hover:bg-slate-800 text-foreground border-border font-medium"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold truncate">{ger.nombre}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                      </div>
                      <div className="flex items-center justify-between gap-1">
                        <span className={cn("text-[9px] px-1 rounded font-bold uppercase truncate max-w-[80px]", isSelected ? "bg-sky-700 text-white" : "bg-muted text-muted-foreground")}>
                          {parentDir?.nombre?.split(' ')[1] || ger.parentId}
                        </span>
                        <span className={cn("text-[10px]", isSelected ? "text-sky-100" : "text-muted-foreground")}>
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
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-60 shrink-0 bg-slate-50 dark:bg-slate-900/80 p-3 rounded-xl border border-border flex flex-col shadow-2xs"
            >
              <div className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 mb-2 flex items-center justify-between pb-1.5 border-b border-border">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>Vendedores ({vendedores.length})</span>
                </div>
                {selectedRepIds.length > 0 && (
                  <button onClick={() => setSelectedRepIds([])} className="text-[9px] text-emerald-600 hover:underline font-bold">
                    Limpiar
                  </button>
                )}
              </div>
              <div className="space-y-1.5 overflow-y-auto flex-1 pr-0.5 scrollbar-thin">
                {vendedores.map(rep => {
                  const isSelected = selectedRepIds.includes(rep.id);
                  return (
                    <button
                      key={rep.id}
                      onClick={() => toggleSelection(setSelectedRepIds, selectedRepIds, rep.id)}
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
                        {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
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

        {/* COLUMNA DERECHA PERMANENTE: TABLA DE CARTERA DE CLIENTES FILTRADA */}
        <div className="w-[450px] min-w-[380px] shrink-0 bg-slate-50 dark:bg-slate-900/80 p-3.5 rounded-xl border border-border flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-border">
              <div>
                <div className="text-xs font-black text-foreground flex items-center gap-2">
                  <span>Cartera Filtrada ({activeContext.cartera.length})</span>
                  <Badge variant="outline" className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                    {activeContext.titulo}
                  </Badge>
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  Actualización dinámica según los nodos seleccionados arriba
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

            {/* Tabla de Clientes */}
            <div className="overflow-y-auto max-h-[300px] scrollbar-thin">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border text-[10px] font-bold text-muted-foreground bg-slate-100 dark:bg-slate-850 sticky top-0 z-10">
                    <th className="py-1.5 px-2">Cliente ID</th>
                    <th className="py-1.5 px-2 text-right font-bold">Volumen</th>
                    <th className="py-1.5 px-2 text-center font-bold">Onboarding</th>
                    <th className="py-1.5 px-2 text-center font-bold">Estatus</th>
                    <th className="py-1.5 px-2 text-right font-bold">% Adopción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {activeContext.cartera.slice(0, 50).map(cli => (
                    <tr key={cli.id} className="hover:bg-card transition-colors">
                      <td className="py-1.5 px-2 font-bold font-mono text-foreground flex items-center gap-1">
                        {cli.esTopPareto && (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" title="Cuenta Top Pareto (20% volumen)" />
                        )}
                        <span>{cli.id}</span>
                      </td>
                      <td className="py-1.5 px-2 text-right font-bold tabular-nums text-foreground">
                        {formatNumber(cli.volumenMes)} {cli.unidad}
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
                      <td className="py-1.5 px-2 text-center">
                        {cli.esActivo ? (
                          <Badge variant="success" className="text-[9px] py-0 px-1 font-bold">Activo</Badge>
                        ) : cli.esRevertido ? (
                          <Badge variant="warning" className="text-[9px] py-0 px-1 font-bold">Revertido</Badge>
                        ) : (
                          <Badge variant="outline" className="text-[9px] py-0 px-1 text-muted-foreground">Inactivo</Badge>
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
              </table>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}