import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { X, Copy, Check, AlertCircle, PhoneOff, UserX, Download, ArrowRight, ExternalLink } from 'lucide-react';
import { formatNumber, formatPct, cn } from '@/lib/utils';

export function ActionDrawer({
  isOpen,
  onClose,
  nodoSeleccionado,
  clientesAccion = { sinIncorporar: [], inactivosORevertidos: [], volumenEnRiesgoTotal: 0 },
  onExportActionCsv
}) {
  const [copiado, setCopiado] = useState(false);
  const [tabActiva, setTabActiva] = useState('sinIncorporar');

  if (!isOpen) return null;

  const { sinIncorporar = [], inactivosORevertidos = [], volumenEnRiesgoTotal = 0 } = clientesAccion;
  const nombreEntidad = nodoSeleccionado?.nombre || 'Toda la Organización';
  const tipoEntidad = nodoSeleccionado?.tipo || 'Nacional';

  const copiarListaAlPortapapeles = () => {
    const listaActual = tabActiva === 'sinIncorporar' ? sinIncorporar : inactivosORevertidos;
    const titulo = tabActiva === 'sinIncorporar'
      ? `PLAN DE ONBOARDING - ${nombreEntidad}`
      : `PLAN DE RECUPERACION DIGITAL - ${nombreEntidad}`;

    let texto = `${titulo}\nGenerado el: ${new Date().toLocaleDateString('es-MX')}\n\n`;
    texto += `ID Cliente\tLínea\tVolumen\tVendedor\tEstatus\n`;

    listaActual.forEach(c => {
      texto += `${c.id}\t${c.lineaNegocio}\t${formatNumber(c.volumen)} ${c.unidad}\t${c.vendedorNombre}\t${tabActiva === 'sinIncorporar' ? 'Sin Onboarding' : 'Inactivo/Revertido'}\n`;
    });

    navigator.clipboard.writeText(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-card border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header del Action Drawer */}
      <div className="p-4 border-b border-border/80 bg-slate-50/80 dark:bg-slate-850/80 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Plan de Acción Semanal
            </span>
          </div>
          <h2 className="text-sm font-bold text-foreground mt-0.5 truncate max-w-[280px]">
            {nombreEntidad}
          </h2>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            {tipoEntidad} · {formatNumber(volumenEnRiesgoTotal)} unidades en riesgo
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          aria-label="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Contenido con Tabs */}
      <div className="p-4 flex-1 overflow-y-auto">
        <Tabs value={tabActiva} onValueChange={setTabActiva} className="w-full">
          <TabsList className="grid grid-cols-2 w-full mb-3">
            <TabsTrigger value="sinIncorporar" className="text-xs gap-1.5">
              <UserX className="w-3.5 h-3.5" />
              <span>Sin Cuenta ({sinIncorporar.length})</span>
            </TabsTrigger>
            <TabsTrigger value="inactivos" className="text-xs gap-1.5">
              <PhoneOff className="w-3.5 h-3.5" />
              <span>Inactivos ({inactivosORevertidos.length})</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Clientes Sin Cuenta (Onboarding Gap) */}
          <TabsContent value="sinIncorporar" className="space-y-2.5 mt-0">
            <div className="text-[11px] text-muted-foreground bg-slate-50 dark:bg-slate-850 p-2.5 rounded-lg border border-border/80 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>
                Cuentas prioritarias por volumen que aún no tienen credenciales habilitadas. <b>Responsabilidad: Vendedor.</b>
              </span>
            </div>

            {sinIncorporar.map((cli, idx) => (
              <div
                key={cli.id}
                className="p-3 rounded-xl bg-card border border-border/80 hover:border-primary/50 transition-all shadow-xxs flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-400">#{idx + 1}</span>
                    <span className="font-bold text-xs font-mono text-foreground">{cli.id}</span>
                    <Badge variant="danger" className="text-[9px] py-0 px-1 font-normal">
                      Sin Onboarding
                    </Badge>
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    {cli.lineaNegocio.toUpperCase()} · Vendedor: {cli.vendedorNombre}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-bold text-foreground tabular-nums">
                    {formatNumber(cli.volumen)} {cli.unidad}
                  </div>
                  <div className="text-[9px] text-muted-foreground">Volumen mensual</div>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Tab 2: Clientes Inactivos / Revertidos (Usage Gap) */}
          <TabsContent value="inactivos" className="space-y-2.5 mt-0">
            <div className="text-[11px] text-muted-foreground bg-slate-50 dark:bg-slate-850 p-2.5 rounded-lg border border-border/80 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>
                Cuentas con usuario activo pero que compraron por teléfono/correo en este periodo. <b>Responsabilidad: CX & Vendedor.</b>
              </span>
            </div>

            {inactivosORevertidos.map((cli, idx) => (
              <div
                key={cli.id}
                className="p-3 rounded-xl bg-card border border-border/80 hover:border-primary/50 transition-all shadow-xxs flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-400">#{idx + 1}</span>
                    <span className="font-bold text-xs font-mono text-foreground">{cli.id}</span>
                    <Badge variant="warning" className="text-[9px] py-0 px-1 font-normal">
                      Recaída Analógica
                    </Badge>
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    {cli.lineaNegocio.toUpperCase()} · FTTV: {cli.fttv != null ? `${cli.fttv} días` : 'Sin activación'}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-bold text-foreground tabular-nums">
                    {formatNumber(cli.volumen)} {cli.unidad}
                  </div>
                  <div className="text-[9px] text-muted-foreground">Volumen en riesgo</div>
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer con Botones de Acción Inmediata */}
      <div className="p-4 border-t border-border/80 bg-slate-50/90 dark:bg-slate-850/90 flex items-center gap-2">
        <Button
          variant="default"
          size="sm"
          onClick={copiarListaAlPortapapeles}
          className="flex-1 gap-1.5 text-xs font-bold shadow-xs"
        >
          {copiado ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-300" />
              <span>¡Lista Copiada!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copiar para Junta 1-on-1</span>
            </>
          )}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onExportActionCsv}
          className="gap-1 text-xs text-muted-foreground hover:text-foreground"
          title="Descargar lista en CSV"
        >
          <Download className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
