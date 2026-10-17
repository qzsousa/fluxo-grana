<template>
  <div class="space-y-6 stagger-in">
    <!-- Page header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="flex items-start gap-3">
        <Button variant="ghost" size="icon" aria-label="Voltar para Recorrentes" @click="router.push('/recurring')">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Button>
        <div>
          <h1 class="font-display text-3xl text-[var(--color-fg)]">
            {{ isEditing ? 'Editar Transação Recorrente' : 'Nova Transação Recorrente' }}
          </h1>
          <p class="mt-1 text-[var(--color-fg-muted)]">
            Defina a regra uma única vez e o sistema cria as transações na data de cada vencimento.
          </p>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <Card v-if="isLoading" padding="md">
      <div class="space-y-5">
        <div class="h-4 w-32 skeleton skeleton-text"></div>
        <div class="h-11 w-full skeleton rounded-lg"></div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div class="h-11 w-full skeleton rounded-lg"></div>
          <div class="h-11 w-full skeleton rounded-lg"></div>
        </div>
      </div>
    </Card>

    <!-- Form -->
    <Card v-else>
      <form class="space-y-6" @submit.prevent="onSubmit">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div class="lg:col-span-2">
            <Input
              v-model="form.description"
              id="rec-description"
              label="Descrição *"
              placeholder="Ex.: Netflix, Aluguel, Salário"
              required
              :error="errors.description"
              :icon="{
                viewBox: '0 0 24 24',
                stroke: 'currentColor',
                path: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
                strokeWidth: 1.8,
              }"
            />
          </div>

          <Input
            v-model="form.amount"
            id="rec-amount"
            label="Valor *"
            type="number"
            placeholder="0,00"
            required
            :error="errors.amount"
            :hint="`Valor da recorrência em ${currency}. Use um número positivo.`"
          />

          <Select
            v-model="form.type"
            id="rec-type"
            label="O que se repete?"
            :options="transactionTypes"
            required
            :error="errors.type"
            :hint="transactionTypeInfo(form.type)?.explain"
          />

          <div>
            <label for="rec-start-date" class="label">Data de início *</label>
            <input
              id="rec-start-date"
              v-model="form.startDate"
              type="date"
              required
              class="input-base"
              :class="{ error: errors.startDate }"
            />
            <p v-if="errors.startDate" class="error-text" role="alert">
              <svg class="h-3.5 w-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 100 2 1 1 0 000-2z" clip-rule="evenodd" />
              </svg>
              <span>{{ errors.startDate }}</span>
            </p>
            <p v-else class="help-text">Primeira execução da regra.</p>
          </div>

          <Select
            v-model="form.accountId"
            id="rec-account"
            label="Conta *"
            :options="accountOptions"
            placeholder="Selecione a conta"
            required
            :error="errors.accountId"
          />

          <Select
            v-model="form.categoryId"
            id="rec-category"
            label="Categoria"
            :options="categoryOptions"
            placeholder="Selecione (opcional)"
            hint="Ajuda a organizar os lançamentos gerados automaticamente."
          />

          <Select
            v-model="form.frequency"
            id="rec-frequency"
            label="Frequência *"
            :options="frequencyOptions"
            required
            :error="errors.frequency"
            hint="Com que periodicidade a transação é criada."
          />

          <div>
            <label for="rec-end-date" class="label">Data final (opcional)</label>
            <input
              id="rec-end-date"
              v-model="form.endDate"
              type="date"
              class="input-base"
            />
            <p class="help-text">Deixe em branco para repetir indefinidamente.</p>
          </div>

          <div class="lg:col-span-2">
            <label for="rec-notes" class="label">Observações</label>
            <textarea
              id="rec-notes"
              v-model="form.notes"
              rows="3"
              class="input-base resize-y"
              placeholder="Notas sobre esta recorrência..."
            ></textarea>
            <p class="help-text">Campo livre para lembretes, número do contrato, link da fatura etc.</p>
          </div>
        </div>

        <!-- Switches -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="flex items-start gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-muted)] p-4">
            <label for="rec-skip-weekends" class="flex flex-1 cursor-pointer items-start gap-3">
              <input
                id="rec-skip-weekends"
                v-model="form.skipWeekends"
                type="checkbox"
                class="mt-0.5 h-4 w-4 shrink-0 rounded border-[var(--color-border-strong)] accent-[var(--color-brand)]"
              />
              <span>
                <span class="block text-sm font-medium text-[var(--color-fg)]">Pular fins de semana</span>
                <span class="block text-xs text-[var(--color-fg-muted)]">
                  Se o vencimento cair no sábado ou domingo, o lançamento é antecipado para sexta-feira.
                </span>
              </span>
            </label>
            <Tooltip content="Muito útil para folha de pagamento e contas que não são pagas em fins de semana." position="top">
              <span class="cursor-help text-[var(--color-fg-subtle)] hover:text-[var(--color-brand)]" tabindex="0">
                <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" stroke-width="1.5" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 16v-4M12 8h.01" />
                </svg>
              </span>
            </Tooltip>
          </div>

          <label
            for="rec-is-active"
            class="flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-muted)] p-4 transition-colors hover:border-[var(--color-border-strong)]"
          >
            <input
              id="rec-is-active"
              v-model="form.isActive"
              type="checkbox"
              class="mt-0.5 h-4 w-4 shrink-0 rounded border-[var(--color-border-strong)] accent-[var(--color-brand)]"
            />
            <span>
              <span class="block text-sm font-medium text-[var(--color-fg)]">Ativa</span>
              <span class="block text-xs text-[var(--color-fg-muted)]">
                Regras inativas continuam salvas, mas não geram novas transações.
              </span>
            </span>
          </label>
        </div>

        <div
          v-if="submitError"
          class="flex items-start gap-2 rounded-lg border border-[var(--color-danger)] bg-[var(--color-danger-light)] p-3 text-sm text-[var(--color-danger)]"
          role="alert"
        >
          <svg class="h-4 w-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 100 2 1 1 0 000-2z" clip-rule="evenodd" />
          </svg>
          <span>{{ submitError }}</span>
        </div>

        <!-- Actions -->
        <div class="flex flex-col-reverse gap-3 border-t border-[var(--color-border)] pt-5 sm:flex-row sm:justify-end">
          <Button variant="ghost" @click="router.push('/recurring')">Cancelar</Button>
          <Button type="submit" :loading="saving">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {{ isEditing ? 'Salvar Alterações' : 'Salvar' }}
          </Button>
        </div>
      </form>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  useAccounts,
  useCategories,
  useCreateRecurring,
  useRecurringTransaction,
  useUpdateRecurring,
} from "../../composables/useApi";
import type { RecurringTransaction } from "../../composables/useApi";
import { toIsoDateTime } from "../../utils/format";
import { ALL_TRANSACTION_TYPES, transactionTypeInfo } from "../../utils/transaction-types";
import { Button, Card, Input, Select, Tooltip } from "../../components/ui";

