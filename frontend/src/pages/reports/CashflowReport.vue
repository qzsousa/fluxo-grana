<template>
  <div class="space-y-6 stagger-in">
    <!-- Page header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="font-display text-3xl text-[var(--color-fg)]">Fluxo de Caixa</h1>
        <p class="mt-1 text-[var(--color-fg-muted)]">
          Entradas, saídas e o resultado do período — aEvolução mês a mês das suas movimentações.
        </p>
      </div>
      <div class="flex flex-wrap gap-3">
        <Button variant="outline" :disabled="!monthly.length" @click="exportCsv">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
          </svg>
          Exportar
        </Button>
        <Button @click="router.push('/reports')">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Todos os relatórios
        </Button>
      </div>
    </div>

    <!-- Period filter -->
    <Card variant="filled" padding="md">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Select
          v-model="preset"
          id="cashflow-preset"
          label="Período"
          :options="presetOptions"
          hint="Escolha um intervalo rápido ou selecione datas manualmente."
        />
        <div>
          <label for="cashflow-date-from" class="label">De</label>
          <input
            id="cashflow-date-from"
            v-model="rangeFrom"
            type="date"
            class="input-base"
            @input="markCustom"
          />
        </div>
        <div>
          <label for="cashflow-date-to" class="label">Até</label>
          <input
            id="cashflow-date-to"
            v-model="rangeTo"
            type="date"
            class="input-base"
            @input="markCustom"
          />
        </div>
        <div class="flex items-end">
          <p class="pb-2 text-sm text-[var(--color-fg-muted)]">
            <span class="font-medium text-[var(--color-fg)]">{{ transactions.length }}</span>
            transaç{{ transactions.length === 1 ? "ão" : "ões" }} no período
          </p>
        </div>
      </div>
    </Card>

    <!-- Summary -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <template v-if="isLoading">
        <Card v-for="i in 3" :key="i" padding="md">
          <p class="text-sm font-medium text-[var(--color-fg-muted)] skeleton skeleton-title"></p>
          <p class="mt-2 h-4 w-28 skeleton skeleton-text"></p>
        </Card>
      </template>

      <template v-else>
        <Card padding="md">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-sm font-medium text-[var(--color-fg-muted)]">Entradas</p>
              <p class="mt-1 font-display text-2xl font-normal text-[var(--color-success)]">
                +{{ formatCurrency(income, currency, "pt-BR") }}
              </p>
            </div>
            <div class="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-success-light)] text-[var(--color-success)]">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
            </div>
          </div>
          <Tooltip content="Soma de todas as transações do tipo 'Receita' dentro do período selecionado." position="top">
            <span class="ml-1 text-[var(--color-fg-subtle)] hover:text-[var(--color-brand)] cursor-help">
              <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke-width="1.5" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 16v-4M12 8h.01" />
              </svg>
            </span>
          </Tooltip>
        </Card>

        <Card padding="md">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-sm font-medium text-[var(--color-fg-muted)]">Saídas</p>
              <p class="mt-1 font-display text-2xl font-normal text-[var(--color-danger)]">
                -{{ formatCurrency(expense, currency, "pt-BR") }}
              </p>
            </div>
            <div class="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-danger-light)] text-[var(--color-danger)]">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17 13l-5 5m0 0l-5-5m5 5V6" />
              </svg>
            </div>
          </div>
          <Tooltip content="Soma de todas as transações do tipo 'Despesa' dentro do período selecionado." position="top">
            <span class="ml-1 text-[var(--color-fg-subtle)] hover:text-[var(--color-brand)] cursor-help">
              <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke-width="1.5" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 16v-4M12 8h.01" />
              </svg>
            </span>
          </Tooltip>
        </Card>

        <Card padding="md">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-sm font-medium text-[var(--color-fg-muted)]">Resultado do período</p>
              <p
                class="mt-1 font-display text-2xl font-normal"
                :class="net >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'"
              >
                {{ net >= 0 ? "+" : "" }}{{ formatCurrency(net, currency, "pt-BR") }}
              </p>
              <p class="mt-1 text-xs text-[var(--color-fg-muted)]">
                {{ net >= 0 ? "Sobrou no período" : "Faltou no período" }}
              </p>
            </div>
            <div
              class="inline-flex h-12 w-12 items-center justify-center rounded-xl"
              :class="net >= 0 ? 'bg-[var(--color-success-light)] text-[var(--color-success)]' : 'bg-[var(--color-danger-light)] text-[var(--color-danger)]'"
            >
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
                <path v-if="net >= 0" stroke-linecap="round" stroke-linejoin="round" d="M7 11l5-5m0 0l5 5m-5-5v12" />
                <path v-else stroke-linecap="round" stroke-linejoin="round" d="M17 13l-5 5m0 0l-5-5m5 5V6" />
              </svg>
            </div>
          </div>
          <Tooltip content="Entradas menos saídas. Positivo = você gastou menos do que entrou; negativo = gastou mais do que entrou." position="top">
            <span class="ml-1 text-[var(--color-fg-subtle)] hover:text-[var(--color-brand)] cursor-help">
              <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke-width="1.5" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 16v-4M12 8h.01" />
              </svg>
            </span>
          </Tooltip>
        </Card>
      </template>
    </div>

    <!-- Monthly evolution -->
    <Card title="Evolução mensal" description="Entradas e saídas agrupadas por mês" padding="md">
      <template #header-actions>
        <div class="flex items-center gap-4 text-xs text-[var(--color-fg-muted)]">
          <span class="inline-flex items-center gap-1.5">
            <span class="h-2.5 w-2.5 rounded-sm bg-[var(--color-success)]"></span> Entradas
          </span>
          <span class="inline-flex items-center gap-1.5">
            <span class="h-2.5 w-2.5 rounded-sm bg-[var(--color-danger)]"></span> Saídas
          </span>
        </div>
      </template>

      <div v-if="isLoading" class="space-y-4">
        <div v-for="i in 4" :key="i" class="flex items-center gap-4">
          <div class="h-4 w-16 skeleton skeleton-text"></div>
          <div class="h-8 flex-1 skeleton rounded-lg"></div>
        </div>
      </div>

      <EmptyState
        v-else-if="!monthly.length"
        icon="chart"
        title="Sem movimentações no período"
        description="Ajuste o intervalo de datas (De / Até) ou registre novas transações para visualizar a evolução mensal."
        :action="{ label: 'Ver transações', onClick: () => router.push('/transactions') }"
      />

      <div v-else class="space-y-6">
        <div class="overflow-x-auto">
          <div class="flex h-40 min-w-[480px] items-end gap-3">
            <div
              v-for="month in monthly"
              :key="month.key"
              class="flex h-full flex-1 flex-col items-center justify-end gap-1"
            >
              <div class="flex h-full w-full items-end justify-center gap-1">
                <div
                  class="w-1/2 max-w-[28px] rounded-t-md bg-[var(--color-success)] transition-all"
                  :style="{ height: barHeight(month.income) }"
                  :title="`Entradas em ${month.label}: ${formatCurrency(month.income, currency, 'pt-BR')}`"
                ></div>
                <div
                  class="w-1/2 max-w-[28px] rounded-t-md bg-[var(--color-danger)] transition-all"
                  :style="{ height: barHeight(month.expense) }"
                  :title="`Saídas em ${month.label}: ${formatCurrency(month.expense, currency, 'pt-BR')}`"
                ></div>
              </div>
              <span class="text-xs text-[var(--color-fg-muted)]">{{ month.label }}</span>
            </div>
          </div>
        </div>

        <!-- Breakdown -->
        <div class="overflow-x-auto">
          <table class="w-full min-w-[520px] text-sm">
            <thead>
              <tr class="border-b border-[var(--color-border)] text-left text-xs uppercase tracking-wide text-[var(--color-fg-subtle)]">
                <th scope="col" class="py-2 pr-4 font-medium">Mês</th>
                <th scope="col" class="py-2 pr-4 text-right font-medium">Entradas</th>
                <th scope="col" class="py-2 pr-4 text-right font-medium">Saídas</th>
                <th scope="col" class="py-2 text-right font-medium">Resultado</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[var(--color-border)]">
              <tr v-for="month in monthly" :key="month.key">
                <td class="py-3 pr-4 font-medium text-[var(--color-fg)]">{{ month.label }}</td>
                <td class="py-3 pr-4 text-right text-[var(--color-success)]">
                  {{ formatCurrency(month.income, currency, "pt-BR") }}
                </td>
                <td class="py-3 pr-4 text-right text-[var(--color-danger)]">
                  {{ formatCurrency(month.expense, currency, "pt-BR") }}
                </td>
                <td
                  class="py-3 text-right font-semibold"
                  :class="month.income - month.expense >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'"
                >
                  {{ formatCurrency(month.income - month.expense, currency, "pt-BR") }}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="border-t border-[var(--color-border)] font-semibold">
                <td class="py-3 pr-4 text-[var(--color-fg)]">Total</td>
                <td class="py-3 pr-4 text-right text-[var(--color-success)]">{{ formatCurrency(income, currency, "pt-BR") }}</td>
                <td class="py-3 pr-4 text-right text-[var(--color-danger)]">{{ formatCurrency(expense, currency, "pt-BR") }}</td>
                <td
                  class="py-3 text-right"
                  :class="net >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'"
                >
                  {{ formatCurrency(net, currency, "pt-BR") }}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </Card>

    <!-- Error banner -->
    <div
      v-if="query.isError.value"
      class="flex items-center gap-3 rounded-xl border border-[var(--color-danger)] bg-[var(--color-danger-light)] p-4 text-sm text-[var(--color-danger)]"
      role="alert"
    >
      <svg class="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 100 2 1 1 0 000-2z" clip-rule="evenodd" />
      </svg>
      <span>
        Não foi possível carregar as transações do período.
        <Button variant="ghost" size="sm" @click="query.refetch()">Tentar novamente</Button>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useAccounts, useTransactions } from "../../composables/useApi";
