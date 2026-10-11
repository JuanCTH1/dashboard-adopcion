import React from 'react';

/**
 * Permanent, non-dismissable notice. Rendered in normal flow above the whole
 * app so it stays visible on every screen (overlays are offset below it).
 */
export function DemoBanner() {
  return (
    <div
      role="note"
      className="shrink-0 h-7 w-full flex items-center justify-center px-3 bg-amber-300 text-slate-900 border-b border-amber-500/60 text-[11px] sm:text-xs font-bold tracking-wide text-center select-none font-sans z-[100]"
    >
      <span className="truncate">Demo — all data, companies and people are fictitious.</span>
    </div>
  );
}
