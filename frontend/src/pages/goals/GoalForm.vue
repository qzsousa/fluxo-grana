<template>
  <div class="space-y-6 stagger-in">
    <!-- Page header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="font-display text-3xl text-[var(--color-fg)]">
          {{ isEditing ? "Editar Meta" : "Nova Meta" }}
        </h1>
        <p class="mt-1 text-[var(--color-fg-muted)]">
          {{ isEditing ? "Atualize o objetivo, o prazo e o valor já guardado." : "Transforme um desejo em um objetivo com data e valor." }}
        </p>
      </div>
      <Button variant="ghost" @click="router.push('/goals')">
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10 19H5a2 2 0 01-2-2V7a2 2 0 012-2h5m7 10l5-5m0 0l-5-5m5 5H9" />
        </svg>
        Voltar
      </Button>
    </div>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <!-- Formulário -->
      <Card :title="isEditing ? 'Dados da meta' : 'Dados da nova meta'" padding="lg" class="lg:col-span-2">
        <form class="space-y-5" @submit.prevent="onSubmit">
          <Input
            v-model="form.name"
            id="goal-name"
            label="Nome da meta"
            placeholder="Ex: Fundo de emergência, Quitar dívida do carro"
            required
            autocomplete="off"
            :error="errors.name"
          />

          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label for="goal-type" class="label">Objetivo</label>
              <Select
                v-model="form.type"
                id="goal-type"
                :options="goalTypeOptions"
                placeholder="Selecione o objetivo"
                required
                :error="errors.type"
              />
              <p class="mt-1.5 text-xs text-[var(--color-fg-subtle)]">
                Poupança, Quitar dívida, Investimento, Fundo de emergência ou Personalizada.
              </p>
            </div>

            <Select
              v-model="form.currency"
              id="goal-currency"
              label="Moeda"
              :options="currencyOptions"
              placeholder="Selecione a moeda"
              hint="Define como os valores desta meta serão exibidos."
            />
          </div>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              v-model="form.targetAmount"
              id="goal-target-amount"
              label="Valor alvo"
              type="number"
              placeholder="0,00"
              required
              :error="errors.targetAmount"
              hint="Quanto você precisa alcançar para considerar a meta cumprida."
            />

            <Input
              v-model="form.currentAmount"
              id="goal-current-amount"
              label="Valor atual"
              type="number"
              placeholder="0,00"
              :error="errors.currentAmount"
              hint="Quanto já está guardado para esta meta."
            />
          </div>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              v-model="form.targetDate"
              id="goal-target-date"
              label="Prazo (opcional)"
              type="date"
              hint="Data-limite para atingir o valor alvo."
            />

            <Select
              v-model="form.accountId"
              id="goal-account"
              label="Conta vinculada (opcional)"
              :options="accountOptions"
              placeholder="Sem conta vinculada"
              hint="Ajuda a lembrar onde o dinheiro da meta está guardado."
            />
          </div>

          <div>
            <label for="goal-description" class="label">Descrição (opcional)</label>
            <textarea
              id="goal-description"
              v-model="form.description"
              rows="3"
              class="input-base bg-[var(--color-bg-elevated)]"
              placeholder="Conte por que esta meta é importante para você..."
            ></textarea>
          </div>

          <div class="flex items-center gap-2">
            <input
              id="goal-active"
              v-model="form.isActive"
              type="checkbox"
              class="h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-brand)] focus:ring-[var(--color-brand)] focus:ring-2"
            />
            <label for="goal-active" class="text-sm text-[var(--color-fg)]">Meta ativa</label>
            <Tooltip content="Metas inativas continuam salvas, mas saem do seu acompanhamento do dia a dia." position="top">
              <span class="inline-flex text-[var(--color-fg-subtle)] hover:text-[var(--color-brand)] cursor-help">
                <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" stroke-width="1.5" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 16v-4M12 8h.01" />
                </svg>
              </span>
            </Tooltip>
          </div>

          <div class="flex flex-wrap justify-end gap-3 border-t border-[var(--color-border)] pt-5">
            <Button variant="ghost" type="button" @click="router.push('/goals')">Cancelar</Button>
            <Button type="submit" :loading="saving">
              {{ isEditing ? "Salvar Meta" : "Criar Meta" }}
            </Button>
          </div>
        </form>
      </Card>

      <!-- Ajuda -->
      <Card title="Como funciona" padding="lg">
        <ul class="space-y-4 text-sm text-[var(--color-fg-muted)]">
          <li class="flex gap-3">
            <span class="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-light)] text-xs font-semibold text-[var(--color-brand)]">1</span>
            <span>Escolha o <strong class="text-[var(--color-fg)]">Objetivo</strong>: Poupança, Quitar dívida, Investimento, Fundo de emergência ou Personalizada.</span>
          </li>
          <li class="flex gap-3">
            <span class="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-light)] text-xs font-semibold text-[var(--color-brand)]">2</span>
            <span>Informe o <strong class="text-[var(--color-fg)]">Valor alvo</strong> e o <strong class="text-[var(--color-fg)]">Valor atual</strong> que você já acumulou.</span>
          </li>
          <li class="flex gap-3">
            <span class="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-light)] text-xs font-semibold text-[var(--color-brand)]">3</span>
            <span>Defina o <strong class="text-[var(--color-fg)]">Prazo</strong> e, se quiser, a conta onde o valor está guardado.</span>
          </li>
          <li class="flex gap-3">
            <span class="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-success-light)] text-xs font-semibold text-[var(--color-success)]">4</span>
            <span>Acompanhe o <strong class="text-[var(--color-fg)]">Progresso</strong> na lista e use <strong class="text-[var(--color-fg)]">Adicionar</strong> para registrar cada aporte.</span>
          </li>
        </ul>
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
  useAccounts,
  useCreateGoal,
  useGoal,
  useUpdateGoal,
} from "../../composables/useApi";
import type { Goal } from "../../composables/useApi";
import { Button, Card, Input, Select, Tooltip } from "../../components/ui";
import { toIsoDateTime } from "../../utils/format";

