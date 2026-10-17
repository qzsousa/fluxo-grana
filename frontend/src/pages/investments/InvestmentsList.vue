<template>
  <div class="space-y-6 stagger-in">
    <!-- Page header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="font-display text-3xl text-[var(--color-fg)]">Investimentos</h1>
        <p class="mt-1 text-[var(--color-fg-muted)]">
          Acompanhe sua carteira de ações, FII, ETFs e criptoativos.
        </p>
      </div>
      <Button @click="router.push('/investments/new')">
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Novo Investimento
      </Button>
    </div>

    <!-- Resumo da carteira -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <template v-if="isLoading">
        <Card v-for="i in 4" :key="i" padding="md">
          <div class="h-4 w-28 skeleton skeleton-text"></div>
          <div class="mt-3 h-7 w-40 skeleton skeleton-text"></div>
        </Card>
      </template>

      <template v-else>
        <Card padding="md">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-sm font-medium text-[var(--color-fg-muted)]">Valor de mercado</p>
              <p class="mt-1 font-display text-2xl font-normal text-[var(--color-fg)]">
                {{ money(totalMarketValue, displayCurrency) }}
              </p>
              <p class="mt-1 text-xs text-[var(--color-fg-subtle)]">Posição total</p>
            </div>
            <span class="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-brand-light)] text-[var(--color-brand)]">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
            </span>
          </div>
          <Tooltip content="Soma da quantidade de cada ativo multiplicada pelo preço atual (ou preço médio quando não houver cotação)." position="top">
            <span class="mt-2 inline-flex text-[var(--color-fg-subtle)] hover:text-[var(--color-brand)] cursor-help">
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
              <p class="text-sm font-medium text-[var(--color-fg-muted)]">Custo total</p>
              <p class="mt-1 font-display text-2xl font-normal text-[var(--color-fg)]">
                {{ money(totalCost, displayCurrency) }}
              </p>
              <p class="mt-1 text-xs text-[var(--color-fg-subtle)]">Quantidade × preço médio</p>
            </div>
            <span class="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-bg-muted)] text-[var(--color-fg-muted)]">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 7h6m0 10v-3m-3 3h.01m-6 0h1a2 2 0 001.586-1.12l2-5A2 2 0 008.42 9H7a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </span>
          </div>
          <Tooltip content="Quanto você pagou ao longo do tempo para comprar os ativos que possui hoje." position="top">
            <span class="mt-2 inline-flex text-[var(--color-fg-subtle)] hover:text-[var(--color-brand)] cursor-help">
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
              <p class="text-sm font-medium text-[var(--color-fg-muted)]">Ganho/Perda</p>
              <p class="mt-1 font-display text-2xl font-normal" :class="totalProfit >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'">
                {{ totalProfit >= 0 ? "+" : "-" }}{{ money(Math.abs(totalProfit), displayCurrency) }}
              </p>
              <p class="mt-1 text-xs text-[var(--color-fg-subtle)]">Rentabilidade da carteira</p>
            </div>
            <span
              class="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
              :class="totalProfit >= 0 ? 'bg-[var(--color-success-light)] text-[var(--color-success)]' : 'bg-[var(--color-danger-light)] text-[var(--color-danger)]'"
            >
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
                <path v-if="totalProfit >= 0" stroke-linecap="round" stroke-linejoin="round" d="M7 11l5-5m0 0l5 5m-5-5v12" />
                <path v-else stroke-linecap="round" stroke-linejoin="round" d="M17 13l-5 5m0 0l-5-5m5 5V6" />
              </svg>
            </span>
          </div>
          <Tooltip content="Diferença entre o valor de mercado e o custo total. Positivo = ganho; negativo = perda." position="top">
            <span class="mt-2 inline-flex text-[var(--color-fg-subtle)] hover:text-[var(--color-brand)] cursor-help">
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
              <p class="text-sm font-medium text-[var(--color-fg-muted)]">Posição</p>
              <p class="mt-1 font-display text-2xl font-normal text-[var(--color-fg)]">
                {{ investments.length }}
              </p>
              <p class="mt-1 text-xs text-[var(--color-fg-subtle)]">{{ activeCount }} ativa(s)</p>
            </div>
            <span class="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-info-light)] text-[var(--color-info)]">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m-1.5 0h1.5m-16.5 0a2.25 2.25 0 00-2.25 2.25v11.25A2.25 2.25 0 006 16.5h2.25m-16.5 0l6.75-15.75M3.75 3l13.5 13.5" />
              </svg>
            </span>
          </div>
          <Tooltip content="Número de ativos na carteira e quantos deles seguem ativos." position="top">
            <span class="mt-2 inline-flex text-[var(--color-fg-subtle)] hover:text-[var(--color-brand)] cursor-help">
              <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke-width="1.5" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 16v-4M12 8h.01" />
              </svg>
            </span>
          </Tooltip>
        </Card>
      </template>
    </div>

    <!-- Carteira -->
    <Card v-if="investments.length > 0" title="Sua Carteira" padding="none">
      <template #header-actions>
        <router-link to="/investments/new" class="link text-sm font-medium">Novo Investimento</router-link>
      </template>

      <div class="divide-y divide-[var(--color-border)]">
        <article
          v-for="investment in investments"
          :key="investment.id"
          class="p-6 transition-colors hover:bg-[var(--color-bg-muted)]"
        >
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div class="flex items-start gap-3 min-w-0">
              <span class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-brand-light)] text-xs font-semibold text-[var(--color-brand)]">
                {{ initials(investment.symbol) }}
              </span>
              <div class="min-w-0">
                <p class="font-medium text-[var(--color-fg)] truncate">
                  {{ investment.name }}
                  <span class="text-[var(--color-fg-muted)] font-normal">({{ investment.symbol }})</span>
                </p>
                <p class="text-xs text-[var(--color-fg-muted)]">
                  {{ assetTypeLabel(investment.type) }}
                  <template v-if="investment.sector"> · {{ investment.sector }}</template>
                </p>
              </div>
            </div>
            <span class="badge shrink-0" :class="investment.isActive ? 'badge-info' : 'badge-neutral'">
              {{ investment.isActive ? "Ativo" : "Inativo" }}
            </span>
          </div>

          <dl class="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <dt class="text-xs text-[var(--color-fg-subtle)]">Quantidade</dt>
              <dd class="mt-0.5 text-sm font-medium text-[var(--color-fg)]">{{ quantity(investment) }}</dd>
            </div>
            <div>
              <dt class="text-xs text-[var(--color-fg-subtle)]">Preço médio</dt>
              <dd class="mt-0.5 text-sm font-medium text-[var(--color-fg)]">{{ money(investment.averagePrice, investment.currency) }}</dd>
            </div>
            <div>
              <dt class="text-xs text-[var(--color-fg-subtle)]">Preço atual</dt>
              <dd class="mt-0.5 text-sm font-medium" :class="profitClass(investment)">
                {{ money(unitPrice(investment), investment.currency) }}
              </dd>
            </div>
            <div>
              <dt class="text-xs text-[var(--color-fg-subtle)]">Valor de mercado</dt>
              <dd class="mt-0.5 text-sm font-medium text-[var(--color-fg)]">{{ money(marketValue(investment), investment.currency) }}</dd>
            </div>
          </dl>

          <div class="mt-3 flex flex-wrap items-center justify-between gap-2">
            <p class="text-sm">
              <span class="text-[var(--color-fg-muted)]">Ganho/Perda:</span>
              <span class="font-semibold" :class="profitClass(investment)">
                {{ profit(investment) >= 0 ? "+" : "-" }}{{ money(Math.abs(profit(investment)), investment.currency) }}
              </span>
              <span class="text-xs text-[var(--color-fg-subtle)]"> ({{ profitabilityLabel(investment) }})</span>
            </p>
            <Button variant="ghost" size="sm" @click="router.push(`/investments/${investment.id}`)">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542 7z" />
              </svg>
              Detalhes
            </Button>
          </div>
        </article>
      </div>
    </Card>

    <!-- Loading -->
    <Card v-else-if="isLoading" padding="lg">
      <div class="space-y-4">
        <div v-for="i in 3" :key="i" class="h-28 w-full skeleton rounded-xl"></div>
      </div>
    </Card>

    <!-- Empty state -->
    <Card v-else padding="lg">
      <EmptyState
        icon="chart"
        title="Nenhum investimento cadastrado"
        description="Registre suas ações, FII, ETFs e criptoativos para acompanhar o valor de mercado e a rentabilidade da carteira."
        :action="{ label: 'Adicionar Investimento', onClick: () => router.push('/investments/new') }"
      />
    </Card>

    <!-- Error banner -->
    <div
      v-if="listError"
      class="flex items-center gap-3 rounded-xl border border-[var(--color-danger)] bg-[var(--color-danger-light)] p-4 text-sm text-[var(--color-danger)]"
      role="alert"
    >
      <svg class="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 100 2 1 1 0 000-2z" clip-rule="evenodd" />
      </svg>
      <span>Não foi possível carregar seus investimentos.</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useInvestments } from "../../composables/useApi";
