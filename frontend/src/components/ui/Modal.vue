<template>
  <Transition name="modal">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[var(--z-modal-backdrop)] flex items-end justify-center sm:items-center sm:p-4"
      @click.self="emit('update:modelValue', false)"
    >
      <div class="absolute inset-0 bg-black/45 animate-fade-in" aria-hidden="true"></div>

      <div
        class="relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] shadow-[var(--shadow-xl)] animate-slide-up sm:max-w-lg sm:rounded-2xl sm:animate-scale-in"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="title ? 'modal-title' : undefined"
        :aria-describedby="description ? 'modal-description' : undefined"
      >
        <!-- Puxador visual: deixa óbvio que o modal fecha arrastando pra baixo -->
        <div class="mx-auto mt-2 h-1 w-9 shrink-0 rounded-full bg-[var(--color-border-strong)] sm:hidden"></div>

        <div
          v-if="title || description || $slots.header"
          class="flex items-start justify-between gap-4 border-b border-[var(--color-border)] px-5 py-4"
        >
          <div class="min-w-0">
            <h2 v-if="title" id="modal-title" class="text-lg font-semibold tracking-tight text-[var(--color-fg)]">
              {{ title }}
            </h2>
            <p v-if="description" id="modal-description" class="mt-1 text-sm text-[var(--color-fg-muted)]">
              {{ description }}
            </p>
          </div>
          <button
            type="button"
            class="-mr-1.5 -mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--color-fg-subtle)] transition-colors hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-fg)]"
            @click="emit('update:modelValue', false)"
            aria-label="Fechar"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto px-5 py-5">
          <slot></slot>
        </div>

        <div
          v-if="$slots.footer"
          class="flex flex-wrap items-center justify-end gap-2 border-t border-[var(--color-border)] bg-[var(--color-bg-muted)] px-5 py-4 safe-bottom sm:pb-4"
        >
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { onBeforeUnmount, watch } from "vue";

const props = defineProps<{
  modelValue: boolean;
  title?: string;
  description?: string;
}>();

const emit = defineEmits<{ "update:modelValue": [value: boolean] }>();

function onKeydown(event: KeyboardEvent) {
  if (event.key === "Escape" && props.modelValue) {
    emit("update:modelValue", false);
  }
}

watch(
  () => props.modelValue,
  (open) => {
    document.body.style.overflow = open ? "hidden" : "";
    if (open) {
      window.addEventListener("keydown", onKeydown);
    } else {
      window.removeEventListener("keydown", onKeydown);
    }
  }
);

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeydown);
  document.body.style.overflow = "";
});
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity var(--duration-base) var(--ease-out);
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>