const route = useRoute();
const router = useRouter();

const goalId = computed(() => {
  const fromParams = route.params.id;
  if (typeof fromParams === "string" && fromParams) return fromParams;
  const fromQuery = route.query.id;
  if (typeof fromQuery === "string" && fromQuery) return fromQuery;
  return "";
});

const isEditing = computed(() => goalId.value !== "");

const goalQuery = useGoal(goalId.value);
const accountsQuery = useAccounts();
const createGoalMutation = useCreateGoal();
const updateGoalMutation = useUpdateGoal();

const saving = ref(false);
const submitError = ref("");

const form = reactive({
  name: "",
  type: "SAVINGS",
  targetAmount: "",
  currentAmount: "",
  currency: "BRL",
  targetDate: "",
  accountId: "",
  description: "",
  isActive: true,
});

const errors = reactive({
  name: "",
  type: "",
  targetAmount: "",
  currentAmount: "",
});

const goalTypeOptions = [
  { value: "SAVINGS", label: "Poupança" },
  { value: "DEBT_PAYOFF", label: "Quitar dívida" },
  { value: "INVESTMENT", label: "Investimento" },
  { value: "EMERGENCY_FUND", label: "Fundo de emergência" },
  { value: "CUSTOM", label: "Personalizada" },
];

const currencyOptions = [
  { value: "BRL", label: "BRL - Real brasileiro" },
  { value: "USD", label: "USD - Dólar americano" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "GBP", label: "GBP - Libra esterlina" },
];

const accountOptions = computed(() => [
  { value: "", label: "Sem conta vinculada" },
  ...(accountsQuery.data.value ?? []).map((account) => ({
    value: account.id,
    label: `${account.name} (${account.currency})`,
  })),
]);

function toDateInput(value?: string | null): string {
  if (!value) return "";
  return value.slice(0, 10);
}

function applyGoal(goal: Goal) {
  form.name = goal.name ?? "";
  form.type = goal.type ?? "SAVINGS";
  form.targetAmount = String(goal.targetAmount ?? "");
  form.currentAmount = String(goal.currentAmount ?? "");
  form.currency = goal.currency || "BRL";
  form.targetDate = toDateInput(goal.targetDate);
  form.accountId = goal.accountId ?? "";
  form.description = goal.description ?? "";
  form.isActive = goal.isActive !== false;
}

watch(
  () => goalQuery.data.value,
  (goal) => {
    if (goal) applyGoal(goal);
  },
  { immediate: true }
);

function validateForm(): boolean {
  errors.name = form.name.trim() ? "" : "Informe o nome da meta";
  errors.type = form.type ? "" : "Selecione o objetivo";
  errors.targetAmount =
    Number(form.targetAmount) > 0 ? "" : "O valor alvo deve ser maior que zero";
  errors.currentAmount =
    form.currentAmount === "" || Number(form.currentAmount) >= 0
      ? ""
      : "O valor atual não pode ser negativo";
  return !errors.name && !errors.type && !errors.targetAmount && !errors.currentAmount;
}

function toPayload(): Partial<Goal> {
  return {
    name: form.name.trim(),
    type: form.type,
    targetAmount: Number(form.targetAmount),
    currentAmount: form.currentAmount === "" ? 0 : Number(form.currentAmount),
    currency: form.currency,
    targetDate: toIsoDateTime(form.targetDate),
    accountId: form.accountId || undefined,
    description: form.description.trim() || undefined,
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
      await updateGoalMutation.mutateAsync({ id: goalId.value, data: payload });
    } else {
      await createGoalMutation.mutateAsync(payload);
    }
    router.push("/goals");
  } catch (error) {
    submitError.value =
      "Não foi possível salvar a meta: " + ((error as Error)?.message || "tente novamente.");
  } finally {
    saving.value = false;
  }
}
</script>