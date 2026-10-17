<template>
  <div class="space-y-6 stagger-in">
    <!-- Page header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="min-w-0">
        <router-link to="/accounts" class="link text-sm">← Voltar para contas</router-link>
        <h1 class="mt-2 font-display text-3xl text-[var(--color-fg)]">Detalhes da conta</h1>
        <p v-if="account" class="mt-1 text-[var(--color-fg-muted)]">
          {{ account.institution || accountTypeLabel(account.type) }}
        </p>
      </div>
      <div v-if="account" class="flex flex-wrap gap-3">
        <Button variant="outline" @click="router.push(`/accounts/${account.id}/edit`)">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Editar conta
        </Button>
        <Button variant="danger" @click="showDeleteModal = true">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Excluir conta
        </Button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card padding="lg">
        <div class="h-12 w-12 skeleton rounded-xl"></div>
        <div class="mt-4 h-4 w-24 skeleton skeleton-text"></div>
        <div class="mt-2 h-9 w-36 skeleton skeleton-text"></div>
      </Card>
      <Card padding="lg" class="lg:col-span-2">
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div v-for="i in 6" :key="i" class="space-y-2">
            <div class="h-3 w-20 skeleton skeleton-text"></div>
            <div class="h-5 w-28 skeleton skeleton-text"></div>
          </div>
        </div>
      </Card>
    </div>

    <div v-else-if="isError" class="rounded-xl border border-[var(--color-danger)] bg-[var(--color-danger-light)] p-4 text-sm text-[var(--color-danger)]" role="alert">
      Não foi possível carregar esta conta.
    </div>

    <template v-else-if="account">
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <!-- Saldo -->
        <Card padding="lg">
          <div class="flex items-start justify-between">
            <span class="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-brand-light)] text-[var(--color-brand)]">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </span>
            <span class="badge" :class="account.isActive ? 'badge-success' : 'badge-neutral'">
              {{ account.isActive ? 'Ativa' : 'Inativa' }}
            </span>
          </div>

          <p class="mt-4 text-sm font-medium text-[var(--color-fg-muted)]">Saldo atual</p>
          <p
            class="mt-1 font-display text-3xl font-normal"
            :class="Number(account.balance) >= 0 ? 'text-[var(--color-fg)]' : 'text-[var(--color-danger)]'"
          >
            {{ formatCurrency(Number(account.balance || 0), account.currency) }}
          </p>

          <div class="mt-4 border-t border-[var(--color-border)] pt-4">
            <p class="truncate font-medium text-[var(--color-fg)]">{{ account.name }}</p>
            <p class="mt-1 text-xs text-[var(--color-fg-muted)]">{{ accountTypeLabel(account.type) }}</p>
          </div>
        </Card>

        <!-- Informações -->
        <Card title="Informações" padding="lg" class="lg:col-span-2">
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <p class="text-sm font-medium text-[var(--color-fg-muted)]">Nome da conta</p>
              <p class="mt-1 text-lg font-medium text-[var(--color-fg)]">{{ account.name }}</p>
            </div>

            <div>
              <p class="text-sm font-medium text-[var(--color-fg-muted)]">Tipo</p>
              <p class="mt-1 text-lg font-medium text-[var(--color-fg)]">{{ accountTypeLabel(account.type) }}</p>
            </div>

            <div>
              <p class="text-sm font-medium text-[var(--color-fg-muted)]">Saldo inicial</p>
              <p class="mt-1 text-lg font-medium text-[var(--color-fg)]">
                {{ formatCurrency(Number(account.initialBalance || 0), account.currency) }}
              </p>
            </div>

            <div>
              <p class="text-sm font-medium text-[var(--color-fg-muted)]">Moeda</p>
              <p class="mt-1 text-lg font-medium text-[var(--color-fg)]">{{ account.currency }}</p>
            </div>

            <div>
              <p class="text-sm font-medium text-[var(--color-fg-muted)]">Instituição</p>
              <p class="mt-1 text-lg font-medium text-[var(--color-fg)]">{{ account.institution || 'Não informada' }}</p>
            </div>

            <div>
              <p class="text-sm font-medium text-[var(--color-fg-muted)]">Ícone</p>
              <p class="mt-1 text-lg font-medium text-[var(--color-fg)]">{{ account.icon || 'Padrão' }}</p>
            </div>

            <div>
              <p class="text-sm font-medium text-[var(--color-fg-muted)]">Conta padrão</p>
              <p class="mt-1">
                <span class="badge" :class="account.isDefault ? 'badge-success' : 'badge-neutral'">
                  {{ account.isDefault ? 'Sim' : 'Não' }}
                </span>
              </p>
            </div>

            <div>
              <p class="text-sm font-medium text-[var(--color-fg-muted)]">Cor da conta</p>
              <p class="mt-1 flex items-center gap-2 text-lg font-medium text-[var(--color-fg)]">
                <span
                  class="inline-block h-5 w-5 rounded-full border border-[var(--color-border)]"
                  :style="{ backgroundColor: account.color || 'var(--color-brand)' }"
                ></span>
                {{ account.color || 'Padrão' }}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <!-- Histórico de saldo -->
      <Card title="Histórico de saldo" description="Evolução do saldo a partir das movimentações" padding="none">
        <div v-if="isHistoryLoading" class="divide-y divide-[var(--color-border)]">
          <div v-for="i in 4" :key="i" class="flex items-center gap-4 px-6 py-4">
            <div class="h-4 w-24 skeleton skeleton-text"></div>
            <div class="h-4 flex-1 skeleton skeleton-text"></div>
            <div class="h-4 w-20 skeleton skeleton-text"></div>
          </div>
        </div>

        <div v-else-if="history.length" class="divide-y divide-[var(--color-border)]">
          <div
            v-for="tx in history"
            :key="tx.id"
            class="flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-[var(--color-bg-muted)]"
          >
            <div class="min-w-0">
              <p class="font-mono text-xs text-[var(--color-fg-muted)]">{{ formatDate(tx.date, "pt-BR") }}</p>
              <p class="truncate text-sm font-medium text-[var(--color-fg)]">{{ tx.description }}</p>
            </div>
            <p
              class="shrink-0 text-sm font-semibold"
              :class="signedAmount(tx) >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'"
            >
              {{ signedAmount(tx) >= 0 ? '+' : '' }}{{ formatCurrency(Math.abs(signedAmount(tx)), tx.currency || account.currency) }}
            </p>
          </div>
        </div>

        <div v-else class="px-6 py-12">
          <EmptyState
            icon="chart"
            title="Nenhuma movimentação ainda"
            description="Assim que houver transações nesta conta, a evolução do saldo aparecerá aqui."
            :action="{ label: 'Ver transações', onClick: () => router.push('/transactions') }"
          />
        </div>
      </Card>
    </template>

    <Card v-else padding="lg">
      <EmptyState
        icon="wallet"
        title="Conta não encontrada"
        description="A conta que você procura não existe ou foi removida."
        :action="{ label: 'Voltar para contas', onClick: () => router.push('/accounts') }"
      />
    </Card>

    <!-- Confirmação de exclusão -->
    <Modal
      v-model="showDeleteModal"
      title="Excluir conta"
      :description="`Tem certeza que deseja excluir a conta ${account?.name || ''}? Esta ação não pode ser desfeita.`"
    >
      <p class="text-sm text-[var(--color-fg-muted)]">
        Todas as transações vinculadas a esta conta podem ser afetadas.
      </p>
      <div
        v-if="deleteError"
        class="mt-4 rounded-lg border border-[var(--color-danger-muted)] bg-[var(--color-danger-light)] p-3 text-sm text-[var(--color-danger)]"
        role="alert"
      >
        {{ deleteError }}
      </div>
      <template #footer>
        <Button variant="ghost" :disabled="deleteMutation.isPending.value" @click="showDeleteModal = false">Cancelar</Button>
        <Button variant="danger" :loading="deleteMutation.isPending.value" @click="onDelete">Confirmar exclusão</Button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAccount, useAccountBalanceHistory, useDeleteAccount } from "../../composables/useApi";
