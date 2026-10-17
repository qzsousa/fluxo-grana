<template>
  <div class="w-full">
    <label v-if="label" :for="id" class="label">{{ label }}</label>

    <div class="relative">
      <input
        :id="id"
        :type="showPassword ? 'text' : type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :autocomplete="autocomplete"
        :inputmode="inputmode"
        :aria-describedby="error ? `${id}-error` : hint ? `${id}-hint` : undefined"
        :aria-invalid="!!error"
        :class="['input-base', { 'pl-10': icon, 'pr-11': showPasswordToggle }, errorClasses]"
        @input="onInput"
        @blur="onBlur"
        @focus="onFocus"
      />

      <svg
        v-if="icon"
        class="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--color-fg-subtle)]"
        :viewBox="icon.viewBox"
        fill="none"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          :d="icon.path"
          :stroke-width="icon.strokeWidth || 1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>

      <button
        v-if="showPasswordToggle"
        type="button"
        class="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-[var(--color-fg-subtle)] transition-colors hover:text-[var(--color-fg)]"
        :aria-label="showPassword ? 'Ocultar senha' : 'Mostrar senha'"
        :aria-pressed="showPassword"
        @click="showPassword = !showPassword"
      >
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
          <template v-if="showPassword">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.4 5.3A9.7 9.7 0 0112 5c4.5 0 8.3 2.9 9.5 7a10.3 10.3 0 01-3 4.5M6.2 6.7A10.2 10.2 0 002.5 12c1.2 4.1 5 7 9.5 7a9.6 9.6 0 003.4-.6" />
          </template>
          <template v-else>
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7z" />
            <circle cx="12" cy="12" r="3" />
          </template>
        </svg>
      </button>
    </div>

    <div v-if="error" :id="`${id}-error`" class="error-text" role="alert">
      <svg class="h-3.5 w-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 100 2 1 1 0 000-2z" clip-rule="evenodd" />
      </svg>
      <span>{{ error }}</span>
    </div>
    <p v-else-if="hint" :id="`${id}-hint`" class="help-text">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

interface Props {
  // `number` entra aqui porque várias páginas usam `v-model.number`
  // (ex.: saldo inicial, valor da transação).
  modelValue: string | number;
  id: string;
  label?: string;
  type?: "text" | "email" | "password" | "number" | "tel" | "url" | "search" | "date" | "color";
  inputmode?: "none" | "text" | "decimal" | "numeric" | "tel" | "search" | "email" | "url";
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  autocomplete?: string;
  error?: string;
  hint?: string;
  icon?: {
    viewBox: string;
    path: string;
    // Aceito por compatibilidade com as chamadas antigas; o SVG já usa
    // `currentColor` fixo.
    stroke?: string;
    strokeWidth?: number;
  };
}

const props = withDefaults(defineProps<Props>(), {
  type: "text",
  disabled: false,
  readonly: false,
  required: false,
});

const emit = defineEmits<{
  "update:modelValue": [value: string];
  blur: [event: FocusEvent];
  focus: [event: FocusEvent];
}>();

const showPassword = ref(false);
const showPasswordToggle = computed(() => props.type === "password");

const errorClasses = computed(() => (props.error ? "error" : ""));

function onInput(event: Event) {
  emit("update:modelValue", (event.target as HTMLInputElement).value);
}

function onBlur(event: FocusEvent) {
  emit("blur", event);
}

function onFocus(event: FocusEvent) {
  emit("focus", event);
}
</script>