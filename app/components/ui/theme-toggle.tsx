"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "solpoll-theme";

function getStoredTheme(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY);
}

function setThemeOnHtml(theme: string) {
  const root = document.documentElement;
  root.classList.toggle("solana-dark", theme === "solana-dark");
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "solana-dark">("light");

  useEffect(() => {
    const stored = getStoredTheme();
    if (stored === "solana-dark" || stored === "tokio-night") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTheme("solana-dark");
      setThemeOnHtml("solana-dark");
      if (stored === "tokio-night") {
        localStorage.setItem(STORAGE_KEY, "solana-dark");
      }
    }
  }, []);

  function toggle() {
    const next = theme === "light" ? "solana-dark" : "light";
    setTheme(next);
    setThemeOnHtml(next);
    localStorage.setItem(STORAGE_KEY, next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle theme"
      className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-surface-alt"
    >
      {theme === "light" ? "Solana Dark" : "Light"}
    </button>
  );
}
