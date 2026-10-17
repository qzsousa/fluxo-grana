<template>
  <div class="space-y-6 stagger-in">
    <!-- Page header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="font-display text-3xl text-[var(--color-fg)]">
          {{ isEditing ? "Editar Investimento" : "Novo Investimento" }}
        </h1>
        <p class="mt-1 text-[var(--color-fg-muted)]">
          {{
            isEditing
              ? "Atualize a quantidade, os preços e o Setor deste ativo."
              : "Cadastre um ativo para acompanhar a rentabilidade da sua carteira."
          }}
        </p>
      </div>
      <Button variant="ghost" @click="router.push('/investments')">
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10 19H5a2 2 0 01-2-2V7a2 2 0 012-2h5m7 10l5-5m0 0l-5-5m5 5H9" />
        </svg>
        Voltar
      </Button>
    </div>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <!-- Formulário -->
      <Card :title="isEditing ? 'Dados do investimento' : 'Dados do novo investimento'" padding="lg" class="lg:col-span-2">
        <form class="space-y-5" @submit.prevent="onSubmit">
          <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Input
              v-model="form.symbol"
              id="investment-symbol"
              label="Símbolo"
              placeholder="PETR4, AAPL, BTC-USD"
              required
              autocomplete="off"
              :error="errors.symbol"
              hint="Código do ativo na bolsa."
            />

            <div class="md:col-span-2">
              <Input
                v-model="form.name"
                id="investment-name"
                label="Nome"
                placeholder="Petrobras, Apple Inc., Bitcoin"
                required
                autocomplete="off"
                :error="errors.name"
                hint="Nome completo do ativo."
              />
            </div>
          </div>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label for="investment-type" class="label">Tipo de ativo</label>
              <Select
                v-model="form.type"
                id="investment-type"
                :options="investmentTypeOptions"
                placeholder="Selecione o tipo"
                required
                :error="errors.type"
              />
              <div class="mt-1.5">
                <Tooltip
                  content="Ações e FII são negociados em bolsa; Título é renda fixa (CDB, LCI, Tesouro); ETF é um fundo que replica um índice; Cripto são moedas digitais."
                  position="top"
                >
                  <span class="inline-flex items-center gap-1 text-xs text-[var(--color-fg-subtle)] hover:text-[var(--color-brand)] cursor-help">
                    <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" stroke-width="1.5" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 16v-4M12 8h.01" />
                    </svg>
                    O que significa cada tipo?
                  </span>
                </Tooltip>
              </div>
            </div>

            <Select
              v-model="form.currency"
              id="investment-currency"
              label="Moeda"
              :options="currencyOptions"
              placeholder="Selecione a moeda"
              hint="Moeda em que o ativo é negociado."
            />
          </div>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Input
              v-model="form.quantity"
              id="investment-quantity"
              label="Quantidade"
              type="number"
              placeholder="0,00"
              required
              :error="errors.quantity"
              hint="Para cripto, use casas decimais."
            />

            <Input
              v-model="form.averagePrice"
              id="investment-average-price"
              label="Preço médio"
              type="number"
              placeholder="0,00"
              required
              :error="errors.averagePrice"
              hint="Quanto você pagou por unidade."
            />

            <Input
              v-model="form.currentPrice"
              id="investment-current-price"
              label="Preço atual (opcional)"
              type="number"
              placeholder="0,00"
              :error="errors.currentPrice"
              hint="Cotação mais recente. Sem ela, usamos o preço médio."
            />
          </div>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              v-model="form.targetPrice"
              id="investment-target-price"
              label="Preço-alvo (opcional)"
              type="number"
              placeholder="0,00"
              :error="errors.targetPrice"
              hint="Cotação que você espera para o ativo."
            />

            <Input
              v-model="form.stopLoss"
              id="investment-stop-loss"
              label="Stop loss (opcional)"
              type="number"
              placeholder="0,00"
              :error="errors.stopLoss"
              hint="Cotação que faz você reconsiderar a posição."
            />
          </div>

          <Input
            v-model="form.sector"
            id="investment-sector"
            label="Setor (opcional)"
            placeholder="Tecnologia, Energia, Financeiro, Imobiliário"
            hint="Ajuda a diversificar a carteira."
          />

          <div class="flex items-center gap-2">
            <input
              id="investment-active"
              v-model="form.isActive"
              type="checkbox"
              class="h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-brand)] focus:ring-[var(--color-brand)] focus:ring-2"
            />
            <label for="investment-active" class="text-sm text-[var(--color-fg)]">Posição ativa</label>
            <Tooltip content="Posições inativas saem dos totais da carteira, mas continuam salvas para consulta." position="top">
              <span class="inline-flex text-[var(--color-fg-subtle)] hover:text-[var(--color-brand)] cursor-help">
                <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" stroke-width="1.5" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 16v-4M12 8h.01" />
                </svg>
              </span>
            </Tooltip>
          </div>

          <div class="flex flex-wrap justify-end gap-3 border-t border-[var(--color-border)] pt-5">
            <Button variant="ghost" type="button" @click="router.push('/investments')">Cancelar</Button>
            <Button type="submit" :loading="saving">
              {{ isEditing ? "Salvar Investimento" : "Criar Investimento" }}
            </Button>
          </div>
        </form>
      </Card>

      <!-- Prévia -->
      <Card title="Prévia" padding="lg">
        <dl class="space-y-4">
          <div>
            <dt class="text-xs font-medium uppercase tracking-wide text-[var(--color-fg-subtle)]">Ativo</dt>
            <dd class="mt-1 text-sm font-medium text-[var(--color-fg)]">
              {{ form.name || "—" }}<span v-if="form.symbol" class="text-[var(--color-fg-muted)]"> ({{ form.symbol.toUpperCase() }})</span>
            </dd>
          </div>
          <div>
            <dt class="text-xs font-medium uppercase tracking-wide text-[var(--color-fg-subtle)]">Tipo de ativo</dt>
            <dd class="mt-1 text-sm font-medium text-[var(--color-fg)]">
              {{ investmentTypeLabel(form.type) }}
            </dd>
          </div>
          <div>
            <dt class="text-xs font-medium uppercase tracking-wide text-[var(--color-fg-subtle)]">Custo</dt>
            <dd class="mt-1 text-sm font-medium text-[var(--color-fg)]">
              {{ money(costPreview, form.currency) }}
            </dd>
          </div>
          <div>
            <dt class="text-xs font-medium uppercase tracking-wide text-[var(--color-fg-subtle)]">Valor de mercado</dt>
            <dd class="mt-1 text-sm font-medium text-[var(--color-fg)]">
              {{ money(marketPreview, form.currency) }}
            </dd>
          </div>
          <div>
            <dt class="text-xs font-medium uppercase tracking-wide text-[var(--color-fg-subtle)]">Ganho/Perda</dt>
            <dd class="mt-1 text-sm font-medium" :class="profitPreview >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'">
              {{ profitPreview >= 0 ? "+" : "-" }}{{ money(Math.abs(profitPreview), form.currency) }}
            </dd>
          </div>
        </dl>
      </Card>
    </div>

    <div
      v-if="submitError"
      class="flex items-center gap-3 rounded-xl border border-[var(--color-danger)] bg-[var(--color-danger-light)] p-4 text-sm text-[var(--color-danger)]"
      role="alert"
    >
      <svg class="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 100 2 1 1 0 000-2z" clip-rule="evenodd" />
      </svg>
      <span>{{ submitError }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  useCreateInvestment,
  useInvestment,
  useUpdateInvestment,
} from "../../composables/useApi";
import type { Investment } from "../../composables/useApi";
import { Button, Card, Input, Select, Tooltip } from "../../components/ui";
import { formatCurrency } from "../../utils/format";

