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
    <div v-if="hasHeader" class="px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-bg-muted)] flex items-start justify-between gap-4">
      <div class="min-w-0">
        <h3 v-if="title" class="font-display text-lg font-normal text-[var(--color-fg)] truncate">{{ title }}</h3>
        <p v-if="description" class="mt-1 text-sm text-[var(--color-fg-muted)] truncate">{{ description }}</p>
      </div>
      <slot name="header-actions"></slot>
    </div>

    <div :class="contentClasses">
      <slot></slot>
    </div>

    <div v-if="$slots.footer" class="px-6 py-4 border-t border-[var(--color-border)] bg-[var(--color-bg-muted)] flex items-center justify-end gap-3">
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
    outlined: "border-2 border-[var(--color-border)] shadow-none",
    elevated: "shadow-lg border-none",
    filled: "bg-[var(--color-bg-muted)] border-none",
    glass: "glass shadow-lg border-none",
  };
  return variants[props.variant] || variants.default;
});

const paddingClasses = computed(() => {
  const paddings = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };
  return paddings[props.padding] || paddings.md;
});

const contentClasses = computed(() => {
  if (props.padding === "none") return "";
  return "";
});

const hasHeader = computed(() => !!props.title || !!props.description || !!slots["header-actions"]);

defineEmits<{ click: [] }>();
</script>