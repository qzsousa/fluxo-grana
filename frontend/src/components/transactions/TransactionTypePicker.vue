<template>
  <fieldset class="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-muted)] p-4">
    <legend class="px-1.5 text-sm font-medium text-[var(--color-fg)]">O que está acontecendo?</legend>
    <p class="mb-4 text-xs text-[var(--color-fg-muted)]">
      É esta escolha que decide se o dinheiro entra, sai ou muda de lugar. Toque em um cartão para
      ver o que ele faz.
    </p>

    <!-- Grupos: primeiro o do dia a dia, depois o raro. -->
    <div v-for="group in groups" :key="group.title" class="mb-4 last:mb-0">
      <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-fg-subtle)]">
        {{ group.title }}
      </p>

      <div class="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        <button
          v-for="type in group.types"
          :key="type.value"
          type="button"
          role="radio"
          :aria-checked="modelValue === type.value"
          class="flex items-start gap-3 rounded-xl border p-3 text-left transition-colors"
          :class="
            modelValue === type.value
              ? 'border-[var(--color-brand)] bg-[var(--color-bg-elevated)] shadow-[var(--shadow-xs)]'
              : 'border-transparent bg-[var(--color-bg-elevated)] hover:border-[var(--color-border-strong)]'
          "
          @click="$emit('update:modelValue', type.value)"
        >
          <span
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
            :class="type.iconBg"
          >
            <AppIcon :name="type.icon" :size="18" :stroke-width="2" />
          </span>

          <span class="min-w-0 flex-1">
            <span class="flex items-center gap-1.5">
              <span class="text-sm font-medium text-[var(--color-fg)]">{{ type.label }}</span>
              <AppIcon
                v-if="modelValue === type.value"
                name="check"
                :size="14"
                :stroke-width="3"
                class="text-[var(--color-brand)]"
              />
            </span>
            <span class="mt-0.5 block text-xs leading-snug text-[var(--color-fg-muted)]">
              {{ type.hint }}
            </span>
          </span>
        </button>
      </div>
    </div>

    <!-- Explicação do tipo escolhido, em linguagem direta -->
    <div
      v-if="selected"
      class="mt-4 flex items-start gap-3 rounded-xl border border-[var(--color-brand-muted)] bg-[var(--color-brand-light)] p-3.5"
      role="status"
    >
      <span class="mt-0.5 shrink-0 text-[var(--color-brand)]">
        <AppIcon :name="selected.icon" :size="18" :stroke-width="2" />
      </span>
      <div class="min-w-0">
        <p class="text-sm font-semibold text-[var(--color-brand)]">{{ selected.label }}</p>
        <p class="mt-0.5 text-xs leading-relaxed text-[var(--color-brand)]">{{ selected.explain }}</p>
      </div>
    </div>
  </fieldset>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { AppIcon } from "../ui";
import { ALL_TRANSACTION_TYPES, TRANSACTION_TYPE_GROUPS, transactionTypeInfo } from "../../utils/transaction-types";

const props = defineProps<{ modelValue: string }>();
defineEmits<{ "update:modelValue": [value: string] }>();

/** Os 3 primeiros são o dia a dia; os outros, só para quem investe. */
const groups = TRANSACTION_TYPE_GROUPS;

const selected = computed(() =>
  ALL_TRANSACTION_TYPES.find((type) => type.value === props.modelValue) ??
  transactionTypeInfo(props.modelValue)
);
</script>