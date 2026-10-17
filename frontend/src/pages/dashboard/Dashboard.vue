<template>
  <div class="space-y-4 stagger-in">
    <!-- ================= CABEÇALHO ================= -->
    <div class="flex items-start justify-between gap-4">
      <div class="min-w-0">
        <h1 class="page-title">Olá{{ auth.user?.name ? `, ${firstName}` : "" }}</h1>
        <p class="page-subtitle">Este é o resumo de hoje.</p>
      </div>
      <div class="hidden shrink-0 gap-2 sm:flex">
        <Button variant="secondary" size="sm" @click="router.push('/accounts/new')">
          <AppIcon name="wallet" :size="16" :stroke-width="2" />
          Nova conta
        </Button>
        <Button size="sm" @click="router.push('/transactions/new')">
          <AppIcon name="plus" :size="16" :stroke-width="2.4" />
          Nova transação
        </Button>
      </div>
    </div>

    <!-- ================= ERRO ================= -->
    <div
      v-if="hasError"
      class="flex items-center gap-3 rounded-xl border border-[var(--color-danger)] bg-[var(--color-danger-light)] px-4 py-3 text-sm text-[var(--color-danger)]"
      role="alert"
    >
      <AppIcon name="alert" :size="18" class="shrink-0" />
      <span>Não foi possível carregar tudo.</span>
      <button class="ml-auto shrink-0 font-semibold underline" @click="reload">Recarregar</button>
    </div>

    <!-- ================= SALDO + INDICADORES ================= -->
    <Card padding="none">
      <div class="p-5">
        <p class="text-sm font-medium text-[var(--color-fg-muted)]">Saldo total</p>

        <p v-if="isLoading" class="mt-2 h-10 w-48 skeleton"></p>
        <p v-else class="mt-1 text-[2rem] font-semibold leading-tight tracking-tight tabular-nums text-[var(--color-fg)]">
          {{ formatCurrency(totalBalance, currency, locale) }}
        </p>

        <p class="mt-1 text-xs text-[var(--color-fg-muted)]">
          {{ accounts.length }} conta{{ accounts.length === 1 ? "" : "s" }}
          <template v-if="monthNet !== 0">
            · mês {{ monthNet >= 0 ? "fechado em" : "negativo em" }}
            <span :class="monthNet >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'">
              {{ formatCurrency(Math.abs(monthNet), currency, locale) }}
            </span>
          </template>
        </p>
      </div>

      <div class="grid grid-cols-3 divide-x divide-[var(--color-border)] border-t border-[var(--color-border)]">
        <div class="p-3 sm:p-4">
          <p class="text-xs font-medium text-[var(--color-fg-muted)]">Receitas</p>
          <p v-if="isLoading" class="mt-2 h-5 w-16 skeleton"></p>
          <p v-else class="mt-1 text-sm font-semibold tabular-nums text-[var(--color-success)] sm:text-base">
            {{ formatCurrency(monthIncome, currency, locale) }}
          </p>
        </div>
        <div class="p-3 sm:p-4">
          <p class="text-xs font-medium text-[var(--color-fg-muted)]">Despesas</p>
          <p v-if="isLoading" class="mt-2 h-5 w-16 skeleton"></p>
          <p v-else class="mt-1 text-sm font-semibold tabular-nums text-[var(--color-danger)] sm:text-base">
            {{ formatCurrency(monthExpenses, currency, locale) }}
          </p>
        </div>
        <div class="p-3 sm:p-4">
          <p class="text-xs font-medium text-[var(--color-fg-muted)]">Resultado</p>
          <p v-if="isLoading" class="mt-2 h-5 w-16 skeleton"></p>
          <p v-else class="mt-1 text-sm font-semibold tabular-nums sm:text-base" :class="monthNet >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'">
            {{ monthNet >= 0 ? "+" : "−" }}{{ formatCurrency(Math.abs(monthNet), currency, locale) }}
          </p>
        </div>
      </div>
    </Card>

    <!-- ================= PRÓXIMOS VENCIMENTOS ================= -->
    <Card
      v-if="upcomingInvoices.length"
      title="Próximos vencimentos"
      description="Faturas de cartão ainda em aberto"
      padding="none"
    >
      <template #header-actions>
        <router-link to="/invoices" class="link text-sm">Ver faturas</router-link>
      </template>

      <div class="divide-y divide-[var(--color-border)]">
        <router-link
          v-for="invoice in upcomingInvoices"
          :key="invoice.id ?? invoice.reference"
          :to="invoice.id ? `/invoices/${invoice.id}` : '/invoices'"
          class="density-row flex items-center gap-3 px-4 transition-colors active:bg-[var(--color-bg-muted)] sm:hover:bg-[var(--color-bg-muted)]"
        >
          <span
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
            :class="invoice.daysUntilDue < 0 || invoice.daysUntilDue === 0 ? 'bg-[var(--color-danger-light)] text-[var(--color-danger)]' : invoice.daysUntilDue <= 2 ? 'bg-[var(--color-warning-light)] text-[var(--color-warning)]' : 'bg-[var(--color-bg-muted)] text-[var(--color-fg-muted)]'"
          >
            <AppIcon :name="invoice.daysUntilDue <= 0 ? 'alert' : 'clock'" :size="17" :stroke-width="2" />
          </span>

          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium text-[var(--color-fg)]">{{ invoice.account.name }}</p>
            <p class="truncate text-xs text-[var(--color-fg-muted)]">
              Vence em {{ formatDate(invoice.dueDate, locale, shortDate) }} ·
              {{ daysUntilLabel(invoice.daysUntilDue) }}
            </p>
          </div>

          <p class="shrink-0 text-sm font-semibold tabular-nums text-[var(--color-fg)]">
            {{ formatCurrency(invoice.remaining, invoice.account.currency, locale) }}
          </p>
        </router-link>
      </div>
    </Card>

    <!-- ================= LISTAS ================= -->
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-5">
      <!-- Transações recentes -->
      <Card title="Transações recentes" padding="none" class="lg:col-span-3">
        <template #header-actions>
          <router-link to="/transactions" class="link text-sm">Ver todas</router-link>
        </template>

        <div v-if="recentQuery.isLoading.value" class="divide-y divide-[var(--color-border)]">
          <div v-for="i in 5" :key="i" class="flex items-center gap-3 px-4 py-3.5">
            <div class="h-9 w-9 shrink-0 rounded-full skeleton"></div>
            <div class="flex-1 space-y-2">
              <div class="h-3.5 w-32 skeleton skeleton-text"></div>
              <div class="h-3 w-20 skeleton skeleton-text"></div>
            </div>
            <div class="h-4 w-16 skeleton skeleton-text"></div>
          </div>
        </div>

        <div v-else-if="recentTransactions.length" class="divide-y divide-[var(--color-border)]">
          <div
            v-for="tx in recentTransactions"
            :key="tx.id"
            class="density-row group flex items-center gap-3 px-4 transition-colors active:bg-[var(--color-bg-muted)] sm:hover:bg-[var(--color-bg-muted)]"
          >
            <router-link :to="`/transactions/${tx.id}`" class="flex min-w-0 flex-1 items-center gap-3">
              <!-- Ícone e cor escolhidos no lançamento; sem marca, cai no tipo. -->
              <span
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                :style="lookStyle(tx)"
              >
                <AppIcon :name="tx.icon || typeIcon(tx.type)" :size="17" :stroke-width="2" />
              </span>

              <span class="min-w-0 flex-1">
                <span
                  class="block truncate text-sm font-medium"
                  :class="tx.paidAt ? 'text-[var(--color-fg-muted)] line-through' : 'text-[var(--color-fg)]'"
                >
                  {{ tx.description }}
                </span>
                <span class="block truncate text-xs text-[var(--color-fg-muted)]">
                  {{ tx.category?.name || tx.account?.name || "Sem categoria" }} ·
                  {{ formatRelativeDate(tx.date, locale) }}
                  <span v-if="tx.paidAt" class="text-[var(--color-success)]">· paga</span>
                </span>
              </span>
            </router-link>

            <p
              class="shrink-0 text-sm font-semibold tabular-nums"
              :class="signedAmount(tx) >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-fg)]'"
            >
              {{ signedAmount(tx) >= 0 ? "+" : "−" }}{{ formatCurrency(Math.abs(signedAmount(tx)), tx.currency || currency, locale) }}
            </p>

            <!-- Pagar aqui mesmo: atalho para a despesa solta de cartão. -->
            <button
              v-if="isPayable(tx)"
              type="button"
              class="flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] px-2.5 text-xs font-semibold text-[var(--color-fg-muted)] transition-colors hover:border-[var(--color-success)] hover:bg-[var(--color-success-light)] hover:text-[var(--color-success)] focus-visible:opacity-100"
              :aria-label="tx.paidAt ? 'Desfazer pagamento' : `Pagar ${tx.description}`"
              :title="tx.paidAt ? 'Desfazer pagamento' : 'Pagar esta compra'"
              @click.stop="openOrDirectPay(tx)"
            >
              <AppIcon :name="tx.paidAt ? 'checkCircle' : 'check'" :size="14" :stroke-width="2.4" />
              <span>{{ tx.paidAt ? "Pago" : "Pagar" }}</span>
            </button>>
          </div>
        </div>

        <EmptyState
          v-else
          icon="inbox"
          title="Nenhuma transação ainda"
          description="Registre sua primeira entrada ou saída para começar a acompanhar."
          :action="{ label: 'Nova transação', onClick: () => router.push('/transactions/new') }"
        />
      </Card>

      <!-- Contas -->
      <Card title="Suas contas" padding="none" class="lg:col-span-2">
        <template #header-actions>
          <router-link to="/accounts" class="link text-sm">Ver todas</router-link>
        </template>

        <div v-if="accountsQuery.isLoading.value" class="divide-y divide-[var(--color-border)]">
          <div v-for="i in 3" :key="i" class="flex items-center gap-3 px-4 py-3.5">
            <div class="h-9 w-9 shrink-0 rounded-lg skeleton"></div>
            <div class="flex-1 space-y-2">
              <div class="h-3.5 w-24 skeleton skeleton-text"></div>
              <div class="h-3 w-14 skeleton skeleton-text"></div>
            </div>
          </div>
        </div>

        <div v-else-if="accounts.length" class="divide-y divide-[var(--color-border)]">
          <router-link
            v-for="account in accounts"
            :key="account.id"
            :to="`/accounts/${account.id}`"
            class="flex items-center gap-3 px-4 py-3.5 transition-colors active:bg-[var(--color-bg-muted)] sm:hover:bg-[var(--color-bg-muted)]"
          >
            <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-bg-muted)] text-[var(--color-fg-muted)]">
              <AppIcon name="wallet" :size="17" />
            </span>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium text-[var(--color-fg)]">{{ account.name }}</p>
              <p class="text-xs capitalize text-[var(--color-fg-muted)]">{{ accountTypeLabel(account.type) }}</p>
            </div>
            <p
              class="shrink-0 text-sm font-semibold tabular-nums"
              :class="account.balance >= 0 ? 'text-[var(--color-fg)]' : 'text-[var(--color-danger)]'"
            >
              {{ formatCurrency(account.balance, account.currency || currency, locale) }}
            </p>
          </router-link>
        </div>

        <EmptyState
          v-else
          icon="wallet"
          title="Nenhuma conta cadastrada"
          description="Adicione uma conta, carteira ou cartão para começar."
          :action="{ label: 'Adicionar conta', onClick: () => router.push('/accounts/new') }"
        />
      </Card>
    </div>

    <QuickPayModal v-model:open="payOpen" :purchase="payTarget" />

    <!-- Lembretes por último: é anotação pessoal, não número financeiro. -->
    <NotesCard />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../stores/auth";
