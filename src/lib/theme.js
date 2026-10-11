import { useState, useEffect } from "react";

/**
 * Categorical chart palette (light / dark) and semantic tokens.
 * Generic Tailwind-based colors, no brand-specific values.
 */

export const CAT_LIGHT = [
  "#4338CA", // 1. Indigo
  "#22C55E", // 2. Green
  "#F59E0B", // 3. Amber
  "#0EA5E9", // 4. Sky
  "#A855F7", // 5. Purple
  "#F97316", // 6. Orange
  "#DC2626", // 7. Red
  "#475569", // 8. Slate 600
];

export const CAT_DARK = [
  "#818CF8", // 1. Indigo (bright)
  "#22C55E", // 2. Green
  "#F59E0B", // 3. Amber
  "#A855F7", // 4. Purple
  "#F97316", // 5. Orange
  "#DC2626", // 6. Red
  "#38bdf8", // 7. Sky 400
  "#94a3b8", // 8. Slate 400
];

// Universal semantic tokens
export const OK = "#10b981", WARN = "#F59E0B", BAD = "#DC2626", INK = "#0f172a", MUT = "#64748b", BLUE = "#4338CA";

export function useChartTheme() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof document === "undefined") return false;
    return document.documentElement.classList.contains("dark");
  });

  useEffect(() => {
    if (typeof document === "undefined") return;

    const checkDark = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };

    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    window.addEventListener("storage", checkDark);

    return () => {
      observer.disconnect();
      window.removeEventListener("storage", checkDark);
    };
  }, []);

  return {
    isDark,
    cat: isDark ? CAT_DARK : CAT_LIGHT,
    primary: isDark ? "#818CF8" : "#4338CA",
    secondary: isDark ? "#F59E0B" : "#d97706",
    grid: isDark ? "#1e293b" : "#f1f5f9",
    textMuted: isDark ? "#94a3b8" : "#64748b",
    ok: "#22C55E",
    warn: "#F59E0B",
    bad: "#DC2626"
  };
}