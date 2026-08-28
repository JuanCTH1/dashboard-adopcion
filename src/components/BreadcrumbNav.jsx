import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BreadcrumbNav({ items = [], onSelectLevel, className }) {
  return (
    <nav className={cn("flex items-center gap-1 text-xs text-muted-foreground select-none flex-wrap", className)}>
      <button
        type="button"
        onClick={() => onSelectLevel('nacional', null)}
        className="flex items-center gap-1 px-2 py-1 rounded-md hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-semibold cursor-pointer"
      >
        <Home className="w-3.5 h-3.5 text-primary" />
        <span>Nacional</span>
      </button>

      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;

        return (
          <React.Fragment key={item.id || idx}>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <button
              type="button"
              disabled={isLast}
              onClick={() => onSelectLevel(item.nivel, item.id)}
              className={cn(
                "px-2 py-1 rounded-md transition-colors font-semibold truncate max-w-[160px]",
                isLast
                  ? "text-foreground font-bold bg-slate-100 dark:bg-slate-800/80 cursor-default"
                  : "hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              )}
            >
              {item.nombre}
            </button>
          </React.Fragment>
        );
      })}
    </nav>
  );
}
