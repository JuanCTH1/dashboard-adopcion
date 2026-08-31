import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, UserCheck, Target, X, List, TrendingUp, Copy, Check, Award, Mail } from 'lucide-react';
import { formatNumber, formatCompactNumber, formatPct, cn } from '@/lib/utils';

const TOP_N = 3;

/** Short business line badge */
const BL_SHORT = { readymix: 'RMX', cemento: 'CEM', agregados: 'AGG' };

const DIMENSIONS = [
  { key: 'sales_reps', label: 'Sales Reps', tipo: 'sales_rep' },
  { key: 'markets', label: 'Markets', tipo: 'market' },
  { key: 'regions', label: 'Regions', tipo: 'region' }
];

function renderRankBadge(rank) {
  if (rank === 1) return <span className="text-[12px] font-black text-amber-500">🥇</span>;
  if (rank === 2) return <span className="text-[12px] font-black text-slate-400">🥈</span>;
  if (rank === 3) return <span className="text-[12px] font-black text-amber-700 dark:text-amber-500">🥉</span>;
  return <span className="text-[12px] font-bold text-muted-foreground tabular-nums">#{rank}</span>;
}

function renderTierBadge(tier) {
  if (tier === 'Digital Leader') {
    return (
      <Badge variant="outline" className="text-[10px] font-extrabold px-1.5 py-0 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800">
        Digital Leader
      </Badge>
    );
  }
  if (tier === 'Accelerating') {
    return (
      <Badge variant="outline" className="text-[10px] font-extrabold px-1.5 py-0 bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-800">
        Accelerating
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-[10px] font-medium px-1.5 py-0 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700">
      In Transition
    </Badge>
  );
}

/** Single row for ranking tables */
function RankingRow({ item, variant, mode, onClick, dense }) {
  const isMostImproved = mode === 'most_improved';
  const isOnb = variant === 'onboarding';

  const pct = isOnb ? item.onboardingPct : item.adopcionPct;
  const mom = isOnb ? (item.newOnboardedMonth ?? 0) : (item.momDeltaAdopcion ?? item.momDelta ?? 0);

  const sub = isOnb
    ? `${item.onboardedCount}/${item.assignedCount} accounts`
    : `${formatCompactNumber(item.digitalOrders)}/${formatCompactNumber(item.totalOrders)} orders`;

  const subTitle = isOnb
    ? undefined
    : `${formatNumber(item.digitalOrders)} / ${formatNumber(item.totalOrders)} digital orders`;

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
              dense ? "text-[12px] max-w-[95px]" : "text-[12px] max-w-[200px]"
            )}
            title={item.nombre}
          >
            {item.nombre}
          </span>
          {item.tipo === 'market_line' && item.lineaNegocio && (
            <span className="text-[10px] font-black px-1 py-0.2 rounded border uppercase shrink-0 bg-slate-500/10 text-muted-foreground border-border">
              {BL_SHORT[item.lineaNegocio] || 'BL'}
            </span>
          )}
        </div>
        <div className="text-muted-foreground font-mono text-[11px]" title={subTitle}>
          {sub}
        </div>
      </td>
      <td className="py-1 px-1 text-right">
        {isMostImproved ? (
          <div className="flex flex-col items-end">
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-[12px] flex items-center gap-0.5">
              {isOnb ? `+${mom} new` : `▲ +${mom.toFixed(1)}%`}
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">
              {formatPct(pct)} total
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-end">
            <span className={cn(
              "font-mono font-bold text-[12px]",
              isOnb ? "text-emerald-600 dark:text-emerald-400" : "text-primary"
            )}>
              {formatPct(pct)}
            </span>
            {mom > 0 && !isOnb && (
              <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 font-mono">
                ▲ +{mom.toFixed(1)}%
              </span>
            )}
          </div>
        )}
      </td>
    </tr>
  );
}

