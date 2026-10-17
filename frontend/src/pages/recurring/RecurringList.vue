<template>
  <div class="space-y-6 stagger-in">
    <!-- Page header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="font-display text-3xl text-[var(--color-fg)]">Recorrentes</h1>
        <p class="mt-1 text-[var(--color-fg-muted)]">
          Automatize assinaturas, contas e pagamentos fixos — defina a regra uma vez e o sistema registra para você.
        </p>
      </div>
      <Button @click="router.push('/recurring/new')">
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Nova Transação Recorrente
      </Button>
    </div>

    <!-- Summary cards -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <template v-if="isLoading">
        <Card v-for="i in 3" :key="i" padding="md">
          <p class="text-sm font-medium text-[var(--color-fg-muted)] skeleton skeleton-title"></p>
          <p class="mt-2 h-4 w-24 skeleton skeleton-text"></p>
        </Card>
      </template>

      <template v-else>
        <Card padding="md">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-sm font-medium text-[var(--color-fg-muted)]">Total de regras</p>
              <p class="mt-1 font-display text-2xl font-normal text-[var(--color-fg)]">{{ recurring.length }}</p>
              <p class="mt-1 text-xs text-[var(--color-fg-muted)]">
                {{ activeCount }} ativa{{ activeCount !== 1 ? 's' : '' }} · {{ inactiveCount }} inativa{{ inactiveCount !== 1 ? 's' : '' }}
              </p>
            </div>
            <div class="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-brand-light)] text-[var(--color-brand)]">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <Tooltip content="Quantidade de regras de recorrência cadastradas, ativas ou não." position="top">
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
              <p class="text-sm font-medium text-[var(--color-fg-muted)]">Despesas recorrentes</p>
              <p class="mt-1 font-display text-2xl font-normal text-[var(--color-danger)]">{{ activeExpensesCount }}</p>
              <p class="mt-1 text-xs text-[var(--color-fg-muted)]">regras de despesa ativas</p>
            </div>
            <div class="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-danger-light)] text-[var(--color-danger)]">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17 13l-5 5m0 0l-5-5m5 5V6" />
              </svg>
            </div>
          </div>
          <Tooltip content="Quantas regras ativas geram despesa. Elas entram automaticamente no seu fluxo de caixa." position="top">
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
              <p class="text-sm font-medium text-[var(--color-fg-muted)]">Estimativa mensal</p>
              <p class="mt-1 font-display text-2xl font-normal text-[var(--color-fg)]">
                -{{ formatCurrency(monthlyEstimate, currency, "pt-BR") }}
              </p>
              <p class="mt-1 text-xs text-[var(--color-fg-muted)]">somando apenas regras ativas</p>
            </div>
            <div class="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-warning-light)] text-[var(--color-warning)]">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 012-2h2a2 2 0 012 2v10" />
              </svg>
            </div>
          </div>
          <Tooltip content="Soma das despesas ativas convertidas para um mês (diária ÷ 30,44, semanal ÷ 4,35, quinzenal ÷ 2,17, trimestral ÷ 3, anual ÷ 12)." position="top">
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

    <!-- Recurring list -->
    <Card
      title="Transações Recorrentes"
      description="Regras salvas — a próxima execução é calculada automaticamente"
      padding="none"
    >
      <template #header-actions>
        <span class="badge bg-[var(--color-bg-muted)] text-[var(--color-fg-muted)] border border-[var(--color-border)]">
          {{ recurring.length }} registro{{ recurring.length !== 1 ? 's' : '' }}
        </span>
      </template>

      <!-- Loading -->
      <div v-if="isLoading" class="divide-y divide-[var(--color-border)]">
        <div v-for="i in 4" :key="i" class="flex items-center gap-4 px-6 py-4">
          <div class="h-10 w-10 skeleton rounded-lg"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 w-44 skeleton skeleton-text"></div>
            <div class="h-3 w-32 skeleton skeleton-text"></div>
          </div>
          <div class="h-4 w-20 skeleton skeleton-text"></div>
        </div>
      </div>

      <!-- Items -->
      <div v-else-if="recurring.length" class="divide-y divide-[var(--color-border)]">
        <div
          v-for="rec in recurring"
          :key="rec.id"
          class="flex flex-col gap-4 px-6 py-4 transition-colors hover:bg-[var(--color-bg-muted)] sm:flex-row sm:items-center"
        >
          <span
            class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
            :class="typeClasses(rec.type)"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" aria-hidden="true">
              <path v-if="rec.type === 'INCOME'" stroke-linecap="round" stroke-linejoin="round" d="M7 11l5-5m0 0l5 5m-5-5v12" />
              <path v-else-if="rec.type === 'EXPENSE'" stroke-linecap="round" stroke-linejoin="round" d="M17 13l-5 5m0 0l-5-5m5 5V6" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </span>

          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <p class="truncate text-sm font-medium text-[var(--color-fg)]">{{ rec.description }}</p>
              <span
                class="badge"
                :class="rec.isActive
                  ? 'bg-[var(--color-success-light)] text-[var(--color-success)]'
                  : 'bg-[var(--color-bg-muted)] text-[var(--color-fg-muted)] border border-[var(--color-border)]'"
              >
                {{ rec.isActive ? 'Ativa' : 'Inativa' }}
              </span>
              <span
                v-if="rec.skipWeekends"
                class="badge bg-[var(--color-info-light)] text-[var(--color-info)]"
              >
                Pula fins de semana
              </span>
            </div>

            <p class="mt-1 text-xs text-[var(--color-fg-muted)]">
              <span class="font-medium text-[var(--color-fg-muted)]">Frequência:</span> {{ frequencyLabel(rec.frequency) }}
              · <span class="font-medium text-[var(--color-fg-muted)]">Próxima execução:</span> {{ formatDate(rec.nextRunAt, "pt-BR") || "—" }}
              · <span class="font-medium text-[var(--color-fg-muted)]">Última execução:</span> {{ rec.lastRunAt ? formatDate(rec.lastRunAt, "pt-BR") : "Nunca executada" }}
            </p>
          </div>

          <div class="flex items-center justify-between gap-3 sm:justify-end">
            <p
              class="font-display text-lg font-normal"
              :class="rec.type === 'INCOME' ? 'text-[var(--color-success)]' : 'text-[var(--color-fg)]'"
            >
              {{ rec.type === 'INCOME' ? '+' : '-' }}{{ formatCurrency(Math.abs(Number(rec.amount || 0)), rec.currency || currency, "pt-BR") }}
            </p>
            <Tooltip content="Editar descrição, valor, frequência e status desta regra." position="top">
              <Button
                variant="ghost"
                size="icon"
                :aria-label="`Editar ${rec.description}`"
                @click="router.push(`/recurring/${rec.id}/edit`)"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </Button>
            </Tooltip>
          </div>
        </div>
      </div>

      <!-- Empty -->
      <div v-else class="px-6 py-6">
        <EmptyState
          icon="table"
          title="Nenhuma transação recorrente"
          description="Cadastre assinaturas, contas de casa ou salário para que sejam lançados automaticamente todos os meses."
          :action="{ label: 'Nova Transação Recorrente', onClick: () => router.push('/recurring/new') }"
        />
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
        Não foi possível carregar suas transações recorrentes.
        <Button variant="ghost" size="sm" @click="reload">Tentar novamente</Button>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useRecurringTransactions } from "../../composables/useApi";
