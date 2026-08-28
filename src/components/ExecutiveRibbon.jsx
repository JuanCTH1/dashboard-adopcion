import React from 'react';
import { MetricCard } from './MetricCard';
import { Globe, Smartphone, Server, Users, Layers, Activity } from 'lucide-react';
import { formatNumber, formatPct } from '@/lib/utils';
import { METRIC_DEFINITIONS } from '@/domain/definiciones';

export function ExecutiveRibbon({
  metricasGlobales,
  periodoSeleccionado
}) {
  const { actual, deltas, sparklineAdopcion, sparklineConcreto, sparklineCemento } = metricasGlobales;
  const { clientes, pedidos, volumen } = actual;

  return (
    <div className="space-y-3 select-none">
      {/* 4 Tarjetas de Alto Contraste y Separación Óptica */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* KPI 1: % Adopción en Pedidos */}
        <MetricCard
          titulo="% Adopción Digital (Pedidos)"
          valorPrincipal={formatPct(pedidos.pctAdopcion)}
          subtitulo={`${formatNumber(pedidos.digitales)} de ${formatNumber(pedidos.totales)} pedidos totales`}
          deltaMoM={deltas.pedidosMoM}
          sparklineData={sparklineAdopcion}
          tooltipData={METRIC_DEFINITIONS.adopcion_pedidos}
          accentGradient="from-blue-600 via-sky-400 to-indigo-500"
        >
          <div className="mt-2.5 flex items-center justify-between text-[10px] text-muted-foreground pt-1.5 border-t border-border/80 font-medium">
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

        {/* KPI 2: Concreto / Readymix en m³ */}
        <MetricCard
          titulo="Volumen Concreto (m³)"
          valorPrincipal={`${formatNumber(volumen.concreto.digital)} m³`}
          subtitulo={`${formatPct(volumen.concreto.pctAdopcion)} de ${formatNumber(volumen.concreto.total)} m³ totales`}
          deltaMoM={deltas.concretoMoM}
          sparklineData={sparklineConcreto}
          tooltipData={METRIC_DEFINITIONS.adopcion_volumen}
          accentGradient="from-emerald-600 via-teal-400 to-green-500"
        />

        {/* KPI 3: Cemento & Agregados en Toneladas */}
        <MetricCard
          titulo="Volumen Cemento & Agregados (Tons)"
          valorPrincipal={`${formatNumber(volumen.cemento.digital)} ton`}
          subtitulo={`${formatPct(volumen.cemento.pctAdopcion)} de ${formatNumber(volumen.cemento.total)} ton totales`}
          deltaMoM={deltas.cementoMoM}
          sparklineData={sparklineCemento}
          tooltipData={METRIC_DEFINITIONS.adopcion_volumen}
          accentGradient="from-amber-500 via-orange-400 to-amber-600"
        />

        {/* KPI 4: Onboarding y Cuentas Activas */}
        <MetricCard
          titulo="Onboarding de Cartera (Cuentas)"
          valorPrincipal={`${formatNumber(clientes.activos)} Activos`}
          subtitulo={`${formatNumber(clientes.incorporados)} con cuenta de ${formatNumber(clientes.asignados)} cartera`}
          deltaMoM={deltas.clientesMoM}
          tooltipData={METRIC_DEFINITIONS.incorporado}
          accentGradient="from-purple-600 via-indigo-400 to-purple-500"
        >
          <div className="mt-2.5 flex items-center justify-between text-[10px] text-muted-foreground pt-1.5 border-t border-border/80 font-medium">
            <span>{formatPct(clientes.pctOnboarding)} Onboarded</span>
            <span>·</span>
            <span>{clientes.fttvPromedio || 12}d FTTV</span>
            <span>·</span>
            <span className="text-rose-600 dark:text-rose-400 font-bold">{clientes.revertidos} Revertidos</span>
          </div>
        </MetricCard>
      </div>
    </div>
  );
}