import React, { useState, useMemo, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const DRAG_THRESHOLD_PX = 4;
const GRID_COLS_CLASS = { 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-4", 6: "grid-cols-6" };

export function FilterListbox({
  label,
  options = [],
  value = [],
  onChange,
  grid = false,
  gridCols = 4,
  showSearch = false,
  formatLabel = (opt) => opt,
  className = "",
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const isMouseDownRef = useRef(false);
  const dragStartedRef = useRef(false);
  const dragModeRef = useRef("select");
  const dragStartPosRef = useRef({ x: 0, y: 0 });
  const dragTouchedRef = useRef(new Set());
  const dragBaselineRef = useRef(null);
  const dragSessionSetRef = useRef(null);
  const [dragPreview, setDragPreview] = useState(null);

  const selectedSet = useMemo(() => {
    return new Set(Array.isArray(value) ? value.map(String) : [String(value)].filter(Boolean));
  }, [value]);

  const filteredOptions = useMemo(() => {
    if (!searchQuery) return options;
    const q = searchQuery.toLowerCase().trim();
    return options.filter(opt => String(opt).toLowerCase().includes(q));
  }, [options, searchQuery]);

  const commitDrag = () => {
    const baseline = dragBaselineRef.current;
    const final = dragSessionSetRef.current;
    if (baseline && final) {
      const nextSelected = Array.from(final);
      onChange(nextSelected);
    }
    dragBaselineRef.current = null;
    dragSessionSetRef.current = null;
    setDragPreview(null);
  };

  const handleMouseDown = (e, optVal, isSelected) => {
    isMouseDownRef.current = true;
    dragStartedRef.current = false;
    dragStartPosRef.current = { x: e.clientX, y: e.clientY };
    dragModeRef.current = isSelected ? "deselect" : "select";

    const baseline = new Set(selectedSet);
    dragBaselineRef.current = baseline;
    const session = new Set(baseline);
    if (isSelected) session.delete(optVal); else session.add(optVal);
    dragSessionSetRef.current = session;
    dragTouchedRef.current = new Set([optVal]);
    setDragPreview(new Set(session));

    const handleMouseMove = (moveEvent) => {
      const dx = moveEvent.clientX - dragStartPosRef.current.x;
      const dy = moveEvent.clientY - dragStartPosRef.current.y;
      if (Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD_PX) {
        dragStartedRef.current = true;
      }
    };

    const handleMouseUp = () => {
      isMouseDownRef.current = false;
      dragStartedRef.current = false;
      commitDrag();
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseEnter = (optVal, isSelected) => {
    if (!isMouseDownRef.current || !dragStartedRef.current) return;
    if (dragTouchedRef.current.has(optVal)) return;

    const shouldToggle =
      (dragModeRef.current === "select" && !isSelected) ||
      (dragModeRef.current === "deselect" && isSelected);
    if (!shouldToggle) return;

    dragTouchedRef.current.add(optVal);
    const session = dragSessionSetRef.current;
    if (dragModeRef.current === "select") session.add(optVal); else session.delete(optVal);
    setDragPreview(new Set(session));
  };

  const isOptSelected = (opt) => {
    const optStr = String(opt);
    if (dragPreview) return dragPreview.has(optStr);
    return selectedSet.has(optStr);
  };

  return (
    <div className={cn("p-2.5 bg-card rounded-xl border border-border select-none shadow-2xs", className)}>
      <div className="flex justify-between items-center mb-1.5 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{label}</span>
          {selectedSet.size > 0 && (
            <Badge variant="default" className="text-[9px] px-1.5 py-0 font-bold h-4">
              {selectedSet.size}
            </Badge>
          )}
        </div>
        {selectedSet.size > 0 && (
          <button
            onClick={() => onChange([])}
            className="text-[9px] text-primary hover:underline font-bold cursor-pointer"
          >
            Limpiar
          </button>
        )}
      </div>

      {showSearch && options.length > 4 && (
        <div className="mb-2">
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={`Buscar ${label.toLowerCase()}...`}
            className="w-full px-2 py-1 text-[11px] rounded-lg border border-border bg-slate-50 dark:bg-slate-900 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-xxs"
          />
        </div>
      )}

      {grid ? (
        <div className={cn("grid gap-1", GRID_COLS_CLASS[gridCols] || "grid-cols-4")}>
          {filteredOptions.map(opt => {
            const isSelected = isOptSelected(opt);
            return (
              <button
                key={String(opt)}
                type="button"
                onMouseDown={(e) => handleMouseDown(e, String(opt), isSelected)}
                onMouseEnter={() => handleMouseEnter(String(opt), isSelected)}
                className={cn(
                  "text-center py-1 text-[10px] rounded-md border font-bold transition-all cursor-pointer select-none",
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "bg-slate-50 dark:bg-slate-900 text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 border-border"
                )}
                title={String(opt)}
              >
                {formatLabel(opt)}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="space-y-1 max-h-36 overflow-y-auto pr-0.5 scrollbar-thin">
          {filteredOptions.map(opt => {
            const isSelected = isOptSelected(opt);
            return (
              <button
                key={String(opt)}
                type="button"
                onMouseDown={(e) => handleMouseDown(e, String(opt), isSelected)}
                onMouseEnter={() => handleMouseEnter(String(opt), isSelected)}
                className={cn(
                  "w-full text-left px-2 py-1 text-[11px] rounded-lg border font-medium transition-all flex items-center justify-between cursor-pointer select-none",
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary font-bold shadow-xs"
                    : "bg-slate-50 dark:bg-slate-900 text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 border-border"
                )}
                title={String(opt)}
              >
                <span className="truncate">{formatLabel(opt)}</span>
                {isSelected && <span className="text-[10px] font-bold">✔</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}