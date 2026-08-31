import React, { useState, useMemo } from 'react';
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
  // Estados de selección horizontal de izquierda a derecha (Miller Columns)
  const [selectedVpId, setSelectedVpId] = useState('vp-1');
  const [selectedDirId, setSelectedDirId] = useState('dir-1');
  const [selectedGerId, setSelectedGerId] = useState('ger-1');
  const [selectedRepId, setSelectedRepId] = useState('rep-1');

  // Obtener datos dinámicos de cada nivel
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
          <div className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-primary" />
            <span>Navegación Horizontal Multinivel (Drill-Down de Izquierda a Derecha)</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground flex-wrap">
            <span className="text-primary font-bold">1. Vicepresidencia</span>
            <ChevronRight className="w-3 h-3 text-muted-foreground" />
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">2. Dirección</span>
            <ChevronRight className="w-3 h-3 text-muted-foreground" />
            <span className="text-sky-600 dark:text-sky-400 font-bold">3. Gerencia</span>
            <ChevronRight className="w-3 h-3 text-muted-foreground" />
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">4. Vendedor</span>
            <ChevronRight className="w-3 h-3 text-muted-foreground" />
            <span className="text-amber-600 dark:text-amber-400 font-bold">5. Cartera de Clientes</span>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onExportCsv}
          className="gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground shadow-xxs self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-primary" />
          <span>Exportar Vista CSV</span>
        </Button>
      </div>

      {/* 5 COLUMNAS HORIZONTALES CON SCROLL FLUIDO */}
      <div className="flex gap-3 mt-4 overflow-x-auto pb-2 scrollbar-thin items-stretch min-h-[380px]">
        {/* COLUMNA 1: Vicepresidencias */}
        <div className="w-56 shrink-0 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-border flex flex-col">
          <div className="text-[12px] font-bold uppercase text-primary mb-2 flex items-center gap-1.5 pb-2 border-b border-border">
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
                    setSelectedDirId(null);
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
                  <div className={cn("text-[12px] flex items-center justify-between", isSelected ? "text-white/90" : "text-muted-foreground")}>
                    <span>{formatPct(vp.metricas.pedidos.pctAdopcion)} adopción</span>
                    <span>{vp.metricas.clientes.asignados} clientes</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* COLUMNA 2: Direcciones Regionales */}
        <div className="w-60 shrink-0 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-border flex flex-col">
          <div className="text-[12px] font-bold uppercase text-indigo-600 dark:text-indigo-400 mb-2 flex items-center gap-1.5 pb-2 border-b border-border">
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
                    setSelectedGerId(null);
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
                  <div className={cn("text-[12px] flex items-center justify-between", isSelected ? "text-indigo-100" : "text-muted-foreground")}>
                    <span>{formatPct(dir.metricas.pedidos.pctAdopcion)} adopción</span>
                    <span>{dir.metricas.clientes.asignados} clientes</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* COLUMNA 3: Gerencias de Plaza */}
        <div className="w-60 shrink-0 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-border flex flex-col">
          <div className="text-[12px] font-bold uppercase text-sky-600 dark:text-sky-400 mb-2 flex items-center gap-1.5 pb-2 border-b border-border">
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
                    setSelectedRepId(null);
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
                  <div className={cn("text-[12px] flex items-center justify-between", isSelected ? "text-sky-100" : "text-muted-foreground")}>
                    <span>{formatPct(ger.metricas.pedidos.pctAdopcion)} adopción</span>
                    <span>{ger.metricas.clientes.asignados} clientes</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* COLUMNA 4: Fuerza de Ventas (Vendedores) */}
        <div className="w-64 shrink-0 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-border flex flex-col">
          <div className="text-[12px] font-bold uppercase text-emerald-600 dark:text-emerald-400 mb-2 flex items-center gap-1.5 pb-2 border-b border-border">
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
                        <span className={cn("text-[12px] px-1 rounded font-semibold", isSelected ? "bg-emerald-700 text-white" : "bg-muted text-muted-foreground")}>
                          {rep.plaza}
                        </span>
                      )}
                    </div>
                    <ChevronRight className={cn("w-3.5 h-3.5 shrink-0", isSelected ? "text-white" : "text-muted-foreground")} />
                  </div>
                  <div className={cn("text-[12px] flex items-center justify-between", isSelected ? "text-emerald-100" : "text-muted-foreground")}>
                    <span>{formatPct(rep.metricas.pedidos.pctAdopcion)} adopción</span>
                    <span>{rep.metricas.clientes.asignados} clientes</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* COLUMNA 5: Detalle de Cartera de Clientes del Vendedor */}
        <div className="w-96 min-w-[360px] flex-1 shrink-0 bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-border flex flex-col">
          {/* Cabecera del Vendedor Seleccionado */}
          <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-border">
            <div>
              <div className="text-xs font-black text-foreground flex items-center gap-2">
                <span>{currentRepObj?.nombre || 'Vendedor'}</span>
                <Badge variant="outline" className="text-[12px] font-bold text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                  {carteraVendedor.length} Clientes Asignados
                </Badge>
              </div>
              <div className="text-[12px] text-muted-foreground mt-0.5">
                Plaza {currentRepObj?.plaza || 'Nacional'} · Adopción: <b>{formatPct(currentRepObj?.metricas?.pedidos?.pctAdopcion || 0)}</b> (Objetivo 90%)
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

          {/* Tabla de Clientes */}
          <div className="flex-1 overflow-y-auto max-h-[300px] scrollbar-thin">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border text-[12px] font-bold text-muted-foreground bg-slate-100 dark:bg-slate-800 sticky top-0 z-10">
                  <th className="py-1.5 px-2">Cliente</th>
                  <th className="py-1.5 px-2 text-right">Volumen</th>
                  <th className="py-1.5 px-2 text-center">Onboarding</th>
                  <th className="py-1.5 px-2 text-center">Estatus</th>
                  <th className="py-1.5 px-2 text-right">% Adopción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {carteraVendedor.map(cli => (
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
                        <Badge variant="success" className="text-[12px] py-0 px-1 font-bold">
                          ✔ Onboarded
                        </Badge>
                      ) : (
                        <Badge variant="danger" className="text-[12px] py-0 px-1 font-bold">
                          Sin cuenta
                        </Badge>
                      )}
                    </td>
                    <td className="py-1.5 px-2 text-center">
                      {cli.esActivo ? (
                        <Badge variant="success" className="text-[12px] py-0 px-1 font-bold">Activo</Badge>
                      ) : cli.esRevertido ? (
                        <Badge variant="warning" className="text-[12px] py-0 px-1 font-bold">Revertido</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[12px] py-0 px-1 text-muted-foreground">Inactivo</Badge>
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
    </Card>
  );
}
