import React from 'react';
import { Search, Sun, Moon, Download, X, Filter } from 'lucide-react';
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
            <span className="hidden lg:inline">Search rep, city, account...</span>
            <span className="lg:hidden">Search...</span>
            <kbd className="text-[10px] bg-card px-1 py-0.5 rounded border border-border text-muted-foreground font-mono ml-1 shadow-xxs hidden xl:inline">
              Ctrl+K
            </kbd>
          </button>

          {/* INLINE ACTIVE FILTER CHIPS (PERFECT 48PX LOCKED HEIGHT, ZERO BRINCO) */}
          {activeChips.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5 min-w-0 flex-1">
              <div className="h-4 w-[1px] bg-border shrink-0 hidden sm:block" />
              <Filter className="w-3.5 h-3.5 text-primary shrink-0" />

              {activeChips.map((chip) => (
                <Badge
                  key={chip.key}
                  variant="info"
                  className="gap-1 text-[10px] font-semibold pl-2 pr-1 py-0.5 shadow-xxs border-sky-500/30 shrink-0"
                >
                  <span><b>{chip.label}:</b> {chip.value}</span>
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

              <button
                type="button"
                onClick={onClearAllChips}
                className="text-[10px] text-primary hover:underline font-bold shrink-0 cursor-pointer ml-1"
              >
                Clear all
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
