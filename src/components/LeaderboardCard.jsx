import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, UserCheck, Target, ChevronRight } from 'lucide-react';
import { formatNumber, formatCompactNumber, formatPct, cn } from '@/lib/utils';

export function LeaderboardCard({ leaderboardData = [], onOpenActionDrawer }) {
  const [dimension, setDimension] = useState('market_line'); // 'market_line' | 'sales_reps' | 'markets' | 'regions'

  // Filter raw dataset by selected dimension
  const filteredData = useMemo(() => {
    if (!leaderboardData || leaderboardData.length === 0) return [];

    let filtered = [...leaderboardData];
    if (dimension === 'market_line') {
      filtered = filtered.filter(item => item.tipo === 'market_line');
    } else if (dimension === 'sales_reps') {
      filtered = filtered.filter(item => item.tipo === 'sales_rep');
    } else if (dimension === 'markets') {
      filtered = filtered.filter(item => item.tipo === 'market');
    } else if (dimension === 'regions') {
      filtered = filtered.filter(item => item.tipo === 'region');
    }
    return filtered;
  }, [leaderboardData, dimension]);

  // Ranking 1: Onboarding Performance
  const onboardingRankings = useMemo(() => {
    const list = [...filteredData];
    list.sort((a, b) => b.onboardingPct - a.onboardingPct);
    return list.map((item, index) => ({
      ...item,
      rank: index + 1
    }));
  }, [filteredData]);

  // Ranking 2: Orders Adoption Performance
  const adoptionRankings = useMemo(() => {
    const list = [...filteredData];
    list.sort((a, b) => b.adopcionPct - a.adopcionPct);
    return list.map((item, index) => ({
      ...item,
      rank: index + 1
    }));
  }, [filteredData]);

  const renderRankBadge = (rank) => {
    if (rank === 1) return <span className="text-[11px] font-black text-amber-500">🥇</span>;
    if (rank === 2) return <span className="text-[11px] font-black text-slate-400">🥈</span>;
    if (rank === 3) return <span className="text-[11px] font-black text-amber-700 dark:text-amber-500">🥉</span>;
    return <span className="text-[10px] font-bold text-muted-foreground tabular-nums">#{rank}</span>;
  };

  return (
    <Card className="p-3.5 bg-card border border-border shadow-xs rounded-xl relative overflow-hidden select-none font-sans h-[255px] max-h-[255px] flex flex-col justify-between">
      {/* Top Accent Bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-500 via-primary to-emerald-500" />

      {/* HEADER & CONTROLS */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-500" />
          <h3 className="text-xs font-black uppercase tracking-wider text-foreground font-sans">
            Rankings
          </h3>
        </div>

        {/* DIMENSION TABS */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg border border-border">
          <button
            type="button"
            onClick={() => setDimension('market_line')}
            className={cn(
              "px-2 py-0.5 text-[9.5px] rounded-md transition-all cursor-pointer",
              dimension === 'market_line'
                ? "bg-primary text-primary-foreground font-black shadow-xs"
                : "text-muted-foreground hover:text-foreground font-medium"
            )}
          >
            Line
          </button>
          <button
            type="button"
            onClick={() => setDimension('sales_reps')}
            className={cn(
              "px-2 py-0.5 text-[9.5px] rounded-md transition-all cursor-pointer",
              dimension === 'sales_reps'
                ? "bg-primary text-primary-foreground font-black shadow-xs"
                : "text-muted-foreground hover:text-foreground font-medium"
            )}
          >
            Reps
          </button>
          <button
            type="button"
            onClick={() => setDimension('markets')}
            className={cn(
              "px-2 py-0.5 text-[9.5px] rounded-md transition-all cursor-pointer",
              dimension === 'markets'
                ? "bg-primary text-primary-foreground font-black shadow-xs"
                : "text-muted-foreground hover:text-foreground font-medium"
            )}
          >
            Markets
          </button>
          <button
            type="button"
            onClick={() => setDimension('regions')}
            className={cn(
              "px-2 py-0.5 text-[9.5px] rounded-md transition-all cursor-pointer",
              dimension === 'regions'
                ? "bg-primary text-primary-foreground font-black shadow-xs"
                : "text-muted-foreground hover:text-foreground font-medium"
            )}
          >
            Regions
          </button>
        </div>
      </div>

      {/* DUAL RANKINGS GRID (SIDE-BY-SIDE ONBOARDING VS ADOPTION) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 flex-1 min-h-0 overflow-hidden">
        
        {/* RANKING 1: ONBOARDING */}
        <div className="bg-slate-50 dark:bg-slate-900/60 p-2 rounded-xl border border-border flex flex-col min-h-0 overflow-hidden">
          <div className="flex items-center gap-1.5 pb-1.5 mb-1 border-b border-border/80 text-[10.5px] font-black uppercase text-emerald-700 dark:text-emerald-400 shrink-0">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Onboarding</span>
          </div>

          <div className="overflow-y-auto max-h-[160px] flex-1 scrollbar-thin">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-[9px] font-extrabold uppercase text-muted-foreground border-b border-border/60">
                  <th className="py-1 px-1 w-6 text-center">#</th>
                  <th className="py-1 px-1">Entity</th>
                  <th className="py-1 px-1 text-right">Onb %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {onboardingRankings.map((item) => (
                  <tr
                    key={`onb-${item.id}`}
                    onClick={() => onOpenActionDrawer && onOpenActionDrawer({ nombre: item.nombre, tipo: item.lineaNegocio || 'National' }, item.id)}
                    className="hover:bg-card transition-colors cursor-pointer group"
                  >
                    <td className="py-1 px-1 text-center font-bold">
                      {renderRankBadge(item.rank)}
                    </td>
                    <td className="py-1 px-1">
                      <div className="font-bold text-[10.5px] text-foreground group-hover:text-primary transition-colors truncate max-w-[110px]" title={item.nombre}>
                        {item.nombre}
                      </div>
                      <div className="text-[8.5px] text-muted-foreground font-mono">
                        {item.onboardedCount}/{item.assignedCount} customers
                      </div>
                    </td>
                    <td className="py-1 px-1 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 text-[10.5px]">
                      {formatPct(item.onboardingPct)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RANKING 2: DIGITAL ADOPTION */}
        <div className="bg-slate-50 dark:bg-slate-900/60 p-2 rounded-xl border border-border flex flex-col min-h-0 overflow-hidden">
          <div className="flex items-center gap-1.5 pb-1.5 mb-1 border-b border-border/80 text-[10.5px] font-black uppercase text-indigo-600 dark:text-indigo-400 shrink-0">
            <Target className="w-3.5 h-3.5" />
            <span>Orders Adoption</span>
          </div>

          <div className="overflow-y-auto max-h-[160px] flex-1 scrollbar-thin">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-[9px] font-extrabold uppercase text-muted-foreground border-b border-border/60">
                  <th className="py-1 px-1 w-6 text-center">#</th>
                  <th className="py-1 px-1">Entity</th>
                  <th className="py-1 px-1 text-right">Adop %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {adoptionRankings.map((item) => (
                  <tr
                    key={`adop-${item.id}`}
                    onClick={() => onOpenActionDrawer && onOpenActionDrawer({ nombre: item.nombre, tipo: item.lineaNegocio || 'National' }, item.id)}
                    className="hover:bg-card transition-colors cursor-pointer group"
                  >
                    <td className="py-1 px-1 text-center font-bold">
                      {renderRankBadge(item.rank)}
                    </td>
                    <td className="py-1 px-1">
                      <div className="font-bold text-[10.5px] text-foreground group-hover:text-primary transition-colors truncate max-w-[110px]" title={item.nombre}>
                        {item.nombre}
                      </div>
                      <div className="text-[8.5px] text-muted-foreground font-mono" title={`${formatNumber(item.digitalOrders)} / ${formatNumber(item.totalOrders)} orders`}>
                        {formatCompactNumber(item.digitalOrders)}/{formatCompactNumber(item.totalOrders)} orders
                      </div>
                    </td>
                    <td className="py-1 px-1 text-right font-mono font-black text-primary text-[10.5px]">
                      {formatPct(item.adopcionPct)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </Card>
  );
}
