<template>
  <div class="space-y-6 stagger-in">
    <!-- ================= CABEÇALHO ================= -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="min-w-0">
        <router-link to="/invoices" class="link text-sm">
          <AppIcon name="chevronLeft" :size="14" class="mr-1 inline" />
          Faturas
        </router-link>
        <h1 class="page-title mt-1">
          {{ invoice ? `Fatura de ${referenceLabel(invoice.reference)}` : 'Fatura' }}
        </h1>
        <p v-if="invoice" class="page-subtitle">
          {{ invoice.account.name }} · compras de {{ formatDate(invoice.periodStart, locale, shortDate) }}
          a {{ formatDate(invoice.periodEnd, locale, shortDate) }}
        </p>
      </div>

      <Button v-if="invoice && invoice.remaining > 0" size="sm" @click="payOpen = true">
        <AppIcon name="check" :size="16" :stroke-width="2.4" />
        Pagar fatura
      </Button>
    </div>

    <div
      v-if="hasError"
      class="flex items-center gap-3 rounded-xl border border-[var(--color-danger)] bg-[var(--color-danger-light)] px-4 py-3 text-sm text-[var(--color-danger)]"
      role="alert"
    >
      <AppIcon name="alert" :size="18" class="shrink-0" />
      <span>Não foi possível carregar a fatura.</span>
      <button class="ml-auto shrink-0 font-semibold underline" @click="invoiceQuery.refetch()">Recarregar</button>
    </div>

    <template v-if="isLoading">
      <div class="h-40 w-full skeleton rounded-xl"></div>
      <div class="h-64 w-full skeleton rounded-xl"></div>
    </template>

    <template v-else-if="invoice">
      <!-- ================= RESUMO ================= -->
      <Card padding="none">
        <div class="grid grid-cols-2 divide-x divide-[var(--color-border)] sm:grid-cols-4">
          <div class="p-4">
            <p class="text-xs font-medium text-[var(--color-fg-muted)]">Total</p>
            <p class="mt-1 text-lg font-semibold tabular-nums text-[var(--color-fg)]">
              {{ formatCurrency(invoice.total, currency, locale) }}
            </p>
          </div>
          <div class="p-4">
            <p class="text-xs font-medium text-[var(--color-fg-muted)]">Em aberto</p>
            <p
              class="mt-1 text-lg font-semibold tabular-nums"
              :class="invoice.remaining > 0 ? 'text-[var(--color-fg)]' : 'text-[var(--color-success)]'"
            >
              {{ formatCurrency(invoice.remaining, currency, locale) }}
            </p>
          </div>
          <div class="p-4">
            <p class="text-xs font-medium text-[var(--color-fg-muted)]">Fechamento</p>
            <p class="mt-1 text-sm font-medium text-[var(--color-fg)]">
              {{ formatDate(invoice.closingDate, locale, shortDate) }}
            </p>
          </div>
          <div class="p-4">
            <p class="text-xs font-medium text-[var(--color-fg-muted)]">Vencimento</p>
            <p class="mt-1 text-sm font-medium" :class="dueClasses">
              {{ formatDate(invoice.dueDate, locale, shortDate) }}
            </p>
            <p class="text-xs text-[var(--color-fg-muted)]">{{ daysUntilLabel(invoice.daysUntilDue) }}</p>
          </div>
        </div>

        <div
          v-if="invoice.status === 'PAID'"
          class="flex items-center gap-3 border-t border-[var(--color-border)] bg-[var(--color-success-light)] px-4 py-3 text-sm text-[var(--color-success)]"
        >
          <AppIcon name="checkCircle" :size="18" class="shrink-0" />
          <div class="min-w-0 flex-1">
            <p class="font-medium">Fatura quitada.</p>
            <p v-if="invoice.paidAt" class="text-xs">
              Pagamento registrado em {{ formatDate(invoice.paidAt, locale) }}.
            </p>
          </div>
          <button
            v-if="invoice.paymentTransactionId"
            type="button"
            class="shrink-0 font-semibold underline"
            @click="confirmUndo = true"
          >
            Desfazer
          </button>
        </div>
      </Card>

      <!-- ================= COMPRAS ================= -->
      <Card
        title="Compras da fatura"
        :description="`${purchases.length} ${purchases.length === 1 ? 'lançamento' : 'lançamentos'} entre o fechamento anterior e este`"
        padding="none"
      >
        <div v-if="purchases.length" class="divide-y divide-[var(--color-border)]">
          <router-link
            v-for="purchase in purchases"
            :key="purchase.id"
            :to="`/transactions/${purchase.id}`"
            class="density-row flex items-center gap-3 px-4 transition-colors active:bg-[var(--color-bg-muted)] sm:px-5 sm:hover:bg-[var(--color-bg-muted)]"
          >
            <span
              v-if="purchase.category"
              class="h-9 w-9 shrink-0 rounded-full"
              :style="{ backgroundColor: purchase.category.color + '22', color: purchase.category.color }"
            >
              <AppIcon name="tag" :size="16" class="m-auto mt-2.5 block" />
            </span>
            <span
              v-else
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-bg-muted)] text-[var(--color-fg-subtle)]"
            >
              <AppIcon name="tag" :size="16" />
            </span>

            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium text-[var(--color-fg)]">{{ purchase.description }}</p>
              <p class="truncate text-xs text-[var(--color-fg-muted)]">
                {{ formatDate(purchase.date, locale, shortDate) }}
                <template v-if="purchase.category"> · {{ purchase.category.name }}</template>
              </p>
            </div>

            <p class="shrink-0 text-sm font-semibold tabular-nums text-[var(--color-fg)]">
              {{ formatCurrency(purchase.amount, purchase.currency, locale) }}
            </p>
          </router-link>
        </div>

        <EmptyState
          v-else
          icon="inbox"
          title="Nenhuma compra nesta fatura"
          description="As compras feitas no cartão dentro deste período aparecem aqui."
          :action="{ label: 'Registrar compra', onClick: () => router.push('/transactions/new') }"
        />
      </Card>
    </template>

    <PayInvoiceModal v-model:open="payOpen" :invoice="invoice" @paid="onPaid" />

    <Modal
      v-model="confirmUndo"
      title="Desfazer o pagamento?"
      description="A transferência gerada será apagada e o valor volta para a conta de origem."
    >
      <p class="text-sm text-[var(--color-fg-muted)]">
        A fatura volta para o estado em aberto e o lançamento de pagamento sai do extrato.
      </p>
      <template #footer>
        <Button variant="ghost" @click="confirmUndo = false">Cancelar</Button>
        <Button variant="danger" :loading="undoing" @click="undo">Desfazer pagamento</Button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useInvoice, useRevertInvoicePayment } from "../../composables/useApi";
