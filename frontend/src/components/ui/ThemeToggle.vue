<template>
  <div
    class="inline-flex items-center gap-0.5 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-muted)] p-0.5"
    role="radiogroup"
    aria-label="Tema da interface"
  >
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      role="radio"
      :aria-checked="preference === option.value"
      :title="option.label"
      :aria-label="option.label"
      class="flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-150"
      :class="
        preference === option.value
          ? 'bg-[var(--color-bg-elevated)] text-[var(--color-brand)] shadow-[var(--shadow-xs)]'
          : 'text-[var(--color-fg-subtle)] hover:text-[var(--color-fg)]'
      "
      @click="setTheme(option.value)"
    >
      <AppIcon :name="option.icon" :size="16" :stroke-width="2" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { useTheme, themeLabels } from "../../composables/useTheme";
import type { ThemePreference } from "../../composables/useTheme";
import AppIcon from "./AppIcon.vue";

const { preference, setTheme } = useTheme();

const options: { value: ThemePreference; label: string; icon: string }[] = [
  { value: "light", label: themeLabels.light, icon: "sun" },
  { value: "dark", label: themeLabels.dark, icon: "moon" },
  { value: "system", label: themeLabels.system, icon: "monitor" },
];
</script>