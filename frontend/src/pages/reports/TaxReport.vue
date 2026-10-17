<template>
  <div class="space-y-6 stagger-in">
    <!-- Page header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="font-display text-3xl text-[var(--color-fg)]">Impostos</h1>
        <p class="mt-1 text-[var(--color-fg-muted)]">
          Base de despesas dedutíveis do período, organizada por categoria para conferir com o seu contador.
        </p>
      </div>
      <div class="flex flex-wrap gap-3">
        <Button variant="outline" :disabled="!deductibleTotal" @click="exportCsv">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
          </svg>
          Exportar
        </Button>
        <Button @click="generateReport">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Gerar relatório
        </Button>
      </div>
    </div>

    <!-- Period filter -->
    <Card variant="filled" padding="md">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Select
          v-model="preset"
          id="tax-preset"
          label="Período"
          :options="presetOptions"
          hint="Escolha o intervalo da base de cálculo."
        />
        <div>
          <label for="tax-date-from" class="label">De</label>
          <input
            id="tax-date-from"
            v-model="rangeFrom"
            type="date"
            class="input-base"
            @input="markCustom"
          />
        </div>
        <div>
          <label for="tax-date-to" class="label">Até</label>
          <input
            id="tax-date-to"
            v-model="rangeTo"
            type="date"
            class="input-base"
            @input="markCustom"
          />
        </div>
        <div>
          <label for="tax-rate" class="label">Alíquota estimada (%)</label>
          <input
            id="tax-rate"
            v-model="estimatedRate"
            type="number"
            min="0"
            max="100"
            step="0.5"
            class="input-base"
          />
          <p class="help-text">Percentual aplicado sobre o resultado positivo, apenas para simulação.</p>
        </div>
      </div>
    </Card>

    <!-- Summary cards -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <template v-if="isLoading">
        <Card v-for="i in 4" :key="i" padding="md">
          <p class="text-sm font-medium text-[var(--color-fg-muted)] skeleton skeleton-title"></p>
          <p class="mt-2 h-4 w-24 skeleton skeleton-text"></p>
        </Card>
      </template>

      <template v-else>
        <Card padding="md">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-sm font-medium text-[var(--color-fg-muted)]">Total de despesas dedutíveis</p>
              <p class="mt-1 font-display text-2xl font-normal text-[var(--color-danger)]">
                {{ formatCurrency(deductibleTotal, currency, "pt-BR") }}
              </p>
              <p class="mt-1 text-xs text-[var(--color-fg-muted)]">{{ transactions.length }} lançamentos no período</p>
            </div>
            <div class="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-danger-light)] text-[var(--color-danger)]">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <Tooltip content="Soma de todas as despesas lançadas no período. Use como base de conferência: a dedução fiscal oficial depende da natureza de cada gasto." position="top">
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
              <p class="text-sm font-medium text-[var(--color-fg-muted)]">Receitas do período</p>
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
        </Card>

        <Card padding="md">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-sm font-medium text-[var(--color-fg-muted)]">Resultado do período</p>
              <p
                class="mt-1 font-display text-2xl font-normal"
                :class="net >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'"
              >
                {{ formatCurrency(net, currency, "pt-BR") }}
              </p>
              <p class="mt-1 text-xs text-[var(--color-fg-muted)]">receitas menos despesas</p>
            </div>
            <div
              class="inline-flex h-12 w-12 items-center justify-center rounded-xl"
              :class="net >= 0 ? 'bg-[var(--color-success-light)] text-[var(--color-success)]' : 'bg-[var(--color-danger-light)] text-[var(--color-danger)]'"
            >
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 13h2l3-8 4 16 3-8h6" />
              </svg>
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-sm font-medium text-[var(--color-fg-muted)]">Impostos a pagar</p>
              <p class="mt-1 font-display text-2xl font-normal text-[var(--color-warning)]">
                {{ formatCurrency(taxesDue, currency, "pt-BR") }}
              </p>
              <p class="mt-1 text-xs text-[var(--color-fg-muted)]">estimativa de {{ estimatedRate }}%</p>
            </div>
            <div class="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-warning-light)] text-[var(--color-warning)]">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <Tooltip content="Simulação simples: percentual escolhido por você aplicado sobre o resultado positivo do período. Não substitui o cálculo oficial (DARF/DAS)." position="top">
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

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <!-- Expenses by category -->
      <Card title="Despesas por categoria" description="Onde estão os seus gastos dedutíveis" padding="md">
        <div v-if="isLoading" class="space-y-4">
          <div v-for="i in 4" :key="i" class="flex items-center gap-4">
            <div class="h-4 w-32 skeleton skeleton-text"></div>
            <div class="h-3 flex-1 skeleton skeleton-text"></div>
          </div>
        </div>

        <EmptyState
          v-else-if="!expenseByCategory.length"
          icon="table"
          title="Nenhuma despesa no período"
          description="Ajuste o intervalo de datas ou registre despesas para montar a base dedutível."
          :action="{ label: 'Ver transações', onClick: () => router.push('/transactions') }"
        />

        <ul v-else class="space-y-4">
          <li v-for="category in expenseByCategory" :key="category.name">
            <div class="flex items-baseline justify-between gap-3">
              <p class="truncate text-sm font-medium text-[var(--color-fg)]">{{ category.name }}</p>
              <p class="text-sm font-semibold text-[var(--color-fg)]">
                {{ formatCurrency(category.total, currency, "pt-BR") }}
              </p>
            </div>
            <div class="mt-1.5 flex items-center gap-3">
              <div class="h-2 flex-1 overflow-hidden rounded-full bg-[var(--color-bg-muted)]">
                <div
                  class="h-full rounded-full bg-[var(--color-brand)]"
                  :style="{ width: `${sharePercent(category.total)}%` }"
                ></div>
              </div>
              <span class="w-16 text-right text-xs text-[var(--color-fg-muted)]">
                {{ sharePercent(category.total).toFixed(1) }}%
              </span>
            </div>
          </li>
        </ul>
      </Card>

      <!-- Generated report -->
      <Card
        title="Resumo do período"
        description="Documento gerado a partir dos seus lançamentos"
        padding="md"
      >
        <template #header-actions>
          <router-link to="/reports" class="link text-sm font-medium">Outros relatórios</router-link>
        </template>

        <div v-if="!reportGenerated" class="py-6">
          <EmptyState
            icon="inbox"
            title="Nenhum relatório gerado"
            description="Clique em “Gerar relatório” para montar o resumo do período com os totais e as principais despesas."
            :action="{ label: 'Gerar relatório', onClick: generateReport }"
          />
        </div>

        <div v-else class="space-y-4">
          <dl class="space-y-3 text-sm">
            <div class="flex items-baseline justify-between gap-3 border-b border-[var(--color-border)] pb-2">
              <dt class="text-[var(--color-fg-muted)]">Período</dt>
              <dd class="font-medium text-[var(--color-fg)]">{{ periodLabel }}</dd>
            </div>
            <div class="flex items-baseline justify-between gap-3 border-b border-[var(--color-border)] pb-2">
              <dt class="text-[var(--color-fg-muted)]">Receitas</dt>
              <dd class="font-medium text-[var(--color-success)]">{{ formatCurrency(income, currency, "pt-BR") }}</dd>
            </div>
            <div class="flex items-baseline justify-between gap-3 border-b border-[var(--color-border)] pb-2">
              <dt class="text-[var(--color-fg-muted)]">Total de despesas dedutíveis</dt>
              <dd class="font-medium text-[var(--color-danger)]">{{ formatCurrency(deductibleTotal, currency, "pt-BR") }}</dd>
            </div>
            <div class="flex items-baseline justify-between gap-3 border-b border-[var(--color-border)] pb-2">
              <dt class="text-[var(--color-fg-muted)]">Resultado do período</dt>
              <dd class="font-medium" :class="net >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'">
                {{ formatCurrency(net, currency, "pt-BR") }}
              </dd>
            </div>
            <div class="flex items-baseline justify-between gap-3">
              <dt class="text-[var(--color-fg-muted)]">Impostos a pagar (estimativa)</dt>
              <dd class="font-medium text-[var(--color-warning)]">{{ formatCurrency(taxesDue, currency, "pt-BR") }}</dd>
            </div>
          </dl>

          <div>
            <p class="text-sm font-medium text-[var(--color-fg)]">Maiores despesas por categoria</p>
            <ol class="mt-2 space-y-1.5 text-sm text-[var(--color-fg-muted)]">
              <li
                v-for="(category, index) in topCategories"
                :key="category.name"
                class="flex items-baseline justify-between gap-3"
              >
                <span class="truncate">{{ index + 1 }}. {{ category.name }}</span>
                <span class="font-medium text-[var(--color-fg)]">
                  {{ formatCurrency(category.total, currency, "pt-BR") }}
                </span>
              </li>
              <li v-if="!topCategories.length" class="text-[var(--color-fg-subtle)]">
                Nenhuma despesa registrada no período.
              </li>
            </ol>
          </div>

          <div class="flex items-start gap-2 rounded-lg border border-[var(--color-warning)] bg-[var(--color-warning-light)] p-3 text-sm text-[var(--color-warning)]">
            <svg class="mt-0.5 h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 100 2 1 1 0 000-2z" clip-rule="evenodd" />
            </svg>
            <span>
              Documento de apoio para conferência. A apuração oficial dos impostos (DARF/DAS) deve ser feita com o seu contador.
            </span>
          </div>

          <div class="flex flex-col gap-3 border-t border-[var(--color-border)] pt-4 sm:flex-row sm:justify-end">
            <Button variant="ghost" @click="reportGenerated = false">Descartar</Button>
            <Button :disabled="!deductibleTotal" @click="exportCsv">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
              </svg>
              Baixar CSV
            </Button>
          </div>
        </div>
      </Card>
    </div>

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
import { formatCurrency, formatDate, startOfDayIso, endOfDayIso } from "../../utils/format";
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
const estimatedRate = ref("15");
const reportGenerated = ref(false);

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

