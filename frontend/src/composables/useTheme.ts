import { ref, watchEffect, watch } from "vue";

type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "theme";

function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "system";
  const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
  return stored ?? "system";
}

function prefersDark(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function resolveTheme(theme: Theme): "light" | "dark" {
  if (theme === "system") return prefersDark() ? "dark" : "light";
  return theme;
}

export function useTheme() {
  const theme = ref<Theme>(getStoredTheme());
  const resolved = ref<"light" | "dark">(resolveTheme(theme.value));

  watchEffect(() => {
    const r = resolveTheme(theme.value);
    resolved.value = r;
    const html = document.documentElement;
    if (r === "dark") {
      html.classList.add("dark");
      html.classList.remove("light");
    } else {
      html.classList.add("light");
      html.classList.remove("dark");
    }
  });

  const mediaQuery = typeof window !== "undefined" ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  if (mediaQuery) {
    mediaQuery.addEventListener("change", () => {
      if (theme.value === "system") {
        resolved.value = prefersDark() ? "dark" : "light";
      }
    });
  }

  function setTheme(newTheme: Theme) {
    theme.value = newTheme;
    localStorage.setItem(STORAGE_KEY, newTheme);
  }

  function toggleTheme() {
    const order: Theme[] = ["light", "dark", "system"];
    const currentIndex = order.indexOf(theme.value);
    const nextIndex = (currentIndex + 1) % order.length;
    setTheme(order[nextIndex]);
  }

  watch(() => theme.value, (newTheme) => {
    localStorage.setItem(STORAGE_KEY, newTheme);
  });

  return {
    theme,
    resolved,
    setTheme,
    toggleTheme,
  };
}

export type { Theme };