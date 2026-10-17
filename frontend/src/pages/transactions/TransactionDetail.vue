<template>
  <div class="space-y-6 stagger-in">
    <!-- Page header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="min-w-0">
        <router-link to="/transactions" class="link text-sm">← Voltar para transações</router-link>
        <h1 class="mt-2 font-display text-3xl text-[var(--color-fg)]">Detalhes da transação</h1>
        <p v-if="transaction" class="mt-1 text-[var(--color-fg-muted)]">
          {{ formatDate(transaction.date, "pt-BR") }} · {{ formatRelativeDate(transaction.date, "pt-BR") }}
        </p>
      </div>
      <div v-if="transaction" class="flex flex-wrap gap-3">
        <Button variant="outline" @click="router.push(`/transactions/${transaction.id}/edit`)">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Editar transação
        </Button>
        <Button variant="danger" @click="showDeleteModal = true">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Excluir transação
        </Button>
      </div>
    </div>

    <!-- Loading -->
    <Card v-if="isLoading" padding="none">
      <div class="space-y-6 p-6">
        <div class="h-8 w-48 skeleton skeleton-text"></div>
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div v-for="i in 6" :key="i" class="space-y-2">
            <div class="h-3 w-20 skeleton skeleton-text"></div>
            <div class="h-5 w-32 skeleton skeleton-text"></div>
          </div>
        </div>
      </div>
    </Card>

    <div v-else-if="isError" class="rounded-xl border border-[var(--color-danger)] bg-[var(--color-danger-light)] p-4 text-sm text-[var(--color-danger)]" role="alert">
      Não foi possível carregar esta transação.
    </div>

    <template v-else-if="transaction">
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <!-- Resumo -->
        <Card padding="lg" class="lg:col-span-1">
          <div class="flex items-center justify-between">
            <span
              class="inline-flex h-12 w-12 items-center justify-center rounded-xl"
              :class="amount >= 0 ? 'bg-[var(--color-success-light)] text-[var(--color-success)]' : 'bg-[var(--color-danger-light)] text-[var(--color-danger)]'"
            >
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
                <path v-if="amount >= 0" stroke-linecap="round" stroke-linejoin="round" d="M7 11l5-5m0 0l5 5m-5-5v12" />
                <path v-else stroke-linecap="round" stroke-linejoin="round" d="M17 13l-5 5m0 0l-5-5m5 5V6" />
              </svg>
            </span>
            <span class="badge" :class="statusBadgeClass(transaction.status)">{{ statusLabel(transaction.status) }}</span>
          </div>

          <p class="mt-4 text-sm font-medium text-[var(--color-fg-muted)]">Valor</p>
          <p class="mt-1 font-display text-3xl font-normal" :class="amount >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'">
            {{ amount >= 0 ? '+' : '-' }}{{ formatCurrency(Math.abs(amount), transaction.currency) }}
          </p>

          <p class="mt-4 text-sm font-medium text-[var(--color-fg-muted)]">Descrição</p>
          <p class="mt-1 text-lg font-medium text-[var(--color-fg)]">{{ transaction.description }}</p>

          <div class="mt-4 border-t border-[var(--color-border)] pt-4">
            <p class="text-sm font-medium text-[var(--color-fg-muted)]">O que é isto</p>
            <div class="mt-1.5 flex items-start gap-2.5">
              <span
                class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                :class="transactionTypeInfo(transaction.type)?.iconBg"
              >
                <AppIcon
                  :name="transactionTypeInfo(transaction.type)?.icon || 'arrows'"
                  :size="16"
                  :stroke-width="2"
                />
              </span>
              <div class="min-w-0">
                <p class="text-lg font-medium text-[var(--color-fg)]">
                  {{ typeLabel(transaction.type) }}
                </p>
                <p class="mt-0.5 text-sm leading-relaxed text-[var(--color-fg-muted)]">
                  {{ transactionTypeInfo(transaction.type)?.explain }}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <!-- Informações -->
        <Card title="Informações" padding="md" class="lg:col-span-2">
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <p class="text-sm font-medium text-[var(--color-fg-muted)]">Data</p>
              <p class="mt-1 text-lg font-medium text-[var(--color-fg)]">{{ formatDate(transaction.date, "pt-BR") }}</p>
            </div>

            <div>
              <p class="text-sm font-medium text-[var(--color-fg-muted)]">Conta</p>
              <p class="mt-1 text-lg font-medium text-[var(--color-fg)]">{{ transaction.account?.name || '—' }}</p>
            </div>

            <div>
              <p class="text-sm font-medium text-[var(--color-fg-muted)]">Categoria</p>
              <p v-if="transaction.category" class="mt-1 flex items-center gap-2 text-lg font-medium text-[var(--color-fg)]">
                <span
                  class="inline-flex h-7 w-7 items-center justify-center rounded-lg text-sm"
                  :style="{ backgroundColor: (transaction.category.color || '#999') + '20', color: transaction.category.color }"
                >
                  {{ transaction.category.icon }}
                </span>
                {{ transaction.category.name }}
              </p>
              <p v-else class="mt-1 text-lg font-medium text-[var(--color-fg-subtle)]">Sem categoria</p>
            </div>

            <div v-if="transaction.type === 'TRANSFER'">
              <p class="text-sm font-medium text-[var(--color-fg-muted)]">Para conta</p>
              <p class="mt-1 text-lg font-medium text-[var(--color-fg)]">{{ transaction.toAccount?.name || '—' }}</p>
            </div>
          </div>

          <div v-if="transaction.notes" class="mt-6 border-t border-[var(--color-border)] pt-4">
            <p class="text-sm font-medium text-[var(--color-fg-muted)]">Observações</p>
            <p class="mt-1 whitespace-pre-wrap text-[var(--color-fg)]">{{ transaction.notes }}</p>
          </div>

          <div v-if="transaction.tags?.length" class="mt-6 border-t border-[var(--color-border)] pt-4">
            <p class="text-sm font-medium text-[var(--color-fg-muted)]">Etiquetas</p>
            <div class="mt-2 flex flex-wrap gap-2">
              <span
                v-for="tag in transaction.tags"
                :key="tag"
                class="inline-flex items-center rounded-full bg-[var(--color-bg-muted)] px-2.5 py-0.5 text-xs font-medium text-[var(--color-fg)]"
              >
                {{ tag }}
              </span>
            </div>
          </div>
        </Card>
      </div>

      <!-- Auditoria -->
      <Card padding="md">
        <dl class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt class="text-sm font-medium text-[var(--color-fg-muted)]">Criado em</dt>
            <dd class="mt-1 text-[var(--color-fg)]">{{ formatDateTime(transaction.createdAt) }}</dd>
          </div>
          <div>
            <dt class="text-sm font-medium text-[var(--color-fg-muted)]">Atualizado em</dt>
            <dd class="mt-1 text-[var(--color-fg)]">{{ formatDateTime(transaction.updatedAt) }}</dd>
          </div>
        </dl>
      </Card>
    </template>

    <Card v-else padding="lg">
      <EmptyState
        icon="table"
        title="Transação não encontrada"
        description="A transação que você procura não existe ou foi excluída."
        :action="{ label: 'Voltar para transações', onClick: () => router.push('/transactions') }"
      />
    </Card>

    <!-- Confirmação de exclusão -->
    <Modal
      v-model="showDeleteModal"
      title="Excluir transação"
      description="Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita."
    >
      <p class="text-sm text-[var(--color-fg-muted)]">
        <span class="font-medium text-[var(--color-fg)]">{{ transaction?.description }}</span>
        no valor de {{ formatCurrency(Math.abs(amount), transaction?.currency) }}
        será removida permanentemente.
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
import { useTransaction, useDeleteTransaction } from "../../composables/useApi";
import { formatCurrency, formatDate, formatRelativeDate } from "../../utils/format";
import { typeLabel, transactionTypeInfo } from "../../utils/transaction-types";
import { AppIcon, Button, Card, EmptyState, Modal } from "../../components/ui";

