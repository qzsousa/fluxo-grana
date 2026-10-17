import { ref, computed, watch } from "vue";

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "theme";

/**
 * Estado global do tema. Módulo compartilhado entre todas as instâncias
 * do composable (evita recriar listeners a cada chamada).
 */
const preference = ref<ThemePreference>(
  (localStorage.getItem(STORAGE_KEY) as ThemePreference) || "system"
);
const systemPrefersDark = ref(
  typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-color-scheme: dark)").matches
);

let mediaQuery: MediaQueryList | null = null;
let applying = false;

function applyTheme(theme: ResolvedTheme) {
  if (typeof document === "undefined") return;
  applying = true;
  document.documentElement.setAttribute("data-theme", theme);
  // Mantém o <meta name="theme-color"> em sincronia com a barra do navegador
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", theme === "dark" ? "#121210" : "#f6f5f1");
  requestAnimationFrame(() => {
    applying = false;
  });
}

if (typeof window !== "undefined" && window.matchMedia) {
  mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  mediaQuery.addEventListener("change", (e) => {
    systemPrefersDark.value = e.matches;
  });
}

export function useTheme() {
  const resolvedTheme = computed<ResolvedTheme>(() =>
    preference.value === "system"
      ? systemPrefersDark.value
        ? "dark"
        : "light"
      : preference.value
  );

  watch(
    resolvedTheme,
    (theme) => {
      if (applying) return;
      applyTheme(theme);
    },
    { immediate: true }
  );

  watch(preference, (value) => {
    localStorage.setItem(STORAGE_KEY, value);
  });

  function setTheme(value: ThemePreference) {
    preference.value = value;
  }

  /** Cicla entre os três modos: claro -> escuro -> sistema */
  function cycleTheme() {
    const order: ThemePreference[] = ["light", "dark", "system"];
    const current = order.indexOf(preference.value);
    preference.value = order[(current + 1) % order.length];
  }

  return {
    preference,
    resolvedTheme,
    isDark: computed(() => resolvedTheme.value === "dark"),
    setTheme,
    cycleTheme,
  };
}

export const themeLabels: Record<ThemePreference, string> = {
  light: "Claro",
  dark: "Escuro",
  system: "Sistema",
};