<template>
  <div class="flex flex-col items-center text-center py-12 px-4">
    <div
      v-if="icon"
      :class="[
        'inline-flex items-center justify-center rounded-2xl mb-4',
        iconSizeClasses,
        iconBgClasses,
      ]"
      aria-hidden="true"
    >
      <component :is="iconComponent" :class="iconColorClasses" aria-hidden="true" />
    </div>

    <h3 class="font-display text-xl text-[var(--color-fg)] mb-2">{{ title }}</h3>
    <p class="text-[var(--color-fg-muted)] max-w-sm mb-6">{{ description }}</p>

    <Button
      v-if="action"
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

const icons: Record<string, object> = {
  inbox: {
    template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>`,
  },
  table: {
    template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>`,
  },
  wallet: {
    template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12a4.5 4.5 0 00-9 0v2.25H4.875c-.621 0-1.125.504-1.125 1.125v2.25c0 .621.504 1.125 1.125 1.125h14.25c.621 0 1.125-.504 1.125-1.125V15.375c0-.621-.504-1.125-1.125-1.125H16.5V12z" /></svg>`,
  },
  chart: {
    template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m-1.5 0h1.5m-16.5 0a2.25 2.25 0 00-2.25 2.25v11.25A2.25 2.25 0 006 16.5h2.25m-16.5 0l6.75-15.75M3.75 3l13.5 13.5" /></svg>`,
  },
  credit_card: {
    template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 13.5c0-4.941 4.016-8.931 8.962-8.931a8.957 8.957 0 017.313 4.217A8.957 8.957 0 0121.75 13.5H2.25zM11.25 5.25L12 6m-2.25-5.25a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>`,
  },
  users: {
    template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a5.971 5.971 0 00-.94 3.197M15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>`,
  },
  settings: {
    template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>`,
  },
};

const iconComponent = computed(() => icons[props.icon] || icons.inbox);

const iconSizeClasses = computed(() => "h-14 w-14");
const iconBgClasses = computed(() => "bg-[var(--color-bg-muted)]");
const iconColorClasses = computed(() => "h-7 w-7 text-[var(--color-fg-muted)]");
</script>