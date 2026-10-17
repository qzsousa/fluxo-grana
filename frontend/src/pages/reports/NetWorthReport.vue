<template>
  <div class="space-y-6 stagger-in">
    <!-- Page header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="font-display text-3xl text-[var(--color-fg)]">Patrimônio Líquido</h1>
        <p class="mt-1 text-[var(--color-fg-muted)]">
          Quanto você tem hoje e como esse valor evoluiu ao longo do período.
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
          id="networth-preset"
          label="Período"
          :options="presetOptions"
          hint="O período define o histórico analisado abaixo."
        />
        <div>
          <label for="networth-date-from" class="label">De</label>
          <input
            id="networth-date-from"
            v-model="rangeFrom"
            type="date"
            class="input-base"
            @input="markCustom"
          />
        </div>
        <div>
          <label for="networth-date-to" class="label">Até</label>
          <input
            id="networth-date-to"
            v-model="rangeTo"
            type="date"
            class="input-base"
            @input="markCustom"
          />
        </div>
        <div class="flex items-end">
          <p class="pb-2 text-sm text-[var(--color-fg-muted)]">
            Saldo consolidado de
            <span class="font-medium text-[var(--color-fg)]">{{ accounts.length }}</span>
            conta{{ accounts.length === 1 ? "" : "s" }}
          </p>
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
              <p class="text-sm font-medium text-[var(--color-fg-muted)]">Patrimônio atual</p>
              <p
                class="mt-1 font-display text-2xl font-normal"
                :class="netWorth >= 0 ? 'text-[var(--color-fg)]' : 'text-[var(--color-danger)]'"
              >
                {{ formatCurrency(netWorth, currency, "pt-BR") }}
              </p>
              <p class="mt-1 text-xs text-[var(--color-fg-muted)]">soma dos saldos de hoje</p>
            </div>
            <div class="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-brand-light)] text-[var(--color-brand)]">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <Tooltip content="Patrimônio líquido = soma dos saldos positivos (bens) menos os saldos negativos (dívidas) de todas as contas." position="top">
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
              <p class="text-sm font-medium text-[var(--color-fg-muted)]">Entradas do período</p>
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
              <p class="text-sm font-medium text-[var(--color-fg-muted)]">Saídas do período</p>
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
        </Card>

        <Card padding="md">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-sm font-medium text-[var(--color-fg-muted)]">Variação no período</p>
              <p
                class="mt-1 font-display text-2xl font-normal"
                :class="variation >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'"
              >
                {{ variation >= 0 ? '+' : '' }}{{ formatCurrency(variation, currency, "pt-BR") }}
              </p>
              <p class="mt-1 text-xs text-[var(--color-fg-muted)]">
                {{ variation >= 0 ? 'Seu patrimônio cresceu' : 'Seu patrimônio encolheu' }}
              </p>
            </div>
            <div
              class="inline-flex h-12 w-12 items-center justify-center rounded-xl"
              :class="variation >= 0 ? 'bg-[var(--color-success-light)] text-[var(--color-success)]' : 'bg-[var(--color-danger-light)] text-[var(--color-danger)]'"
            >
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
                <path v-if="variation >= 0" stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                <path v-else stroke-linecap="round" stroke-linejoin="round" d="M13 17l-5-5m0 0l5-5m-5 5H6" />
              </svg>
            </div>
          </div>
          <Tooltip content="Entradas menos saídas do período. Uma variação positiva significa que você accumulou dinheiro no intervalo." position="top">
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

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <!-- Evolution -->
      <Card
        title="Evolução mensal"
        description="Patrimônio estimado ao fim de cada mês do período"
        padding="none"
        class="lg:col-span-2"
      >
        <template #header-actions>
          <Tooltip content="Estimativa calculada a partir do saldo atual menos as movimentações do período. Transferências e ajustes manuais podem alterar levemente o valor." position="top">
            <span class="cursor-help text-[var(--color-fg-subtle)] hover:text-[var(--color-brand)]" tabindex="0">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke-width="1.5" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 16v-4M12 8h.01" />
              </svg>
            </span>
          </Tooltip>
        </template>

        <div v-if="isLoading" class="space-y-4 p-6">
          <div v-for="i in 4" :key="i" class="flex items-center gap-4">
            <div class="h-4 w-16 skeleton skeleton-text"></div>
            <div class="h-8 flex-1 skeleton rounded-lg"></div>
          </div>
        </div>

        <div v-else-if="!monthly.length" class="px-6 py-6">
          <EmptyState
            icon="chart"
            title="Sem histórico no período"
            description="Amplie o intervalo de datas para ver a evolução do seu patrimônio ou registre novas transações."
            :action="{ label: 'Ver transações', onClick: () => router.push('/transactions') }"
          />
        </div>

        <div v-else class="space-y-6 p-6">
          <div class="overflow-x-auto">
            <div class="flex h-40 min-w-[420px] items-end gap-3">
              <div
                v-for="month in monthly"
                :key="month.key"
                class="flex h-full flex-1 flex-col items-center justify-end gap-1"
              >
                <span
                  class="text-xs font-medium"
                  :class="month.balance >= 0 ? 'text-[var(--color-fg-muted)]' : 'text-[var(--color-danger)]'"
                >
                  {{ formatCurrency(month.balance, currency, "pt-BR") }}
                </span>
                <div
                  class="w-full max-w-[36px] rounded-t-md transition-all"
                  :class="month.balance >= 0 ? 'bg-[var(--color-brand)]' : 'bg-[var(--color-danger)]'"
                  :style="{ height: barHeight(month.balance) }"
                  :title="`Patrimônio estimado em ${month.label}: ${formatCurrency(month.balance, currency, 'pt-BR')}`"
                ></div>
                <span class="text-xs text-[var(--color-fg-muted)]">{{ month.label }}</span>
              </div>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full min-w-[520px] text-sm">
              <thead>
                <tr class="border-b border-[var(--color-border)] text-left text-xs uppercase tracking-wide text-[var(--color-fg-subtle)]">
                  <th scope="col" class="py-2 pr-4 font-medium">Mês</th>
                  <th scope="col" class="py-2 pr-4 text-right font-medium">Entradas</th>
                  <th scope="col" class="py-2 pr-4 text-right font-medium">Saídas</th>
                  <th scope="col" class="py-2 text-right font-medium">Patrimônio estimado</th>
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
                    :class="month.balance >= 0 ? 'text-[var(--color-fg)]' : 'text-[var(--color-danger)]'"
                  >
                    {{ formatCurrency(month.balance, currency, "pt-BR") }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      <!-- Accounts -->
      <Card title="Suas contas" description="Composição do patrimônio atual" padding="none">
        <template #header-actions>
          <router-link to="/accounts" class="link text-sm font-medium">Ver todas</router-link>
        </template>

        <div v-if="accountsQuery.isLoading.value" class="divide-y divide-[var(--color-border)]">
          <div v-for="i in 3" :key="i" class="flex items-center gap-3 px-6 py-4">
            <div class="h-9 w-9 skeleton rounded-lg"></div>
            <div class="flex-1 space-y-2">
              <div class="h-4 w-28 skeleton skeleton-text"></div>
              <div class="h-3 w-16 skeleton skeleton-text"></div>
            </div>
          </div>
        </div>

        <div v-else-if="accounts.length" class="divide-y divide-[var(--color-border)]">
          <div v-for="account in accounts" :key="account.id" class="flex items-center gap-3 px-6 py-4">
            <span
              class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
              :class="Number(account.balance) >= 0
                ? 'bg-[var(--color-brand-light)] text-[var(--color-brand)]'
                : 'bg-[var(--color-danger-light)] text-[var(--color-danger)]'"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </span>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium text-[var(--color-fg)]">{{ account.name }}</p>
              <p class="text-xs capitalize text-[var(--color-fg-muted)]">
                {{ account.type.toLowerCase() }}
                <span v-if="Number(account.balance) < 0" class="text-[var(--color-danger)]">· saldo devedor</span>
              </p>
            </div>
            <p
              class="text-sm font-semibold"
              :class="Number(account.balance) >= 0 ? 'text-[var(--color-fg)]' : 'text-[var(--color-danger)]'"
            >
              {{ formatCurrency(Number(account.balance), account.currency || currency, "pt-BR") }}
            </p>
          </div>
        </div>

        <div v-else class="px-6 py-6">
          <EmptyState
            icon="wallet"
            title="Nenhuma conta cadastrada"
            description="Cadastre suas contas para que o patrimônio líquido seja calculado automaticamente."
            :action="{ label: 'Adicionar Conta', onClick: () => router.push('/accounts/new') }"
          />
        </div>

        <template v-if="!accountsQuery.isLoading.value && accounts.length" #footer>
          <p class="text-sm text-[var(--color-fg-muted)]">
            Patrimônio líquido:
            <span class="font-semibold" :class="netWorth >= 0 ? 'text-[var(--color-fg)]' : 'text-[var(--color-danger)]'">
              {{ formatCurrency(netWorth, currency, "pt-BR") }}
            </span>
          </p>
        </template>
      </Card>
    </div>

    <!-- Error banner -->
    <div
      v-if="accountsQuery.isError.value || query.isError.value"
      class="flex items-center gap-3 rounded-xl border border-[var(--color-danger)] bg-[var(--color-danger-light)] p-4 text-sm text-[var(--color-danger)]"
      role="alert"
    >
      <svg class="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 100 2 1 1 0 000-2z" clip-rule="evenodd" />
      </svg>
      <span>
        Não foi possível carregar todos os dados deste relatório.
        <Button variant="ghost" size="sm" @click="reload">Tentar novamente</Button>
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

const accounts = computed(() => accountsQuery.data.value ?? []);
const transactions = computed(() => query.data.value?.transactions ?? []);
const isLoading = computed(() => query.isLoading.value);
const currency = computed(() => accounts.value[0]?.currency || "BRL");

const netWorth = computed(() =>
  accounts.value.reduce((sum, account) => sum + Number(account.balance || 0), 0)
);

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

const variation = computed(() => income.value - expense.value);

function monthLabel(key: string): string {
  const date = new Date(`${key}-01T12:00:00`);
  if (Number.isNaN(date.getTime())) return key;
  return date.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
}

// Saldo estimado no início do período: saldo atual descontando o que entrou e saiu dele.
const openingBalance = computed(() => netWorth.value - variation.value);

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

  let running = openingBalance.value;
  return Array.from(groups.values())
    .sort((a, b) => a.key.localeCompare(b.key))
    .map((group) => {
      running += group.income - group.expense;
      return { ...group, balance: running };
    });
});

const maxBalance = computed(() =>
  monthly.value.reduce((peak, month) => Math.max(peak, Math.abs(month.balance)), 0)
);

function barHeight(value: number): string {
  const max = maxBalance.value > 0 ? maxBalance.value : 1;
  if (value === 0) return "2px";
  return `${Math.max(6, Math.round((Math.abs(value) / max) * 100))}%`;
}

function reload() {
  query.refetch();
  accountsQuery.refetch();
}

function exportCsv() {
  const header = ["Mês", "Entradas", "Saídas", "Patrimônio estimado"];
  const rows = monthly.value.map((month) => [
    month.label,
    month.income.toFixed(2),
    month.expense.toFixed(2),
    month.balance.toFixed(2),
  ]);
  const csv = [header, ...rows].map((row) => row.join(";")).join("\r\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `patrimonio-liquido-${rangeFrom.value}-a-${rangeTo.value}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
</script>
