import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  User,
  Users,
  Building,
  Briefcase,
  Layers,
  Sparkles,
  ArrowRight,
  CornerDownLeft,
  X,
  FileSpreadsheet,
  SunMoon,
  RotateCcw,
  AlertCircle,
  TrendingUp,
  ShoppingCart,
  Calendar,
  Check,
  Clock,
  Laptop
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatNumber, formatCompactNumber, formatPct, cn } from '@/lib/utils';

const MAX_RESULTS_PER_SECTION = 6;

const QUICK_ACTIONS = [
  {
    id: 'open_action_plan',
    title: 'Open Commercial Action Plan',
    subtitle: 'View high-volume customers at risk and pending digital registration',
    category: 'Actions',
    icon: AlertCircle,
    color: 'text-rose-500 bg-rose-500/10'
  },
  {
    id: 'export_csv',
    title: 'Export Portfolio to CSV',
    subtitle: 'Download complete customer data for the active view',
    category: 'Actions',
    icon: FileSpreadsheet,
    color: 'text-emerald-500 bg-emerald-500/10'
  },
  {
    id: 'filter_pending',
    title: 'Filter: Unregistered / Pending Customers',
    subtitle: 'Show only customers who have not onboarded to the CX App',
    category: 'Presets',
    icon: Users,
    color: 'text-amber-500 bg-amber-500/10'
  },
  {
    id: 'filter_active',
    title: 'Filter: Digitally Active Customers',
    subtitle: 'Show only customers actively placing orders via digital channels',
    category: 'Presets',
    icon: TrendingUp,
    color: 'text-sky-500 bg-sky-500/10'
  },
  {
    id: 'toggle_theme',
    title: 'Toggle Dark / Light Theme',
    subtitle: 'Switch between dark workstation and clean light mode',
    category: 'Actions',
    icon: SunMoon,
    color: 'text-indigo-500 bg-indigo-500/10'
  },
  {
    id: 'reset_filters',
    title: 'Reset All Dashboard Filters',
    subtitle: 'Clear all selected years, business lines, and hierarchy levels',
    category: 'Actions',
    icon: RotateCcw,
    color: 'text-slate-500 bg-slate-500/10'
  }
];

