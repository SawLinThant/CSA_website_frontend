"use client";

import * as React from "react";
import { THEME_STORAGE_KEY } from "@/lib/theme-storage";

const MEDIA = "(prefers-color-scheme: dark)";

export type ThemeName = "light" | "dark" | "system";

export type ThemeContextValue = {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  resolvedTheme: "light" | "dark";
  themes: string[];
  systemTheme: "light" | "dark";
};

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined);

function getSystemTheme(): "light" | "dark" {
  return window.matchMedia(MEDIA).matches ? "dark" : "light";
}

function applyThemeClass(resolved: "light" | "dark") {
  document.documentElement.classList.toggle("dark", resolved === "dark");
}

function readStoredTheme(): ThemeName | null {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    if (raw === "light" || raw === "dark" || raw === "system") return raw;
  } catch {
    /* private mode / blocked */
  }
  return null;
}

/**
 * Theme via `.dark` on `documentElement`. React 19 forbids &lt;script&gt; in the React tree (even in RSC),
 * so we apply the stored theme in `useLayoutEffect` before the browser paints after hydration.
 */
export function ThemeProvider({
  children,
  defaultTheme = "light",
  enableSystem = true,
}: {
  children: React.ReactNode;
  defaultTheme?: ThemeName;
  enableSystem?: boolean;
  /** Kept for API compatibility with next-themes; only `class` (`.dark`) is supported. */
  attribute?: "class";
}) {
  const [theme, setThemeState] = React.useState<ThemeName>(defaultTheme);
  const [systemTheme, setSystemTheme] = React.useState<"light" | "dark">("light");
  const [mounted, setMounted] = React.useState(false);

  // Before paint after hydration: read storage and sync DOM (React 19: no inline <script> in tree).
  React.useLayoutEffect(() => {
    setMounted(true);
    const sys = getSystemTheme();
    setSystemTheme(sys);
    const stored = readStoredTheme();
    const initial = stored ?? defaultTheme;
    setThemeState(initial);
    const resolved = initial === "system" ? sys : initial;
    applyThemeClass(resolved);
  }, [defaultTheme]);

  React.useEffect(() => {
    if (!mounted) return;
    const mq = window.matchMedia(MEDIA);
    const onChange = () => {
      const sys = getSystemTheme();
      setSystemTheme(sys);
      if (theme === "system") applyThemeClass(sys);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [mounted, theme]);

  React.useLayoutEffect(() => {
    if (!mounted) return;
    const resolved = theme === "system" ? systemTheme : theme;
    applyThemeClass(resolved);
  }, [mounted, theme, systemTheme]);

  const setTheme = React.useCallback(
    (next: ThemeName) => {
      if (!enableSystem && next === "system") return;
      setThemeState(next);
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        /* ignore */
      }
      const resolved = next === "system" ? getSystemTheme() : next;
      applyThemeClass(resolved);
    },
    [enableSystem],
  );

  const resolvedTheme = theme === "system" ? systemTheme : theme;

  const value = React.useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme,
      resolvedTheme,
      themes: enableSystem ? ["light", "dark", "system"] : ["light", "dark"],
      systemTheme,
    }),
    [theme, setTheme, resolvedTheme, enableSystem, systemTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/** Mirrors next-themes `useTheme` enough for our app (e.g. Sonner). */
export function useTheme(): Partial<ThemeContextValue> & {
  setTheme: (theme: string) => void;
  themes: string[];
} {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) {
    return {
      setTheme: () => {},
      themes: [],
    };
  }
  return {
    theme: ctx.theme,
    setTheme: (t: string) => {
      if (t === "light" || t === "dark" || t === "system") ctx.setTheme(t);
    },
    resolvedTheme: ctx.resolvedTheme,
    themes: ctx.themes,
    systemTheme: ctx.systemTheme,
  };
}