import type { Investment } from "../../composables/useApi";
import { Button, Card, EmptyState, Tooltip } from "../../components/ui";
import { formatCurrency, formatNumber } from "../../utils/format";

const router = useRouter();
const investmentsQuery = useInvestments();

const investments = computed<Investment[]>(() => investmentsQuery.data.value ?? []);
const isLoading = computed(() => investmentsQuery.isLoading.value);
const listError = computed(() => investmentsQuery.isError.value);

const ASSET_TYPE_LABELS: Record<string, string> = {
  STOCK: "Ações",
  ETF: "ETF",
  FUND: "Fundo",
  CRYPTO: "Cripto",
  FIXED_INCOME: "Renda fixa",
  REAL_ESTATE: "Imóvel",
  OTHER: "Outro",
};

function assetTypeLabel(type: string): string {
  return ASSET_TYPE_LABELS[type] ?? type;
}

function money(value: number, currency?: string | null): string {
  return formatCurrency(Number(value || 0), currency || "BRL", "pt-BR");
}

function quantity(investment: Investment): string {
  return formatNumber(Number(investment.quantity || 0), { maximumFractionDigits: 8 }, "pt-BR");
}

function initials(symbol: string): string {
  return (symbol || "?").slice(0, 4).toUpperCase();
}

function unitPrice(investment: Investment): number {
  return Number(investment.currentPrice || investment.averagePrice || 0);
}