import type { TransactionFilters } from "../../composables/useApi";
import { formatCurrency, startOfDayIso, endOfDayIso } from "../../utils/format";
import { Button, Card, EmptyState, Select, Tooltip } from "../../components/ui";

const router = useRouter();

function toDateInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Period state (kept as date-picker strings, converted to ISO for the API)
const preset = ref("THIS_MONTH");
const rangeFrom = ref(toDateInput(new Date(new Date().getFullYear(), new Date().getMonth(), 1)));
const rangeTo = ref(toDateInput(new Date()));

const presetOptions = [
  { value: "THIS_MONTH", label: "Este mês" },
  { value: "LAST_3_MONTHS", label: "Últimos 3 meses" },
  { value: "LAST_6_MONTHS", label: "Últimos 6 meses" },
  { value: "THIS_YEAR", label: "Este ano" },
  { value: "CUSTOM", label: "Personalizado" },
];

function applyPreset(value: string) {
  const now = new Date();
  if (value === "THIS_MONTH") {
    rangeFrom.value = toDateInput(new Date(now.getFullYear(), now.getMonth(), 1));
    rangeTo.value = toDateInput(now);
  } else if (value === "LAST_3_MONTHS") {
    rangeFrom.value = toDateInput(new Date(now.getFullYear(), now.getMonth() - 2, 1));
    rangeTo.value = toDateInput(now);
  } else if (value === "LAST_6_MONTHS") {
    rangeFrom.value = toDateInput(new Date(now.getFullYear(), now.getMonth() - 5, 1));
    rangeTo.value = toDateInput(now);
  } else if (value === "THIS_YEAR") {
    rangeFrom.value = toDateInput(new Date(now.getFullYear(), 0, 1));
    rangeTo.value = toDateInput(now);
  }
}

