<template>
  <div
    :class="[
      'card',
      variantClasses,
      paddingClasses,
      { 'card-interactive': interactive },
    ]"
    @click="interactive && $emit('click')"
  >
    <div
      v-if="hasHeader"
      class="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] px-4 py-3 sm:px-5 sm:py-4"
    >
      <div class="min-w-0">
        <h3 v-if="title" class="truncate text-base font-semibold tracking-tight text-[var(--color-fg)]">
          {{ title }}
        </h3>
        <p v-if="description" class="mt-0.5 text-sm text-[var(--color-fg-muted)]">
          {{ description }}
        </p>
      </div>
      <div class="flex shrink-0 items-center gap-2">
        <slot name="header-actions"></slot>
      </div>
    </div>

    <slot></slot>

    <div
      v-if="$slots.footer"
      class="flex flex-wrap items-center justify-end gap-2 border-t border-[var(--color-border)] px-4 py-3 sm:px-5"
    >
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useSlots } from "vue";

interface Props {
  title?: string;
  description?: string;
  variant?: "default" | "outlined" | "elevated" | "filled" | "glass";
  padding?: "none" | "sm" | "md" | "lg";
  interactive?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: "default",
  padding: "md",
  interactive: false,
});

const slots = useSlots();

const variantClasses = computed(() => {
  const variants = {
    default: "",
    outlined: "border-[var(--color-border-strong)]",
    elevated: "border-transparent shadow-[var(--shadow-lg)]",
    filled: "bg-[var(--color-bg-muted)] border-transparent shadow-none",
    glass: "glass border-[var(--color-border)]",
  };
  return variants[props.variant] || variants.default;
});

const paddingClasses = computed(() => {
  const paddings = {
    none: "",
    sm: "p-4",
    md: "p-4 sm:p-5",
    lg: "p-5 sm:p-7",
  };
  return paddings[props.padding] || paddings.md;
});

const hasHeader = computed(() => !!props.title || !!props.description || !!slots["header-actions"]);

defineEmits<{ click: [] }>();
</script>