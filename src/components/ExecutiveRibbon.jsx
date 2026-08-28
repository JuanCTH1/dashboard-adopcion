import React from 'react';
import { MetricCard } from './MetricCard';
import { LensSelector } from './LensSelector';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, SlidersHorizontal, ArrowUpRight, Globe, Smartphone, Server } from 'lucide-react';
import { formatNumber, formatPct, cn } from '@/lib/utils';
import { METRIC_DEFINITIONS, LENTES } from '@/domain/definiciones';

export function ExecutiveRibbon({
  metricasGlobales,
  activeLens,
  onLensChange,
  periodoSeleccionado,
  mesesDisponibles,
  onPeriodoChange,
  onOpenSearch,
  onToggleFilters,
  filtrosActivosCount = 0
}) {
  const { actual, deltas, sparklineAdopcion, sparklineVolumen } = metricasGlobales;
  const { clientes, pedidos, volumen } = actual;

  // Determinar métrica principal según el lente activo
  let valorKpiPrincipal = formatPct(pedidos.pctAdopcion);
  let deltaKpiPrincipal = deltas.pedidosMoM;
  let tituloKpiPrincipal = '% Adopción Digital';
  let subKpiPrincipal = `${formatNumber(pedidos.digitales)} de ${formatNumber(pedidos.totales)} pedidos totales`;
  let sparklineKpi = sparklineAdopcion;

  if (activeLens === LENTES.CLIENTES) {
    valorKpiPrincipal = formatPct(clientes.pctAdopcion);
    deltaKpiPrincipal = deltas.clientesMoM;
    tituloKpiPrincipal = '% Penetración de Clientes';
    subKpiPrincipal = `${formatNumber(clientes.activos)} de ${formatNumber(clientes.asignados)} clientes activos`;
  } else if (activeLens === LENTES.VOLUMEN && volumen.compatible) {
    valorKpiPrincipal = formatPct(volumen.pctAdopcion);
    deltaKpiPrincipal = deltas.volumenMoM;
    tituloKpiPrincipal = '% Volumen Digital';
    subKpiPrincipal = `${formatNumber(volumen.digital)} de ${formatNumber(volumen.total)} ${volumen.unidad}`;
    sparklineKpi = sparklineVolumen;
  }

  return (
    <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border/80 pb-3.5 pt-2 px-4 sm:px-6 shadow-xxs transition-all">
      {/* Barra de Control Superior */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Adopción Digital CX
            </span>
          </div>

          <div className="h-4 w-[1px] bg-border hidden sm:block" />

          {/* Selector de Periodo */}
          <select
            value={periodoSeleccionado}
            onChange={(e) => onPeriodoChange(e.target.value)}
            className="text-xs font-semibold bg-card border border-border rounded-lg px-2.5 py-1 text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer shadow-xxs"
          >
            {mesesDisponibles.map(m => (
              <option key={m.key} value={m.key}>
                {m.label} ({m.key})
              </option>
            ))}
          </select>

          {/* Botón de Filtros */}
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleFilters}
            className={cn(
              "gap-1.5 text-xs font-semibold shadow-xxs",
              filtrosActivosCount > 0 && "border-primary text-primary bg-primary/5"
            )}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filtros</span>
            {filtrosActivosCount > 0 && (
              <Badge variant="default" className="ml-1 px-1.5 py-0 text-[10px] h-4 min-w-4 justify-center">
                {filtrosActivosCount}
              </Badge>
            )}
          </Button>

          {/* Acceso Rápido Buscador */}
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenSearch}
            className="gap-1.5 text-xs text-muted-foreground hover:text-foreground hidden sm:flex shadow-xxs"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Buscar vendedor / cliente</span>
            <kbd className="text-[10px] bg-muted px-1.5 py-0.5 rounded border border-border text-muted-foreground font-mono ml-1">
              Ctrl+K
            </kbd>
          </Button>
        </div>

        {/* Selector Maestro de Triple Lente */}
        <LensSelector
          activeLens={activeLens}
          onLensChange={onLensChange}
          volumeCompatible={volumen.compatible}
          volumeMessage={volumen.mensajeIncompatibilidad}
        />
      </div>

      {/* Grid de 4 KPIs Ejecutivos Stephen Few / Tufte Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* KPI 1: Adopción Digital Principal */}
        <MetricCard
          titulo={tituloKpiPrincipal}
          valorPrincipal={valorKpiPrincipal}
          subtitulo={subKpiPrincipal}
          deltaMoM={deltaKpiPrincipal}
          sparklineData={sparklineKpi}
          tooltipData={METRIC_DEFINITIONS.adopcion_pedidos}
          accentColor="linear-gradient(to right, #00529B, #38bdf8)"
        />

        {/* KPI 2: Pedidos y Desglose de Canales */}
        <MetricCard
          titulo="Pedidos Digitales"
          valorPrincipal={`${formatNumber(pedidos.digitales)}`}
          subtitulo={`de ${formatNumber(pedidos.totales)} pedidos (${formatPct(pedidos.pctAdopcion)})`}
          tooltipData={METRIC_DEFINITIONS.adopcion_pedidos}
          accentColor="linear-gradient(to right, #059669, #34d399)"
          className="relative"
        >
          {/* Desglose de Canales */}
          <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground pt-1.5 border-t border-border/60">
            <span className="flex items-center gap-1">
              <Globe className="w-3 h-3 text-sky-500" /> Web: {formatNumber(pedidos.canales.web)}
            </span>
            <span className="flex items-center gap-1">
              <Smartphone className="w-3 h-3 text-emerald-500" /> App: {formatNumber(pedidos.canales.app)}
            </span>
            <span className="flex items-center gap-1">
              <Server className="w-3 h-3 text-amber-500" /> EDI: {formatNumber(pedidos.canales.edi)}
            </span>
          </div>
        </MetricCard>

        {/* KPI 3: Embudo de Clientes */}
        <MetricCard
          titulo="Onboarding & Penetración"
          valorPrincipal={`${formatNumber(clientes.incorporados)} / ${formatNumber(clientes.asignados)}`}
          subtitulo={`${formatPct(clientes.pctOnboarding)} Onboarded · ${formatNumber(clientes.activos)} Activos (${formatPct(clientes.pctActivacion)} activ.)`}
          tooltipData={METRIC_DEFINITIONS.incorporado}
          accentColor="linear-gradient(to right, #d97706, #fbbf24)"
        />

        {/* KPI 4: Volumen o Indicadores Avanzados */}
        <MetricCard
          titulo={volumen.compatible ? `Volumen Digital (${volumen.unidad})` : "FTTV & Reversión"}
          valorPrincipal={
            volumen.compatible
              ? `${formatNumber(volumen.digital)}`
              : `${clientes.fttvPromedio || 12} días FTTV`
          }
          subtitulo={
            volumen.compatible
              ? `${formatPct(volumen.pctAdopcion)} del volumen total (${formatNumber(volumen.total)} ${volumen.unidad})`
              : `${formatNumber(clientes.revertidos)} clientes con recaída analógica`
          }
          deltaMoM={volumen.compatible ? deltas.volumenMoM : null}
          tooltipData={volumen.compatible ? METRIC_DEFINITIONS.adopcion_volumen : METRIC_DEFINITIONS.fttv}
          accentColor="linear-gradient(to right, #6366f1, #818cf8)"
        />
      </div>
    </div>
  );
}