const route = useRoute();
const router = useRouter();

const investmentId = computed(() => {
  const fromParams = route.params.id;
  if (typeof fromParams === "string" && fromParams) return fromParams;
  const fromQuery = route.query.id;
  if (typeof fromQuery === "string" && fromQuery) return fromQuery;
  return "";
});

const isEditing = computed(() => investmentId.value !== "");

const investmentQuery = useInvestment(investmentId.value);
const createInvestmentMutation = useCreateInvestment();
const updateInvestmentMutation = useUpdateInvestment();

const saving = ref(false);
const submitError = ref("");

const form = reactive({
  symbol: "",
  name: "",
  type: "STOCK",
  currency: "BRL",
  quantity: "",
  averagePrice: "",
  currentPrice: "",
  targetPrice: "",
  stopLoss: "",
  sector: "",
  isActive: true,
});

const errors = reactive({
  symbol: "",
  name: "",
  type: "",
  quantity: "",
  averagePrice: "",
  currentPrice: "",
  targetPrice: "",
  stopLoss: "",
});

const investmentTypeOptions = [
  { value: "STOCK", label: "Ações" },
  { value: "ETF", label: "ETF" },
  { value: "FUND", label: "Fundo" },
  { value: "CRYPTO", label: "Cripto" },
  { value: "FIXED_INCOME", label: "Renda fixa" },
  { value: "REAL_ESTATE", label: "Imóvel" },
  { value: "OTHER", label: "Outro" },
];

