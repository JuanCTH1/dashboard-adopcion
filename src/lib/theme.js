import { useState, useEffect } from "react";

/**
 * PALETA DE COLOR OFICIAL CEMEX PARA DATA VISUALIZATION
 * Basada en el Brandbook Oficial:
 * - Pantone 293c (Azul Principal): #0000B3 / #002B99
 * - Pantone Red 032c (Rojo Marca & Alerta): #F22331
 * - Pantone 7479c (Verde Éxito): #53CC80
 * - Pantone 116c (Ámbar Advertencia): #FFB000
 * - Pantone 2192c (Azul Cielo): #398EF4
 * - Pantone 265c (Púrpura): #9A4CF5
 * - Pantone 137c (Naranja): #FF8000
 */

export const CAT_LIGHT = [
  "#0000B3", // 1. Azul Pantone 293c
  "#53CC80", // 2. Verde Pantone 7479c
  "#FFB000", // 3. Ámbar Pantone 116c
  "#398EF4", // 4. Azul Cielo Pantone 2192c
  "#9A4CF5", // 5. Púrpura Pantone 265c
  "#FF8000", // 6. Naranja Pantone 137c
  "#F22331", // 7. Rojo Pantone 032c
  "#475569", // 8. Slate 600
];

export const CAT_DARK = [
  "#398EF4", // 1. Azul Luminoso (Cielo)
  "#53CC80", // 2. Verde Luminoso
  "#FFB000", // 3. Ámbar Luminoso
  "#9A4CF5", // 4. Púrpura Luminoso
  "#FF8000", // 5. Naranja Luminoso
  "#F22331", // 6. Coral / Rojo
  "#38bdf8", // 7. Sky 400
  "#94a3b8", // 8. Slate 400
];

// Tokens semánticos universales
export const OK = "#10b981", WARN = "#FFB000", BAD = "#F22331", INK = "#0f172a", MUT = "#64748b", BLUE = "#0000B3";

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
    primary: isDark ? "#398EF4" : "#0000B3",
    secondary: isDark ? "#FFB000" : "#d97706",
    grid: isDark ? "#1e293b" : "#f1f5f9",
    textMuted: isDark ? "#94a3b8" : "#64748b",
    ok: "#53CC80",
    warn: "#FFB000",
    bad: "#F22331"
  };
}