<template>
  <div class="w-full overflow-x-auto">
    <table class="w-full text-sm" role="table">
      <thead>
        <tr class="border-b border-[var(--color-border)]">
          <th
            v-for="col in columns"
            :key="col.key"
            :class="[
              'px-4 py-3 text-left font-medium text-[var(--color-fg-muted)] uppercase tracking-wider text-xs',
              col.align ? `text-${col.align}` : '',
              col.width ? `w-[${col.width}]` : '',
            ]"
            :style="{ minWidth: col.minWidth }"
            scope="col"
          >
            <div class="flex items-center gap-2">
              <span>{{ col.label }}</span>
              <Tooltip v-if="col.tooltip" :content="col.tooltip">
                <span class="text-[var(--color-fg-subtle)] hover:text-[var(--color-brand)] cursor-help">
                  <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" stroke-width="1.5" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 16v-4M12 8h.01" />
                  </svg>
                </span>
              </Tooltip>
            </div>
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-[var(--color-border)]">
        <tr
          v-for="(row, rowIndex) in data"
          :key="rowKey(row)"
          :class="[
            'transition-colors',
            'hover:bg-[var(--color-bg-muted)]',
            rowIndex % 2 === 0 ? 'bg-[var(--color-bg)]' : 'bg-[var(--color-bg-elevated)]',
          ]"
        >
          <td
            v-for="col in columns"
            :key="col.key"
            :class="[
              'px-4 py-3',
              col.align ? `text-${col.align}` : '',
            ]"
          >
            <slot :name="col.key" :row="row" :index="rowIndex">
              <span v-if="col.format" :class="col.formatClass">{{ col.format(row[col.key]) }}</span>
              <span v-else>{{ row[col.key] }}</span>
            </slot>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="data.length === 0" class="py-12 text-center">
      <EmptyState
        :icon="emptyIcon"
        :title="emptyTitle"
        :description="emptyDescription"
        :action="emptyAction"
      />
    </div>
  </div>

  <Pagination
    v-if="pagination && pagination.total > pagination.limit"
    :page="pagination.page"
    :limit="pagination.limit"
    :total="pagination.total"
    @page-change="emit('page-change', $event)"
    @limit-change="emit('limit-change', $event)"
  />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Pagination } from "./index";
import EmptyState from "./EmptyState.vue";

interface Column<T = Record<string, unknown>> {
  key: string;
  label: string;
  align?: "left" | "center" | "right";
  width?: string;
  minWidth?: string;
  format?: (value: unknown) => string;
  formatClass?: string;
  tooltip?: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
}

interface Props {
  columns: Column[];
  data: Record<string, unknown>[];
  rowKey: (row: Record<string, unknown>) => string | number;
  pagination?: PaginationData;
  emptyIcon?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: { label: string; onClick: () => void };
}

const props = withDefaults(defineProps<Props>(), {
  emptyIcon: "table",
  emptyTitle: "Nenhum registro encontrado",
  emptyDescription: "Comece adicionando um novo item.",
  rowKey: (row) => row.id,
});

defineEmits<{ "page-change": [page: number]; "limit-change": [limit: number] }>();
</script>