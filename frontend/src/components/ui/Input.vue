<template>
  <div class="w-full">
    <label v-if="label" :for="id" class="label">{{ label }}</label>
    <div class="relative">
      <svg
        v-if="icon"
        class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--color-fg-subtle)] pointer-events-none"
        :aria-hidden="true"
        :viewBox="icon.viewBox"
        :fill="icon.fill"
        :stroke="icon.stroke"
      >
        <path :d="icon.path" :stroke-width="icon.strokeWidth" />
      </svg>
      <input
        :id="id"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :autocomplete="autocomplete"
        :aria-describedby="error ? `${id}-error` : hint ? `${id}-hint` : undefined"
        :aria-invalid="!!error"
        :class="[
          'input-base',
          { 'pl-10': icon },
          { 'pr-10': showPasswordToggle },
          errorClasses,
        ]"
        @input="onInput"
        @blur="onBlur"
        @focus="onFocus"
      />
      <button
        v-if="showPasswordToggle"
        type="button"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-fg-subtle)] hover:text-[var(--color-fg)] transition-colors"
        :aria-label="showPassword ? 'Ocultar senha' : 'Mostrar senha'"
        @click="showPassword = !showPassword"
      >
<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8">
          <template v-if="showPassword">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
          </template>
          <template v-else>
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542 7z" />
          </template>
        </svg>
      </button>
      <div v-if="error" :id="`${id}-error`" class="error-text" role="alert" aria-live="polite">
        <svg class="h-3.5 w-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 100 2 1 1 0 000-2z" clip-rule="evenodd" />
        </svg>
        <span>{{ error }}</span>
      </div>
      <p v-else-if="hint" :id="`${id}-hint`" class="help-text">{{ hint }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

interface Props {
  modelValue: string;
  id: string;
  label?: string;
  type?: "text" | "email" | "password" | "number" | "tel" | "url" | "search";
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  autocomplete?: string;
  error?: string;
  hint?: string;
  icon?: {
    viewBox: string;
    fill?: string;
    stroke?: string;
    path: string;
    strokeWidth?: number;
  };
}

const props = withDefaults(defineProps<Props>(), {
  type: "text",
  disabled: false,
  readonly: false,
  required: false,
});

const emit = defineEmits<{ "update:modelValue": [value: string]; blur: [event: FocusEvent]; focus: [event: FocusEvent] }>();

const isFocused = ref(false);
const showPassword = ref(false);
const showPasswordToggle = computed(() => props.type === "password");

const errorClasses = computed(() => (props.error ? "error" : ""));

function onInput(event: Event) {
  const target = event.target as HTMLInputElement;
  emit("update:modelValue", target.value);
}

function onBlur(event: FocusEvent) {
  isFocused.value = false;
  emit("blur", event);
}

function onFocus(event: FocusEvent) {
  isFocused.value = true;
  emit("focus", event);
}
</script>