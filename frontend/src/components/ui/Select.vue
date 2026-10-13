<template>
  <div class="w-full">
    <label v-if="label" :for="id" class="label">{{ label }}</label>
    <div class="relative">
      <select
        :id="id"
        :value="modelValue"
        :disabled="disabled"
        :required="required"
        :aria-describedby="error ? `${id}-error` : hint ? `${id}-hint` : undefined"
        :aria-invalid="!!error"
        :class="[
          'input-base appearance-none',
          'pr-10 bg-[var(--color-bg-elevated)]',
          errorClasses,
        ]"
        @change="onChange"
        @blur="onBlur"
        @focus="onFocus"
      >
        <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
        <option
          v-for="option in options"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
      <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-fg-subtle)]">
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
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

interface Option {
  value: string;
  label: string;
}

interface Props {
  modelValue: string;
  id: string;
  label?: string;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  hint?: string;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  required: false,
});

const emit = defineEmits<{ "update:modelValue": [value: string]; blur: [event: FocusEvent]; focus: [event: FocusEvent] }>();

const isFocused = ref(false);
const errorClasses = computed(() => (props.error ? "error" : ""));

function onChange(event: Event) {
  const target = event.target as HTMLSelectElement;
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