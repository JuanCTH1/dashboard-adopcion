import React, { useState, useEffect } from 'react';
import { Search, User, Users, MapPin, Building, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CommandPalette({
  isOpen,
  onClose,
  items = { vendedores: [], gerentes: [], directores: [], regiones: [] },
  onSelectItem
}) {
  const [query, setQuery] = useState('');

  // Escuchar tecla Escape
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', onKeyDown);
      return () => window.removeEventListener('keydown', onKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  // Filtrar resultados
  const vendedoresMatch = (items.vendedores || [])
    .filter(v => v.nombre.toLowerCase().includes(q) || v.plaza.toLowerCase().includes(q) || v.id.toLowerCase().includes(q))
    .slice(0, 5);

  const gerentesMatch = (items.gerentes || [])
    .filter(g => g.nombre.toLowerCase().includes(q) || g.id.toLowerCase().includes(q))
    .slice(0, 3);

  const directoresMatch = (items.directores || [])
    .filter(d => d.nombre.toLowerCase().includes(q) || d.id.toLowerCase().includes(q))
    .slice(0, 2);

  const handleSelect = (tipo, item) => {
    onSelectItem(tipo, item);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-start justify-center pt-16 px-4 animate-in fade-in-0 duration-150">
      <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        {/* Input de Búsqueda */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border/80 bg-slate-50/50 dark:bg-slate-850/50">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Escribe el nombre de un vendedor, gerente, plaza o cliente (ej. Juan, Dallas, CLI)..."
            className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-muted-foreground hover:text-foreground rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Lista de Resultados */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-3">
          {/* Vendedores */}
          {vendedoresMatch.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 py-1">
                Vendedores ({vendedoresMatch.length})
              </div>
              <div className="space-y-0.5">
                {vendedoresMatch.map(v => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => handleSelect('vendedor', v)}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                          {v.nombre}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {v.plaza} · {v.regionNombre} · {v.id}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono">Ir a Cartera ?</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Gerentes */}
          {gerentesMatch.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 py-1">
                Gerentes ({gerentesMatch.length})
              </div>
              <div className="space-y-0.5">
                {gerentesMatch.map(g => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => handleSelect('gerente', g)}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-xs">
                        <Users className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                          {g.nombre}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {g.id}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono">Ver Equipo ?</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Directores */}
          {directoresMatch.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 py-1">
                Directores ({directoresMatch.length})
              </div>
              <div className="space-y-0.5">
                {directoresMatch.map(d => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => handleSelect('director', d)}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold text-xs">
                        <Building className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                          {d.nombre}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {d.id}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono">Ver Región ?</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {vendedoresMatch.length === 0 && gerentesMatch.length === 0 && directoresMatch.length === 0 && (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No se encontraron coincidencias para "{query}".
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-border/80 bg-slate-50/80 dark:bg-slate-850/80 text-[10px] text-muted-foreground flex items-center justify-between">
          <span>Navega con teclado o clic</span>
          <span>Presiona <b>ESC</b> para cerrar</span>
        </div>
      </div>
    </div>
  );
}