watch(preset, (value) => applyPreset(value));
applyPreset(preset.value);

function markCustom() {
  preset.value = "CUSTOM";
}

const filters = computed<TransactionFilters>(() => ({
  dateFrom: startOfDayIso(rangeFrom.value),
  dateTo: endOfDayIso(rangeTo.value),
  limit: 500,
}));

const query = useTransactions(filters);
const accountsQuery = useAccounts();

const transactions = computed(() => query.data.value?.transactions ?? []);
const isLoading = computed(() => query.isLoading.value);
const currency = computed(() => accountsQuery.data.value?.[0]?.currency || "BRL");

const income = computed(() =>
  transactions.value
    .filter((tx) => tx.type === "INCOME")
    .reduce((sum, tx) => sum + Math.abs(Number(tx.amount || 0)), 0)
);

const expense = computed(() =>
  transactions.value
    .filter((tx) => tx.type === "EXPENSE")
    .reduce((sum, tx) => sum + Math.abs(Number(tx.amount || 0)), 0)
);

const net = computed(() => income.value - expense.value);

function monthLabel(key: string): string {
  const date = new Date(`${key}-01T12:00:00`);
  if (Number.isNaN(date.getTime())) return key;
  return date.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
}

const monthly = computed(() => {
  const groups = new Map<string, { key: string; label: string; income: number; expense: number }>();

  for (const tx of transactions.value) {
    const key = (tx.date || "").slice(0, 7);
    if (!/^\d{4}-\d{2}$/.test(key)) continue;
    const amount = Math.abs(Number(tx.amount || 0));
    const group = groups.get(key) ?? { key, label: monthLabel(key), income: 0, expense: 0 };
    if (tx.type === "INCOME") group.income += amount;
    else if (tx.type === "EXPENSE") group.expense += amount;
    groups.set(key, group);
  }

  return Array.from(groups.values()).sort((a, b) => a.key.localeCompare(b.key));
});

const maxBarValue = computed(() => {
  const max = monthly.value.reduce(
    (peak, month) => Math.max(peak, month.income, month.expense),
    0
  );
  return max > 0 ? max : 1;
});

function barHeight(value: number): string {
  if (value <= 0) return "2px";
  return `${Math.max(6, Math.round((value / maxBarValue.value) * 100))}%`;
}

function exportCsv() {
  const header = ["Mês", "Entradas", "Saídas", "Resultado"];
  const rows = monthly.value.map((month) => [
    month.label,
    month.income.toFixed(2),
    month.expense.toFixed(2),
    (month.income - month.expense).toFixed(2),
  ]);
  const csv = [header, ...rows].map((row) => row.join(";")).join("\r\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `fluxo-de-caixa-${rangeFrom.value}-a-${rangeTo.value}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
</script>
