import React from 'react';
import { cn } from '@/lib/utils';

export function AppLogo({ className }) {
  return (
    <div className={cn("flex items-center gap-2.5 select-none", className)}>
      <div className="w-7 h-7 shrink-0 rounded-lg bg-gradient-to-br from-primary via-blue-700 to-indigo-800 shadow-xs overflow-hidden">
        <img src="/favicon.svg" alt="" className="w-full h-full" />
      </div>
      <div>
        <div className="flex items-center gap-1.5 leading-none">
          <span className="font-extrabold text-sm tracking-tight text-foreground font-sans">
            ADOPTION
          </span>
          <span className="text-[12px] font-bold text-primary px-1.5 py-0.2 rounded-full bg-primary/10 border border-primary/20">
            PRO
          </span>
        </div>
      </div>
    </div>
  );
}