const deductibleTotal = computed(() =>
  transactions.value
    .filter((tx) => tx.type === "EXPENSE")
    .reduce((sum, tx) => sum + Math.abs(Number(tx.amount || 0)), 0)
);

const net = computed(() => income.value - deductibleTotal.value);

const taxesDue = computed(() => {
  const rate = Number(estimatedRate.value);
  if (!Number.isFinite(rate) || rate <= 0 || net.value <= 0) return 0;
  return (net.value * rate) / 100;
});

// Date-picker values are plain yyyy-MM-dd; parse them at noon so the
// displayed date matches the one the user picked in any timezone.
function parseDateInput(value: string): Date {
  return value ? new Date(`${value}T12:00:00`) : new Date();
}

const periodLabel = computed(
  () =>
    `${formatDate(parseDateInput(rangeFrom.value), "pt-BR")} a ${formatDate(
      parseDateInput(rangeTo.value),
      "pt-BR"
    )}`
);

const expenseByCategory = computed(() => {
  const groups = new Map<string, { name: string; total: number; count: number }>();

  for (const tx of transactions.value) {
    if (tx.type !== "EXPENSE") continue;
    const name = tx.category?.name || "Sem categoria";
    const group = groups.get(name) ?? { name, total: 0, count: 0 };
    group.total += Math.abs(Number(tx.amount || 0));
    group.count += 1;
    groups.set(name, group);
  }

  return Array.from(groups.values()).sort((a, b) => b.total - a.total);
});

const topCategories = computed(() => expenseByCategory.value.slice(0, 5));

function sharePercent(value: number): number {
  if (deductibleTotal.value <= 0) return 0;
  return (value / deductibleTotal.value) * 100;
}

function generateReport() {
  reportGenerated.value = true;
}

function exportCsv() {
  const header = ["Categoria", "Total", "Participação (%)"];
  const rows = expenseByCategory.value.map((category) => [
    category.name,
    category.total.toFixed(2),
    sharePercent(category.total).toFixed(2),
  ]);
  const csv = [header, ...rows].map((row) => row.join(";")).join("\r\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `impostos-${rangeFrom.value}-a-${rangeTo.value}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
</script>
