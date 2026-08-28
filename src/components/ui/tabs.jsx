import React, { createContext, useContext } from "react"
import { cn } from "@/lib/utils"

const TabsContext = createContext({ value: '', onValueChange: () => {} });

export function Tabs({ value, onValueChange, className, children, ...props }) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={cn("w-full", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "inline-flex h-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800/80 p-0.5 text-muted-foreground border border-border/80 select-none",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({ value: triggerValue, className, children, ...props }) {
  const { value, onValueChange } = useContext(TabsContext);
  const isActive = value === triggerValue;

  return (
    <button
      type="button"
      onClick={() => onValueChange(triggerValue)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-xs font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none",
        isActive
          ? "bg-white text-foreground shadow-xs dark:bg-slate-900"
          : "text-muted-foreground hover:text-foreground hover:bg-slate-200/50 dark:hover:bg-slate-800/50",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value: contentValue, className, children, ...props }) {
  const { value } = useContext(TabsContext);
  if (value !== contentValue) return null;

  return (
    <div className={cn("mt-2 focus-visible:outline-none", className)} {...props}>
      {children}
    </div>
  );
}