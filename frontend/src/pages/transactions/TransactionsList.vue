<template>
  <div class="space-y-6 stagger-in">
    <!-- Page header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="font-display text-3xl text-[var(--color-fg)]">Transações</h1>
        <p class="mt-1 text-[var(--color-fg-muted)]">Acompanhe todas as suas movimentações financeiras</p>
      </div>
      <Button @click="showAddForm = true">
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Nova Transação
      </Button>
    </div>

    <!-- Filters -->
    <Card variant="filled" padding="md">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Input
          v-model="filters.search"
          id="filter-search"
          type="search"
          placeholder="Buscar descrição, notas..."
          :icon="{
            viewBox: '0 0 24 24',
            stroke: 'currentColor',
            path: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
            strokeWidth: 1.8,
          }"
        />

        <Input
          v-model="filters.dateFrom"
          id="filter-date-from"
          type="date"
          label="Data inicial"
        />

        <Input
          v-model="filters.dateTo"
          id="filter-date-to"
          type="date"
          label="Data final"
        />

        <Select
          v-model="filters.categoryId"
          id="filter-category"
          label="Categoria"
          :options="categoryOptions"
          placeholder="Todas as categorias"
        />

        <Select
          v-model="filters.accountId"
          id="filter-account"
          label="Conta"
          :options="accountOptions"
          placeholder="Todas as contas"
        />
      </div>
    </Card>

    <!-- Transactions Table -->
    <Card padding="none">
      <Table
        :columns="tableColumns"
        :data="transactionsQuery.data.value?.transactions ?? []"
        :rowKey="(row) => row.id"
        :pagination="paginationData"
        :empty-icon="'transactions'"
        :empty-title="'Nenhuma transação encontrada'"
        :empty-description="'Ajuste os filtros ou adicione uma nova transação.'"
        @page-change="onPageChange"
        @limit-change="onLimitChange"
      >
        <template #date="{ row }">
          <span class="font-mono text-sm text-[var(--color-fg-muted)]">{{ formatDate(row.date) }}</span>
        </template>
        <template #description="{ row }">
          <div class="flex items-center gap-2.5">
            <!-- Marca escolhida no lançamento: ícone na cor escolhida. -->
            <span
              v-if="row.icon || row.color"
              class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
              :style="lookStyle(row)"
            >
              <AppIcon :name="row.icon || 'tag'" :size="14" :stroke-width="2" />
            </span>

            <div class="min-w-0">
              <p
                class="truncate font-medium max-w-xs"
                :class="row.paidAt ? 'text-[var(--color-fg-muted)] line-through' : 'text-[var(--color-fg)]'"
              >
                {{ row.description }}
              </p>
              <p v-if="row.notes" class="text-xs text-[var(--color-fg-subtle)] truncate max-w-xs">{{ row.notes }}</p>
              <p v-if="row.paidAt" class="text-xs text-[var(--color-success)]">Compra paga</p>
            </div>
          </div>
        </template>
        <template #category="{ row }">
          <span v-if="row.category" class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium" :style="{ backgroundColor: row.category.color + '20', color: row.category.color }">
            <span class="h-1.5 w-1.5 rounded-full" :style="{ backgroundColor: row.category.color }"></span>
            {{ row.category.name }}
          </span>
          <span v-else class="text-xs text-[var(--color-fg-subtle)]">Sem categoria</span>
        </template>
        <template #account="{ row }">
          <span class="text-sm text-[var(--color-fg-muted)]">{{ row.account?.name || '—' }}</span>
        </template>
        <template #amount="{ row }">
          <span class="font-semibold" :class="signedAmount(row) >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'">
            {{ signedAmount(row) >= 0 ? '+' : '' }}{{ formatCurrency(Math.abs(signedAmount(row)), row.currency) }}
          </span>
        </template>
        <template #actions="{ row }">
          <div class="flex items-center gap-1">
            <Button
              v-if="isPayable(row)"
              variant="ghost"
              size="sm"
              :aria-label="row.paidAt ? 'Desfazer pagamento' : `Pagar ${row.description}`"
              :title="row.paidAt ? 'Desfazer pagamento' : 'Pagar esta compra'"
              @click="togglePay(row)"
            >
              <AppIcon
                :name="row.paidAt ? 'checkCircle' : 'check'"
                :size="14"
                :class="row.paidAt ? 'text-[var(--color-success)]' : ''"
                :stroke-width="2.2"
              />
              <span class="ml-1.5 text-xs font-semibold">
                {{ row.paidAt ? 'Pago' : 'Pagar' }}
              </span>
            </Button>

            <Button variant="ghost" size="icon" @click="router.push(`/transactions/${row.id}`)" aria-label="Ver detalhes">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </Button>
          </div>
        </template>
      </Table>
    </Card>

    <!-- Add Transaction Modal -->
    <Transition name="modal" appear>
      <div v-if="showAddForm" class="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-4" @click.self="showAddForm = false">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" aria-hidden="true"></div>

        <div class="relative w-full max-w-2xl bg-[var(--color-bg-elevated)] rounded-2xl shadow-xl animate-scale-in glass border border-[var(--color-border)] overflow-hidden max-h-[90vh] flex flex-col">
          <div class="px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-bg-muted)] flex items-center justify-between">
            <h2 class="font-display text-xl text-[var(--color-fg)]">Nova Transação</h2>
            <button
              type="button"
              class="rounded-lg p-1.5 text-[var(--color-fg-subtle)] hover:text-[var(--color-fg)] hover:bg-[var(--color-border)] transition-colors"
              @click="showAddForm = false"
              aria-label="Fechar"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form @submit.prevent="onSubmit" class="flex-1 overflow-y-auto p-6 space-y-5">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <Input
                v-model="form.description"
                id="tx-description"
                label="Descrição *"
                placeholder="Ex: Supermercado, Salário, Uber"
                required
                :error="errors.description"
              />

              <div class="grid grid-cols-2 gap-4">
                <Input
                  v-model.number="form.amount"
                  id="tx-amount"
                  label="Valor *"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0,00"
                  required
                  :error="errors.amount"
                />

                <Select
                  v-model="form.type"
                  id="tx-type"
                  label="O que está acontecendo?"
                  :options="typeOptions"
                  required
                  :error="errors.type"
                  :hint="typeExplain(form.type)"
                />
              </div>

              <Input
                v-model="form.date"
                id="tx-date"
                label="Data *"
                type="date"
                required
                :error="errors.date"
              />

              <Select
                v-model="form.accountId"
                id="tx-account"
                label="Conta *"
                :options="accountOptions"
                required
                :error="errors.accountId"
              />

              <Select
                v-model="form.categoryId"
                id="tx-category"
                label="Categoria"
                :options="categoryOptions"
                placeholder="Selecione (opcional)"
              />

              <div class="lg:col-span-2">
                <Input
                  v-model="form.notes"
                  id="tx-notes"
                  label="Observações"
                  type="text"
                  placeholder="Notas adicionais..."
                />
              </div>
            </div>

            <div v-if="submitError" class="p-3 rounded-lg bg-[var(--color-danger-light)] border border-[var(--color-danger-muted)] text-sm text-[var(--color-danger)]" role="alert">
              {{ submitError }}
            </div>

            <div class="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
              <Button variant="ghost" @click="showAddForm = false">Cancelar</Button>
              <Button type="submit" :loading="createMutation.isPending.value">Salvar Transação</Button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  <!-- Pagamento rápido da compra, sem sair da lista -->
    <QuickPayModal v-model:open="quickPayOpen" :purchase="payTarget" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { useRouter } from "vue-router";