import {
  usePayTransaction,
  useAccounts,
  useRevertTransactionPayment,
  useTransactions,
  useUpcomingInvoices,
} from "../../composables/useApi";
import type { Transaction } from "../../composables/useApi";
import { usePreferences } from "../../composables/usePreferences";
import { useToast } from "../../composables/useToast";
import { formatCurrency, formatDate, formatRelativeDate, startOfDayIso, endOfDayIso } from "../../utils/format";
import { expenseColorByHex } from "../../utils/palette";
import { daysUntilLabel } from "../../utils/invoices";
import { AppIcon, Button, Card, EmptyState } from "../../components/ui";
import NotesCard from "../../components/NotesCard.vue";
import QuickPayModal from "../../components/transactions/QuickPayModal.vue";

const auth = useAuthStore();
const router = useRouter();
const toast = useToast();
const { preferences } = usePreferences();

const locale = computed(() => preferences.value.locale);
const shortDate = { month: "short", day: "numeric" } as Intl.DateTimeFormatOptions;

const payNow = usePayTransaction();
const revertPay = useRevertTransactionPayment();
const openOrDirectPay = (tx: Transaction) => {
  if (tx.paidAt) {
    undoPay(tx);
    return;
  }
  if (tx.account?.type === "CREDIT") {
    openPay(tx);
  } else {
    payDirect(tx);
  }
};
const payDirect = async (tx: Transaction) => {
  try {
    await payNow.mutateAsync({ id: tx.id, data: {} });
    toast.success(`"${tx.description}" paga.`);
  } catch (error: any) {
    toast.error(error?.response?.data?.error || "Não foi possível pagar.", "Algo deu errado");
  }
};