export function CommandPalette({
  isOpen,
  onClose,
  data = { vps: [], directores: [], gerentes: [], vendedores: [], clientes: [] },
  onSelectItem
}) {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'customers' | 'team' | 'actions'
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentItems, setRecentItems] = useState(() => {
    try {
      const stored = localStorage.getItem('cx_dashboard_recent_searches');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const inputRef = useRef(null);
  const listContainerRef = useRef(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Save recent search
  const recordRecentItem = (tipo, item) => {
    try {
      const entry = {
        tipo,
        id: item.id || item.nombre || item.title,
        nombre: item.nombre || item.nombreEmpresa || item.title,
        subtitle: item.plaza || item.subtitle || item.persona || '',
        timestamp: Date.now()
      };
      const updated = [entry, ...recentItems.filter(r => r.id !== entry.id)].slice(0, 5);
      setRecentItems(updated);
      localStorage.setItem('cx_dashboard_recent_searches', JSON.stringify(updated));
    } catch {
      // Ignore local storage error
    }
  };

  const handleSelect = (tipo, item) => {
    recordRecentItem(tipo, item);
    onSelectItem?.(tipo, item);
    onClose();
  };

  // Filter items based on query and active tab
  const q = query.toLowerCase().trim();

  const filteredResults = useMemo(() => {
    const res = {
      actions: [],
      clientes: [],
      vendedores: [],
      gerentes: [],
      directores: [],
      vps: []
    };

    // 1. Actions & Presets
    if (activeTab === 'all' || activeTab === 'actions') {
      res.actions = QUICK_ACTIONS.filter(act => {
        if (!q) return true;
        return act.title.toLowerCase().includes(q) || act.subtitle.toLowerCase().includes(q);
      }).slice(0, MAX_RESULTS_PER_SECTION);
    }

    // 2. Customers
    if (activeTab === 'all' || activeTab === 'customers') {
      const allClients = data.clientes || [];
      if (!q) {
        // When empty query, show Top Pareto clients
        res.clientes = allClients.filter(c => c.esTopPareto).slice(0, MAX_RESULTS_PER_SECTION);
      } else {
        res.clientes = allClients.filter(c => {
          return (
            (c.nombreEmpresa && c.nombreEmpresa.toLowerCase().includes(q)) ||
            (c.id && c.id.toLowerCase().includes(q)) ||
            (c.plaza && c.plaza.toLowerCase().includes(q)) ||
            (c.lineaLabel && c.lineaLabel.toLowerCase().includes(q))
          );
        }).slice(0, MAX_RESULTS_PER_SECTION);
      }
    }

    // 3. Sales Reps
    if (activeTab === 'all' || activeTab === 'team') {
      const reps = data.vendedores || [];
      if (!q) {
        res.vendedores = reps.slice(0, 4);
      } else {
        res.vendedores = reps.filter(v => {
          return (
            v.nombre.toLowerCase().includes(q) ||
            v.plaza.toLowerCase().includes(q) ||
            v.id.toLowerCase().includes(q) ||
            (v.regionNombre && v.regionNombre.toLowerCase().includes(q))
          );
        }).slice(0, MAX_RESULTS_PER_SECTION);
      }
    }

    // 4. Markets / Gerentes
    if (activeTab === 'all' || activeTab === 'team') {
      const gers = data.gerentes || [];
      res.gerentes = gers.filter(g => {
        if (!q) return false;
        return g.nombre.toLowerCase().includes(q) || (g.persona && g.persona.toLowerCase().includes(q));
      }).slice(0, 4);
    }

    // 5. Regions / Directores
    if (activeTab === 'all' || activeTab === 'team') {
      const dirs = data.directores || [];
      res.directores = dirs.filter(d => {
        if (!q) return false;
        return d.nombre.toLowerCase().includes(q) || (d.persona && d.persona.toLowerCase().includes(q));
      }).slice(0, 4);
    }

    // 6. Business Lines / VPs
    if (activeTab === 'all' || activeTab === 'team') {
      const vps = data.vps || [];
      res.vps = vps.filter(v => {
        if (!q) return false;
        return v.nombre.toLowerCase().includes(q) || (v.persona && v.persona.toLowerCase().includes(q));
      }).slice(0, 3);
    }

    return res;
  }, [q, activeTab, data]);

  // Flatten active result items for keyboard arrow navigation
  const flatItems = useMemo(() => {
    const items = [];
    filteredResults.actions.forEach(a => items.push({ tipo: 'action', data: a }));
    filteredResults.clientes.forEach(c => items.push({ tipo: 'cliente', data: c }));
    filteredResults.vendedores.forEach(v => items.push({ tipo: 'vendedor', data: v }));
    filteredResults.gerentes.forEach(g => items.push({ tipo: 'gerente', data: g }));
    filteredResults.directores.forEach(d => items.push({ tipo: 'director', data: d }));
    filteredResults.vps.forEach(v => items.push({ tipo: 'vp', data: v }));
    return items;
  }, [filteredResults]);

  // Handle Keyboard Navigation (Up, Down, Enter, Escape)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev < flatItems.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : Math.max(0, flatItems.length - 1)));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (flatItems[selectedIndex]) {
          const item = flatItems[selectedIndex];
          handleSelect(item.tipo, item.data);
        }
      } else if (e.key === 'Tab') {
        e.preventDefault();
        const tabs = ['all', 'customers', 'team', 'actions'];
        const nextTabIdx = (tabs.indexOf(activeTab) + 1) % tabs.length;
        setActiveTab(tabs[nextTabIdx]);
        setSelectedIndex(0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, flatItems, selectedIndex, activeTab, onClose]);

  // Scroll active item into view
  useEffect(() => {
    const el = listContainerRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    if (el) {
      el.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  let currentGlobalIndex = 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-start justify-center pt-12 md:pt-20 px-3 sm:px-4 animate-in fade-in-0 duration-150 select-none font-sans">
      <div className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150 max-h-[82vh]">
        {/* 1. SEARCH INPUT HEADER */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border/80 bg-slate-50/80 dark:bg-slate-900/80 shrink-0">
          <Search className="w-4 h-4 text-primary shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search customers, sales reps, markets, regions, or commands..."
            className="w-full bg-transparent text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none font-medium"
          />

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="p-1 text-muted-foreground hover:text-foreground rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <div className="flex items-center gap-1 shrink-0">
            <kbd className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-muted text-muted-foreground border border-border rounded shadow-2xs">
              ESC
            </kbd>
          </div>
        </div>

        {/* 2. CATEGORY TABS */}
        <div className="flex items-center gap-1 px-3 py-1.5 border-b border-border/60 bg-slate-100/60 dark:bg-slate-900/40 text-xs shrink-0 overflow-x-auto scrollbar-none">
          {[
            { id: 'all', label: 'All Results' },
            { id: 'customers', label: '🏢 Customers' },
            { id: 'team', label: '👥 Hierarchy & Team' },
            { id: 'actions', label: '⚡ Actions & Presets' }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                setSelectedIndex(0);
              }}
              className={cn(
                "px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap",
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-slate-200/60 dark:hover:bg-slate-800"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 3. SCROLLABLE RESULTS LIST */}
        <div ref={listContainerRef} className="flex-1 overflow-y-auto p-2 space-y-3 scrollbar-thin">
          {/* A. QUICK ACTIONS & PRESETS */}
          {filteredResults.actions.length > 0 && (
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground px-2 py-1 flex items-center justify-between">
                <span>Quick Actions & Presets</span>
                <span className="text-[9px] font-mono">{filteredResults.actions.length}</span>
              </div>
              <div className="space-y-1">
                {filteredResults.actions.map(act => {
                  const idx = currentGlobalIndex++;
                  const isHighlighted = selectedIndex === idx;
                  const Icon = act.icon;

                  return (
                    <button
                      key={act.id}
                      data-index={idx}
                      type="button"
                      onClick={() => handleSelect('action', act)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={cn(
                        "w-full flex items-center justify-between p-2 rounded-xl transition-all text-left cursor-pointer border",
                        isHighlighted
                          ? "bg-primary/10 border-primary/40 text-foreground shadow-2xs"
                          : "bg-card border-transparent hover:bg-slate-100 dark:hover:bg-slate-800/80 text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0", act.color)}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="truncate">
                          <div className="text-xs font-bold text-foreground truncate">{act.title}</div>
                          <div className="text-[10.5px] text-muted-foreground truncate">{act.subtitle}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {isHighlighted && (
                          <span className="text-[10px] font-mono font-bold text-primary flex items-center gap-0.5">
                            Execute <CornerDownLeft className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* B. CUSTOMERS */}
          {filteredResults.clientes.length > 0 && (
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-primary px-2 py-1 flex items-center justify-between">
                <span>Customers</span>
                <span className="text-[9px] font-mono">{filteredResults.clientes.length}</span>
              </div>
              <div className="space-y-1">
                {filteredResults.clientes.map(cli => {
                  const idx = currentGlobalIndex++;
                  const isHighlighted = selectedIndex === idx;
                  const shortBl = cli.lineaNegocio === 'readymix' ? 'RMX' : cli.lineaNegocio === 'cemento' ? 'CEM' : 'AGG';

                  return (
                    <button
                      key={cli.id}
                      data-index={idx}
                      type="button"
                      onClick={() => handleSelect('cliente', cli)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={cn(
                        "w-full flex items-center justify-between p-2 rounded-xl transition-all text-left cursor-pointer border",
                        isHighlighted
                          ? "bg-primary/10 border-primary/40 text-foreground shadow-2xs"
                          : "bg-card border-transparent hover:bg-slate-100 dark:hover:bg-slate-800/80 text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-600 flex items-center justify-center font-bold text-xs shrink-0">
                          <ShoppingCart className="w-3.5 h-3.5" />
                        </div>
                        <div className="truncate">
                          <div className="text-xs font-bold text-foreground flex items-center gap-1.5 truncate">
                            {cli.esTopPareto && (
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" title="Top 20% Pareto Customer" />
                            )}
                            <span className="truncate">{cli.nombreEmpresa || cli.id}</span>
                            <span className={cn(
                              "text-[8px] font-black px-1.5 py-0.2 rounded border uppercase shrink-0",
                              shortBl === 'RMX' ? "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30" :
                              shortBl === 'CEM' ? "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30" :
                              "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30"
                            )}>
                              {shortBl}
                            </span>
                          </div>
                          <div className="text-[10px] text-muted-foreground flex items-center gap-1.5 truncate mt-0.5">
                            <span>{cli.plaza || 'USA'}</span>
                            <span>·</span>
                            <span>{cli.id}</span>
                            <span>·</span>
                            <span className="font-bold text-sky-700 dark:text-sky-400">{formatCompactNumber(cli.pedidosDigitales || 0)} digital ord</span>
                            <span>·</span>
                            <span className="font-bold">{cli.pctAdopcionPedidos || 0}% adopt</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        {!cli.estaIncorporado ? (
                          <Badge variant="danger" className="text-[9px] py-0.2 px-1.5 font-bold">
                            Pending
                          </Badge>
                        ) : cli.pedidosDigitales > 0 ? (
                          <Badge variant="success" className="text-[9px] py-0.2 px-1.5 font-bold">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[9px] py-0.2 px-1.5 font-bold bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30">
                            Onboarded
                          </Badge>
                        )}
                        {isHighlighted && (
                          <span className="text-[10px] font-mono font-bold text-primary flex items-center gap-0.5">
                            <CornerDownLeft className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* C. SALES REPS */}
          {filteredResults.vendedores.length > 0 && (
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 px-2 py-1 flex items-center justify-between">
                <span>Sales Representatives</span>
                <span className="text-[9px] font-mono">{filteredResults.vendedores.length}</span>
              </div>
              <div className="space-y-1">
                {filteredResults.vendedores.map(rep => {
                  const idx = currentGlobalIndex++;
                  const isHighlighted = selectedIndex === idx;

                  return (
                    <button
                      key={rep.id}
                      data-index={idx}
                      type="button"
                      onClick={() => handleSelect('vendedor', rep)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={cn(
                        "w-full flex items-center justify-between p-2 rounded-xl transition-all text-left cursor-pointer border",
                        isHighlighted
                          ? "bg-emerald-500/10 border-emerald-500/40 text-foreground shadow-2xs"
                          : "bg-card border-transparent hover:bg-slate-100 dark:hover:bg-slate-800/80 text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <div className="truncate">
                          <div className="text-xs font-bold text-foreground truncate">{rep.nombre}</div>
                          <div className="text-[10.5px] text-muted-foreground truncate">
                            {rep.plaza} · {rep.regionNombre} · {rep.id}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        <Badge variant="outline" className="text-[9.5px] font-bold">
                          {rep.bl || 'BL'}
                        </Badge>
                        {isHighlighted && (
                          <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                            Filter <CornerDownLeft className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* D. MARKETS */}
          {filteredResults.gerentes.length > 0 && (
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-sky-600 dark:text-sky-400 px-2 py-1 flex items-center justify-between">
                <span>Markets & Plazas</span>
                <span className="text-[9px] font-mono">{filteredResults.gerentes.length}</span>
              </div>
              <div className="space-y-1">
                {filteredResults.gerentes.map(ger => {
                  const idx = currentGlobalIndex++;
                  const isHighlighted = selectedIndex === idx;

                  return (
                    <button
                      key={ger.id || ger.nombre}
                      data-index={idx}
                      type="button"
                      onClick={() => handleSelect('gerente', ger)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={cn(
                        "w-full flex items-center justify-between p-2 rounded-xl transition-all text-left cursor-pointer border",
                        isHighlighted
                          ? "bg-sky-500/10 border-sky-500/40 text-foreground shadow-2xs"
                          : "bg-card border-transparent hover:bg-slate-100 dark:hover:bg-slate-800/80 text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-600 flex items-center justify-center font-bold text-xs shrink-0">
                          <Users className="w-3.5 h-3.5" />
                        </div>
                        <div className="truncate">
                          <div className="text-xs font-bold text-foreground truncate">{ger.nombre} Market</div>
                          <div className="text-[10.5px] text-muted-foreground truncate">{ger.persona || 'Market Manager'}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {isHighlighted && (
                          <span className="text-[10px] font-mono font-bold text-sky-600 dark:text-sky-400 flex items-center gap-0.5">
                            Filter <CornerDownLeft className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* E. REGIONS */}
          {filteredResults.directores.length > 0 && (
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 px-2 py-1 flex items-center justify-between">
                <span>Regions</span>
                <span className="text-[9px] font-mono">{filteredResults.directores.length}</span>
              </div>
              <div className="space-y-1">
                {filteredResults.directores.map(dir => {
                  const idx = currentGlobalIndex++;
                  const isHighlighted = selectedIndex === idx;

                  return (
                    <button
                      key={dir.id || dir.nombre}
                      data-index={idx}
                      type="button"
                      onClick={() => handleSelect('director', dir)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={cn(
                        "w-full flex items-center justify-between p-2 rounded-xl transition-all text-left cursor-pointer border",
                        isHighlighted
                          ? "bg-indigo-500/10 border-indigo-500/40 text-foreground shadow-2xs"
                          : "bg-card border-transparent hover:bg-slate-100 dark:hover:bg-slate-800/80 text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">
                          <Briefcase className="w-3.5 h-3.5" />
                        </div>
                        <div className="truncate">
                          <div className="text-xs font-bold text-foreground truncate">{dir.nombre} Region</div>
                          <div className="text-[10.5px] text-muted-foreground truncate">{dir.persona || 'Regional Director'}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {isHighlighted && (
                          <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5">
                            Filter <CornerDownLeft className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* F. BUSINESS LINES */}
          {filteredResults.vps.length > 0 && (
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-primary px-2 py-1 flex items-center justify-between">
                <span>Business Lines</span>
                <span className="text-[9px] font-mono">{filteredResults.vps.length}</span>
              </div>
              <div className="space-y-1">
                {filteredResults.vps.map(vp => {
                  const idx = currentGlobalIndex++;
                  const isHighlighted = selectedIndex === idx;

                  return (
                    <button
                      key={vp.id}
                      data-index={idx}
                      type="button"
                      onClick={() => handleSelect('vp', vp)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={cn(
                        "w-full flex items-center justify-between p-2 rounded-xl transition-all text-left cursor-pointer border",
                        isHighlighted
                          ? "bg-primary/10 border-primary/40 text-foreground shadow-2xs"
                          : "bg-card border-transparent hover:bg-slate-100 dark:hover:bg-slate-800/80 text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                          <Building className="w-3.5 h-3.5" />
                        </div>
                        <div className="truncate">
                          <div className="text-xs font-bold text-foreground truncate">{vp.nombre} Business Line</div>
                          <div className="text-[10.5px] text-muted-foreground truncate">{vp.persona || 'VP Leadership'}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {isHighlighted && (
                          <span className="text-[10px] font-mono font-bold text-primary flex items-center gap-0.5">
                            Filter <CornerDownLeft className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* EMPTY STATE */}
          {flatItems.length === 0 && (
            <div className="py-12 text-center text-xs text-muted-foreground flex flex-col items-center justify-center space-y-2">
              <Search className="w-8 h-8 text-muted-foreground/40" />
              <div className="font-bold text-foreground">No matching results found for "{query}"</div>
              <div className="text-[11px] text-muted-foreground max-w-sm">
                Try searching for a customer name (e.g. <i>Apex</i>), client ID (<i>CLI-00123</i>), market (<i>Dallas</i>), or command (<i>Export</i>).
              </div>
            </div>
          )}
        </div>

        {/* 4. KEYBOARD SHORTCUTS FOOTER */}
        <div className="px-4 py-2 border-t border-border/80 bg-slate-50/80 dark:bg-slate-900/80 text-[10.5px] text-muted-foreground flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.2 text-[9px] font-mono font-bold bg-muted border border-border rounded shadow-2xs">↑</kbd>
              <kbd className="px-1 py-0.2 text-[9px] font-mono font-bold bg-muted border border-border rounded shadow-2xs">↓</kbd>
              <span>Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.2 text-[9px] font-mono font-bold bg-muted border border-border rounded shadow-2xs">↵</kbd>
              <span>Select</span>
            </span>
            <span className="flex items-center gap-1 hidden sm:inline-flex">
              <kbd className="px-1.5 py-0.2 text-[9px] font-mono font-bold bg-muted border border-border rounded shadow-2xs">Tab</kbd>
              <span>Category</span>
            </span>
          </div>

          <div className="text-[10px] font-semibold text-primary">
            {flatItems.length} result{flatItems.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CommandPalette;

