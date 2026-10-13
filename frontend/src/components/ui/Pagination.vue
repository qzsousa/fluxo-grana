<template>
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 py-3 border-t border-[var(--color-border)] bg-[var(--color-bg-muted)]">
    <div class="text-sm text-[var(--color-fg-muted)]">
      <span v-if="total > 0">
        Mostrando <span class="font-medium text-[var(--color-fg)]">{{ start }}</span> a
        <span class="font-medium text-[var(--color-fg)]">{{ end }}</span> de
        <span class="font-medium text-[var(--color-fg)]">{{ total }}</span> resultados
      </span>
      <span v-else>Nenhum resultado</span>
    </div>

    <div class="flex items-center gap-2">
      <Select
        :id="`limit-${total}`"
        v-model="localLimit"
        :options="limitOptions"
        class="w-auto min-w-[140px]"
        @update:modelValue="emit('limit-change', $event)"
      />

      <div class="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          :disabled="page === 1"
          @click="emit('page-change', page - 1)"
          aria-label="Página anterior"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Button>

        <span class="px-3 text-sm font-medium text-[var(--color-fg)]">
          Página {{ page }} de {{ totalPages }}
        </span>

        <Button
          variant="ghost"
          size="icon"
          :disabled="page === totalPages"
          @click="emit('page-change', page + 1)"
          aria-label="Próxima página"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
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

const localLimit = computed({
  get: () => props.limit,
  set: (value) => emit("limit-change", value),
});

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.limit)));

const start = computed(() => props.total === 0 ? 0 : (props.page - 1) * props.limit + 1);
const end = computed(() => Math.min(props.page * props.limit, props.total));

const limitOptions = [
  { value: "10", label: "10 por página" },
  { value: "25", label: "25 por página" },
  { value: "50", label: "50 por página" },
  { value: "100", label: "100 por página" },
];
</script>