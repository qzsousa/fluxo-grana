<template>
  <div class="space-y-6 stagger-in">
    <!-- Page header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="font-display text-3xl text-[var(--color-fg)]">Dashboard</h1>
        <p class="mt-1 text-[var(--color-fg-muted)]">
          Bem-vindo{{ auth.user?.name ? `, ${auth.user.name}` : "" }} — aqui está sua visão financeira.
        </p>
      </div>
      <div class="flex flex-wrap gap-3">
        <Button variant="outline" @click="router.push('/accounts/new')">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nova Conta
        </Button>
        <Button @click="router.push('/transactions/new')">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nova Transação
        </Button>
      </div>
    </div>

    <!-- Summary cards -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <template v-if="isLoading">
        <Card v-for="i in 4" :key="i" padding="md">
          <p class="text-sm font-medium text-[var(--color-fg-muted)] skeleton skeleton-title"></p>
          <p class="mt-2 text-2xl font-bold text-[var(--color-fg)] skeleton skeleton-text" style="width: 8rem;"></p>
        </Card>
      </template>

      <template v-else>
        <Card padding="md">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-sm font-medium text-[var(--color-fg-muted)]">Saldo Total</p>
              <p class="mt-1 font-display text-2xl font-normal text-[var(--color-fg)]">{{ formatCurrency(totalBalance, currency) }}</p>
              <p class="mt-1 text-xs text-[var(--color-fg-muted)]">{{ accounts.length }} conta{{ accounts.length !== 1 ? 's' : '' }}</p>
            </div>
            <div class="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-brand-light)] text-[var(--color-brand)]">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
          </div>
          <Tooltip content="Soma dos saldos de todas as suas contas ativas." position="top">
            <span class="ml-1 text-[var(--color-fg-subtle)] hover:text-[var(--color-brand)] cursor-help">
              <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke-width="1.5" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 16v-4M12 8h.01" />
              </svg>
            </span>
          </Tooltip>
        </Card>

        <Card padding="md">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-sm font-medium text-[var(--color-fg-muted)]">Receitas do Mês</p>
              <p class="mt-1 font-display text-2xl font-normal text-[var(--color-success)]">+{{ formatCurrency(monthIncome, currency) }}</p>
            </div>
            <div class="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-success-light)] text-[var(--color-success)]">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
            </div>
          </div>
          <Tooltip content="Soma de todas as transações do tipo 'Receita' no mês corrente." position="top">
            <span class="ml-1 text-[var(--color-fg-subtle)] hover:text-[var(--color-brand)] cursor-help">
              <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke-width="1.5" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 16v-4M12 8h.01" />
              </svg>
            </span>
          </Tooltip>
        </Card>

        <Card padding="md">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-sm font-medium text-[var(--color-fg-muted)]">Despesas do Mês</p>
              <p class="mt-1 font-display text-2xl font-normal text-[var(--color-danger)]">-{{ formatCurrency(monthExpenses, currency) }}</p>
            </div>
            <div class="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-danger-light)] text-[var(--color-danger)]">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17 13l-5 5m0 0l-5-5m5 5V6" />
              </svg>
            </div>
          </div>
          <Tooltip content="Soma de todas as transações do tipo 'Despesa' no mês corrente." position="top">
            <span class="ml-1 text-[var(--color-fg-subtle)] hover:text-[var(--color-brand)] cursor-help">
              <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke-width="1.5" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 16v-4M12 8h.01" />
              </svg>
            </span>
          </Tooltip>
        </Card>

        <Card padding="md">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-sm font-medium text-[var(--color-fg-muted)]">Saldo do Mês</p>
              <p class="mt-1 font-display text-2xl font-normal" :class="monthNet >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'">
                {{ monthNet >= 0 ? '+' : '' }}{{ formatCurrency(monthNet, currency) }}
              </p>
            </div>
            <div class="inline-flex h-12 w-12 items-center justify-center rounded-xl" :class="monthNet >= 0 ? 'bg-[var(--color-success-light)] text-[var(--color-success)]' : 'bg-[var(--color-danger-light)] text-[var(--color-danger)]'">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
                <path v-if="monthNet >= 0" stroke-linecap="round" stroke-linejoin="round" d="M7 11l5-5m0 0l5 5m-5-5v12" />
                <path v-else stroke-linecap="round" stroke-linejoin="round" d="M17 13l-5 5m0 0l-5-5m5 5V6" />
              </svg>
            </div>
          </div>
          <Tooltip content="Diferença entre receitas e despesas do mês corrente. Positivo = sobrou; negativo = faltou." position="top">
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
      <!-- Recent transactions -->
      <Card title="Transações Recentes" padding="none" class="lg:col-span-2">
        <template #header-actions>
          <router-link to="/transactions" class="link text-sm font-medium">Ver todas</router-link>
        </template>

        <div v-if="recentQuery.isLoading.value" class="divide-y divide-[var(--color-border)]">
          <div v-for="i in 5" :key="i" class="flex items-center gap-4 px-6 py-4">
            <div class="h-10 w-10 skeleton rounded-full"></div>
            <div class="flex-1 space-y-2">
              <div class="h-4 w-40 skeleton skeleton-text"></div>
              <div class="h-3 w-24 skeleton skeleton-text"></div>
            </div>
            <div class="h-4 w-16 skeleton skeleton-text text-right"></div>
          </div>
        </div>

        <div v-else-if="recentTransactions.length" class="divide-y divide-[var(--color-border)]">
          <div
            v-for="tx in recentTransactions"
            :key="tx.id"
            class="flex items-center gap-4 px-6 py-4 hover:bg-[var(--color-bg-muted)] transition-colors cursor-pointer"
            @click="router.push(`/transactions/${tx.id}`)"
          >
            <span
              class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
              :class="tx.type === 'INCOME' ? 'bg-[var(--color-success-light)] text-[var(--color-success)]' : tx.type === 'EXPENSE' ? 'bg-[var(--color-danger-light)] text-[var(--color-danger)]' : 'bg-[var(--color-bg-muted)] text-[var(--color-fg-muted)]'"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" aria-hidden="true">
                <path v-if="tx.type === 'INCOME'" stroke-linecap="round" stroke-linejoin="round" d="M7 11l5-5m0 0l5 5m-5-5v12" />
                <path v-else-if="tx.type === 'EXPENSE'" stroke-linecap="round" stroke-linejoin="round" d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                <path v-else stroke-linecap="round" stroke-linejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </span>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium text-[var(--color-fg)]">{{ tx.description }}</p>
              <p class="truncate text-xs text-[var(--color-fg-muted)]">
                {{ tx.category?.name || 'Sem categoria' }} · {{ tx.account?.name || '—' }}
              </p>
            </div>
            <div class="text-right">
              <p class="text-sm font-semibold" :class="signedAmount(tx) >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'">
                {{ signedAmount(tx) >= 0 ? '+' : '' }}{{ formatCurrency(Math.abs(signedAmount(tx)), tx.currency || currency) }}
              </p>
              <p class="text-xs text-[var(--color-fg-subtle)]">{{ formatRelativeDate(tx.date) }}</p>
            </div>
          </div>
        </div>

        <div v-else class="px-6 py-12">
          <EmptyState
            icon="transactions"
            title="Nenhuma transação ainda"
            description="Registre sua primeira transação para começar a acompanhar seus gastos e receitas."
            :action="{ label: 'Nova Transação', onClick: () => router.push('/transactions/new') }"
          />
        </div>
      </Card>

      <!-- Accounts overview -->
      <Card title="Suas Contas" padding="none">
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
          <router-link
            v-for="account in accounts"
            :key="account.id"
            :to="`/accounts/${account.id}`"
            class="flex items-center gap-3 px-6 py-4 hover:bg-[var(--color-bg-muted)] transition-colors"
          >
            <span class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-brand-light)] text-[var(--color-brand)]">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </span>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium text-[var(--color-fg)]">{{ account.name }}</p>
              <p class="text-xs capitalize text-[var(--color-fg-muted)]">{{ account.type.toLowerCase() }}</p>
            </div>
            <p class="text-sm font-semibold" :class="account.balance >= 0 ? 'text-[var(--color-fg)]' : 'text-[var(--color-danger)]'">
              {{ formatCurrency(account.balance, account.currency || currency) }}
            </p>
          </router-link>
        </div>

        <div v-else class="px-6 py-12">
          <EmptyState
            icon="wallet"
            title="Nenhuma conta cadastrada"
            description="Adicione sua primeira conta bancária, carteira ou cartão para começar a organizar suas finanças."
            :action="{ label: 'Adicionar Conta', onClick: () => router.push('/accounts/new') }"
          />
        </div>
      </Card>
    </div>

    <!-- Error banner -->
    <div
      v-if="accountsQuery.isError.value || recentQuery.isError.value || monthQuery.isError.value"
      class="rounded-xl border border-[var(--color-danger)] bg-[var(--color-danger-light)] p-4 text-sm text-[var(--color-danger)] flex items-center gap-3"
      role="alert"
    >
      <svg class="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 100 2 1 1 0 000-2z" clip-rule="evenodd" />
      </svg>
      <span>Alguns dados não puderam ser carregados. <Button variant="ghost" size="sm" @click="window.location.reload()">Tentar novamente</Button></span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../stores/auth";