const payOpen = ref(false);
const payTarget = ref<Transaction | null>(null);

// Lembretes e o card de vencimentos leem da mesma fonte — um pedido só.
const upcomingQuery = useUpcomingInvoices(computed(() => preferences.value.invoiceReminderDays));
const upcomingInvoices = computed(() => upcomingQuery.data.value ?? []);

const accountsQuery = useAccounts();
const recentQuery = useTransactions(ref({ limit: 5 }));

const now = new Date();
const monthStart = startOfDayIso(
  new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
);
const today = endOfDayIso(now.toISOString().slice(0, 10));
// O backend limita `limit` a 100 (transactionFiltersSchema.max(100))
const monthQuery = useTransactions(ref({ dateFrom: monthStart, dateTo: today, limit: 100 }));

const accounts = computed(() => accountsQuery.data.value ?? []);
const recentTransactions = computed(() => recentQuery.data.value?.transactions ?? []);

const currency = computed(() => auth.user?.currency || accounts.value[0]?.currency || "BRL");
const firstName = computed(() => (auth.user?.name || "").split(" ")[0]);

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

const hasError = computed(
  () => accountsQuery.isError.value || recentQuery.isError.value || monthQuery.isError.value
);

function typeIcon(type: string): string {
  if (type === "INCOME") return "arrowUp";
  if (type === "EXPENSE") return "arrowDown";
  return "arrows";
}

