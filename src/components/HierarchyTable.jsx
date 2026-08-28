import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BreadcrumbNav } from './BreadcrumbNav';
import { BulletGraph } from './BulletGraph';
import { ChevronRight, ArrowUpDown, Download, CheckCircle2, XCircle, PhoneCall, Layers, UserCheck, ShieldCheck } from 'lucide-react';
import { formatNumber, formatPct, cn } from '@/lib/utils';

export function HierarchyTable({
  nivelActivo,
  nodosJerarquia = [],
  breadcrumbs = [],
  onSelectNodo,
  onBreadcrumbClick,
  onOpenActionDrawer,
  carteraVendedor = null,
  onExportCsv
}) {
  const [ordenCampo, setOrdenCampo] = useState('adopcion');
  const [ordenAsc, setOrdenAsc] = useState(false);

  const toggleSort = (campo) => {
    if (ordenCampo === campo) {
      setOrdenAsc(!ordenAsc);
    } else {
      setOrdenCampo(campo);
      setOrdenAsc(false);
    }
  };

  const nodosOrdenados = [...nodosJerarquia].sort((a, b) => {
    let valA = 0;
    let valB = 0;

    if (ordenCampo === 'nombre') {
      return ordenAsc ? a.nombre.localeCompare(b.nombre) : b.nombre.localeCompare(a.nombre);
    } else if (ordenCampo === 'adopcion') {
      valA = a.metricas?.pedidos?.pctAdopcion || 0;
      valB = b.metricas?.pedidos?.pctAdopcion || 0;
    } else if (ordenCampo === 'pedidos') {
      valA = a.metricas?.pedidos?.totales || 0;
      valB = b.metricas?.pedidos?.totales || 0;
    } else if (ordenCampo === 'onboarding') {
      valA = a.metricas?.clientes?.pctOnboarding || 0;
      valB = b.metricas?.clientes?.pctOnboarding || 0;
    }

    return ordenAsc ? valA - valB : valB - valA;
  });

  const nivelBadgeLabel = carteraVendedor
    ? "Nivel 4: Cartera de Clientes"
    : nivelActivo === 'nacional'
    ? "Nivel 1: Vicepresidencias"
    : nivelActivo === 'vp'
    ? "Nivel 2: Direcciones Regionales"
    : nivelActivo === 'director'
    ? "Nivel 3: Gerencias de Plaza"
    : "Nivel 4: Fuerza de Ventas";

  return (
    <Card className="p-5 bg-card border border-border shadow-xs rounded-xl flex flex-col relative overflow-hidden select-none">
      {/* Barra superior */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-700 via-indigo-500 to-sky-400" />

      {/* Encabezado con Nivel y Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary font-bold text-xs shrink-0">
            {nivelBadgeLabel}
          </div>
          <div className="h-4 w-[1px] bg-border hidden sm:block" />
          <BreadcrumbNav items={breadcrumbs} onSelectLevel={onBreadcrumbClick} />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onExportCsv}
            className="gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground shadow-xxs"
          >
            <Download className="w-3.5 h-3.5 text-primary" />
            <span>Exportar Vista CSV</span>
          </Button>
        </div>
      </div>

      {/* ÁREA DE TABLA ANIMADA CON FRAMER MOTION */}
      <AnimatePresence mode="wait">
        {carteraVendedor ? (
          <motion.div
            key="cartera-vendedor"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="mt-3.5 overflow-x-auto"
          >
            <div className="text-xs font-bold text-foreground mb-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Cartera de Clientes ({carteraVendedor.length} cuentas)</span>
              </div>
              <span className="text-[11px] text-muted-foreground font-medium">
                Prioridad por volumen comercial
              </span>
            </div>

            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border text-[11px] font-bold text-muted-foreground bg-slate-100/70 dark:bg-slate-900/60">
                  <th className="py-2.5 px-3">Cliente ID</th>
                  <th className="py-2.5 px-3">Línea</th>
                  <th className="py-2.5 px-3 text-right">Volumen Mensual</th>
                  <th className="py-2.5 px-3 text-center">Onboarding</th>
                  <th className="py-2.5 px-3 text-center">Uso Digital</th>
                  <th className="py-2.5 px-3 text-right">Pedidos (Dig / Tot)</th>
                  <th className="py-2.5 px-3 text-right">% Adopción</th>
                  <th className="py-2.5 px-3 text-right">FTTV</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {carteraVendedor.map(cli => (
                  <tr key={cli.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors">
                    <td className="py-2.5 px-3 font-bold font-mono text-foreground flex items-center gap-1.5">
                      {cli.esTopPareto && (
                        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" title="Cuenta Top Pareto (20% volumen)" />
                      )}
                      <span>{cli.id}</span>
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground font-medium">{cli.lineaLabel}</td>
                    <td className="py-2.5 px-3 text-right font-bold tabular-nums text-foreground">
                      {formatNumber(cli.volumenMes)} {cli.unidad}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {cli.estaIncorporado ? (
                        <Badge variant="success" className="gap-1 font-bold">
                          <CheckCircle2 className="w-3 h-3" /> Onboarded
                        </Badge>
                      ) : (
                        <Badge variant="danger" className="gap-1 font-bold">
                          <XCircle className="w-3 h-3" /> Sin cuenta
                        </Badge>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {cli.esActivo ? (
                        <Badge variant="success" className="font-bold">Activo</Badge>
                      ) : cli.esRevertido ? (
                        <Badge variant="warning" className="gap-1 font-bold">
                          <PhoneCall className="w-3 h-3" /> Revertido
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">Inactivo</Badge>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-muted-foreground">
                      <span className="font-bold text-foreground">{cli.pedidosDigitales}</span> / {cli.pedidosTotales}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold tabular-nums">
                      <span className={cn(
                        cli.pctAdopcionPedidos >= 75 ? "text-emerald-600 dark:text-emerald-400" :
                        cli.pctAdopcionPedidos >= 40 ? "text-amber-600 dark:text-amber-400" :
                        "text-rose-600 dark:text-rose-400"
                      )}>
                        {cli.pctAdopcionPedidos.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-muted-foreground font-semibold">
                      {cli.fttv != null ? `${cli.fttv} d` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        ) : (
          <motion.div
            key={nivelActivo}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="mt-3.5 overflow-x-auto"
          >
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border text-[11px] font-bold text-muted-foreground bg-slate-100/70 dark:bg-slate-900/60">
                  <th className="py-2.5 px-3 cursor-pointer select-none" onClick={() => toggleSort('nombre')}>
                    <div className="flex items-center gap-1">
                      <span>Nombre / Entidad</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-2.5 px-3 text-right cursor-pointer select-none" onClick={() => toggleSort('pedidos')}>
                    <div className="flex items-center justify-end gap-1">
                      <span>Pedidos (Dig / Tot)</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-2.5 px-3 min-w-[190px] cursor-pointer select-none" onClick={() => toggleSort('adopcion')}>
                    <div className="flex items-center gap-1">
                      <span>% Adopción (Objetivo 75%)</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-2.5 px-3 text-center cursor-pointer select-none" onClick={() => toggleSort('onboarding')}>
                    <div className="flex items-center justify-center gap-1">
                      <span>Onboarding de Clientes</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-2.5 px-3 text-center">
                    <span>Clientes Activos</span>
                  </th>
                  <th className="py-2.5 px-3 text-center">Plan Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {nodosOrdenados.map(nodo => {
                  const p = nodo.metricas?.pedidos;
                  const c = nodo.metricas?.clientes;

                  return (
                    <tr
                      key={nodo.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors group cursor-pointer"
                      onClick={() => onSelectNodo(nodo)}
                    >
                      {/* Nombre y Tipo */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-[11px] shadow-2xs border border-primary/20">
                            {nodo.tipo.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                              <span>{nodo.nombre}</span>
                              {nodo.plaza && (
                                <Badge variant="outline" className="text-[9px] py-0 px-1 font-semibold text-muted-foreground">
                                  {nodo.plaza}
                                </Badge>
                              )}
                            </div>
                            <div className="text-[10px] text-muted-foreground font-medium">
                              {nodo.tipo} · {c?.asignados} clientes en cartera
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Pedidos */}
                      <td className="py-3 px-3 text-right tabular-nums">
                        <div className="font-bold text-foreground">
                          {formatNumber(p?.digitales)}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          de {formatNumber(p?.totales)} tot.
                        </div>
                      </td>

                      {/* Bullet Graph Stephen Few (Con Objetivo 75%) */}
                      <td className="py-3 px-3">
                        <BulletGraph valor={p?.pctAdopcion || 0} meta={75.0} />
                      </td>

                      {/* Onboarding de Clientes */}
                      <td className="py-3 px-3 text-center tabular-nums">
                        <div className="font-bold text-foreground">
                          {formatPct(c?.pctOnboarding)}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {c?.incorporados} / {c?.asignados} con cuenta
                        </div>
                      </td>

                      {/* Clientes Activos */}
                      <td className="py-3 px-3 text-center tabular-nums">
                        <div className="font-bold text-foreground">
                          {formatNumber(c?.activos)}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          ({formatPct(c?.pctActivacion)} activ.)
                        </div>
                      </td>

                      {/* Botón Acción / Drilldown */}
                      <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="dense"
                            size="compact"
                            onClick={() => onOpenActionDrawer(nodo)}
                            className="text-[10px] font-bold text-primary hover:bg-primary hover:text-white transition-all"
                            title="Abrir lista prioritaria semanal"
                          >
                            Plan Acción
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onSelectNodo(nodo)}
                            className="h-6 w-6 text-muted-foreground hover:text-foreground"
                            title="Bajar al siguiente nivel"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}