import { useAccounts, useTransactions } from "../../composables/useApi";
import type { Transaction } from "../../composables/useApi";
import { formatCurrency, formatRelativeDate } from "../../utils/format";
import { Button, Card, EmptyState, Tooltip } from "../../components/ui";

const auth = useAuthStore();
const router = useRouter();

// Queries
const accountsQuery = useAccounts();
const recentQuery = useTransactions(ref({ limit: 5 }));

const now = new Date();
const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
const today = now.toISOString().slice(0, 10);
const monthQuery = useTransactions(ref({ dateFrom: monthStart, dateTo: today, limit: 200 }));

const accounts = computed(() => accountsQuery.data.value ?? []);
const recentTransactions = computed(() => recentQuery.data.value?.transactions ?? []);

const currency = computed(() => auth.user?.currency || accounts.value[0]?.currency || "BRL");

const totalBalance = computed(() =>
  accounts.value.reduce((sum, account) => sum + Number(account.balance || 0), 0)
);

function signedAmount(tx: Transaction): number {
  const amount = Math.abs(Number(tx.amount || 0));
  if (tx.type === "EXPENSE") return -amount;
  if (tx.type === "INCOME") return amount;
  return 0;
}

const monthIncome = computed(() =>
  (monthQuery.data.value?.transactions ?? [])
    .filter((tx) => tx.type === "INCOME")
    .reduce((sum, tx) => sum + Math.abs(Number(tx.amount || 0)), 0)
);

const monthExpenses = computed(() =>
  (monthQuery.data.value?.transactions ?? [])
    .filter((tx) => tx.type === "EXPENSE")
    .reduce((sum, tx) => sum + Math.abs(Number(tx.amount || 0)), 0)
);

const monthNet = computed(() => monthIncome.value - monthExpenses.value);

const isLoading = computed(
  () => accountsQuery.isLoading.value || monthQuery.isLoading.value
);
</script>