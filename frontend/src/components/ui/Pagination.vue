<template>
  <div
    class="flex flex-col gap-3 border-t border-[var(--color-border)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
  >
    <p class="text-sm text-[var(--color-fg-muted)]">
      <span v-if="total > 0">
        <span class="font-semibold text-[var(--color-fg)]">{{ start }}–{{ end }}</span>
        de
        <span class="font-semibold text-[var(--color-fg)]">{{ total }}</span>
      </span>
      <span v-else>Nenhum resultado</span>
    </p>

    <div class="flex items-center justify-between gap-2 sm:justify-end">
      <Select
        :id="`limit-${total}`"
        :model-value="localLimit"
        :options="limitOptions"
        class="hidden w-36 sm:block"
        @update:model-value="emit('limit-change', Number($event))"
      />

      <div class="flex items-center gap-1">
        <Button
          variant="secondary"
          size="icon"
          :disabled="page === 1"
          @click="emit('page-change', page - 1)"
          aria-label="Página anterior"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Button>

        <span class="min-w-20 text-center text-sm font-medium text-[var(--color-fg)]">
          {{ page }} <span class="text-[var(--color-fg-subtle)]">/ {{ totalPages }}</span>
        </span>

        <Button
          variant="secondary"
          size="icon"
          :disabled="page === totalPages"
          @click="emit('page-change', page + 1)"
          aria-label="Próxima página"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Select } from "./index";

interface Props {
  page: number;
  limit: number;
  total: number;
}

const props = defineProps<Props>();

const emit = defineEmits<{ "page-change": [page: number]; "limit-change": [limit: number] }>();

const localLimit = computed<string>({
  get: () => String(props.limit),
  set: (value) => emit("limit-change", Number(value)),
});

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.limit)));

const start = computed(() => (props.total === 0 ? 0 : (props.page - 1) * props.limit + 1));
const end = computed(() => Math.min(props.page * props.limit, props.total));

const limitOptions = [
  { value: "10", label: "10 por página" },
  { value: "25", label: "25 por página" },
  { value: "50", label: "50 por página" },
  { value: "100", label: "100 por página" },
];
</script>