function marketValue(investment: Investment): number {
  return Number(investment.quantity || 0) * unitPrice(investment);
}

function costBasis(investment: Investment): number {
  return Number(investment.quantity || 0) * Number(investment.averagePrice || 0);
}

function profit(investment: Investment): number {
  return marketValue(investment) - costBasis(investment);
}

function profitability(investment: Investment): number {
  const cost = costBasis(investment);
  if (cost <= 0) return 0;
  return (profit(investment) / cost) * 100;
}

function profitabilityLabel(investment: Investment): string {
  const value = profitability(investment);
  return `${value >= 0 ? "+" : ""}${value.toFixed(2).replace(".", ",")}%`;
}

function profitClass(investment: Investment): string {
  return profit(investment) >= 0 ? "text-[var(--color-success)]" : "text-[var(--color-danger)]";
}

const displayCurrency = computed(() => investments.value[0]?.currency || "BRL");

const totalMarketValue = computed(() =>
  investments.value.reduce((sum, investment) => sum + marketValue(investment), 0)
);

const totalCost = computed(() =>
  investments.value.reduce((sum, investment) => sum + costBasis(investment), 0)
);

const totalProfit = computed(() => totalMarketValue.value - totalCost.value);

const activeCount = computed(() => investments.value.filter((investment) => investment.isActive).length);
</script>