<template>
  <div class="space-y-6 stagger-in">
    <!-- Page header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="min-w-0">
        <router-link to="/investments" class="link text-sm font-medium">Investimentos</router-link>
        <h1 class="mt-1 truncate font-display text-3xl text-[var(--color-fg)]">
          {{ investment ? `${investment.name} (${investment.symbol})` : "Investimento" }}
        </h1>
        <p class="mt-1 text-[var(--color-fg-muted)]">
          Posição, rentabilidade e níveis de preço definidos para este ativo.
        </p>
      </div>
      <div class="flex flex-wrap gap-3">
        <Button variant="outline" @click="router.push('/investments')">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10 19H5a2 2 0 01-2-2V7a2 2 0 012-2h5m7 10l5-5m0 0l-5-5m5 5H9" />
          </svg>
          Voltar
        </Button>
        <Button v-if="investment" @click="goToEdit">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Editar
        </Button>
      </div>
    </div>

    <!-- Loading -->
    <Card v-if="isLoading" padding="lg">
      <div class="space-y-4">
        <div class="h-8 w-64 skeleton skeleton-text"></div>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div v-for="i in 4" :key="i" class="h-20 w-full skeleton rounded-xl"></div>
        </div>
      </div>
    </Card>

    <!-- Não encontrado -->
    <Card v-else-if="!investment" padding="lg">
      <EmptyState
        icon="chart"
        title="Investimento não encontrado"
        description="O ativo que você procura não existe mais ou foi removido da carteira."
        :action="{ label: 'Voltar para Investimentos', onClick: () => router.push('/investments') }"
      />
    </Card>

    <template v-else>
      <!-- Números -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card padding="md">
          <p class="text-sm font-medium text-[var(--color-fg-muted)]">Quantidade</p>
          <p class="mt-1 font-display text-2xl font-normal text-[var(--color-fg)]">{{ quantityLabel }}</p>
          <p class="mt-1 text-xs text-[var(--color-fg-subtle)]">{{ assetTypeLabel(investment.type) }}</p>
        </Card>

        <Card padding="md">
          <p class="text-sm font-medium text-[var(--color-fg-muted)]">Preço médio</p>
          <p class="mt-1 font-display text-2xl font-normal text-[var(--color-fg)]">
            {{ money(investment.averagePrice, investment.currency) }}
          </p>
          <p class="mt-1 text-xs text-[var(--color-fg-subtle)]">Custo por unidade</p>
        </Card>

        <Card padding="md">
          <p class="text-sm font-medium text-[var(--color-fg-muted)]">Preço atual</p>
          <p class="mt-1 font-display text-2xl font-normal" :class="profitClass">
            {{ money(unitPrice, investment.currency) }}
          </p>
          <p class="mt-1 text-xs text-[var(--color-fg-subtle)]">
            {{ investment.currentPrice ? "Última cotação informada" : "Usando o preço médio" }}
          </p>
        </Card>

        <Card padding="md">
          <p class="text-sm font-medium text-[var(--color-fg-muted)]">Valor de mercado</p>
          <p class="mt-1 font-display text-2xl font-normal text-[var(--color-fg)]">
            {{ money(marketValue, investment.currency) }}
          </p>
          <p class="mt-1 text-xs text-[var(--color-fg-subtle)]">Quantidade × preço atual</p>
        </Card>
      </div>

      <!-- Rentabilidade -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card padding="md">
          <p class="text-sm font-medium text-[var(--color-fg-muted)]">Custo total</p>
          <p class="mt-1 font-display text-2xl font-normal text-[var(--color-fg)]">
            {{ money(costBasis, investment.currency) }}
          </p>
          <p class="mt-1 text-xs text-[var(--color-fg-subtle)]">Quanto você investiu</p>
        </Card>

        <Card padding="md">
          <p class="text-sm font-medium text-[var(--color-fg-muted)]">Ganho/Perda</p>
          <p class="mt-1 font-display text-2xl font-normal" :class="profitClass">
            {{ profit >= 0 ? "+" : "-" }}{{ money(Math.abs(profit), investment.currency) }}
          </p>
          <p class="mt-1 text-xs text-[var(--color-fg-subtle)]">Diferença em reais</p>
        </Card>

        <Card padding="md">
          <p class="text-sm font-medium text-[var(--color-fg-muted)]">Rentabilidade</p>
          <p class="mt-1 font-display text-2xl font-normal" :class="profitClass">{{ profitabilityLabel }}</p>
          <p class="mt-1 text-xs text-[var(--color-fg-subtle)]">Ganho/Perda sobre o custo</p>
        </Card>
      </div>

      <!-- Detalhes -->
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Detalhes" padding="lg">
          <dl class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt class="text-xs font-medium uppercase tracking-wide text-[var(--color-fg-subtle)]">Símbolo</dt>
              <dd class="mt-1 text-sm font-medium text-[var(--color-fg)]">{{ investment.symbol }}</dd>
            </div>
            <div>
              <dt class="text-xs font-medium uppercase tracking-wide text-[var(--color-fg-subtle)]">Tipo de ativo</dt>
              <dd class="mt-1 text-sm font-medium text-[var(--color-fg)]">{{ assetTypeLabel(investment.type) }}</dd>
            </div>
            <div>
              <dt class="text-xs font-medium uppercase tracking-wide text-[var(--color-fg-subtle)]">Moeda</dt>
              <dd class="mt-1 text-sm font-medium text-[var(--color-fg)]">{{ investment.currency }}</dd>
            </div>
            <div>
              <dt class="text-xs font-medium uppercase tracking-wide text-[var(--color-fg-subtle)]">Setor</dt>
              <dd class="mt-1 text-sm font-medium text-[var(--color-fg)]">
                {{ investment.sector || "Não informado" }}
              </dd>
            </div>
            <div>
              <dt class="text-xs font-medium uppercase tracking-wide text-[var(--color-fg-subtle)]">Posição</dt>
              <dd class="mt-1">
                <span class="badge" :class="investment.isActive ? 'badge-info' : 'badge-neutral'">
                  {{ investment.isActive ? "Ativa" : "Inativa" }}
                </span>
              </dd>
            </div>
            <div>
              <dt class="text-xs font-medium uppercase tracking-wide text-[var(--color-fg-subtle)]">Registrado em</dt>
              <dd class="mt-1 text-sm font-medium text-[var(--color-fg)]">
                {{ formatDate(investment.createdAt, "pt-BR") || "—" }}
              </dd>
            </div>
          </dl>
        </Card>

        <Card title="Níveis de preço" padding="lg">
          <dl class="space-y-4">
            <div>
              <dt class="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-[var(--color-fg-subtle)]">
                Preço-alvo
                <Tooltip content="Cotação que você espera alcançar para o ativo. Serve de referência para decidir quando realizar." position="top">
                  <span class="inline-flex text-[var(--color-fg-subtle)] hover:text-[var(--color-brand)] cursor-help">
                    <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" stroke-width="1.5" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 16v-4M12 8h.01" />
                    </svg>
                  </span>
                </Tooltip>
              </dt>
              <dd class="mt-1 font-display text-xl text-[var(--color-success)]">
                {{ investment.targetPrice ? money(investment.targetPrice, investment.currency) : "Não definido" }}
              </dd>
            </div>
            <div>
              <dt class="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-[var(--color-fg-subtle)]">
                Stop loss
                <Tooltip content="Preço de corte: abaixo dele você reavalia a posição para limitar a perda." position="top">
                  <span class="inline-flex text-[var(--color-fg-subtle)] hover:text-[var(--color-brand)] cursor-help">
                    <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" stroke-width="1.5" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 16v-4M12 8h.01" />
                    </svg>
                  </span>
                </Tooltip>
              </dt>
              <dd class="mt-1 font-display text-xl text-[var(--color-danger)]">
                {{ investment.stopLoss ? money(investment.stopLoss, investment.currency) : "Não definido" }}
              </dd>
            </div>
          </dl>
        </Card>
      </div>

      <!-- Ações -->
      <Card padding="lg">
        <div class="flex flex-wrap justify-end gap-3">
          <Button variant="ghost" @click="router.push('/investments')">Voltar</Button>
          <Button variant="danger" :loading="deleting" @click="handleDeleteInvestment">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Excluir
          </Button>
        </div>
      </Card>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useDeleteInvestment, useInvestment } from "../../composables/useApi";