import { useTransactions, useCreateTransaction, useAccounts, useCategories, usePayTransaction, useRevertTransactionPayment } from "../../composables/useApi";
import type { Transaction, TransactionFilters, Category, Account } from "../../composables/useApi";
import { formatCurrency, formatDate, startOfDayIso, endOfDayIso, toIsoDateTime } from "../../utils/format";
import { expenseColorByHex } from "../../utils/palette";
import { ALL_TRANSACTION_TYPES, transactionTypeInfo } from "../../utils/transaction-types";
import { AppIcon, Button, Card, Input, Select, Table } from "../../components/ui";
import QuickPayModal from "../../components/transactions/QuickPayModal.vue";

const router = useRouter();

// Filters (UI values kept as date-picker strings, converted to ISO for the API)
const filters = ref({
  search: "",
  dateFrom: "",
  dateTo: "",
  categoryId: "",
  accountId: "",
});
const page = ref(1);
const limit = ref(20);

const queryFilters = computed<TransactionFilters>(() => {
  const f: TransactionFilters = { page: page.value, limit: limit.value };
  if (filters.value.search) f.search = filters.value.search;
  if (filters.value.dateFrom) f.dateFrom = startOfDayIso(filters.value.dateFrom);
  if (filters.value.dateTo) f.dateTo = endOfDayIso(filters.value.dateTo);
  if (filters.value.categoryId) f.categoryId = filters.value.categoryId;
  if (filters.value.accountId) f.accountId = filters.value.accountId;
  return f;
});

const transactionsQuery = useTransactions(queryFilters);
const accountsQuery = useAccounts();
const categoriesQuery = useCategories();

// Mutations
const createMutation = useCreateTransaction();

// State
const showAddForm = ref(false);
const submitError = ref("");

