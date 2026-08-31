import * as React from "react"
import { cn } from "@/lib/utils"

const BADGE_VARIANTS = {
  default: "border-transparent bg-primary text-primary-foreground",
  secondary: "border-transparent bg-secondary text-secondary-foreground",
  destructive: "border-transparent bg-destructive/15 text-destructive border-destructive/20",
  outline: "text-foreground border-border",
  success: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  warning: "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  danger: "border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400",
  info: "border-sky-500/20 bg-sky-500/10 text-sky-600 dark:text-sky-400",
};

export function Badge({ className, variant = "default", ...props }) {
  const variantClass = BADGE_VARIANTS[variant] || BADGE_VARIANTS.default;
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[12px] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring tabular-nums select-none",
        variantClass,
        className
      )}
      {...props}
    />
  );
}
