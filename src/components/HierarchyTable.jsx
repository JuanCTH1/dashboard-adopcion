import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BulletGraph } from './BulletGraph';
import {
  ChevronRight,
  Download,
  CheckCircle2,
  XCircle,
  PhoneCall,
  Layers,
  User,
  Users,
  Building,
  Briefcase
} from 'lucide-react';
import { formatNumber, formatPct, cn } from '@/lib/utils';
import { adopcionRepo } from '@/domain/adopcionRepo';

export function HierarchyTable({
  filtrosCompuestos,
  onOpenActionDrawer,
  onExportCsv
}) {
  // Estados de selección multinivel persistente (Tree Drill-Down)
  const [selectedVpId, setSelectedVpId] = useState('vp-1');
  const [selectedDirId, setSelectedDirId] = useState('dir-1');
  const [selectedGerId, setSelectedGerId] = useState('ger-1');
  const [selectedRepId, setSelectedRepId] = useState('rep-1');

  // Obtener datos dinámicos de cada nivel según filtros
  const vps = useMemo(() => {
    return adopcionRepo.getJerarquia('nacional', null, filtrosCompuestos);
  }, [filtrosCompuestos]);

  const directores = useMemo(() => {
    return adopcionRepo.getJerarquia('vp', selectedVpId, filtrosCompuestos);
  }, [selectedVpId, filtrosCompuestos]);

  const gerentes = useMemo(() => {
    return adopcionRepo.getJerarquia('director', selectedDirId, filtrosCompuestos);
  }, [selectedDirId, filtrosCompuestos]);

  const vendedores = useMemo(() => {
    return adopcionRepo.getJerarquia('gerente', selectedGerId, filtrosCompuestos);
  }, [selectedGerId, filtrosCompuestos]);

  const carteraVendedor = useMemo(() => {
    if (!selectedRepId) return [];
    return adopcionRepo.getCartera(selectedRepId, filtrosCompuestos);
  }, [selectedRepId, filtrosCompuestos]);

  const currentRepObj = useMemo(() => {
    return vendedores.find(v => v.id === selectedRepId) || vendedores[0];
  }, [vendedores, selectedRepId]);

  return (
    <Card className="p-5 bg-card border border-border shadow-xs rounded-xl flex flex-col relative overflow-hidden select-none">
      {/* Barra superior de acento */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-700 via-indigo-500 to-sky-400" />

      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-border">
        <div>
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-primary" />
            <span>Navegación en Árbol Jerárquico (Drill-Down Persistente)</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <span className="text-primary font-bold">VP</span>
            <ChevronRight className="w-3 h-3 text-muted-foreground" />
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">Dirección</span>
            <ChevronRight className="w-3 h-3 text-muted-foreground" />
            <span className="text-sky-600 dark:text-sky-400 font-bold">Gerencia</span>
            <ChevronRight className="w-3 h-3 text-muted-foreground" />
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">Vendedor & Cartera</span>
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

      {/* EXPLORADOR DE ÁRBOL EN COLUMNAS CONECTADAS (Miller Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 mt-4 items-start">
        {/* COLUMNA 1: Vicepresidencias & Direcciones (3 de 12 Cols) */}
        <div className="lg:col-span-3 space-y-3 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-border">
          {/* Nivel 1: Vicepresidencias */}
          <div>
            <div className="text-[10px] font-bold uppercase text-muted-foreground mb-1.5 flex items-center gap-1">
              <Building className="w-3 h-3 text-primary" />
              <span>Vicepresidencia</span>
            </div>
            <div className="space-y-1">
              {vps.map(vp => {
                const isSelected = selectedVpId === vp.id;
                return (
                  <button
                    key={vp.id}
                    onClick={() => {
                      setSelectedVpId(vp.id);
                      setSelectedDirId(null);
                      setSelectedGerId(null);
                      setSelectedRepId(null);
                    }}
                    className={cn(
                      "w-full text-left p-2 rounded-lg border transition-all flex items-center justify-between cursor-pointer text-xs",
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary font-bold shadow-xs"
                        : "bg-card hover:bg-slate-100 dark:hover:bg-slate-800 text-foreground border-border font-medium"
                    )}
                  >
                    <div className="truncate">
                      <div>{vp.nombre}</div>
                      <div className={cn("text-[10px]", isSelected ? "text-white/80" : "text-muted-foreground")}>
                        {formatPct(vp.metricas.pedidos.pctAdopcion)} adopción · {vp.metricas.clientes.asignados} clientes
                      </div>
                    </div>
                    <ChevronRight className={cn("w-3.5 h-3.5 shrink-0", isSelected ? "text-white" : "text-muted-foreground")} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Nivel 2: Direcciones del VP seleccionado */}
          <div className="pt-2 border-t border-border/80">
            <div className="text-[10px] font-bold uppercase text-muted-foreground mb-1.5 flex items-center gap-1">
              <Briefcase className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
              <span>Direcciones Regionales</span>
            </div>
            <div className="space-y-1">
              {directores.map(dir => {
                const isSelected = selectedDirId === dir.id;
                return (
                  <button
                    key={dir.id}
                    onClick={() => {
                      setSelectedDirId(dir.id);
                      setSelectedGerId(null);
                      setSelectedRepId(null);
                    }}
                    className={cn(
                      "w-full text-left p-2 rounded-lg border transition-all flex items-center justify-between cursor-pointer text-xs",
                      isSelected
                        ? "bg-indigo-600 text-white border-indigo-700 font-bold shadow-xs"
                        : "bg-card hover:bg-slate-100 dark:hover:bg-slate-800 text-foreground border-border font-medium"
                    )}
                  >
                    <div className="truncate">
                      <div>{dir.nombre}</div>
                      <div className={cn("text-[10px]", isSelected ? "text-indigo-100" : "text-muted-foreground")}>
                        {formatPct(dir.metricas.pedidos.pctAdopcion)} adopción · {dir.metricas.clientes.asignados} clientes
                      </div>
                    </div>
                    <ChevronRight className={cn("w-3.5 h-3.5 shrink-0", isSelected ? "text-white" : "text-muted-foreground")} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* COLUMNA 2: Gerencias y Vendedores (3 de 12 Cols) */}
        <div className="lg:col-span-3 space-y-3 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-border">
          {/* Nivel 3: Gerencias de Plaza */}
          <div>
            <div className="text-[10px] font-bold uppercase text-muted-foreground mb-1.5 flex items-center gap-1">
              <Users className="w-3 h-3 text-sky-600 dark:text-sky-400" />
              <span>Gerencias</span>
            </div>
            <div className="space-y-1 max-h-40 overflow-y-auto pr-0.5 scrollbar-thin">
              {gerentes.map(ger => {
                const isSelected = selectedGerId === ger.id;
                return (
                  <button
                    key={ger.id}
                    onClick={() => {
                      setSelectedGerId(ger.id);
                      setSelectedRepId(null);
                    }}
                    className={cn(
                      "w-full text-left p-2 rounded-lg border transition-all flex items-center justify-between cursor-pointer text-xs",
                      isSelected
                        ? "bg-sky-600 text-white border-sky-700 font-bold shadow-xs"
                        : "bg-card hover:bg-slate-100 dark:hover:bg-slate-800 text-foreground border-border font-medium"
                    )}
                  >
                    <div className="truncate">
                      <div>{ger.nombre}</div>
                      <div className={cn("text-[10px]", isSelected ? "text-sky-100" : "text-muted-foreground")}>
                        {formatPct(ger.metricas.pedidos.pctAdopcion)} adopción
                      </div>
                    </div>
                    <ChevronRight className={cn("w-3.5 h-3.5 shrink-0", isSelected ? "text-white" : "text-muted-foreground")} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Nivel 4: Vendedores */}
          <div className="pt-2 border-t border-border/80">
            <div className="text-[10px] font-bold uppercase text-muted-foreground mb-1.5 flex items-center gap-1">
              <User className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>Vendedores ({vendedores.length})</span>
            </div>
            <div className="space-y-1 max-h-56 overflow-y-auto pr-0.5 scrollbar-thin">
              {vendedores.map(rep => {
                const isSelected = selectedRepId === rep.id;
                return (
                  <button
                    key={rep.id}
                    onClick={() => setSelectedRepId(rep.id)}
                    className={cn(
                      "w-full text-left p-2 rounded-lg border transition-all flex items-center justify-between cursor-pointer text-xs",
                      isSelected
                        ? "bg-emerald-600 text-white border-emerald-700 font-bold shadow-xs"
                        : "bg-card hover:bg-slate-100 dark:hover:bg-slate-800 text-foreground border-border font-medium"
                    )}
                  >
                    <div className="truncate">
                      <div className="flex items-center gap-1">
                        <span>{rep.nombre}</span>
                        {rep.plaza && (
                          <span className={cn("text-[9px] px-1 rounded", isSelected ? "bg-emerald-700 text-white" : "bg-muted text-muted-foreground")}>
                            {rep.plaza}
                          </span>
                        )}
                      </div>
                      <div className={cn("text-[10px]", isSelected ? "text-emerald-100" : "text-muted-foreground")}>
                        {formatPct(rep.metricas.pedidos.pctAdopcion)} adopción · {rep.metricas.clientes.asignados} clientes
                      </div>
                    </div>
                    <ChevronRight className={cn("w-3.5 h-3.5 shrink-0", isSelected ? "text-white" : "text-muted-foreground")} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* COLUMNA 3: DETALLE DE CARTERA DEL VENDEDOR SELECCIONADO (6 de 12 Cols) */}
        <div className="lg:col-span-6 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-border flex flex-col min-h-[380px]">
          {/* Header del Vendedor */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/80">
            <div>
              <div className="text-xs font-black text-foreground flex items-center gap-2">
                <span>{currentRepObj?.nombre || 'Vendedor'}</span>
                <Badge variant="outline" className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                  {carteraVendedor.length} Clientes Asignados
                </Badge>
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                Plaza {currentRepObj?.plaza || 'Nacional'} · Adopción: <b>{formatPct(currentRepObj?.metricas?.pedidos?.pctAdopcion || 0)}</b> (Objetivo 75%)
              </div>
            </div>

            <Button
              variant="default"
              size="sm"
              onClick={() => onOpenActionDrawer(currentRepObj)}
              className="text-xs font-bold gap-1 shadow-xs"
            >
              Plan Acción
            </Button>
          </div>

          {/* Tabla de Clientes del Vendedor */}
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border text-[10px] font-bold text-muted-foreground bg-slate-100 dark:bg-slate-850">
                  <th className="py-2 px-2.5">Cliente ID</th>
                  <th className="py-2 px-2 text-right">Volumen</th>
                  <th className="py-2 px-2 text-center">Onboarding</th>
                  <th className="py-2 px-2 text-center">Estatus</th>
                  <th className="py-2 px-2 text-right">Pedidos Dig.</th>
                  <th className="py-2 px-2 text-right">% Adopción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {carteraVendedor.map(cli => (
                  <tr key={cli.id} className="hover:bg-card transition-colors">
                    <td className="py-2 px-2.5 font-bold font-mono text-foreground flex items-center gap-1.5">
                      {cli.esTopPareto && (
                        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" title="Cuenta Top Pareto (20% volumen)" />
                      )}
                      <span>{cli.id}</span>
                    </td>
                    <td className="py-2 px-2 text-right font-bold tabular-nums text-foreground">
                      {formatNumber(cli.volumenMes)} {cli.unidad}
                    </td>
                    <td className="py-2 px-2 text-center">
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
                    <td className="py-2 px-2 text-center">
                      {cli.esActivo ? (
                        <Badge variant="success" className="text-[9px] py-0 px-1 font-bold">Activo</Badge>
                      ) : cli.esRevertido ? (
                        <Badge variant="warning" className="text-[9px] py-0 px-1 font-bold">Revertido</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[9px] py-0 px-1 text-muted-foreground">Inactivo</Badge>
                      )}
                    </td>
                    <td className="py-2 px-2 text-right tabular-nums text-muted-foreground">
                      <span className="font-bold text-foreground">{cli.pedidosDigitales}</span> / {cli.pedidosTotales}
                    </td>
                    <td className="py-2 px-2 text-right font-bold tabular-nums">
                      <span className={cn(
                        cli.pctAdopcionPedidos >= 75 ? "text-emerald-600 dark:text-emerald-400" :
                        cli.pctAdopcionPedidos >= 40 ? "text-amber-600 dark:text-amber-400" :
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
    </Card>
  );
}