/** Ranking block inside the card */
function RankingBlock({ title, icon: Icon, accent, rows, total, variant, mode, onRowClick, onExpand }) {
  const hidden = Math.max(0, total - TOP_N);

  return (
    <div className="bg-slate-50 dark:bg-slate-900/60 p-2 rounded-xl border border-border flex flex-col min-h-0">
      <div className={cn("flex items-center justify-between pb-1.5 mb-1 border-b border-border/80 text-[12px] font-black uppercase shrink-0", accent)}>
        <div className="flex items-center gap-1.5">
          <Icon className="w-3.5 h-3.5" />
          <span>{title}</span>
        </div>
        {mode === 'most_improved' && (
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1 rounded border border-emerald-200 dark:border-emerald-800">
            {variant === 'onboarding' ? 'New Accounts' : 'MoM Growth'}
          </span>
        )}
      </div>

      <table className="w-full text-left border-collapse">
        <tbody>
          {rows.map(item => (
            <RankingRow
              key={`${variant}-${item.id}`}
              item={item}
              variant={variant}
              mode={mode}
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
          className="mt-auto pt-1.5 flex items-center justify-center gap-1 text-[11px] font-bold text-muted-foreground hover:text-primary transition-colors cursor-pointer"
        >
          <List className="w-3 h-3" />
          <span>View all ({total})</span>
        </button>
      )}
    </div>
  );
}

export function LeaderboardCard({ leaderboardData = [], filtrosCompuestos = {}, onOpenActionDrawer }) {
  const [dimension, setDimension] = useState('sales_reps');
  const [rankingMode, setRankingMode] = useState('standings'); // 'standings' | 'most_improved'
  const [expanded, setExpanded] = useState(null); // null | 'onboarding' | 'adoption'
  const [copied, setCopied] = useState(false);

  // Dynamic month resolution
  const MONTH_NAMES = {
    'Jan': 'January', 'Feb': 'February', 'Mar': 'March', 'Apr': 'April',
    'May': 'May', 'Jun': 'June', 'Jul': 'July', 'Aug': 'August',
    'Sep': 'September', 'Oct': 'October', 'Nov': 'November', 'Dec': 'December'
  };

  const rawMonth = filtrosCompuestos?.meses?.length === 1 
    ? filtrosCompuestos.meses[0] 
    : 'Jul';
  const monthName = MONTH_NAMES[rawMonth] || rawMonth || 'July';

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

  // Absolute Standings
  const standingsOnboarding = useMemo(() => rank(filteredData, 'onboardingPct'), [filteredData]);
  const standingsAdoption = useMemo(() => rank(filteredData, 'adopcionPct'), [filteredData]);

  // Most Improved (New onboarded accounts count for onboarding, MoM Delta for adoption)
  const improvedOnboarding = useMemo(() => rank(filteredData, 'newOnboardedMonth'), [filteredData]);
  const improvedAdoption = useMemo(() => rank(filteredData, 'momDeltaAdopcion'), [filteredData]);

  const activeOnboardingList = rankingMode === 'most_improved' ? improvedOnboarding : standingsOnboarding;
  const activeAdoptionList = rankingMode === 'most_improved' ? improvedAdoption : standingsAdoption;

  const handleRowClick = (item) => {
    setExpanded(null);
    onOpenActionDrawer?.({ nombre: item.nombre, tipo: item.lineaNegocio || 'National' }, item.id);
  };

  const dimLabel = DIMENSIONS.find(d => d.key === dimension)?.label || 'Sales Reps';
  const modalRows = expanded === 'onboarding' ? activeOnboardingList : activeAdoptionList;
  const modalTitle = expanded === 'onboarding'
    ? (rankingMode === 'most_improved' ? 'Top Movers: Customers Onboarding (New Accounts)' : 'Customers Onboarding Standings')
    : (rankingMode === 'most_improved' ? 'Top Movers: Digital Orders Adoption (MoM)' : 'Digital Orders Adoption Standings');

  // Trigger Outlook Email & Copy Styled Rich HTML Table to Clipboard (Always copies full monthly national ranking)
  const handleSendEmail = () => {
    // 1. Compute Top 3 across all dimensions (National Monthly Dataset - Independent of active UI filters)
    const allReps = (leaderboardData || []).filter(i => i.tipo === 'sales_rep');
    const allMkts = (leaderboardData || []).filter(i => i.tipo === 'market');
    const allRegs = (leaderboardData || []).filter(i => i.tipo === 'region');

    // Rank Reps Onboarding by newly onboarded accounts in the month
    const topRepsOnb = rank(allReps, 'newOnboardedMonth').slice(0, 3);
    const topRepsAdop = rank(allReps, 'adopcionPct').slice(0, 3);
    const topRepsMovers = rank(allReps, 'momDeltaAdopcion').slice(0, 3);

    const topRegAdop = rank(allRegs, 'adopcionPct')[0];
    const topRegMover = rank(allRegs, 'momDeltaAdopcion')[0];

    const topMktAdop = rank(allMkts, 'adopcionPct')[0];
    const topMktMover = rank(allMkts, 'momDeltaAdopcion')[0];

    const subject = `${monthName} Digital Adoption & Customers Onboarding Pulse | American Cements USA`;

    // 2. Build Rich HTML for Clipboard locked to 580px table width (Outlook-compatible fixed width)
    const richHtml = `
      <table width="580" cellpadding="0" cellspacing="0" border="0" style="width: 580px; max-width: 580px; font-family: Arial, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; line-height: 1.6; font-size: 13px;">
        <tr>
          <td>
            <p style="margin: 0 0 12px 0;">Hello team,</p>
            <p style="margin: 0 0 12px 0;">Please find below our ${monthName} pulse on customer digital adoption and account onboarding across <strong>American Cements USA</strong>.</p>
            <p style="margin: 0 0 18px 0;">Special recognition to our top performers for expanding our digital customer base and driving order conversion this month.</p>
            
            <h3 style="color: #0000B3; margin: 20px 0 10px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">⭐ SALES REPS SPOTLIGHT</h3>

            <!-- Card 1: Customers Onboarding -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 12px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
              <tr>
                <td style="padding: 12px 16px;">
                  <div style="font-weight: bold; color: #0f172a; margin-bottom: 8px; font-size: 13px;">🏆 CUSTOMERS ONBOARDING</div>
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 13px;">
                    ${topRepsOnb.map((r, i) => `
                      <tr>
                        <td width="28" style="width: 28px; padding: 3px 0; vertical-align: middle;">${i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</td>
                        <td style="padding: 3px 0; vertical-align: middle;"><strong>#${i + 1} ${r.nombre}</strong></td>
                        <td align="right" style="text-align: right; padding: 3px 0; vertical-align: middle; white-space: nowrap;">
                          <strong style="color: #059669;">+${r.newOnboardedMonth || 0} new accounts</strong>
                          <span style="color: #64748b; font-size: 12px; margin-left: 6px;">(${r.onboardedCount}/${r.assignedCount} total)</span>
                        </td>
                      </tr>
                    `).join('')}
                  </table>
                </td>
              </tr>
            </table>

            <!-- Card 2: Digital Adoption -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 12px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
              <tr>
                <td style="padding: 12px 16px;">
                  <div style="font-weight: bold; color: #0f172a; margin-bottom: 8px; font-size: 13px;">🏆 DIGITAL ADOPTION</div>
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 13px;">
                    ${topRepsAdop.map((r, i) => `
                      <tr>
                        <td width="28" style="width: 28px; padding: 3px 0; vertical-align: middle;">${i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</td>
                        <td style="padding: 3px 0; vertical-align: middle;"><strong>#${i + 1} ${r.nombre}</strong></td>
                        <td align="right" style="text-align: right; padding: 3px 0; vertical-align: middle; white-space: nowrap; color: #0000B3; font-weight: bold;">
                          ${formatPct(r.adopcionPct)} Digital Orders
                        </td>
                      </tr>
                    `).join('')}
                  </table>
                </td>
              </tr>
            </table>

            <!-- Card 3: Top Movers -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 16px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
              <tr>
                <td style="padding: 12px 16px;">
                  <div style="font-weight: bold; color: #0f172a; margin-bottom: 8px; font-size: 13px;">🔥 TOP ADOPTION MOVERS</div>
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 13px;">
                    ${topRepsMovers.map((r, i) => `
                      <tr>
                        <td width="28" style="width: 28px; padding: 3px 0; vertical-align: middle;">🚀</td>
                        <td style="padding: 3px 0; vertical-align: middle;"><strong>#${i + 1} ${r.nombre}</strong></td>
                        <td align="right" style="text-align: right; padding: 3px 0; vertical-align: middle; white-space: nowrap;">
                          <strong style="color: #059669;">▲ +${(r.momDeltaAdopcion ?? r.momDelta ?? 0).toFixed(1)}% MoM</strong>
                          <span style="color: #64748b; font-size: 12px; margin-left: 6px;">→ now at ${formatPct(r.adopcionPct)}</span>
                        </td>
                      </tr>
                    `).join('')}
                  </table>
                </td>
              </tr>
            </table>

            <!-- Title: Regions & Markets (outside the card) -->
            <h3 style="color: #0000B3; margin: 20px 0 10px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">🏢 REGIONS & MARKETS</h3>

            <!-- Card 4: Regions & Markets -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 16px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
              <tr>
                <td style="padding: 12px 16px;">
                  <div style="margin-bottom: 10px;">
                    <div style="font-weight: bold; color: #334155; margin-bottom: 4px;">📍 REGIONS:</div>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 13px; margin-left: 4px;">
                      <tr>
                        <td width="100" style="width: 100px; padding: 2px 0;">🥇 Leader:</td>
                        <td style="padding: 2px 0;"><strong>${topRegAdop?.nombre || 'Sunbelt Region'}</strong></td>
                        <td align="right" style="text-align: right; padding: 2px 0; color: #0000B3; font-weight: bold;">(${formatPct(topRegAdop?.adopcionPct || 0)})</td>
                      </tr>
                      <tr>
                        <td width="100" style="width: 100px; padding: 2px 0;">🚀 Top Mover:</td>
                        <td style="padding: 2px 0;"><strong>${topRegMover?.nombre || 'Pacific NW Region'}</strong></td>
                        <td align="right" style="text-align: right; padding: 2px 0; color: #059669; font-weight: bold;">(▲ +${(topRegMover?.momDeltaAdopcion || 0).toFixed(1)}% MoM)</td>
                      </tr>
                    </table>
                  </div>

                  <div>
                    <div style="font-weight: bold; color: #334155; margin-bottom: 4px;">🏢 MARKETS:</div>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 13px; margin-left: 4px;">
                      <tr>
                        <td width="100" style="width: 100px; padding: 2px 0;">🥇 Leader:</td>
                        <td style="padding: 2px 0;"><strong>${topMktAdop?.nombre || 'Salt Lake Market'}</strong></td>
                        <td align="right" style="text-align: right; padding: 2px 0; color: #0000B3; font-weight: bold;">(${formatPct(topMktAdop?.adopcionPct || 0)})</td>
                      </tr>
                      <tr>
                        <td width="100" style="width: 100px; padding: 2px 0;">🚀 Top Mover:</td>
                        <td style="padding: 2px 0;"><strong>${topMktMover?.nombre || 'Phoenix Market'}</strong></td>
                        <td align="right" style="text-align: right; padding: 2px 0; color: #059669; font-weight: bold;">(▲ +${(topMktMover?.momDeltaAdopcion || 0).toFixed(1)}% MoM)</td>
                      </tr>
                    </table>
                  </div>
                </td>
              </tr>
            </table>

            <!-- Card 5: Focus for this month -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 18px; background-color: #eff6ff; border-left: 4px solid #0000B3; border-radius: 0 8px 8px 0;">
              <tr>
                <td style="padding: 12px 16px;">
                  <strong style="color: #0000B3; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">FOCUS FOR THIS MONTH:</strong>
                  <p style="margin: 4px 0 0 0; font-size: 12px; color: #334155;">
                    • <strong>Priority 1 (Onboarding):</strong> Ensure any new or active accounts have active digital credentials.<br/>
                    • <strong>Priority 2 (Habit Shift):</strong> Touch base with registered accounts that placed orders by phone this past month to walk them through their next online order.
                  </p>
                </td>
              </tr>
            </table>

            <p style="margin-top: 20px; font-size: 13px; color: #475569;">
              Thank you for your ongoing commitment to our digital customer experience.<br/><br/>
              <strong style="color: #0f172a;">Commercial Leadership Team</strong><br/>
              American Cements USA
            </p>
          </td>
        </tr>
      </table>
    `;

    // Plain text fallback
    const plainFallback = `Hello team,\n\nPlease find attached our ${monthName} pulse on customer digital adoption and account onboarding across American Cements USA.\n(Paste with Ctrl + V to view full styled cards).`;

    // Write rich HTML to clipboard immediately
    try {
      const blobHtml = new Blob([richHtml], { type: 'text/html' });
      const blobText = new Blob([plainFallback], { type: 'text/plain' });
      navigator.clipboard.write([new ClipboardItem({ 'text/html': blobHtml, 'text/plain': blobText })]);
    } catch {
      navigator.clipboard.writeText(plainFallback);
    }

    setCopied(true);

    // Launch Outlook with a 1.2s delay so user can comfortably read the green feedback toast
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}`;
    setTimeout(() => {
      window.location.href = mailtoUrl;
    }, 1200);

    setTimeout(() => setCopied(false), 4500);
  };

  return (
    <>
      <Card className="p-3.5 bg-card border border-border shadow-xs rounded-xl relative overflow-hidden select-none font-sans h-[310px] flex flex-col">
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-500 via-primary to-emerald-500" />

        {/* Card Header with Dual Switcher & Email Action */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-border gap-2 shrink-0 flex-wrap">
          {/* Title + Mode Switcher */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
              <h3 className="text-xs font-black uppercase tracking-wider text-foreground">Rankings</h3>
            </div>

            {/* Standings vs Most Improved Toggle */}
            <div className="inline-flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-border select-none">
              <button
                type="button"
                onClick={() => setRankingMode('standings')}
                className={cn(
                  "px-2 py-0.5 text-[11px] rounded-md transition-all cursor-pointer whitespace-nowrap font-bold flex items-center gap-1",
                  rankingMode === 'standings'
                    ? "bg-white dark:bg-slate-700 text-foreground shadow-xs border border-border/80"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title="View absolute standings (Top performers)"
              >
                <span>Standings</span>
              </button>
              <button
                type="button"
                onClick={() => setRankingMode('most_improved')}
                className={cn(
                  "px-2 py-0.5 text-[11px] rounded-md transition-all cursor-pointer whitespace-nowrap font-bold flex items-center gap-1",
                  rankingMode === 'most_improved'
                    ? "bg-white dark:bg-slate-700 text-foreground shadow-xs border border-border/80"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title="View top movers with highest month-over-month growth"
              >
                <TrendingUp className="w-3 h-3 text-emerald-400" />
                <span>Most Improved</span>
              </button>
            </div>
          </div>

          {/* Dimension Selector + Send Outlook Email */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-border select-none">
              {DIMENSIONS.map(d => (
                <button
                  key={d.key}
                  type="button"
                  onClick={() => setDimension(d.key)}
                  className={cn(
                    "px-2 py-0.5 text-[11px] rounded-md transition-all cursor-pointer whitespace-nowrap font-semibold",
                    dimension === d.key
                      ? "bg-primary text-primary-foreground border-primary font-bold shadow-xs"
                      : "text-slate-700 dark:text-slate-300 hover:text-foreground hover:bg-slate-200/70 dark:hover:bg-slate-700"
                  )}
                >
                  {d.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleSendEmail}
              className="h-7 px-2.5 rounded-lg border border-border bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              title="Copies monthly leaderboard and opens Outlook (independent of active filters)"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">Copied! Paste into Outlook (Ctrl + V)</span>
                </>
              ) : (
                <>
                  <Mail className="w-3 h-3 text-primary" />
                  <span className="text-[11px] font-bold">{monthName} Leaderboard (Email)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Ranking Tables Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 flex-1 min-h-0">
          <RankingBlock
            title={rankingMode === 'most_improved' ? "Onboard Movers" : "Onboarding"}
            icon={rankingMode === 'most_improved' ? TrendingUp : UserCheck}
            accent="text-emerald-700 dark:text-emerald-400"
            rows={activeOnboardingList.slice(0, TOP_N)}
            total={activeOnboardingList.length}
            variant="onboarding"
            mode={rankingMode}
            onRowClick={handleRowClick}
            onExpand={() => setExpanded('onboarding')}
          />
          <RankingBlock
            title={rankingMode === 'most_improved' ? "Adoption Movers" : "Adoption"}
            icon={rankingMode === 'most_improved' ? TrendingUp : Target}
            accent={rankingMode === 'most_improved' ? "text-emerald-600 dark:text-emerald-400" : "text-primary"}
            rows={activeAdoptionList.slice(0, TOP_N)}
            total={activeAdoptionList.length}
            variant="adoption"
            mode={rankingMode}
            onRowClick={handleRowClick}
            onExpand={() => setExpanded('adoption')}
          />
        </div>
      </Card>

      {/* MODAL: Full Standings Table */}
      {expanded && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-sm p-4 font-sans select-none"
          onClick={() => setExpanded(null)}
        >
          <div
            className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-xl max-h-[82vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-slate-50/80 dark:bg-slate-800/80 shrink-0">
              <div className="flex items-center gap-2">
                {expanded === 'onboarding'
                  ? <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  : <Target className="w-4 h-4 text-primary" />}
                <div>
                  <h3 className="text-sm font-black text-foreground leading-tight">{modalTitle}</h3>
                  <p className="text-[12px] text-muted-foreground font-medium">
                    {dimLabel} Scope · {modalRows.length} total entries
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="h-7 px-2.5 rounded-lg border border-border bg-card hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-primary" />}
                  <span className="text-[11px]">{copied ? 'Copied!' : 'Copy List'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setExpanded(null)}
                  className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Table Content */}
            <div className="overflow-y-auto scrollbar-thin px-4 py-3 flex-1">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border text-[11px] font-bold text-muted-foreground uppercase pb-1">
                    <th className="py-1 px-1 w-8 text-center">#</th>
                    <th className="py-1 px-2">Name & Scope</th>
                    <th className="py-1 px-2">Maturity Tier</th>
                    <th className="py-1 px-2 text-right">{expanded === 'onboarding' ? 'Onboarding' : 'Adoption Rate'}</th>
                  </tr>
                </thead>
                <tbody>
                  {modalRows.map(item => (
                    <tr
                      key={`modal-${item.id}`}
                      onClick={() => handleRowClick(item)}
                      className="hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors cursor-pointer border-b border-border/40 last:border-b-0"
                    >
                      <td className="py-2 px-1 text-center font-bold">{renderRankBadge(item.rank)}</td>
                      <td className="py-2 px-2">
                        <div className="font-bold text-foreground hover:text-primary transition-colors flex items-center gap-1.5">
                          <span>{item.nombre}</span>
                          {item.tipo === 'market_line' && item.lineaNegocio && (
                            <span className="text-[10px] font-black px-1 py-0.2 rounded border uppercase bg-slate-500/10 text-muted-foreground border-border">
                              {BL_SHORT[item.lineaNegocio] || 'BL'}
                            </span>
                          )}
                        </div>
                        <div className="text-muted-foreground text-[11px]">
                          {item.persona || `${item.onboardedCount}/${item.assignedCount} accounts`}
                        </div>
                      </td>
                      <td className="py-2 px-2">
                        {renderTierBadge(item.tier)}
                      </td>
                      <td className="py-2 px-2 text-right font-mono">
                        <div className="font-bold text-foreground text-xs">
                          {formatPct(expanded === 'onboarding' ? item.onboardingPct : item.adopcionPct)}
                        </div>
                        {item.momDelta > 0 && (
                          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                            ▲ +{item.momDelta.toFixed(1)}% MoM
                          </div>
                        )}
                      </td>
                    </tr>
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
