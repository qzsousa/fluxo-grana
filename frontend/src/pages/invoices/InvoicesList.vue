<template>
  <div class="space-y-6 stagger-in">
    <!-- ================= CABEÇALHO ================= -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="min-w-0">
        <h1 class="page-title">Faturas do cartão</h1>
        <p class="page-subtitle">
          Compras agrupadas por período de fechamento, com o vencimento e o que já foi pago.
        </p>
      </div>
      <Button variant="secondary" size="sm" @click="router.push('/transactions/new')">
        <AppIcon name="plus" :size="16" :stroke-width="2.4" />
        Nova compra
      </Button>
    </div>

    <!-- ================= ESTADO INICIAL ================= -->
    <Card v-if="hasCards === false" padding="none">
      <EmptyState
        icon="credit_card"
        title="Nenhum cartão cadastrado"
        description="Cadastre uma conta do tipo Cartão de crédito para acompanhar compras por fatura e receber lembretes de vencimento."
        :action="{
          label: 'Cadastrar cartão',
          onClick: () => router.push('/accounts/new'),
        }"
      />
    </Card>

    <template v-else>
      <!-- ================= SELETOR DE CARTÃO ================= -->
      <div v-if="cards.length > 1" class="flex flex-wrap gap-2" role="tablist" aria-label="Cartões">
        <button
          v-for="card in cards"
          :key="card.id"
          type="button"
          role="tab"
          :aria-selected="card.id === selectedCardId"
          class="inline-flex min-h-9 items-center gap-2 rounded-xl border px-3 py-1.5 text-sm font-medium transition-colors"
          :class="
            card.id === selectedCardId
              ? 'border-[var(--color-brand)] bg-[var(--color-brand-light)] text-[var(--color-brand)]'
              : 'border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-[var(--color-fg-muted)] hover:bg-[var(--color-bg-muted)]'
          "
          @click="selectedCardId = card.id"
        >
          <span class="h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: card.color }"></span>
          {{ card.name }}
        </button>
      </div>

      <!-- ================= AVISO DE CARTÃO NÃO CONFIGURADO ================= -->
      <div
        v-if="hero && !hero.account.isConfigured"
        class="flex items-start gap-3 rounded-xl border border-[var(--color-warning)] bg-[var(--color-warning-light)] px-4 py-3 text-sm text-[var(--color-warning)]"
        role="alert"
      >
        <AppIcon name="alert" :size="18" class="mt-0.5 shrink-0" />
        <div class="min-w-0 flex-1">
          <p class="font-medium">Falta definir o fechamento e o vencimento deste cartão.</p>
          <p class="mt-0.5 text-xs">
            As faturas abaixo usam fechamento dia 25 e vencimento dia 5 como palpite.
            Ajuste para os números ficarem certos.
          </p>
        </div>
        <router-link
          :to="`/accounts/${hero.account.id}/edit`"
          class="shrink-0 font-semibold underline"
        >
          Configurar
        </router-link>
      </div>

      <div
        v-if="hasError"
        class="flex items-center gap-3 rounded-xl border border-[var(--color-danger)] bg-[var(--color-danger-light)] px-4 py-3 text-sm text-[var(--color-danger)]"
        role="alert"
      >
        <AppIcon name="alert" :size="18" class="shrink-0" />
        <span>Não foi possível carregar as faturas.</span>
        <button class="ml-auto shrink-0 font-semibold underline" @click="invoicesQuery.refetch()">Recarregar</button>
      </div>

      <!-- ================= FATURA EM DESTAQUE ================= -->
      <div v-if="isLoading" class="space-y-4">
        <div class="h-44 w-full skeleton rounded-xl"></div>
        <div class="h-24 w-full skeleton rounded-xl"></div>
      </div>

      <template v-else-if="hero">
        <Card padding="none">
          <div class="p-5">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="text-sm font-medium text-[var(--color-fg-muted)]">
                  Fatura de {{ referenceLabel(hero.reference) }}
                </p>
                <p
                  class="mt-1 text-[2rem] font-semibold leading-tight tabular-nums tracking-tight"
                  :class="hero.remaining > 0 ? 'text-[var(--color-fg)]' : 'text-[var(--color-success)]'"
                >
                  {{ formatCurrency(hero.remaining, hero.account.currency, locale) }}
                </p>
                <p class="mt-1 text-xs text-[var(--color-fg-muted)]">
                  {{ hero.transactionCount }}
                  {{ hero.transactionCount === 1 ? "compra" : "compras" }}
                  <template v-if="hero.paidTotal > 0">
                    · pago {{ formatCurrency(hero.paidTotal, hero.account.currency, locale) }} de
                    {{ formatCurrency(hero.total, hero.account.currency, locale) }}
                  </template>
                </p>
              </div>

              <span :class="badge.badgeClass" class="mt-1">{{ badge.label }}</span>
            </div>

            <div class="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--color-fg-muted)]">
              <span class="inline-flex items-center gap-1.5">
                <AppIcon name="calendar" :size="14" />
                Fecha em {{ formatDate(hero.closingDate, locale, shortDate) }}
              </span>
              <span class="inline-flex items-center gap-1.5" :class="dueClasses">
                <AppIcon name="clock" :size="14" />
                Vence em {{ formatDate(hero.dueDate, locale, shortDate) }} ·
                {{ daysUntilLabel(hero.daysUntilDue) }}
              </span>
            </div>
          </div>

          <!-- Limite do cartão -->
          <div v-if="limit" class="border-t border-[var(--color-border)] px-5 py-4">
            <div class="flex items-baseline justify-between gap-2 text-xs">
              <span class="font-medium text-[var(--color-fg-muted)]">Limite comprometido nesta fatura</span>
              <span class="tabular-nums text-[var(--color-fg-muted)]">
                {{ formatCurrency(limit.used, hero.account.currency, locale) }} de
                {{ formatCurrency(limit.available + limit.used, hero.account.currency, locale) }}
              </span>
            </div>
            <div
              class="mt-2 h-2 overflow-hidden rounded-full bg-[var(--color-bg-muted)]"
              role="progressbar"
              :aria-valuenow="Math.round(limit.ratio * 100)"
              aria-valuemin="0"
              aria-valuemax="100"
              aria-label="Uso do limite do cartão"
            >
              <div
                class="h-full rounded-full transition-[width] duration-300"
                :class="limit.ratio > 0.85 ? 'bg-[var(--color-danger)]' : limit.ratio > 0.6 ? 'bg-[var(--color-warning)]' : 'bg-[var(--color-brand)]'"
                :style="{ width: `${Math.max(limit.ratio * 100, 2)}%` }"
              ></div>
            </div>
            <p class="mt-1.5 text-xs text-[var(--color-fg-muted)]">
              {{ formatCurrency(limit.available, hero.account.currency, locale) }} disponíveis nesta fatura.
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-2 border-t border-[var(--color-border)] px-5 py-4">
            <Button
              v-if="hero.remaining > 0"
              size="sm"
              :disabled="!hero.id"
              @click="openPay(hero)"
            >
              <AppIcon name="check" :size="16" :stroke-width="2.4" />
              Pagar fatura
            </Button>
            <router-link
              v-if="hero.id"
              :to="`/invoices/${hero.id}`"
              class="link px-2 py-1.5 text-sm"
            >
              Ver {{ hero.transactionCount }} {{ hero.transactionCount === 1 ? "compra" : "compras" }}
            </router-link>
            <router-link
              :to="`/accounts/${hero.account.id}/edit`"
              class="link px-2 py-1.5 text-sm"
            >
              Editar cartão
            </router-link>
          </div>
        </Card>
      </template>

      <!-- ================= HISTÓRICO ================= -->
      <Card
        v-if="history.length"
        title="Outras faturas"
        :description="`${history.length} ${history.length === 1 ? 'fatura' : 'faturas'} deste cartão`"
        padding="none"
      >
        <div class="divide-y divide-[var(--color-border)]">
          <div v-for="invoice in history" :key="invoice.reference" class="density-row flex flex-wrap items-center gap-3 px-4 sm:px-5">
            <span class="h-9 w-1 shrink-0 rounded-full" :class="stripe(invoice)"></span>

            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium text-[var(--color-fg)]">
                {{ referenceLabel(invoice.reference) }}
              </p>
              <p class="truncate text-xs text-[var(--color-fg-muted)]">
                {{ invoice.transactionCount }}
                {{ invoice.transactionCount === 1 ? "compra" : "compras" }}
                · fecha {{ formatDate(invoice.closingDate, locale, shortDate) }}
                · vence {{ formatDate(invoice.dueDate, locale, shortDate) }}
              </p>
            </div>

            <span :class="badgeOf(invoice).badgeClass" class="shrink-0">
              {{ badgeOf(invoice).label }}
            </span>

            <p class="w-full shrink-0 text-sm font-semibold tabular-nums text-[var(--color-fg)] sm:w-32 sm:text-right">
              {{ formatCurrency(invoice.total, invoice.account.currency, locale) }}
            </p>

            <div class="flex w-full shrink-0 items-center gap-2 sm:w-auto">
              <Button
                v-if="invoice.remaining > 0 && invoice.id"
                size="sm"
                variant="secondary"
                @click="openPay(invoice)"
              >
                Pagar
              </Button>
              <router-link
                v-if="invoice.id"
                :to="`/invoices/${invoice.id}`"
                class="link px-1.5 py-1.5 text-sm"
              >
                Detalhes
              </router-link>
            </div>
          </div>
        </div>
      </Card>

      <EmptyState
        v-else-if="!hero"
        icon="inbox"
        title="Nenhuma fatura neste cartão"
        description="Registre as compras com a conta do cartão para que elas apareçam aqui."
        :action="{ label: 'Registrar compra', onClick: () => router.push('/transactions/new') }"
      />
    </template>

    <PayInvoiceModal v-model:open="payOpen" :invoice="payTarget" @paid="onPaid" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useAccounts, useInvoices, type Invoice } from "../../composables/useApi";
