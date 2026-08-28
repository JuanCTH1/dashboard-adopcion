import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingDown, Users, UserCheck, Activity, Target, ArrowRight, AlertTriangle } from 'lucide-react';
import { formatNumber, formatPct, cn } from '@/lib/utils';

export function AdoptionFunnelStrip({ funnelSteps }) {
  if (!funnelSteps || funnelSteps.length === 0) return null;

  const cAsignados = funnelSteps[0]?.valor || 0;
  const cOnboarded = funnelSteps[1]?.valor || 0;
  const cActivos = funnelSteps[2]?.valor || 0;
  const pctAdopcion = funnelSteps[3]?.valor || 0;

  const sinCuentaCount = Math.max(0, cAsignados - cOnboarded);
  const inactivosCount = Math.max(0, cOnboarded - cActivos);

  const pctOnboarding = cAsignados > 0 ? (cOnboarded / cAsignados) * 100 : 0;
  const pctActivos = cAsignados > 0 ? (cActivos / cAsignados) * 100 : 0;

  return (
    <Card className="p-5 bg-card border border-border shadow-xs rounded-xl overflow-hidden relative select-none">
      {/* Barra superior de acento */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-700 via-sky-400 to-emerald-500" />

      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary" />
            <h3 className="text-xs font-black uppercase tracking-wider text-foreground font-sans">
              Embudo Cónico de Adopción Comercial
            </h3>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">
            Visualización secuencial del flujo de clientes: de la cartera total asignada al uso digital recurrente.
          </p>
        </div>

        <Badge variant="outline" className="text-[11px] font-bold text-primary border-primary/30 w-fit px-2.5 py-0.5 shadow-2xs">
          Objetivo Corporativo: 75.0%
        </Badge>
      </div>

      {/* 1. DIAGRAMA SVG DE EMBUDO CÓNICO REAL CONSTRUIDO CON POLÍGONOS CONECTADOS */}
      <div className="w-full my-3 bg-slate-50 dark:bg-slate-900/90 rounded-xl p-3 border border-border/80 shadow-inner">
        <svg viewBox="0 0 900 130" className="w-full h-auto max-h-36 overflow-visible" preserveAspectRatio="none">
          <defs>
            {/* Gradientes para cada etapa cónica */}
            <linearGradient id="funnel-grad-1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#002B99" />
              <stop offset="100%" stopColor="#1e40af" />
            </linearGradient>
            <linearGradient id="funnel-grad-2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1e40af" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <linearGradient id="funnel-grad-3" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#398EF4" />
            </linearGradient>
            <linearGradient id="funnel-grad-4" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#398EF4" />
              <stop offset="100%" stopColor="#FFB000" />
            </linearGradient>
          </defs>

          {/* Etapa 1: Cartera Base (Trapecio ancho: Y 10 a 120 -> Y 20 a 110) */}
          <polygon points="10,10 210,22 210,108 10,120" fill="url(#funnel-grad-1)" opacity="0.95" />
          <text x="110" y="60" fill="#ffffff" fontSize="14" fontWeight="bold" textAnchor="middle" fontFamily="Outfit, sans-serif">
            {formatNumber(cAsignados)} Clientes
          </text>
          <text x="110" y="78" fill="#cbd5e1" fontSize="11" textAnchor="middle" fontFamily="Outfit, sans-serif">
            100% Universo Base
          </text>

          {/* Fuga 1: Conector de Fuga Onboarding */}
          <line x1="210" y1="65" x2="240" y2="65" stroke="#94a3b8" strokeWidth="2" strokeDasharray="3,3" />

          {/* Etapa 2: Onboarded (Trapecio medio: Y 22 a 108 -> Y 32 a 98) */}
          <polygon points="240,22 440,34 440,96 240,108" fill="url(#funnel-grad-2)" opacity="0.95" />
          <text x="340" y="60" fill="#ffffff" fontSize="14" fontWeight="bold" textAnchor="middle" fontFamily="Outfit, sans-serif">
            {formatNumber(cOnboarded)} Clientes
          </text>
          <text x="340" y="78" fill="#ecfdf5" fontSize="11" textAnchor="middle" fontFamily="Outfit, sans-serif">
            {pctOnboarding.toFixed(0)}% con Cuenta
          </text>

          {/* Etapa 3: Activos Digitales (Trapecio estrecho: Y 34 a 96 -> Y 42 a 88) */}
          <polygon points="470,34 670,44 670,86 470,96" fill="url(#funnel-grad-3)" opacity="0.95" />
          <text x="570" y="60" fill="#ffffff" fontSize="14" fontWeight="bold" textAnchor="middle" fontFamily="Outfit, sans-serif">
            {formatNumber(cActivos)} Clientes
          </text>
          <text x="570" y="78" fill="#e0f2fe" fontSize="11" textAnchor="middle" fontFamily="Outfit, sans-serif">
            {pctActivos.toFixed(0)}% Activos
          </text>

          {/* Etapa 4: Adopción Transaccional Final (Cilindro / Barra de Meta: Y 44 a 86) */}
          <polygon points="700,44 890,44 890,86 700,86" fill="url(#funnel-grad-4)" opacity="0.95" />
          <text x="795" y="60" fill="#ffffff" fontSize="14" fontWeight="bold" textAnchor="middle" fontFamily="Outfit, sans-serif">
            {formatPct(pctAdopcion)}
          </text>
          <text x="795" y="78" fill="#fffbeb" fontSize="11" textAnchor="middle" fontFamily="Outfit, sans-serif">
            Objetivo: 75.0%
          </text>
        </svg>

        {/* Fugas y Diagnósticos debidamente etiquetados */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mt-2 pt-2 border-t border-border/70 text-[11px]">
          <div className="text-muted-foreground font-semibold px-2">
            Base 100% de Clientes
          </div>

          <div className="text-rose-600 dark:text-rose-400 font-bold px-2 flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>-{sinCuentaCount} sin registrar ({((sinCuentaCount/cAsignados)*100).toFixed(0)}% fuga)</span>
          </div>

          <div className="text-amber-600 dark:text-amber-400 font-bold px-2 flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>-{inactivosCount} inactivos / revertidos</span>
          </div>

          <div className="text-emerald-600 dark:text-emerald-400 font-bold px-2">
            {pctAdopcion >= 75 ? "✔ Objetivo 75% Cumplido" : `Brecha: ${(75 - pctAdopcion).toFixed(1)}%`}
          </div>
        </div>
      </div>

      {/* 2. TARJETAS DETALLADAS DEL EMBUDO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
        {/* Paso 1 */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-border">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-6 h-6 rounded-lg bg-blue-700 text-white flex items-center justify-center font-bold text-xs">
              <Users className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-foreground">1. Universo de Clientes</span>
          </div>
          <div className="text-xl font-extrabold text-foreground tabular-nums">
            {formatNumber(cAsignados)} <span className="text-xs font-normal text-muted-foreground">clientes</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">
            Cartera total bajo gestión comercial en el periodo.
          </p>
        </div>

        {/* Paso 2 */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-border">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
              <UserCheck className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-foreground">2. Clientes con Onboarding</span>
          </div>
          <div className="text-xl font-extrabold text-foreground tabular-nums">
            {formatNumber(cOnboarded)} <span className="text-xs font-normal text-muted-foreground">clientes</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">
            {pctOnboarding.toFixed(1)}% habilitados con usuario en la plataforma.
          </p>
        </div>

        {/* Paso 3 */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-border">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-6 h-6 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-xs">
              <Activity className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-foreground">3. Clientes Activos</span>
          </div>
          <div className="text-xl font-extrabold text-foreground tabular-nums">
            {formatNumber(cActivos)} <span className="text-xs font-normal text-muted-foreground">clientes</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">
            Compraron vía digital (Web, App o EDI) en el periodo.
          </p>
        </div>

        {/* Paso 4 */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-border">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-xs">
              <Target className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-foreground">4. Adopción Digital</span>
          </div>
          <div className="text-xl font-extrabold text-foreground tabular-nums">
            {formatPct(pctAdopcion)}
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">
            Share transaccional de pedidos vs Objetivo 75%.
          </p>
        </div>
      </div>
    </Card>
  );
}