const route = useRoute();
const router = useRouter();

const isEditing = computed(() => route.params.id !== undefined);
const recurringId = computed(() => (route.params.id as string) ?? "");

// Queries
const accountsQuery = useAccounts();
const categoriesQuery = useCategories();
const detailQuery = useRecurringTransaction(recurringId.value);

// Mutations
const { mutateAsync: createRecurring } = useCreateRecurring();
const { mutateAsync: updateRecurring } = useUpdateRecurring();

const isLoading = computed(() => isEditing.value && detailQuery.isLoading.value);
const currency = computed(() => accountsQuery.data.value?.[0]?.currency || "BRL");

const saving = ref(false);
const submitError = ref("");

const form = reactive({
  description: "",
  amount: "",
  type: "EXPENSE",
  startDate: new Date().toISOString().slice(0, 10),
  accountId: "",
  categoryId: "",
  frequency: "MONTHLY",
  endDate: "",
  skipWeekends: false,
  notes: "",
  isActive: true,
});

const errors = reactive({
  description: "",
  amount: "",
  type: "",
  startDate: "",
  accountId: "",
  frequency: "",
});

// Recorrência é despesa, receita ou transferência — os tipos de investimento
// não fazem sentido aqui porque não se repetem sozinhos.
const transactionTypes = ALL_TRANSACTION_TYPES.filter((type) =>
  ["EXPENSE", "INCOME", "TRANSFER"].includes(type.value)
).map((type) => ({ value: type.value, label: `${type.label} — ${type.hint.toLowerCase()}` }));