const form = reactive({
  description: "",
  amount: 0,
  type: "EXPENSE" as "EXPENSE" | "INCOME" | "TRANSFER",
  date: new Date().toISOString().slice(0, 10),
  accountId: "",
  categoryId: "",
  notes: "",
});

const errors = reactive({
  description: "",
  amount: "",
  type: "",
  date: "",
  accountId: "",
});

// Só os três do dia a dia: o modal rápido é para lançar gasto e entrada.
// Quem investe usa o formulário completo, que mostra todos os tipos.
const typeOptions = ALL_TRANSACTION_TYPES.filter((type) =>
  ["EXPENSE", "INCOME", "TRANSFER"].includes(type.value)
).map((type) => ({ value: type.value, label: `${type.label} — ${type.hint.toLowerCase()}` }));

/** Explicação do tipo escolhido logo abaixo do campo. */
function typeExplain(value: string): string {
  return transactionTypeInfo(value)?.explain ?? "";
}

const accountOptions = computed(() =>
  (accountsQuery.data.value ?? []).map((a: Account) => ({
    value: a.id,
    label: `${a.name} (${a.type})`,
  }))
);

const categoryOptions = computed(() =>
  (categoriesQuery.data.value ?? []).map((c: Category) => ({
    value: c.id,
    label: c.name,
  }))
);

const paginationData = computed(() => {
  const data = transactionsQuery.data.value;
  if (!data) return undefined;
  return {
    page: data.pagination.page,
    limit: data.pagination.limit,
    total: data.pagination.total,
  };
});

const tableColumns = [
  { key: "date", label: "Data", minWidth: "110px" },
  { key: "description", label: "Descrição", tooltip: "Nome ou descrição da movimentação" },
  { key: "category", label: "Categoria" },
  { key: "account", label: "Conta" },
  { key: "amount", label: "Valor", align: "right" as const, minWidth: "120px" },
  { key: "actions", label: "Ações", align: "right" as const, minWidth: "80px" },
];

function signedAmount(tx: Transaction): number {
  const amount = Math.abs(Number(tx.amount || 0));
  if (tx.type === "EXPENSE") return -amount;
  if (tx.type === "INCOME") return amount;
  return 0;
}

function lookStyle(tx: Transaction): Record<string, string> {
  const color = expenseColorByHex(tx.color);
  if (!color) return { backgroundColor: "var(--color-bg-muted)", color: "var(--color-fg-muted)" };
  return { backgroundColor: color.soft, color: color.ink };
}

/** Só despesa em cartão tem pagamento rápido. */
function isPayable(tx: Transaction): boolean {
  return tx.type === "EXPENSE" && (tx.account?.type === "CREDIT" || tx.status === "PENDING");
}

const payTarget = ref<Transaction | null>(null);
const quickPayOpen = ref(false);
const revertPay = useRevertTransactionPayment();
const directPay = usePayTransaction();

function togglePay(tx: Transaction) {
  if (!tx.paidAt) {
    if (tx.account?.type === "CREDIT") {
      payTarget.value = tx;
      quickPayOpen.value = true;
      return;
    }
    directPay
      .mutateAsync({ id: tx.id, data: {} })
      .catch((error: any) => console.error(error?.response?.data?.error || "Não foi possível pagar"));
    return;
  }
  revertPay
    .mutateAsync(tx.id)
    .catch((error: any) =>
      console.error(error?.response?.data?.error || "Não foi possível desfazer o pagamento")
    );
}

function validateForm(): boolean {
  let valid = true;
  errors.description = form.description.trim() ? "" : "Descrição é obrigatória";
  errors.amount = form.amount > 0 ? "" : "Valor deve ser maior que zero";
  errors.type = form.type ? "" : "Selecione um tipo";
  errors.date = form.date ? "" : "Data é obrigatória";
  errors.accountId = form.accountId ? "" : "Selecione uma conta";
  valid = !errors.description && !errors.amount && !errors.type && !errors.date && !errors.accountId;
  return valid;
}

async function onSubmit() {
  submitError.value = "";
  if (!validateForm()) return;

  try {
    await createMutation.mutateAsync({
      description: form.description,
      amount: form.amount,
      type: form.type,
      date: toIsoDateTime(form.date),
      accountId: form.accountId,
      categoryId: form.categoryId || undefined,
      notes: form.notes || undefined,
    });
    showAddForm.value = false;
    form.description = "";
    form.amount = 0;
    form.type = "EXPENSE";
    form.date = new Date().toISOString().slice(0, 10);
    form.accountId = "";
    form.categoryId = "";
    form.notes = "";
  } catch (e: any) {
    submitError.value = e.response?.data?.error || "Falha ao criar transação. Tente novamente.";
  }
}

function onPageChange(newPage: number) {
  page.value = newPage;
}

function onLimitChange(newLimit: number) {
  limit.value = newLimit;
  page.value = 1;
}
</script>