const ASSET_TYPE_LABELS: Record<string, string> = {
  STOCK: "Ações",
  ETF: "ETF",
  FUND: "Fundo",
  CRYPTO: "Cripto",
  FIXED_INCOME: "Renda fixa",
  REAL_ESTATE: "Imóvel",
  OTHER: "Outro",
};

const currencyOptions = [
  { value: "BRL", label: "BRL - Real brasileiro" },
  { value: "USD", label: "USD - Dólar americano" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "GBP", label: "GBP - Libra esterlina" },
];

function investmentTypeLabel(type: string): string {
  return ASSET_TYPE_LABELS[type] ?? type;
}

function money(value: number, currency?: string | null): string {
  return formatCurrency(Number(value || 0), currency || "BRL", "pt-BR");
}

function num(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

const costPreview = computed(() => num(form.quantity) * num(form.averagePrice));

const marketPreview = computed(() => {
  const unitPrice = num(form.currentPrice) || num(form.averagePrice);
  return num(form.quantity) * unitPrice;
});

const profitPreview = computed(() => marketPreview.value - costPreview.value);

function applyInvestment(investment: Investment) {
  form.symbol = investment.symbol ?? "";
  form.name = investment.name ?? "";
  form.type = investment.type ?? "STOCK";
  form.currency = investment.currency || "BRL";
  form.quantity = String(investment.quantity ?? "");
  form.averagePrice = String(investment.averagePrice ?? "");
  form.currentPrice = investment.currentPrice != null ? String(investment.currentPrice) : "";
  form.targetPrice = investment.targetPrice != null ? String(investment.targetPrice) : "";
  form.stopLoss = investment.stopLoss != null ? String(investment.stopLoss) : "";
  form.sector = investment.sector ?? "";
  form.isActive = investment.isActive !== false;
}

watch(
  () => investmentQuery.data.value,
  (investment) => {
    if (investment) applyInvestment(investment);
  },
  { immediate: true }
);

function validateForm(): boolean {
  errors.symbol = form.symbol.trim() ? "" : "Informe o símbolo do ativo";
  errors.name = form.name.trim() ? "" : "Informe o nome do ativo";
  errors.type = form.type ? "" : "Selecione o tipo de ativo";
  errors.quantity = num(form.quantity) > 0 ? "" : "A quantidade deve ser maior que zero";
  errors.averagePrice = num(form.averagePrice) > 0 ? "" : "O preço médio deve ser maior que zero";
  errors.currentPrice = form.currentPrice === "" || num(form.currentPrice) >= 0 ? "" : "O preço atual não pode ser negativo";
  errors.targetPrice = form.targetPrice === "" || num(form.targetPrice) >= 0 ? "" : "O preço-alvo não pode ser negativo";
  errors.stopLoss = form.stopLoss === "" || num(form.stopLoss) >= 0 ? "" : "O stop loss não pode ser negativo";
  return !Object.values(errors).some(Boolean);
}

function optionalNumber(value: string): number | undefined {
  return value === "" ? undefined : Number(value);
}

function toPayload(): Partial<Investment> {
  return {
    symbol: form.symbol.trim().toUpperCase(),
    name: form.name.trim(),
    type: form.type,
    currency: form.currency,
    quantity: Number(form.quantity),
    averagePrice: Number(form.averagePrice),
    currentPrice: optionalNumber(form.currentPrice),
    targetPrice: optionalNumber(form.targetPrice),
    stopLoss: optionalNumber(form.stopLoss),
    sector: form.sector.trim() || undefined,
    isActive: form.isActive,
  };
}

async function onSubmit() {
  submitError.value = "";
  if (!validateForm()) return;

  saving.value = true;
  try {
    const payload = toPayload();
    if (isEditing.value) {
      await updateInvestmentMutation.mutateAsync({
        id: investmentId.value,
        data: payload,
      });
    } else {
      await createInvestmentMutation.mutateAsync(payload);
    }
    router.push("/investments");
  } catch (error) {
    submitError.value =
      "Não foi possível salvar o investimento: " +
      ((error as Error)?.message || "tente novamente.");
  } finally {
    saving.value = false;
  }
}
</script>