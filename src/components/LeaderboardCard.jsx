import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, UserCheck, ShoppingCart, ChevronRight } from 'lucide-react';
import { formatNumber, formatPct, cn } from '@/lib/utils';

export function LeaderboardCard({ leaderboardData = [], onOpenActionDrawer }) {
  const [dimension, setDimension] = useState('market_line'); // 'market_line' | 'sales_reps' | 'markets' | 'regions'
  const [sortBy, setSortBy] = useState('adopcion'); // 'adopcion' | 'onboarding'

  const processedData = useMemo(() => {
    if (!leaderboardData || leaderboardData.length === 0) return [];

    let filtered = [...leaderboardData];

    // 1. Filter by dimension
    if (dimension === 'market_line') {
      filtered = filtered.filter(item => item.tipo === 'market_line');
    } else if (dimension === 'sales_reps') {
      filtered = filtered.filter(item => item.tipo === 'sales_rep');
    } else if (dimension === 'markets') {
      filtered = filtered.filter(item => item.tipo === 'market');
    } else if (dimension === 'regions') {
      filtered = filtered.filter(item => item.tipo === 'region');
    }

    // 2. Sort by chosen percentage metric
    filtered.sort((a, b) => {
      if (sortBy === 'adopcion') {
        return b.adopcionPct - a.adopcionPct;
      } else {
        return b.onboardingPct - a.onboardingPct;
      }
    });

    // 3. Assign ranks and bottom 20% flags
    const totalCount = filtered.length;
    const bottomThreshold = Math.ceil(totalCount * 0.2);

    return filtered.map((item, index) => ({
      ...item,
      rank: index + 1,
      isTop3: index < 3,
      isBottom20: totalCount >= 5 && index >= totalCount - bottomThreshold
    }));
  }, [leaderboardData, dimension, sortBy]);

  return (
    <Card className="p-4 bg-card border border-border shadow-xs rounded-xl relative overflow-hidden select-none font-sans h-full flex flex-col justify-between">
      {/* Top Accent Bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-500 via-primary to-emerald-500" />

      {/* HEADER & CONTROLS */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-border">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-500" />
          <h3 className="text-xs font-black uppercase tracking-wider text-foreground font-sans">
            Ranking
          </h3>
        </div>

        {/* CONTROLS ROW */}
        <div className="flex items-center gap-1.5">
          {/* Dimension Tabs */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-border">
            <button
              type="button"
              onClick={() => setDimension('market_line')}
              className={cn(
                "px-2 py-0.5 text-[9.5px] font-bold rounded transition-all cursor-pointer",
                dimension === 'market_line' ? "bg-card text-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Line
            </button>
            <button
              type="button"
              onClick={() => setDimension('sales_reps')}
              className={cn(
                "px-2 py-0.5 text-[9.5px] font-bold rounded transition-all cursor-pointer",
                dimension === 'sales_reps' ? "bg-card text-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Reps
            </button>
            <button
              type="button"
              onClick={() => setDimension('markets')}
              className={cn(
                "px-2 py-0.5 text-[9.5px] font-bold rounded transition-all cursor-pointer",
                dimension === 'markets' ? "bg-card text-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Markets
            </button>
            <button
              type="button"
              onClick={() => setDimension('regions')}
              className={cn(
                "px-2 py-0.5 text-[9.5px] font-bold rounded transition-all cursor-pointer",
                dimension === 'regions' ? "bg-card text-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Regions
            </button>
          </div>

          {/* Sort By Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-border">
            <button
              type="button"
              onClick={() => setSortBy('adopcion')}
              className={cn(
                "px-2 py-0.5 text-[9.5px] font-bold rounded transition-all flex items-center gap-1 cursor-pointer",
                sortBy === 'adopcion' ? "bg-primary text-white shadow-2xs" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <ShoppingCart className="w-2.5 h-2.5" />
              <span>Adop %</span>
            </button>
            <button
              type="button"
              onClick={() => setSortBy('onboarding')}
              className={cn(
                "px-2 py-0.5 text-[9.5px] font-bold rounded transition-all flex items-center gap-1 cursor-pointer",
                sortBy === 'onboarding' ? "bg-primary text-white shadow-2xs" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <UserCheck className="w-2.5 h-2.5" />
              <span>Onb %</span>
            </button>
          </div>
        </div>
      </div>

      {/* RANKING TABLE (~4 ROWS VISIBLE) */}
      <div className="overflow-x-auto max-h-[175px] overflow-y-auto scrollbar-thin flex-1">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-border text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground bg-slate-100/80 dark:bg-slate-800/80 sticky top-0 z-10">
              <th className="py-1.5 px-2 w-10 text-center">Rank</th>
              <th className="py-1.5 px-2">Entity</th>
              <th className="py-1.5 px-2 w-12">Line</th>
              <th className="py-1.5 px-2 w-32">Onboarded</th>
              <th className="py-1.5 px-2 w-32">Adopted</th>
              <th className="py-1.5 px-2 w-6 text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {processedData.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-6 text-center text-xs text-muted-foreground">
                  No entities match current filter.
                </td>
              </tr>
            ) : (
              processedData.map((item) => {
                return (
                  <tr
                    key={`${item.tipo}-${item.id}`}
                    onClick={() => onOpenActionDrawer && onOpenActionDrawer({ nombre: item.nombre, tipo: item.lineaNegocio || 'National' }, item.id)}
                    className={cn(
                      "hover:bg-slate-100/70 dark:hover:bg-slate-800/60 transition-colors cursor-pointer group",
                      item.isBottom20 ? "bg-rose-500/5 hover:bg-rose-500/10" : ""
                    )}
                  >
                    {/* Rank Badge */}
                    <td className="py-1.5 px-2 text-center">
                      {item.rank === 1 && (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-black text-[11px] border border-amber-500/30">
                          🥇
                        </span>
                      )}
                      {item.rank === 2 && (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-black text-[11px] border border-slate-300 dark:border-slate-600">
                          🥈
                        </span>
                      )}
                      {item.rank === 3 && (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-700/20 text-amber-800 dark:text-amber-300 font-black text-[11px] border border-amber-700/30">
                          🥉
                        </span>
                      )}
                      {item.rank > 3 && (
                        <span className={cn(
                          "text-[11px] font-bold tabular-nums",
                          item.isBottom20 ? "text-rose-600 dark:text-rose-400" : "text-muted-foreground"
                        )}>
                          #{item.rank}
                        </span>
                      )}
                    </td>

                    {/* Entity Name */}
                    <td className="py-1.5 px-2">
                      <div className="font-bold text-[11px] text-foreground group-hover:text-primary transition-colors flex items-center gap-1">
                        <span className="truncate max-w-[130px]">{item.nombre}</span>
                        {item.isBottom20 && (
                          <Badge variant="danger" className="text-[7.5px] py-0 px-0.5 font-bold shrink-0">
                            ⚠️
                          </Badge>
                        )}
                      </div>
                    </td>

                    {/* Line Badge */}
                    <td className="py-1.5 px-2">
                      <span className={cn(
                        "text-[8.5px] font-black px-1 py-0.2 rounded border uppercase",
                        item.lineaNegocio === 'readymix' ? "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30" :
                        item.lineaNegocio === 'cemento' ? "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30" :
                        item.lineaNegocio === 'agregados' ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30" :
                        "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300"
                      )}>
                        {item.lineaNegocio === 'readymix' ? 'RMX' : item.lineaNegocio === 'cemento' ? 'CEM' : item.lineaNegocio === 'agregados' ? 'AGG' : 'ALL'}
                      </span>
                    </td>

                    {/* Onboarding % (Headline + Raw Count) */}
                    <td className="py-1.5 px-2 font-mono">
                      <div className="text-[11px] font-bold text-foreground tabular-nums">
                        {formatPct(item.onboardingPct)}
                      </div>
                      <div className="text-[8.5px] text-muted-foreground">
                        ({item.onboardedCount}/{item.assignedCount} cli)
                      </div>
                    </td>

                    {/* Order Adoption % (Headline + Raw Count) */}
                    <td className="py-1.5 px-2 font-mono">
                      <div className="text-[11px] font-bold text-primary tabular-nums">
                        {formatPct(item.adopcionPct)}
                      </div>
                      <div className="text-[8.5px] text-muted-foreground">
                        ({formatNumber(item.digitalOrders)} ord)
                      </div>
                    </td>

                    {/* Arrow Action */}
                    <td className="py-1.5 px-2 text-right">
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
