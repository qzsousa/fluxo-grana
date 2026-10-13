<template>
  <button
    :type="type"
    :class="buttonClasses"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="inline-flex items-center gap-2">
      <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
      <span>Carregando…</span>
    </span>
    <span v-else>
      <slot></slot>
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from "vue";

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

const baseClasses = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

const variantClasses = computed(() => {
  const variants = {
    primary: "bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand-hover)] focus-visible:ring-[var(--color-brand)] shadow-sm hover:shadow-md active:scale-[0.98]",
    secondary: "bg-[var(--color-bg-muted)] text-[var(--color-fg)] hover:bg-[var(--color-border)] focus-visible:ring-[var(--color-border-strong)] border border-[var(--color-border)]",
    danger: "bg-[var(--color-danger)] text-white hover:bg-[var(--color-danger)]/90 focus-visible:ring-[var(--color-danger)] shadow-sm",
    ghost: "bg-transparent text-[var(--color-fg)] hover:bg-[var(--color-bg-muted)] focus-visible:ring-[var(--color-border-strong)]",
    success: "bg-[var(--color-success)] text-white hover:bg-[var(--color-success)]/90 focus-visible:ring-[var(--color-success)] shadow-sm",
    outline: "bg-transparent text-[var(--color-brand)] border border-[var(--color-brand)] hover:bg-[var(--color-brand-light)] focus-visible:ring-[var(--color-brand)]",
  };
  return variants[props.variant] || variants.primary;
});

const sizeClasses = computed(() => {
  const sizes = {
    sm: "px-3 py-1.5 text-sm gap-1.5",
    md: "px-4 py-2.5 text-base gap-2",
    lg: "px-6 py-3 text-lg gap-2.5",
    icon: "p-2",
  };
  return sizes[props.size] || sizes.md;
});

const widthClasses = computed(() => (props.fullWidth ? "w-full" : ""));

const buttonClasses = computed(() => [
  baseClasses,
  variantClasses.value,
  sizeClasses.value,
  widthClasses.value,
].join(" "));
</script>