import { formatCurrency, formatDate } from "../../utils/format";
import { Button, Card, EmptyState, Tooltip } from "../../components/ui";

const router = useRouter();

const query = useRecurringTransactions();

const recurring = computed(() => query.data.value ?? []);
const isLoading = computed(() => query.isLoading.value);

const currency = computed(() => recurring.value[0]?.currency || "BRL");

const activeCount = computed(() => recurring.value.filter((r) => r.isActive).length);
const inactiveCount = computed(() => recurring.value.filter((r) => !r.isActive).length);
const activeExpensesCount = computed(
  () => recurring.value.filter((r) => r.isActive && r.type === "EXPENSE").length
);

const frequencyLabels: Record<string, string> = {
  DAILY: "Diária",
  WEEKLY: "Semanal",
  BIWEEKLY: "Quinzenal",
  MONTHLY: "Mensal",
  QUARTERLY: "Trimestral",
  YEARLY: "Anual",
  CUSTOM: "Personalizada",
};

const monthlyFactors: Record<string, number> = {
  DAILY: 30.44,
  WEEKLY: 4.345,
  BIWEEKLY: 2.17,
  MONTHLY: 1,
  QUARTERLY: 1 / 3,
  YEARLY: 1 / 12,
  CUSTOM: 0,
};

function frequencyLabel(value?: string): string {
  if (!value) return "—";
  return frequencyLabels[value] ?? value;
}

function typeClasses(type: string): string {
  if (type === "INCOME") return "bg-[var(--color-success-light)] text-[var(--color-success)]";
  if (type === "EXPENSE") return "bg-[var(--color-danger-light)] text-[var(--color-danger)]";
  return "bg-[var(--color-bg-muted)] text-[var(--color-fg-muted)]";
}

const monthlyEstimate = computed(() =>
  recurring.value
    .filter((r) => r.isActive && r.type === "EXPENSE")
    .reduce(
      (sum, r) => sum + Math.abs(Number(r.amount || 0)) * (monthlyFactors[r.frequency] ?? 0),
      0
    )
);

function reload() {
  query.refetch();
}
</script>