const route = useRoute();
const router = useRouter();

const transactionId = route.params.id as string;
const transactionQuery = useTransaction(transactionId);
const deleteMutation = useDeleteTransaction();

const transaction = computed(() => transactionQuery.data.value ?? null);
const isLoading = computed(() => transactionQuery.isLoading.value);
const isError = computed(() => transactionQuery.isError.value);

const showDeleteModal = ref(false);
const deleteError = ref("");

const amount = computed(() => {
  const tx = transaction.value;
  if (!tx) return 0;
  const value = Math.abs(Number(tx.amount || 0));
  return tx.type === "EXPENSE" ? -value : value;
});

const statusLabels: Record<string, string> = {
  PENDING: "Pendente",
  COMPLETED: "Concluída",
  CANCELLED: "Cancelada",
};

function statusLabel(status: string): string {
  return statusLabels[status] || status;
}

function statusBadgeClass(status: string): string {
  if (status === "COMPLETED") return "badge-success";
  if (status === "CANCELLED") return "badge-danger";
  return "badge-warning";
}

function formatDateTime(value?: string): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("pt-BR");
}

async function onDelete() {
  deleteError.value = "";
  try {
    await deleteMutation.mutateAsync(transactionId);
    showDeleteModal.value = false;
    router.push("/transactions");
  } catch (e: any) {
    deleteError.value = e?.response?.data?.error || "Não foi possível excluir a transação. Tente novamente.";
  }
}
</script>