import { usePreferences } from "../../composables/usePreferences";
import { AppIcon, Button, Card, EmptyState } from "../../components/ui";
import PayInvoiceModal from "../../components/invoices/PayInvoiceModal.vue";
import { formatCurrency, formatDate } from "../../utils/format";
import {
  daysUntilLabel,
  limitUsage,
  referenceLabel,
  statusBadge,
  urgencyStripe,
} from "../../utils/invoices";

const router = useRouter();
const { preferences } = usePreferences();
const locale = computed(() => preferences.value.locale);

const shortDate = { month: "short", day: "numeric" } as Intl.DateTimeFormatOptions;

const accountsQuery = useAccounts();
const invoicesQuery = useInvoices(ref({ monthsBack: 6, monthsForward: 1 }));

const invoices = computed(() => invoicesQuery.data.value ?? []);
const cards = computed(() => accountsQuery.data.value ?? []);

const selectedCardId = ref("");

// Padrão: primeiro cartão com fatura em aberto, senão o primeiro cadastrado.
watch(
  [cards, invoices],
  () => {
    if (selectedCardId.value && cards.value.some((card) => card.id === selectedCardId.value)) return;
    const withOpen = invoices.value.find((invoice) => invoice.status !== "PAID");
    selectedCardId.value = withOpen?.account.id ?? cards.value[0]?.id ?? "";
  },
  { immediate: true }
);

