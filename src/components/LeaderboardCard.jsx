import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Trophy, UserCheck, Target, X, List } from 'lucide-react';
import { formatNumber, formatCompactNumber, formatPct, cn } from '@/lib/utils';

const TOP_N = 3;

/** Etiqueta corta de línea de negocio — necesaria en 'market_line', donde un mismo
 *  mercado aparece una vez por línea y el nombre solo no los distingue. */
const BL_SHORT = { readymix: 'RMX', cemento: 'CEM', agregados: 'AGG' };

const DIMENSIONS = [
  { key: 'market_line', label: 'Business Line', tipo: 'market_line' },
  { key: 'regions', label: 'Regions', tipo: 'region' },
  { key: 'markets', label: 'Markets', tipo: 'market' },
  { key: 'sales_reps', label: 'Reps', tipo: 'sales_rep' }
];

function renderRankBadge(rank) {
  if (rank === 1) return <span className="text-[12px] font-black text-amber-500">🥇</span>;
  if (rank === 2) return <span className="text-[12px] font-black text-slate-400">🥈</span>;
  if (rank === 3) return <span className="text-[12px] font-black text-amber-700 dark:text-amber-500">🥉</span>;
  return <span className="text-[12px] font-bold text-muted-foreground tabular-nums">#{rank}</span>;
}

/** Una fila de ranking — misma forma en la tarjeta y en el modal. */
function RankingRow({ item, variant, onClick, dense }) {
  const isOnb = variant === 'onboarding';
  const pct = isOnb ? item.onboardingPct : item.adopcionPct;
  const sub = isOnb
    ? `${item.onboardedCount}/${item.assignedCount} customers`
    : `${formatCompactNumber(item.digitalOrders)}/${formatCompactNumber(item.totalOrders)} orders`;
  const subTitle = isOnb
    ? undefined
    : `${formatNumber(item.digitalOrders)} / ${formatNumber(item.totalOrders)} orders`;

  return (
    <tr
      onClick={onClick}
      className="hover:bg-card transition-colors cursor-pointer group border-b border-border/40 last:border-b-0"
    >
      <td className="py-1 px-1 text-center font-bold w-6">{renderRankBadge(item.rank)}</td>
      <td className="py-1 px-1">
        <div className="flex items-center gap-1 min-w-0">
          <span
            className={cn(
              "font-bold text-foreground group-hover:text-primary transition-colors truncate",
              dense ? "text-[12px] max-w-[92px]" : "text-[12px] max-w-[220px]"
            )}
            title={item.nombre}
          >
            {item.nombre}
          </span>
          {item.tipo === 'market_line' && item.lineaNegocio && (
            <span className="text-[12px] font-black px-1 py-0.5 rounded border uppercase shrink-0 bg-slate-500/10 text-muted-foreground border-border">
              {BL_SHORT[item.lineaNegocio] || 'BL'}
            </span>
          )}
        </div>
        <div className={cn("text-muted-foreground font-mono", dense ? "text-[12px]" : "text-[12px]")} title={subTitle}>
          {sub}
        </div>
      </td>
      <td
        className={cn(
          "py-1 px-1 text-right font-mono font-bold",
          dense ? "text-[12px]" : "text-[13px]",
          isOnb ? "text-emerald-600 dark:text-emerald-400" : "text-primary"
        )}
      >
        {formatPct(pct)}
      </td>
    </tr>
  );
}

/** Bloque de ranking dentro de la tarjeta: top N fijo, sin scroll. */
function RankingBlock({ title, icon: Icon, accent, rows, total, variant, onRowClick, onExpand }) {
  const hidden = Math.max(0, total - TOP_N);

  return (
    <div className="bg-slate-50 dark:bg-slate-900/60 p-2 rounded-xl border border-border flex flex-col min-h-0">
      <div className={cn("flex items-center gap-1.5 pb-1.5 mb-1 border-b border-border/80 text-[12px] font-black uppercase shrink-0", accent)}>
        <Icon className="w-3.5 h-3.5" />
        <span>{title}</span>
      </div>

      <table className="w-full text-left border-collapse">
        <tbody>
          {rows.map(item => (
            <RankingRow
              key={`${variant}-${item.id}`}
              item={item}
              variant={variant}
              dense
              onClick={() => onRowClick(item)}
            />
          ))}
        </tbody>
      </table>

      {hidden > 0 && (
        <button
          type="button"
          onClick={onExpand}
          className="mt-auto pt-1.5 flex items-center justify-center gap-1 text-[12px] font-bold text-muted-foreground hover:text-primary transition-colors cursor-pointer"
        >
          <List className="w-3 h-3" />
          See all
        </button>
      )}
    </div>
  );
}