import type { Transaction } from "../../composables/useApi";
import { formatCurrency, formatDate } from "../../utils/format";
import { Button, Card, EmptyState, Modal } from "../../components/ui";

const route = useRoute();
const router = useRouter();

const accountId = route.params.id as string;
const accountQuery = useAccount(accountId);
const historyQuery = useAccountBalanceHistory(accountId);
const deleteMutation = useDeleteAccount();

const showDeleteModal = ref(false);
const deleteError = ref("");

const account = computed(() => accountQuery.data.value ?? null);
const isLoading = computed(() => accountQuery.isLoading.value);
const isError = computed(() => accountQuery.isError.value);
const isHistoryLoading = computed(() => historyQuery.isLoading.value);

const history = computed<Transaction[]>(() => {
  const data = historyQuery.data.value as Transaction[] | undefined;
  return Array.isArray(data) ? data : [];
});

const accountTypeLabels: Record<string, string> = {
  CHECKING: "Conta Corrente",
  SAVINGS: "Poupança",
  CREDIT: "Cartão de Crédito",
  INVESTMENT: "Investimento",
  CRYPTO: "Criptomoedas",
  CASH: "Dinheiro",
  OTHER: "Outro",
};

function accountTypeLabel(type: string): string {
  return accountTypeLabels[type] || type;
}

function signedAmount(tx: Transaction): number {
  const value = Math.abs(Number(tx.amount || 0));
  if (tx.type === "EXPENSE") return -value;
  if (tx.type === "INCOME") return value;
  return 0;
}

async function onDelete() {
  deleteError.value = "";
  try {
    await deleteMutation.mutateAsync(accountId);
    showDeleteModal.value = false;
    router.push("/accounts");
  } catch (e: any) {
    deleteError.value = e?.response?.data?.error || "Não foi possível excluir a conta. Tente novamente.";
  }
}
</script>
