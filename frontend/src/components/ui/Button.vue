<template>
  <button
    :type="type"
    :class="buttonClasses"
    :disabled="disabled || loading"
    :aria-busy="loading || undefined"
    v-bind="$attrs"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="inline-flex items-center gap-2">
      <svg class="h-4 w-4 shrink-0 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-opacity="0.25" stroke-width="3" />
        <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
      </svg>
      <span>Carregando…</span>
    </span>
    <span v-else class="inline-flex items-center justify-center gap-2">
      <slot></slot>
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from "vue";

// Attributes extras (data-tour, aria-*, etc.) caem no <button> raiz
defineOptions({ inheritAttrs: false });

interface Props {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "success" | "outline";
  size?: "sm" | "md" | "lg" | "icon";
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: "primary",
  size: "md",
  type: "button",
  disabled: false,
  loading: false,
  fullWidth: false,
});

const emit = defineEmits<{ click: [event: MouseEvent] }>();

const baseClasses =
  "inline-flex items-center justify-center font-semibold rounded-xl whitespace-nowrap " +
  "transition-[background-color,border-color,color,box-shadow] duration-150 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] focus-visible:ring-offset-2 " +
  "disabled:opacity-45 disabled:pointer-events-none";

const variantClasses = computed(() => {
  const variants = {
    primary:
      "bg-[var(--color-brand)] text-[var(--color-on-brand)] hover:bg-[var(--color-brand-hover)] shadow-[var(--shadow-brand)]",
    secondary:
      "bg-[var(--color-bg-elevated)] text-[var(--color-fg)] border border-[var(--color-border-strong)] hover:bg-[var(--color-bg-muted)]",
    danger: "bg-[var(--color-danger)] text-white hover:opacity-90",
    ghost:
      "bg-transparent text-[var(--color-fg-muted)] hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-fg)]",
    success: "bg-[var(--color-success)] text-white hover:opacity-90",
    outline:
      "bg-transparent text-[var(--color-brand)] border border-[var(--color-brand)] hover:bg-[var(--color-brand-light)]",
  };
  return variants[props.variant] || variants.primary;
});

// min-height de 44px em md/lg: alvo de toque confortável no celular
const sizeClasses = computed(() => {
  const sizes = {
    sm: "min-h-9 px-3 py-1.5 text-sm",
    md: "min-h-11 px-4 py-2 text-sm",
    lg: "min-h-13 px-5 py-2.5 text-base",
    icon: "h-11 w-11 p-0",
  };
  return sizes[props.size] || sizes.md;
});

const widthClasses = computed(() => (props.fullWidth ? "w-full" : ""));

const buttonClasses = computed(() =>
  [baseClasses, variantClasses.value, sizeClasses.value, widthClasses.value].join(" ")
);
</script>