export function LeaderboardCard({ leaderboardData = [], onOpenActionDrawer }) {
  const [dimension, setDimension] = useState('market_line');
  const [expanded, setExpanded] = useState(null); // null | 'onboarding' | 'adoption'

  const activeTipo = useMemo(
    () => DIMENSIONS.find(d => d.key === dimension)?.tipo,
    [dimension]
  );

  const filteredData = useMemo(
    () => (leaderboardData || []).filter(item => item.tipo === activeTipo),
    [leaderboardData, activeTipo]
  );

  const rank = (list, key) =>
    [...list].sort((a, b) => b[key] - a[key]).map((item, i) => ({ ...item, rank: i + 1 }));

  const onboardingRankings = useMemo(() => rank(filteredData, 'onboardingPct'), [filteredData]);
  const adoptionRankings = useMemo(() => rank(filteredData, 'adopcionPct'), [filteredData]);

  const handleRowClick = (item) => {
    setExpanded(null);
    onOpenActionDrawer?.({ nombre: item.nombre, tipo: item.lineaNegocio || 'National' }, item.id);
  };

  const modalRows = expanded === 'onboarding' ? onboardingRankings : adoptionRankings;
  const modalTitle = expanded === 'onboarding' ? 'Onboarding' : 'Orders Adoption';
  const dimLabel = DIMENSIONS.find(d => d.key === dimension)?.label || '';

  return (
    <>
      <Card className="p-3.5 bg-card border border-border shadow-xs rounded-xl relative overflow-hidden select-none font-sans h-[300px] flex flex-col">
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-500 via-primary to-emerald-500" />

        <div className="flex items-center justify-between pb-2 mb-2 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-black uppercase tracking-wider text-foreground">Rankings</h3>
          </div>

          <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg border border-border">
            {DIMENSIONS.map(d => (
              <button
                key={d.key}
                type="button"
                onClick={() => setDimension(d.key)}
                className={cn(
                  "px-2 py-0.5 text-[12px] rounded-md transition-all cursor-pointer whitespace-nowrap",
                  dimension === d.key
                    ? "bg-primary text-primary-foreground font-black shadow-xs"
                    : "text-muted-foreground hover:text-foreground font-medium"
                )}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 flex-1 min-h-0">
          <RankingBlock
            title="Onboarding"
            icon={UserCheck}
            accent="text-emerald-700 dark:text-emerald-400"
            rows={onboardingRankings.slice(0, TOP_N)}
            total={onboardingRankings.length}
            variant="onboarding"
            onRowClick={handleRowClick}
            onExpand={() => setExpanded('onboarding')}
          />
          <RankingBlock
            title="Orders Adoption"
            icon={Target}
            accent="text-indigo-600 dark:text-indigo-400"
            rows={adoptionRankings.slice(0, TOP_N)}
            total={adoptionRankings.length}
            variant="adoption"
            onRowClick={handleRowClick}
            onExpand={() => setExpanded('adoption')}
          />
        </div>
      </Card>

      {/* MODAL: lista completa — el único lugar donde se permite scroll */}
      {expanded && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-sm p-4"
          onClick={() => setExpanded(null)}
        >
          <div
            className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
              <div className="flex items-center gap-2">
                {expanded === 'onboarding'
                  ? <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  : <Target className="w-4 h-4 text-primary" />}
                <div>
                  <h3 className="text-sm font-black text-foreground leading-tight">{modalTitle}</h3>
                  <p className="text-[12px] text-muted-foreground font-medium">
                    {dimLabel} · {modalRows.length} total
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setExpanded(null)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto scrollbar-thin px-3 py-2">
              <table className="w-full text-left border-collapse">
                <tbody>
                  {modalRows.map(item => (
                    <RankingRow
                      key={`modal-${item.id}`}
                      item={item}
                      variant={expanded}
                      onClick={() => handleRowClick(item)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