import { Button, Card, EmptyState, Tooltip } from "../../components/ui";
import { formatCurrency, formatDate, formatNumber } from "../../utils/format";

const route = useRoute();
const router = useRouter();

const investmentId = route.params.id as string;
const investmentQuery = useInvestment(investmentId);
const deleteInvestmentMutation = useDeleteInvestment();

const investment = computed(() => investmentQuery.data.value);
const isLoading = computed(() => investmentQuery.isLoading.value);
const deleting = ref(false);

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

const quantityLabel = computed(() =>
  formatNumber(Number(investment.value?.quantity || 0), { maximumFractionDigits: 8 }, "pt-BR")
);

const unitPrice = computed(
  () => Number(investment.value?.currentPrice || investment.value?.averagePrice || 0)
);

const marketValue = computed(
  () => Number(investment.value?.quantity || 0) * unitPrice.value
);

const costBasis = computed(
  () => Number(investment.value?.quantity || 0) * Number(investment.value?.averagePrice || 0)
);

const profit = computed(() => marketValue.value - costBasis.value);

const profitabilityLabel = computed(() => {
  if (costBasis.value <= 0) return "—";
  const value = (profit.value / costBasis.value) * 100;
  return `${value >= 0 ? "+" : ""}${value.toFixed(2).replace(".", ",")}%`;
});

const profitClass = computed(() =>
  profit.value >= 0 ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"
);

function goToEdit() {
  router.push({ path: "/investments/new", query: { id: investmentId } });
}

async function handleDeleteInvestment() {
  if (!confirm("Tem certeza que deseja excluir este investimento?")) return;
  deleting.value = true;
  try {
    await deleteInvestmentMutation.mutateAsync(investmentId);
    router.push("/investments");
  } catch (error) {
    alert("Não foi possível excluir o investimento: " + (error as Error).message);
  } finally {
    deleting.value = false;
  }
}
</script>