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
  possibleValues = null,
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

  const possibleSet = useMemo(() => {
    if (!possibleValues) return null;
    return new Set(Array.isArray(possibleValues) ? possibleValues.map(String) : possibleValues);
  }, [possibleValues]);

  const filteredOptions = useMemo(() => {
    if (!searchQuery) return options;
    const q = searchQuery.toLowerCase().trim();
    return options.filter(opt => String(opt).toLowerCase().includes(q));
  }, [options, searchQuery]);

  const commitDrag = () => {
    const final = dragSessionSetRef.current;
    if (final) {
      onChange(Array.from(final));
    }
    dragBaselineRef.current = null;
    dragSessionSetRef.current = null;
    setDragPreview(null);
  };

  const handleMouseDown = (e, optVal) => {
    e.preventDefault();
    isMouseDownRef.current = true;
    dragStartedRef.current = false;
    dragStartPosRef.current = { x: e.clientX, y: e.clientY };

    const isCurrentlySelected = selectedSet.has(optVal);
    dragModeRef.current = isCurrentlySelected ? "deselect" : "select";

    const baseline = new Set(selectedSet);
    dragBaselineRef.current = baseline;
    const session = new Set(baseline);

    if (isCurrentlySelected) {
      session.delete(optVal);
    } else {
      session.add(optVal);
    }

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

  const handleMouseEnter = (optVal) => {
    if (!isMouseDownRef.current) return;
    if (dragTouchedRef.current.has(optVal)) return;

    dragTouchedRef.current.add(optVal);
    const session = dragSessionSetRef.current;
    if (!session) return;

    if (dragModeRef.current === "select") {
      session.add(optVal);
    } else {
      session.delete(optVal);
    }

    setDragPreview(new Set(session));
  };

  const getOptionState = (opt) => {
    const optStr = String(opt);
    const isSelected = dragPreview ? dragPreview.has(optStr) : selectedSet.has(optStr);
    if (isSelected) return "selected";

    if (possibleSet && !possibleSet.has(optStr)) {
      return "excluded"; // Gris asociativo
    }

    return "possible";
  };

  return (
    <div className={cn("p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 select-none shadow-2xs", className)}>
      {/* Cabecera sin encimarse */}
      <div className="flex items-center justify-between gap-2 mb-2 shrink-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider truncate">
            {label}
          </span>
          {selectedSet.size > 0 && (
            <Badge variant="default" className="text-[9px] px-1.5 py-0 font-bold h-4 shrink-0">
              {selectedSet.size}
            </Badge>
          )}
        </div>
        {selectedSet.size > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-[10px] text-primary dark:text-sky-400 hover:underline font-bold shrink-0 cursor-pointer"
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
            className="w-full px-2.5 py-1 text-[11px] rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary shadow-xxs"
          />
        </div>
      )}

      {grid ? (
        <div className={cn("grid gap-1", GRID_COLS_CLASS[gridCols] || "grid-cols-4")}>
          {filteredOptions.map(opt => {
            const optStr = String(opt);
            const state = getOptionState(opt);
            const isSelected = state === "selected";
            const isExcluded = state === "excluded";

            let btnClass = "bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800 font-semibold";
            if (isSelected) {
              btnClass = "bg-primary text-primary-foreground border-primary font-bold shadow-xs";
            } else if (isExcluded) {
              btnClass = "bg-slate-100 dark:bg-slate-950/40 text-slate-400 dark:text-slate-600 border-slate-200/40 dark:border-slate-900 font-normal opacity-60";
            }

            return (
              <button
                key={optStr}
                type="button"
                onMouseDown={(e) => handleMouseDown(e, optStr)}
                onMouseEnter={() => handleMouseEnter(optStr)}
                className={cn(
                  "text-center py-1 text-[10px] rounded-lg border transition-all cursor-pointer select-none",
                  btnClass
                )}
                title={optStr}
              >
                {formatLabel(opt)}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="space-y-1 max-h-36 overflow-y-auto pr-0.5 scrollbar-thin">
          {filteredOptions.map(opt => {
            const optStr = String(opt);
            const state = getOptionState(opt);
            const isSelected = state === "selected";
            const isExcluded = state === "excluded";

            let btnClass = "bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800 font-medium";
            if (isSelected) {
              btnClass = "bg-primary text-primary-foreground border-primary font-bold shadow-xs";
            } else if (isExcluded) {
              btnClass = "bg-slate-100 dark:bg-slate-950/40 text-slate-400 dark:text-slate-600 border-slate-200/40 dark:border-slate-900 font-normal opacity-60";
            }

            return (
              <button
                key={optStr}
                type="button"
                onMouseDown={(e) => handleMouseDown(e, optStr)}
                onMouseEnter={() => handleMouseEnter(optStr)}
                className={cn(
                  "w-full text-left px-2.5 py-1.5 text-[11px] rounded-lg border transition-all flex items-center justify-between cursor-pointer select-none",
                  btnClass
                )}
                title={optStr}
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
