import { ref, computed, watch } from "vue";

/**
 * Preferências de aparência e comportamento, persistidas em localStorage.
 *
 * Fica no navegador de propósito: são escolhas de dispositivo (cor, densidade,
 * tamanho do texto), não dados da conta. Sincronizar com o servidor custaria
 * uma coluna `preferences` em `User` e um PUT a cada troca de tema.
 *
 * A aplicação é toda por atributo no <html> — o CSS em `styles/main.css` faz
 * o resto, então nenhum componente precisa reagir a essas mudanças.
 */

export type AccentId =
  | "petroleo"
  | "indigo"
  | "violeta"
  | "azul"
  | "esmeralda"
  | "ambar"
  | "rosa"
  | "grafite";

export type Density = "comfortable" | "compact";
export type FontScale = "small" | "normal" | "large";
/** Estilo dos lembretes na tela inicial: post-it animado ou campo comum. */
export type NotesStyle = "postit" | "plain";

export interface Preferences {
  accent: AccentId;
  density: Density;
  fontScale: FontScale;
  notesStyle: NotesStyle;
  /** Antecedência, em dias, do aviso de fatura. */
  invoiceReminderDays: number;
  /** Aviso de fatura pelo sistema operacional, não só dentro do app. */
  browserNotifications: boolean;
  /** Aviso dentro do app (sino + toast), independente do sistema. */
  inAppNotifications: boolean;
  currency: string;
  locale: string;
}

export interface AccentOption {
  id: AccentId;
  label: string;
  /** Amostra da cor no tema claro, usada no seletor. */
  swatch: string;
  /** Amostra da cor no tema escuro. */
  swatchDark: string;
}

export const ACCENTS: AccentOption[] = [
  { id: "petroleo", label: "Petróleo", swatch: "#0e6e63", swatchDark: "#3cbfae" },
  { id: "indigo", label: "Índigo", swatch: "#4f46e5", swatchDark: "#8b8cf7" },
  { id: "violeta", label: "Violeta", swatch: "#7c3aed", swatchDark: "#a78bfa" },
  { id: "azul", label: "Azul", swatch: "#1d4ed8", swatchDark: "#60a5fa" },
  { id: "esmeralda", label: "Esmeralda", swatch: "#047857", swatchDark: "#34d399" },
  { id: "ambar", label: "Âmbar", swatch: "#b45309", swatchDark: "#fbbf24" },
  { id: "rosa", label: "Rosa", swatch: "#be185d", swatchDark: "#f472b6" },
  { id: "grafite", label: "Grafite", swatch: "#3f3f46", swatchDark: "#a1a1aa" },
];

export const DENSITY_OPTIONS: { value: Density; label: string; hint: string }[] = [
  { value: "comfortable", label: "Confortável", hint: "Mais respiro entre as linhas" },
  { value: "compact", label: "Compacto", hint: "Cabe mais itens na tela" },
];

export const FONT_SCALE_OPTIONS: { value: FontScale; label: string }[] = [
  { value: "small", label: "Pequeno" },
  { value: "normal", label: "Normal" },
  { value: "large", label: "Grande" },
];

export const NOTES_STYLE_OPTIONS: { value: NotesStyle; label: string; hint: string }[] = [
  { value: "postit", label: "Post-it", hint: "Papelzinho inclinado que balança ao passar o mouse" },
  { value: "plain", label: "Campo comum", hint: "Lista limpa, sem、趣味 visual" },
];

const STORAGE_KEY = "preferences";

const DEFAULTS: Preferences = {
  accent: "petroleo",
  density: "comfortable",
  fontScale: "normal",
  notesStyle: "postit",
  invoiceReminderDays: 5,
  browserNotifications: false,
  inAppNotifications: true,
  currency: "BRL",
  locale: "pt-BR",
};

function isAccent(value: unknown): value is AccentId {
  return ACCENTS.some((accent) => accent.id === value);
}

function clampDays(value: unknown): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return DEFAULTS.invoiceReminderDays;
  return Math.min(Math.max(Math.trunc(parsed), 1), 14);
}

function read(): Preferences {
  if (typeof localStorage === "undefined") return { ...DEFAULTS };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS };

    const parsed = JSON.parse(raw) as Partial<Preferences>;
    return {
      accent: isAccent(parsed.accent) ? parsed.accent : DEFAULTS.accent,
      density: parsed.density === "compact" ? "compact" : DEFAULTS.density,
      fontScale:
        parsed.fontScale === "small" || parsed.fontScale === "large"
          ? parsed.fontScale
          : DEFAULTS.fontScale,
      notesStyle: parsed.notesStyle === "plain" ? "plain" : DEFAULTS.notesStyle,
      invoiceReminderDays: clampDays(parsed.invoiceReminderDays),
      browserNotifications: parsed.browserNotifications === true,
      inAppNotifications: parsed.inAppNotifications !== false,
      currency: typeof parsed.currency === "string" ? parsed.currency : DEFAULTS.currency,
      locale: typeof parsed.locale === "string" ? parsed.locale : DEFAULTS.locale,
    };
  } catch {
    // Chave corrompida não pode impedir o app de carregar.
    return { ...DEFAULTS };
  }
}

const state = ref<Preferences>(read());

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.value));
  } catch {
    // Modo privado / cota cheia: manter em memória e seguir funcionando.
  }
}

function applyToDom() {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.setAttribute("data-accent", state.value.accent);
  root.setAttribute("data-density", state.value.density);
  root.setAttribute("data-font-scale", state.value.fontScale);
}

watch(
  state,
  () => {
    persist();
    applyToDom();
  },
  { immediate: true, deep: true }
);

// Another tab changed the preference — follow along.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key !== STORAGE_KEY || !event.newValue) return;
    try {
      state.value = JSON.parse(event.newValue) as Preferences;
    } catch {
      // Ignora payload inválido vindo de outra aba.
    }
  });
}

export function usePreferences() {
  const preferences = computed(() => state.value);

  function update<K extends keyof Preferences>(key: K, value: Preferences[K]) {
    state.value = { ...state.value, [key]: value };
  }

  function setAccent(accent: AccentId) {
    update("accent", accent);
  }

  function setDensity(density: Density) {
    update("density", density);
  }

  function setFontScale(fontScale: FontScale) {
    update("fontScale", fontScale);
  }

  function setNotesStyle(notesStyle: NotesStyle) {
    update("notesStyle", notesStyle);
  }

  function setInvoiceReminderDays(days: number) {
    update("invoiceReminderDays", clampDays(days));
  }

  function reset() {
    state.value = { ...DEFAULTS };
  }

  return {
    preferences,
    update,
    setAccent,
    setDensity,
    setFontScale,
    setNotesStyle,
    setInvoiceReminderDays,
    reset,
    defaults: DEFAULTS,
  };
}