import { usePreferences } from "../../composables/usePreferences";
import { useToast } from "../../composables/useToast";
import { AppIcon, Button, Card, EmptyState, Modal } from "../../components/ui";
import PayInvoiceModal from "../../components/invoices/PayInvoiceModal.vue";
import { formatCurrency, formatDate } from "../../utils/format";
import { daysUntilLabel, referenceLabel } from "../../utils/invoices";

const route = useRoute();
const router = useRouter();
const toast = useToast();
const { preferences } = usePreferences();
const locale = computed(() => preferences.value.locale);

const shortDate = { month: "short", day: "numeric" } as Intl.DateTimeFormatOptions;

const invoiceId = computed(() => (route.params.id as string) || "");
const invoiceQuery = useInvoice(invoiceId);
const undoMutation = useRevertInvoicePayment();

const invoice = computed(() => invoiceQuery.data.value ?? null);
const purchases = computed(() => invoice.value?.transactions ?? []);
const currency = computed(() => invoice.value?.account.currency || "BRL");

const isLoading = computed(() => invoiceQuery.isLoading.value);
const hasError = computed(() => invoiceQuery.isError.value);

const dueClasses = computed(() => {
  if (!invoice.value || invoice.value.status === "PAID") return "text-[var(--color-fg)]";
  if (invoice.value.daysUntilDue < 0 || invoice.value.daysUntilDue <= 2) {
    return "text-[var(--color-danger)]";
  }
  return "text-[var(--color-fg)]";
});

const payOpen = ref(false);
const confirmUndo = ref(false);
const undoing = ref(false);

function onPaid() {
  invoiceQuery.refetch();
}

async function undo() {
  if (!invoice.value?.id) return;

  undoing.value = true;
  try {
    await undoMutation.mutateAsync(invoice.value.id);
    toast.success("Pagamento desfeito e fatura reaberta.");
    confirmUndo.value = false;
  } catch (error: any) {
    toast.error(
      error?.response?.data?.error || "Não foi possível desfazer o pagamento.",
      "Algo deu errado"
    );
  } finally {
    undoing.value = false;
  }
}
</script>