const cardInvoices = computed(() =>
  invoices.value.filter((invoice) => invoice.account.id === selectedCardId.value)
);

/** A fatura mais urgente: vencida primeiro, depois a que vence depois. */
const hero = computed<Invoice | null>(() => {
  const unpaid = cardInvoices.value.filter((invoice) => invoice.status !== "PAID");
  if (unpaid.length > 0) return unpaid[0];

  // Tudo pago: mostra a mais recente para o usuário ver onde parou.
  return (
    cardInvoices.value.reduce<Invoice | null>(
      (latest, invoice) =>
        !latest || new Date(invoice.periodEnd) > new Date(latest.periodEnd) ? invoice : latest,
      null
    )
  );
});

const history = computed(() => cardInvoices.value.filter((invoice) => invoice !== hero.value));

const limit = computed(() => (hero.value ? limitUsage(hero.value) : null));

const badge = computed(() => (hero.value ? statusBadge(hero.value) : { label: "", badgeClass: "" }));
const badgeOf = (invoice: Invoice) => statusBadge(invoice);
const stripe = (invoice: Invoice) => urgencyStripe(invoice.urgency);

const dueClasses = computed(() => {
  if (!hero.value) return "";
  if (hero.value.daysUntilDue < 0) return "text-[var(--color-danger)] font-medium";
  if (hero.value.daysUntilDue <= 2) return "text-[var(--color-warning)] font-medium";
  return "";
});

const isLoading = computed(() => invoicesQuery.isLoading.value || accountsQuery.isLoading.value);
const hasError = computed(() => invoicesQuery.isError.value);
const hasCards = computed(() => !accountsQuery.isLoading.value && cards.value.length > 0);

const payOpen = ref(false);
const payTarget = ref<Invoice | null>(null);

function openPay(invoice: Invoice) {
  payTarget.value = invoice;
  payOpen.value = true;
}

function onPaid() {
  payTarget.value = null;
}
</script>
