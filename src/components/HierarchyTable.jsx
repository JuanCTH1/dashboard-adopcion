import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BreadcrumbNav } from './BreadcrumbNav';
import { BulletGraph } from './BulletGraph';
import { ChevronRight, ArrowUpDown, Download, UserCheck, PhoneCall, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { formatNumber, formatPct, cn } from '@/lib/utils';
import { LENTES } from '@/domain/definiciones';

export function HierarchyTable({
  nivelActivo,
  nodosJerarquia = [],
  breadcrumbs = [],
  onSelectNodo,
  onBreadcrumbClick,
  onOpenActionDrawer,
  carteraVendedor = null,
  activeLens = 'clientes',
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

  // Ordenar nodos
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
    } else if (ordenCampo === 'clientes') {
      valA = a.metricas?.clientes?.asignados || 0;
      valB = b.metricas?.clientes?.asignados || 0;
    } else if (ordenCampo === 'onboarding') {
      valA = a.metricas?.clientes?.pctOnboarding || 0;
      valB = b.metricas?.clientes?.pctOnboarding || 0;
    }

    return ordenAsc ? valA - valB : valB - valA;
  });

  return (
    <Card className="p-4 bg-card border-border/90 shadow-xs flex flex-col">
      {/* Encabezado con Breadcrumbs y Acciones */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-border/80">
        <div>
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
            Navegación Jerárquica Comercial
          </div>
          <BreadcrumbNav items={breadcrumbs} onSelectLevel={onBreadcrumbClick} />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onExportCsv}
            className="gap-1 text-xs text-muted-foreground hover:text-foreground shadow-xxs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </Button>
        </div>
      </div>

      {/* Si estamos a nivel vendedor y se tiene la cartera cargada */}
      {carteraVendedor ? (
        <div className="mt-3 overflow-x-auto">
          <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center justify-between">
            <span>Cartera de Clientes ({carteraVendedor.length} cuentas)</span>
            <span className="text-[11px] text-muted-foreground font-normal">
              Ordenado por volumen potencial
            </span>
          </div>

          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border text-[11px] font-semibold text-muted-foreground bg-slate-50 dark:bg-slate-850">
                <th className="py-2.5 px-3">Cliente ID</th>
                <th className="py-2.5 px-3">Línea</th>
                <th className="py-2.5 px-3 text-right">Volumen Mes</th>
                <th className="py-2.5 px-3 text-center">Onboarding</th>
                <th className="py-2.5 px-3 text-center">Uso Digital</th>
                <th className="py-2.5 px-3 text-right">Pedidos (Dig/Tot)</th>
                <th className="py-2.5 px-3 text-right">% Adopción</th>
                <th className="py-2.5 px-3 text-right">FTTV (Días)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {carteraVendedor.map(cli => (
                <tr key={cli.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3 font-semibold font-mono text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    {cli.esTopPareto && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" title="Cuenta Top Pareto (20%)" />
                    )}
                    <span>{cli.id}</span>
                  </td>
                  <td className="py-2.5 px-3 text-muted-foreground">{cli.lineaLabel}</td>
                  <td className="py-2.5 px-3 text-right font-semibold tabular-nums">
                    {formatNumber(cli.volumenMes)} {cli.unidad}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {cli.estaIncorporado ? (
                      <Badge variant="success" className="gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Onboarded
                      </Badge>
                    ) : (
                      <Badge variant="danger" className="gap-1">
                        <XCircle className="w-3 h-3" /> Sin cuenta
                      </Badge>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {cli.esActivo ? (
                      <Badge variant="success">Activo Digital</Badge>
                    ) : cli.esRevertido ? (
                      <Badge variant="warning" className="gap-1">
                        <PhoneCall className="w-3 h-3" /> Revertido
                      </Badge>
                    ) : (
                      <Badge variant="outline">Inactivo</Badge>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-muted-foreground">
                    <span className="font-semibold text-foreground">{cli.pedidosDigitales}</span> / {cli.pedidosTotales}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span className={cn(
                      "font-bold tabular-nums",
                      cli.pctAdopcionPedidos >= 75 ? "text-emerald-600 dark:text-emerald-400" :
                      cli.pctAdopcionPedidos >= 40 ? "text-amber-600 dark:text-amber-400" :
                      "text-rose-600 dark:text-rose-400"
                    )}>
                      {cli.pctAdopcionPedidos.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums text-muted-foreground">
                    {cli.fttv != null ? `${cli.fttv} d` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Tabla Normal de Jerarquía (VPs, Directores, Gerentes, Vendedores) */
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border text-[11px] font-semibold text-muted-foreground bg-slate-50 dark:bg-slate-850">
                <th className="py-2.5 px-3 cursor-pointer select-none" onClick={() => toggleSort('nombre')}>
                  <div className="flex items-center gap-1">
                    <span>Nombre / Entidad</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-2.5 px-3 text-right cursor-pointer select-none" onClick={() => toggleSort('pedidos')}>
                  <div className="flex items-center justify-end gap-1">
                    <span>Pedidos (Dig/Tot)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-2.5 px-3 min-w-[180px] cursor-pointer select-none" onClick={() => toggleSort('adopcion')}>
                  <div className="flex items-center gap-1">
                    <span>% Adopción Digital (vs Meta 75%)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-2.5 px-3 text-center cursor-pointer select-none" onClick={() => toggleSort('onboarding')}>
                  <div className="flex items-center justify-center gap-1">
                    <span>Onboarding</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-2.5 px-3 text-center">
                  <span>Clientes Activos</span>
                </th>
                <th className="py-2.5 px-3 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {nodosOrdenados.map(nodo => {
                const p = nodo.metricas?.pedidos;
                const c = nodo.metricas?.clientes;
                const isUnderperforming = p?.pctAdopcion < 50;

                return (
                  <tr
                    key={nodo.id}
                    className="hover:bg-slate-50/90 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
                    onClick={() => onSelectNodo(nodo)}
                  >
                    {/* Nombre y tipo */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px]">
                          {nodo.tipo.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                            <span>{nodo.nombre}</span>
                            {nodo.plaza && (
                              <Badge variant="outline" className="text-[9px] py-0 px-1 font-normal">
                                {nodo.plaza}
                              </Badge>
                            )}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {nodo.tipo} · {c?.asignados} clientes asignados
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

                    {/* % Adopción con Stephen Few Bullet Graph */}
                    <td className="py-3 px-3">
                      <BulletGraph valor={p?.pctAdopcion || 0} meta={nodo.metaAdopcion || 75} />
                    </td>

                    {/* Onboarding */}
                    <td className="py-3 px-3 text-center tabular-nums">
                      <div className="font-semibold text-foreground">
                        {formatPct(c?.pctOnboarding)}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {c?.incorporados} / {c?.asignados}
                      </div>
                    </td>

                    {/* Clientes Activos */}
                    <td className="py-3 px-3 text-center tabular-nums">
                      <div className="font-semibold text-foreground">
                        {formatNumber(c?.activos)}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        ({formatPct(c?.pctActivacion)} de onb.)
                      </div>
                    </td>

                    {/* Botón Acción / Drilldown */}
                    <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="dense"
                          size="compact"
                          onClick={() => onOpenActionDrawer(nodo)}
                          className="text-[10px] font-bold text-primary hover:bg-primary/10 hover:border-primary/40"
                          title="Abrir lista de acción semanal"
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
        </div>
      )}
    </Card>
  );
}
