<template>
  <div class="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-muted)] p-4">
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <p class="text-sm font-medium text-[var(--color-fg)]">Marca da despesa</p>
        <p class="mt-0.5 text-xs text-[var(--color-fg-muted)]">
          Escolha um ícone e uma cor para achar a despesa de relance na lista.
        </p>
      </div>

      <!-- Prévia: exatamente como a linha vai aparecer na listagem. -->
      <span
        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
        :style="previewStyle"
        aria-hidden="true"
      >
        <AppIcon :name="modelValue.icon || 'inbox'" :size="19" :stroke-width="2" />
      </span>
    </div>

    <!-- Cores -->
    <div class="mt-4">
      <p class="mb-2 text-xs font-medium text-[var(--color-fg-muted)]">Cor</p>
      <div class="flex flex-wrap gap-2" role="radiogroup" aria-label="Cor da despesa">
        <button
          v-for="color in colors"
          :key="color.id"
          type="button"
          role="radio"
          :aria-checked="modelValue.color === color.solid"
          :aria-label="color.label"
          :title="color.label"
          class="flex h-8 w-8 items-center justify-center rounded-full border-2 transition-transform hover:scale-110"
          :class="modelValue.color === color.solid ? 'border-[var(--color-fg)]' : 'border-transparent'"
          :style="{ backgroundColor: color.solid }"
          @click="setColor(color.solid)"
        >
          <AppIcon
            v-if="modelValue.color === color.id"
            name="check"
            :size="14"
            :stroke-width="3"
            class="text-white"
          />
        </button>

        <button
          type="button"
          role="radio"
          :aria-checked="!modelValue.color"
          aria-label="Sem cor"
          title="Sem cor"
          class="flex h-8 w-8 items-center justify-center rounded-full border-2 border-dashed border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] text-[var(--color-fg-subtle)] transition-transform hover:scale-110"
          :class="!modelValue.color ? 'border-[var(--color-fg)]' : ''"
          @click="setColor('')"
        >
          <AppIcon name="close" :size="13" :stroke-width="2.4" />
        </button>
      </div>
    </div>

    <!-- Ícones -->
    <div class="mt-4">
      <p class="mb-2 text-xs font-medium text-[var(--color-fg-muted)]">Ícone</p>

      <div class="grid grid-cols-6 gap-1.5 sm:grid-cols-9">
        <button
          v-for="icon in icons"
          :key="icon.id"
          type="button"
          role="radio"
          :aria-checked="modelValue.icon === icon.id"
          :aria-label="icon.label"
          :title="icon.label"
          class="flex h-9 w-9 items-center justify-center rounded-lg transition-colors"
          :class="
            modelValue.icon === icon.id
              ? 'bg-[var(--color-brand)] text-[var(--color-on-brand)]'
              : 'bg-[var(--color-bg-elevated)] text-[var(--color-fg-muted)] hover:bg-[var(--color-bg-elevated)]/60'
          "
          @click="setIcon(icon.id)"
        >
          <AppIcon :name="icon.id" :size="17" />
        </button>
      </div>
    </div>

    <button
      type="button"
      class="mt-4 text-xs font-medium text-[var(--color-brand)] hover:underline"
      @click="clear"
    >
      Limpar marca
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { AppIcon } from "../ui";
import {
  EXPENSE_COLORS,
  expenseColorByHex,
  type ExpenseColor,
  type ExpenseIcon,
} from "../../utils/palette";

interface Props {
  modelValue: { icon: string; color: string };
  icons: ExpenseIcon[];
  colors?: ExpenseColor[];
}

const props = withDefaults(defineProps<Props>(), {
  colors: () => EXPENSE_COLORS,
});

const emit = defineEmits<{ "update:modelValue": [value: { icon: string; color: string }] }>();

const previewStyle = computed(() => {
  const color = expenseColorByHex(props.modelValue.color);
  return {
    backgroundColor: color?.soft ?? "var(--color-bg-elevated)",
    color: color?.ink ?? "var(--color-fg-subtle)",
  };
});

function patch(partial: Partial<{ icon: string; color: string }>) {
  emit("update:modelValue", { ...props.modelValue, ...partial });
}

/** Grava o hex da amostra, não o id — é o que o backend valida. */
function setColor(hex: string) {
  patch({ color: hex });
}

function setIcon(icon: string) {
  patch({ icon });
}

function clear() {
  emit("update:modelValue", { icon: "", color: "" });
}
</script>