import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { X, Copy, Check, AlertCircle, PhoneOff, UserX, Download, Sparkles, TrendingUp } from 'lucide-react';
import { formatNumber, formatPct, cn } from '@/lib/utils';

export function ActionDrawer({
  isOpen,
  onClose,
  nodoSeleccionado,
  clientesAccion = { sinIncorporar: [], inactivosORevertidos: [], volumenEnRiesgoTotal: 0 },
  onExportActionCsv
}) {
  const [copiado, setCopiado] = useState(false);
  const [tabActiva, setTabActiva] = useState('inactivos');

  if (!isOpen) return null;

  const { sinIncorporar = [], inactivosORevertidos = [], volumenEnRiesgoTotal = 0 } = clientesAccion;
  const nombreEntidad = nodoSeleccionado?.nombre || 'National Scope';
  const tipoEntidad = nodoSeleccionado?.tipo || 'Commercial Unit';

  const copiarListaAlPortapapeles = () => {
    const listaActual = tabActiva === 'sinIncorporar' ? sinIncorporar : inactivosORevertidos;
    const titulo = tabActiva === 'sinIncorporar'
      ? `ONBOARDING TARGETS - ${nombreEntidad}`
      : `PHONE-TO-DIGITAL CONVERSION OPPORTUNITIES - ${nombreEntidad}`;

    let texto = `📋 *${titulo}*\n`;
    texto += `📅 Generated: ${new Date().toLocaleDateString('en-US')}\n\n`;
    texto += `Customer ID\tCompany Name\tLine\tVolume\tSales Rep\tAction Type\n`;

    listaActual.forEach(c => {
      texto += `${c.id}\t${c.nombreEmpresa || c.id}\t${c.lineaNegocio}\t${formatNumber(c.volumen)} ${c.unidad}\t${c.vendedorNombre}\t${tabActiva === 'sinIncorporar' ? 'Pending Credentials' : 'Phone Order Habit'}\n`;
    });

    navigator.clipboard.writeText(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-card border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 font-sans select-none">
      {/* Header */}
      <div className="p-4 border-b border-border bg-slate-50/80 dark:bg-slate-800/80 flex items-start justify-between gap-3 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-black uppercase tracking-wider text-primary">
              1-on-1 Commercial Sync Sheet
            </span>
          </div>
          <h2 className="text-sm font-black text-foreground mt-0.5 truncate max-w-[280px]">
            {nombreEntidad}
          </h2>
          <div className="text-xs text-muted-foreground mt-0.5 font-medium">
            {tipoEntidad} Scope · {formatNumber(volumenEnRiesgoTotal)} units ready for digital shift
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Win Strategic Insight Banner */}
      <div className="mx-4 mt-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 text-xs shrink-0">
        <div className="flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-foreground">Immediate Quick Win Opportunity:</span>
            <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
              {inactivosORevertidos.length > 0 ? (
                <>
                  <b>{inactivosORevertidos.length} key accounts</b> already have portal accounts but continue placing orders by phone/WhatsApp. A brief reminder call from their Sales Rep can easily capture this volume.
                </>
              ) : (
                <>
                  Focus on registering the <b>{sinIncorporar.length} high-frequency accounts</b> below to unlock immediate online ordering access.
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="p-4 flex-1 overflow-y-auto">
        <Tabs value={tabActiva} onValueChange={setTabActiva} className="w-full">
          <TabsList className="grid grid-cols-2 w-full mb-3 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <TabsTrigger value="inactivos" className="text-xs font-bold gap-1.5 py-1.5">
              <PhoneOff className="w-3.5 h-3.5 text-amber-500" />
              <span>Phone Orders ({inactivosORevertidos.length})</span>
            </TabsTrigger>
            <TabsTrigger value="sinIncorporar" className="text-xs font-bold gap-1.5 py-1.5">
              <UserX className="w-3.5 h-3.5 text-rose-500" />
              <span>Pending Onboard ({sinIncorporar.length})</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Phone / Analog Orders (Highest Priority Conversion) */}
          <TabsContent value="inactivos" className="space-y-2.5 mt-0">
            <div className="text-xs text-muted-foreground bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-lg border border-border flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>
                Registered customers with offline order habit. <b>Action: Sales Rep asks customer to submit next order via app.</b>
              </span>
            </div>

            {inactivosORevertidos.map((cli, idx) => (
              <div
                key={cli.id}
                className="p-3 rounded-xl bg-card border border-border hover:border-primary/50 transition-all shadow-xxs flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-400">#{idx + 1}</span>
                    <span className="font-bold text-xs text-foreground truncate">{cli.nombreEmpresa || cli.id}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5 truncate">
                    {cli.lineaNegocio.toUpperCase()} · Rep: {cli.vendedorNombre} · Market: {cli.plaza}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-bold text-foreground tabular-nums">
                    {formatNumber(cli.volumen)} <span className="text-xs font-normal text-muted-foreground">{cli.unidad}</span>
                  </div>
                  <Badge variant="warning" className="text-xs py-0.5 px-1.5 font-bold mt-0.5">
                    Phone Habit
                  </Badge>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Tab 2: Customers Pending Onboarding */}
          <TabsContent value="sinIncorporar" className="space-y-2.5 mt-0">
            <div className="text-xs text-muted-foreground bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-lg border border-border flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>
                High-volume accounts pending registration. <b>Action: Sales Rep requests customer portal user setup.</b>
              </span>
            </div>

            {sinIncorporar.map((cli, idx) => (
              <div
                key={cli.id}
                className="p-3 rounded-xl bg-card border border-border hover:border-primary/50 transition-all shadow-xxs flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-400">#{idx + 1}</span>
                    <span className="font-bold text-xs text-foreground truncate">{cli.nombreEmpresa || cli.id}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5 truncate">
                    {cli.lineaNegocio.toUpperCase()} · Rep: {cli.vendedorNombre} · Market: {cli.plaza}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-bold text-foreground tabular-nums">
                    {formatNumber(cli.volumen)} <span className="text-xs font-normal text-muted-foreground">{cli.unidad}</span>
                  </div>
                  <Badge variant="danger" className="text-xs py-0.5 px-1.5 font-bold mt-0.5">
                    Unregistered
                  </Badge>
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-border bg-slate-50/90 dark:bg-slate-800/90 flex items-center gap-2 shrink-0">
        <Button
          variant="default"
          size="sm"
          onClick={copiarListaAlPortapapeles}
          className="flex-1 gap-1.5 text-xs font-bold shadow-xs cursor-pointer"
        >
          {copiado ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-300" />
              <span>Copied for 1-on-1 Meeting!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Sheet for 1-on-1 Sync</span>
            </>
          )}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onExportActionCsv}
          className="gap-1 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
          aria-label="Export CSV"
        >
          <Download className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