const frequencyOptions = [
  { value: "DAILY", label: "Diária" },
  { value: "WEEKLY", label: "Semanal" },
  { value: "BIWEEKLY", label: "Quinzenal" },
  { value: "MONTHLY", label: "Mensal" },
  { value: "QUARTERLY", label: "Trimestral" },
  { value: "YEARLY", label: "Anual" },
  { value: "CUSTOM", label: "Personalizada" },
];

const accountOptions = computed(() =>
  (accountsQuery.data.value ?? []).map((acc) => ({
    value: acc.id,
    label: `${acc.name} (${acc.currency})`,
  }))
);

const categoryOptions = computed(() =>
  (categoriesQuery.data.value ?? []).map((cat) => ({
    value: cat.id,
    label: cat.name,
  }))
);

watch(
  detailQuery.data,
  (rec) => {
    if (!rec) return;
    form.description = rec.description ?? "";
    form.amount = rec.amount != null ? String(rec.amount) : "";
    form.type = rec.type || "EXPENSE";
    form.startDate = (rec.startDate || "").slice(0, 10) || form.startDate;
    form.accountId = rec.accountId || "";
    form.categoryId = rec.categoryId || "";
    form.frequency = rec.frequency || "MONTHLY";
    form.endDate = (rec.endDate || "").slice(0, 10);
    form.skipWeekends = !!rec.skipWeekends;
    form.isActive = rec.isActive !== false;
  },
  { immediate: true }
);

function validateForm(): boolean {
  errors.description = form.description.trim() ? "" : "Informe a descrição";
  errors.amount = Number(form.amount) > 0 ? "" : "O valor deve ser maior que zero";
  errors.type = form.type ? "" : "Selecione o tipo";
  errors.startDate = form.startDate ? "" : "Informe a data de início";
  errors.accountId = form.accountId ? "" : "Selecione a conta";
  errors.frequency = form.frequency ? "" : "Selecione a frequência";

  if (form.endDate && form.startDate && form.endDate < form.startDate) {
    errors.startDate = "A data final não pode ser anterior à data de início";
  }

  return !errors.description && !errors.amount && !errors.type && !errors.startDate && !errors.accountId && !errors.frequency;
}

async function onSubmit() {
  submitError.value = "";
  if (!validateForm()) return;

  const payload: Partial<RecurringTransaction> & { notes?: string } = {
    description: form.description.trim(),
    amount: Number(form.amount),
    type: form.type,
    startDate: toIsoDateTime(form.startDate),
    accountId: form.accountId,
    categoryId: form.categoryId || undefined,
    frequency: form.frequency,
    endDate: form.endDate ? toIsoDateTime(form.endDate) : undefined,
    skipWeekends: form.skipWeekends,
    isActive: form.isActive,
    notes: form.notes.trim() || undefined,
  };

  saving.value = true;
  try {
    if (isEditing.value) {
      await updateRecurring({ id: recurringId.value, data: payload });
    } else {
      await createRecurring(payload);
    }
    router.push("/recurring");
  } catch (e: any) {
    submitError.value =
      e?.response?.data?.error ||
      "Não foi possível salvar a transação recorrente. Verifique os campos e tente novamente.";
  } finally {
    saving.value = false;
  }
}
</script>
