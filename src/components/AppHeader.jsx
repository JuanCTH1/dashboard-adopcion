import React, { useState, useRef, useEffect } from 'react';
import { Search, Sun, Moon, Download, X, Filter, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AppLogo } from '@/components/ui/AppLogo';
import { cn } from '@/lib/utils';

export function AppHeader({
  sidebarOpen,
  onToggleSidebar,
  activeChips = [],
  onRemoveChip,
  onClearAllChips,
  onOpenSearch,
  isDark,
  onToggleDark,
  onExportCsv
}) {
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const MAX_VISIBLE = 3;
  const visibleChips = activeChips.slice(0, MAX_VISIBLE);
  const hiddenChips = activeChips.slice(MAX_VISIBLE);

  return (
    <header className="border-b border-border bg-card sticky top-0 z-30 shadow-xxs transition-colors select-none font-sans">
      {/* Fixed Single-Level Header Bar (Zero Layout Shift) */}
      <div className="h-12 px-4 sm:px-6 flex items-center justify-between gap-3 bg-card">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <AppLogo />

          <div className="h-4 w-[1px] bg-border hidden md:block shrink-0" />

          {/* Omnibox Search Button */}
          <button
            type="button"
            onClick={onOpenSearch}
            className="hidden md:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 hover:bg-slate-200/80 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium border border-border transition-all cursor-pointer shadow-xxs shrink-0"
          >
            <Search className="w-3.5 h-3.5 text-primary" />
            <span className="hidden lg:inline">Search rep, city, customer...</span>
            <span className="lg:hidden">Search...</span>
            <kbd className="text-[12px] bg-card px-1 py-0.5 rounded border border-border text-muted-foreground font-mono ml-1 shadow-xxs hidden xl:inline">
              Ctrl+K
            </kbd>
          </button>

          {/* INLINE ACTIVE FILTER CHIPS (MAX 3 VISIBLE + N MORE POPOVER, ZERO OVERFLOW) */}
          {activeChips.length > 0 && (
            <div className="flex items-center gap-1.5 min-w-0 flex-1 relative">
              <div className="h-4 w-[1px] bg-border shrink-0 hidden sm:block" />
              <Filter className="w-3.5 h-3.5 text-primary shrink-0" />

              {/* Visible Chips */}
              <div className="flex items-center gap-1.5 overflow-hidden flex-wrap max-h-7">
                {visibleChips.map((chip) => (
                  <Badge
                    key={chip.key}
                    variant="info"
                    className="gap-1 text-xs font-semibold pl-2 pr-1 py-0.5 shadow-xxs border-sky-500/30 shrink-0"
                  >
                    <span>{chip.label ? <b>{chip.label}: </b> : null}{chip.value}</span>
                    <button
                      type="button"
                      onClick={() => onRemoveChip(chip.key)}
                      className="p-0.5 rounded-full hover:bg-sky-500/20 text-sky-700 dark:text-sky-300 transition-colors cursor-pointer"
                      title="Remove filter"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </Badge>
                ))}
              </div>

              {/* +N More Dropdown Pill */}
              {hiddenChips.length > 0 && (
                <div className="relative shrink-0" ref={moreRef}>
                  <button
                    type="button"
                    onClick={() => setMoreOpen(!moreOpen)}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-border cursor-pointer shadow-xxs transition-colors"
                  >
                    <span>+{hiddenChips.length} more</span>
                    <ChevronDown className="w-2.5 h-2.5" />
                  </button>

                  {moreOpen && (
                    <div className="absolute top-full left-0 mt-1.5 p-2 bg-card dark:bg-slate-900 rounded-xl shadow-xl border-2 border-border z-50 flex flex-col gap-1.5 min-w-[160px] animate-in fade-in-0 zoom-in-95">
                      <div className="text-[10px] font-black uppercase text-muted-foreground tracking-wider pb-1 border-b border-border">
                        Active Filters ({activeChips.length})
                      </div>
                      {hiddenChips.map((chip) => (
                        <Badge
                          key={chip.key}
                          variant="info"
                          className="gap-1 text-xs font-semibold pl-2 pr-1 py-0.5 justify-between shadow-xxs border-sky-500/30 w-full"
                        >
                          <span className="truncate">{chip.label ? <b>{chip.label}: </b> : null}{chip.value}</span>
                          <button
                            type="button"
                            onClick={() => onRemoveChip(chip.key)}
                            className="p-0.5 rounded-full hover:bg-sky-500/20 text-sky-700 dark:text-sky-300 transition-colors cursor-pointer shrink-0"
                            title="Remove filter"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={onClearAllChips}
                className="text-xs text-primary hover:underline font-bold shrink-0 cursor-pointer ml-1"
                title="Reset all filters to current month default"
              >
                Reset
              </button>
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onExportCsv}
            className="gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground shadow-xxs"
          >
            <Download className="w-3.5 h-3.5 text-primary" />
            <span className="hidden sm:inline">Export CSV</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleDark}
            className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </Button>
        </div>
      </div>
    </header>
  );
}
