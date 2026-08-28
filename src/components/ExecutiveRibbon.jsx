import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BulletGraph } from './BulletGraph';
import { ShoppingCart, Box, Layers, UserCheck, TrendingUp } from 'lucide-react';
import { formatNumber, formatPct } from '@/lib/utils';

export function ExecutiveRibbon({ metricasGlobales }) {
  if (!metricasGlobales || !metricasGlobales.actual) return null;

  const { actual, deltas } = metricasGlobales;

  const CARDS = [
    {
      id: 'pedidos',
      titulo: 'Digital Adoption Rate (Orders)',
      subtitulo: 'Share of orders placed via digital self-service vs 90% Goal',
      valor: formatPct(actual.pedidos.pctAdopcion),
      subvalor: `${formatNumber(actual.pedidos.digitales)} / ${formatNumber(actual.pedidos.totales)} orders`,
      delta: deltas.pedidosMoM,
      target: 90.0,
      currentVal: actual.pedidos.pctAdopcion,
      icon: ShoppingCart,
      colorGrad: 'from-blue-600 to-indigo-700',
      accentColor: 'text-primary'
    },
    {
      id: 'concreto',
      titulo: 'Readymix Volume (cu yd)',
      subtitulo: 'Digitally ordered readymix volume in period',
      valor: `${formatNumber(actual.volumen.concreto.digital)} cu yd`,
      subvalor: `Total: ${formatNumber(actual.volumen.concreto.total)} cu yd`,
      delta: deltas.concretoMoM,
      target: 80.0,
      currentVal: actual.volumen.concreto.total > 0 ? (actual.volumen.concreto.digital / actual.volumen.concreto.total) * 100 : 0,
      icon: Box,
      colorGrad: 'from-emerald-600 to-teal-700',
      accentColor: 'text-emerald-600 dark:text-emerald-400'
    },
    {
      id: 'cemento',
      titulo: 'Bulk Cement Volume (Tons)',
      subtitulo: 'Digitally ordered cement volume in period',
      valor: `${formatNumber(actual.volumen.cemento.digital)} tons`,
      subvalor: `Total: ${formatNumber(actual.volumen.cemento.total)} tons`,
      delta: deltas.cementoMoM,
      target: 80.0,
      currentVal: actual.volumen.cemento.total > 0 ? (actual.volumen.cemento.digital / actual.volumen.cemento.total) * 100 : 0,
      icon: Layers,
      colorGrad: 'from-amber-500 to-orange-600',
      accentColor: 'text-amber-600 dark:text-amber-400'
    },
    {
      id: 'onboarding',
      titulo: 'Client Onboarding Penetration',
      subtitulo: 'Active commercial accounts registered with active credentials',
      valor: formatPct(actual.clientes.pctOnboarding),
      subvalor: `${actual.clientes.onboarded} of ${actual.clientes.asignados} accounts`,
      delta: deltas.clientesMoM,
      target: 85.0,
      currentVal: actual.clientes.pctOnboarding,
      icon: UserCheck,
      colorGrad: 'from-sky-500 to-blue-600',
      accentColor: 'text-sky-600 dark:text-sky-400'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 select-none font-sans">
      {CARDS.map((card) => {
        const Icon = card.icon;
        return (
          <Card
            key={card.id}
            className="p-4 bg-card border border-border shadow-xs hover:border-primary/40 transition-all rounded-xl relative overflow-hidden flex flex-col justify-between"
          >
            {/* Top Accent Line */}
            <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${card.colorGrad}`} />

            <div>
              {/* Header */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground truncate">
                  {card.titulo}
                </span>
                <div className={`p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 ${card.accentColor}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              {/* Main Metric Value */}
              <div className="text-2xl font-black text-foreground tracking-tight tabular-nums">
                {card.valor}
              </div>
              <div className="text-[11px] text-muted-foreground font-medium mt-0.5 truncate">
                {card.subvalor}
              </div>
            </div>

            {/* Bullet Graph & Target Comparison */}
            <div className="mt-3 pt-2.5 border-t border-border/80 space-y-2">
              <BulletGraph
                actual={card.currentVal}
                target={card.target}
                label=""
              />

              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="w-3 h-3" />
                  <span>+{card.delta}% MoM</span>
                </span>
                <span className="font-bold">Goal: {card.target}%</span>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
