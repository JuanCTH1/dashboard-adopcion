import React from 'react';
import { Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AppLogo({ className }) {
  return (
    <div className={cn("flex items-center gap-2.5 select-none", className)}>
      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary via-blue-700 to-indigo-800 text-white flex items-center justify-center shadow-xs">
        <Layers className="w-4 h-4" />
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
        <div className="text-[12px] text-muted-foreground font-medium mt-0.5">
          Tablero de Gestión Comercial & Digital
        </div>
      </div>
    </div>
  );
}
