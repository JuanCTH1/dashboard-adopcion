import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BulletGraph } from './BulletGraph';
import { Trophy, Search, UserCheck, ShoppingCart, ChevronRight } from 'lucide-react';
import { formatNumber, formatPct, cn } from '@/lib/utils';

export function LeaderboardCard({ leaderboardData = [], onOpenActionDrawer }) {
  const [dimension, setDimension] = useState('market_line'); // 'market_line' | 'sales_reps' | 'markets' | 'regions'
  const [sortBy, setSortBy] = useState('adopcion'); // 'adopcion' | 'onboarding'
  const [searchTerm, setSearchTerm] = useState('');

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

    // 2. Search term filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.nombre.toLowerCase().includes(term) ||
        (item.persona && item.persona.toLowerCase().includes(term)) ||
        (item.lineaNegocio && item.lineaNegocio.toLowerCase().includes(term))
      );
    }

    // 3. Sort by chosen percentage metric
    filtered.sort((a, b) => {
      if (sortBy === 'adopcion') {
        return b.adopcionPct - a.adopcionPct;
      } else {
        return b.onboardingPct - a.onboardingPct;
      }
    });

    // 4. Assign ranks and bottom 20% flags
    const totalCount = filtered.length;
    const bottomThreshold = Math.ceil(totalCount * 0.2);

    return filtered.map((item, index) => ({
      ...item,
      rank: index + 1,
      isTop3: index < 3,
      isBottom20: totalCount >= 5 && index >= totalCount - bottomThreshold
    }));
  }, [leaderboardData, dimension, sortBy, searchTerm]);

  return (
    <Card className="p-4 sm:p-5 bg-card border border-border shadow-xs rounded-xl relative overflow-hidden select-none font-sans">
      {/* Top Accent Bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-500 via-primary to-emerald-500" />

      {/* HEADER & CONTROLS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3.5 mb-3.5 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-black uppercase tracking-wider text-foreground font-sans">
              Commercial Leaderboard & Adoption Benchmark
            </h3>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">
            Cross-entity ranking based exclusively on Onboarding & Order Adoption rates
          </p>
        </div>

        {/* CONTROLS ROW */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative min-w-[150px]">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search entity..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1 text-xs rounded-lg border border-border bg-slate-50 dark:bg-slate-900 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Dimension Tabs */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-border">
            <button
              type="button"
              onClick={() => setDimension('market_line')}
              className={cn(
                "px-2 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer",
                dimension === 'market_line' ? "bg-card text-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Market & Line
            </button>
            <button
              type="button"
              onClick={() => setDimension('sales_reps')}
              className={cn(
                "px-2 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer",
                dimension === 'sales_reps' ? "bg-card text-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Sales Reps
            </button>
            <button
              type="button"
              onClick={() => setDimension('markets')}
              className={cn(
                "px-2 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer",
                dimension === 'markets' ? "bg-card text-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Markets
            </button>
            <button
              type="button"
              onClick={() => setDimension('regions')}
              className={cn(
                "px-2 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer",
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
                "px-2 py-1 text-[10px] font-bold rounded-md transition-all flex items-center gap-1 cursor-pointer",
                sortBy === 'adopcion' ? "bg-primary text-white shadow-2xs" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <ShoppingCart className="w-3 h-3" />
              <span>Adoption %</span>
            </button>
            <button
              type="button"
              onClick={() => setSortBy('onboarding')}
              className={cn(
                "px-2 py-1 text-[10px] font-bold rounded-md transition-all flex items-center gap-1 cursor-pointer",
                sortBy === 'onboarding' ? "bg-primary text-white shadow-2xs" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <UserCheck className="w-3 h-3" />
              <span>Onboarding %</span>
            </button>
          </div>
        </div>
      </div>

      {/* LEADERBOARD TABLE */}
      <div className="overflow-x-auto max-h-[340px] overflow-y-auto scrollbar-thin">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-border text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-slate-100/80 dark:bg-slate-800/80 sticky top-0 z-10">
              <th className="py-2 px-3 w-14 text-center">Rank</th>
              <th className="py-2 px-3">Entity / Scope</th>
              <th className="py-2 px-3 w-20">Line</th>
              <th className="py-2 px-3">Leader / Owner</th>
              <th className="py-2 px-3 w-36">Onboarding %</th>
              <th className="py-2 px-3 w-36">Order Adoption %</th>
              <th className="py-2 px-3 w-40 text-center">Visual Benchmark</th>
              <th className="py-2 px-3 w-10 text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {processedData.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-xs text-muted-foreground">
                  No ranking entities match the current filter criteria.
                </td>
              </tr>
            ) : (
              processedData.map((item) => {
                const activeVal = sortBy === 'adopcion' ? item.adopcionPct : item.onboardingPct;

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
                    <td className="py-2.5 px-3 text-center">
                      {item.rank === 1 && (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-black text-xs border border-amber-500/30">
                          🥇
                        </span>
                      )}
                      {item.rank === 2 && (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-black text-xs border border-slate-300 dark:border-slate-600">
                          🥈
                        </span>
                      )}
                      {item.rank === 3 && (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-700/20 text-amber-800 dark:text-amber-300 font-black text-xs border border-amber-700/30">
                          🥉
                        </span>
                      )}
                      {item.rank > 3 && (
                        <span className={cn(
                          "text-xs font-bold tabular-nums",
                          item.isBottom20 ? "text-rose-600 dark:text-rose-400" : "text-muted-foreground"
                        )}>
                          #{item.rank}
                        </span>
                      )}
                    </td>

                    {/* Entity Name */}
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-xs text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                        <span>{item.nombre}</span>
                        {item.isBottom20 && (
                          <Badge variant="danger" className="text-[8px] py-0 px-1 font-bold">
                            ⚠️ Lagging
                          </Badge>
                        )}
                      </div>
                    </td>

                    {/* Line Badge */}
                    <td className="py-2.5 px-3">
                      <span className={cn(
                        "text-[9px] font-black px-1.5 py-0.5 rounded border uppercase",
                        item.lineaNegocio === 'readymix' ? "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30" :
                        item.lineaNegocio === 'cemento' ? "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30" :
                        item.lineaNegocio === 'agregados' ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30" :
                        "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300"
                      )}>
                        {item.lineaNegocio === 'readymix' ? 'RMX' : item.lineaNegocio === 'cemento' ? 'CEM' : item.lineaNegocio === 'agregados' ? 'AGG' : 'ALL'}
                      </span>
                    </td>

                    {/* Leader / Owner */}
                    <td className="py-2.5 px-3 text-xs font-medium text-muted-foreground truncate max-w-[140px]">
                      {item.persona || 'Commercial Scope'}
                    </td>

                    {/* Onboarding % (Headline + Raw Count) */}
                    <td className="py-2.5 px-3 font-mono">
                      <div className="text-xs font-bold text-foreground tabular-nums">
                        {formatPct(item.onboardingPct)}
                      </div>
                      <div className="text-[9px] text-muted-foreground">
                        ({item.onboardedCount}/{item.assignedCount} cli)
                      </div>
                    </td>

                    {/* Order Adoption % (Headline + Raw Count) */}
                    <td className="py-2.5 px-3 font-mono">
                      <div className="text-xs font-bold text-primary tabular-nums">
                        {formatPct(item.adopcionPct)}
                      </div>
                      <div className="text-[9px] text-muted-foreground">
                        ({formatNumber(item.digitalOrders)} ord)
                      </div>
                    </td>

                    {/* Visual Benchmark Bullet Graph */}
                    <td className="py-2.5 px-3">
                      <BulletGraph
                        actual={activeVal}
                        target={90.0}
                        label=""
                      />
                    </td>

                    {/* Arrow Action */}
                    <td className="py-2.5 px-3 text-right">
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
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