function typeClasses(type: string): string {
  if (type === "INCOME") return "bg-[var(--color-success-light)] text-[var(--color-success)]";
  if (type === "EXPENSE") return "bg-[var(--color-danger-light)] text-[var(--color-danger)]";
  return "bg-[var(--color-bg-muted)] text-[var(--color-fg-muted)]";
}

/** Cor/ícone do lançamento; sem marca, cai na cor semântica do tipo. */
function lookStyle(tx: Transaction): Record<string, string> {
  const color = expenseColorByHex(tx.color);
  if (color) return { backgroundColor: color.soft, color: color.ink };
  return {};
}

/** Só despesa em cartão tem pagamento rápido. */
function isPayable(tx: Transaction): boolean {
  return tx.type === "EXPENSE" && (tx.account?.type === "CREDIT" || tx.status === "PENDING");
}

function openPay(tx: Transaction) {
  payTarget.value = tx;
  payOpen.value = true;
}

async function undoPay(tx: Transaction) {
  try {
    await revertPay.mutateAsync(tx.id);
    toast.info(`Pagamento de "${tx.description}" desfeito.`);
  } catch (error: any) {
    toast.error(
      error?.response?.data?.error || "Não foi possível desfazer o pagamento.",
      "Algo deu errado"
    );
  }
}

const accountTypeLabels: Record<string, string> = {
  checking: "Conta corrente",
  savings: "Poupança",
  credit_card: "Cartão de crédito",
  credit: "Cartão de crédito",
  cash: "Dinheiro",
  investment: "Investimento",
};

function accountTypeLabel(type: string): string {
  return accountTypeLabels[type] || type;
}

function reload() {
  window.location.reload();
}
</script>
