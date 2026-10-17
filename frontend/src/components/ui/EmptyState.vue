<template>
  <div class="flex flex-col items-center px-4 py-10 text-center">
    <div
      class="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-bg-muted)] text-[var(--color-fg-subtle)]"
      aria-hidden="true"
    >
      <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.6">
        <path stroke-linecap="round" stroke-linejoin="round" :d="iconPath" />
      </svg>
    </div>

    <h3 class="text-base font-semibold text-[var(--color-fg)]">{{ title }}</h3>
    <p v-if="description" class="mt-1.5 max-w-sm text-sm text-[var(--color-fg-muted)]">
      {{ description }}
    </p>

    <Button
      v-if="action"
      class="mt-5"
      :variant="action.variant || 'primary'"
      :size="action.size || 'md'"
      @click="action.onClick"
    >
      {{ action.label }}
    </Button>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Button } from "./index";

interface Action {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "danger" | "ghost" | "success" | "outline";
  size?: "sm" | "md" | "lg";
}

interface Props {
  icon?: string;
  title: string;
  description: string;
  action?: Action;
}

const props = withDefaults(defineProps<Props>(), {
  icon: "inbox",
});

const paths: Record<string, string> = {
  inbox: "M3 13h4l2 3h6l2-3h4M5 5h14l2 8v6H3v-6z",
  table: "M3 10h18M3 6h18v12H3zM9 10v8M15 10v8",
  wallet: "M3 8a2 2 0 012-2h12a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2zM16 12h3",
  chart: "M4 20V10M10 20V4M16 20v-7M22 20H2",
  credit_card: "M3 9h18M3 6h18v12H3zM7 15h4",
  users: "M16 19v-1.5a3.5 3.5 0 00-3.5-3.5h-5A3.5 3.5 0 004 17.5V19M10 11a3.5 3.5 0 100-7 3.5 3.5 0 000 7M20 19v-1.5a3.5 3.5 0 00-2.6-3.4M15.5 4.6a3.5 3.5 0 010 6.8",
  settings:
    "M12 15a3 3 0 100-6 3 3 0 000 6M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-2.9 1.2V21a2 2 0 11-4 0v-.1A1.7 1.7 0 007.1 19l-.1.1a2 2 0 11-2.8-2.8l.1-.1A1.7 1.7 0 003 13.3H3a2 2 0 110-4h.1A1.7 1.7 0 004.6 6.4l-.1-.1a2 2 0 112.8-2.8l.1.1A1.7 1.7 0 0010 3.1V3a2 2 0 114 0v.1a1.7 1.7 0 002.9 1.2l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 001.2 2.9H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z",
  transactions: "M7 17L17 7M9 7h8v8",
};

const iconPath = computed(() => paths[props.icon] || paths.inbox);
</script>