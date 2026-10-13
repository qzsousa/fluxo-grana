<template>
  <Transition name="modal" appear>
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[var(--z-modal-backdrop)] flex items-center justify-center p-4"
      @click.self="emit('update:modelValue', false)"
    >
      <div
        class="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        aria-hidden="true"
      ></div>

      <div
        class="relative w-full max-w-lg bg-[var(--color-bg-elevated)] rounded-2xl shadow-xl animate-scale-in glass border border-[var(--color-border)] overflow-hidden"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="title ? 'modal-title' : undefined"
        :aria-describedby="description ? 'modal-description' : undefined"
      >
        <div v-if="title || description || $slots.header" class="px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-bg-muted)] flex items-start justify-between gap-4">
          <div>
            <h2 v-if="title" id="modal-title" class="font-display text-xl text-[var(--color-fg)]">{{ title }}</h2>
            <p v-if="description" id="modal-description" class="mt-1 text-sm text-[var(--color-fg-muted)]">{{ description }}</p>
          </div>
          <button
            type="button"
            class="rounded-lg p-1.5 text-[var(--color-fg-subtle)] hover:text-[var(--color-fg)] hover:bg-[var(--color-border)] transition-colors"
            @click="emit('update:modelValue', false)"
            aria-label="Fechar"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="p-6" :style="{ maxHeight: '60vh', overflow: 'auto' }">
          <slot></slot>
        </div>

        <div v-if="$slots.footer" class="px-6 py-4 border-t border-[var(--color-border)] bg-[var(--color-bg-muted)] flex items-center justify-end gap-3">
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean;
  title?: string;
  description?: string;
}>();

defineEmits<{ "update:modelValue": [value: boolean] }>();
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all var(--duration-base) var(--ease-out);
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  opacity: 0;
  transform: scale(0.95) translateY(8px);
}
</style>