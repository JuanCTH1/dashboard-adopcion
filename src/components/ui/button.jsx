import * as React from "react"
import { cn } from "@/lib/utils"

const BUTTON_VARIANTS = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-xs",
  outline: "border border-border bg-card hover:bg-muted text-foreground",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  ghost: "hover:bg-muted hover:text-foreground",
  link: "text-primary underline-offset-4 hover:underline",
  dense: "bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 border border-border/80"
};

const BUTTON_SIZES = {
  default: "h-8 px-3 py-1.5",
  sm: "h-7 rounded-md px-2.5 text-[11px]",
  lg: "h-9 rounded-lg px-4 text-sm",
  icon: "h-7 w-7 p-0 flex items-center justify-center",
  compact: "h-6 px-2 text-[11px] rounded"
};

export const Button = React.forwardRef(({ className, variant = "default", size = "default", ...props }, ref) => {
  const variantClass = BUTTON_VARIANTS[variant] || BUTTON_VARIANTS.default;
  const sizeClass = BUTTON_SIZES[size] || BUTTON_SIZES.default;
  
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-xs font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none",
        variantClass,
        sizeClass,
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = "Button";
