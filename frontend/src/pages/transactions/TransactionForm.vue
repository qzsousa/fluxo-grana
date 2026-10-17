<template>
  <div class="space-y-6 stagger-in">
    <!-- Page header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="font-display text-3xl text-[var(--color-fg)]">
          {{ isEditing ? 'Editar transação' : 'Nova transação' }}
        </h1>
        <p class="mt-1 text-[var(--color-fg-muted)]">
          {{ isEditing
            ? 'Atualize os dados desta movimentação financeira'
            : 'Registre uma movimentação nas suas contas' }}
        </p>
      </div>
      <Button variant="ghost" @click="router.push('/transactions')">
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l7-7m0 0l-7-7m7 7H3" />
        </svg>
        Cancelar
      </Button>
    </div>

    <Card padding="lg">
      <form class="space-y-6" @submit.prevent="onSubmit">
        <Input
          id="tx-description"
          v-model="form.description"
          label="Descrição"
          placeholder="Ex: Supermercado, Salário, Uber"
          required
          :error="errors.description"
        />

        <!-- Primeiro: o que está acontecendo. O resto do form se adapta aqui. -->
        <TransactionTypePicker id="tx-type" v-model="form.type" />

        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Input
            id="tx-amount"
            v-model="form.amount"
            :label="amountLabel"
            type="number"
            step="0.01"
            min="0.01"
            inputmode="decimal"
            placeholder="0,00"
            required
            :error="errors.amount"
            :hint="amountHint"
          />

          <div>
            <label for="tx-date" class="label">{{ isTransfer ? "Data da transferência" : "Data" }}</label>
            <input
              id="tx-date"
              v-model="form.date"
              type="date"
              class="input-base"
              :class="{ error: errors.date }"
              required
            />
            <p v-if="errors.date" class="error-text">{{ errors.date }}</p>
            <p v-else-if="isTransfer" class="help-text">
              Costuma ser a mesma da outra conta, para os dois saldos baterem.
            </p>
          </div>
        </div>

        <!-- Destino só existe em transferência; esconder reduz a confusão. -->
        <div v-if="isTransfer" class="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Select
            id="tx-account"
            v-model="form.accountId"
            label="Sai desta conta"
            :options="accountOptions"
            placeholder="Selecione a conta de origem"
            required
            :error="errors.accountId"
          />

          <Select
            id="tx-to-account"
            v-model="form.toAccountId"
            label="Entra nesta conta"
            :options="toAccountOptions"
            placeholder="Selecione a conta de destino"
            required
            :error="errors.toAccountId"
            hint="O dinheiro vai de uma para a outra; o total não muda."
          />
        </div>

        <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Select
            id="tx-account"
            v-model="form.accountId"
            label="Conta"
            :options="accountOptions"
            placeholder="Selecione a conta"
            required
            :error="errors.accountId"
            :hint="accountHint"
          />
        </div>

        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Select
            id="tx-category"
            v-model="form.categoryId"
            label="Categoria"
            :options="categoryOptions"
            placeholder="Selecione (opcional)"
          />

          <Input
            id="tx-tags"
            v-model="form.tags"
            label="Etiquetas"
            placeholder="mercado, semanal, essencial"
            hint="Separe as etiquetas por vírgula"
          />
        </div>

        <!-- Só faz sentido identificar entrada e saída; transferência vira
             outro lançamento e não aparece como despesa. -->
        <IconColorPicker
          v-if="isTaggable"
          v-model="look"
          :icons="EXPENSE_ICONS"
        />

        <div>
          <label for="tx-notes" class="label">Observações</label>
          <textarea
            id="tx-notes"
            v-model="form.notes"
            rows="3"
            class="input-base resize-none"
            placeholder="Notas adicionais sobre esta transação..."
          ></textarea>
        </div>

<div
        v-if="form.type === 'EXPENSE' && selectedAccount?.type !== 'CREDIT'"
        class="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-3"
      >
        <label class="flex cursor-pointer items-start gap-3 text-sm">
          <input
            v-model="form.pendingPayment"
            type="checkbox"
            class="mt-0.5 h-4 w-4 cursor-pointer accent-[var(--color-primary)]"
          />
          <span>
            <span class="font-semibold text-[var(--color-fg)]">Ainda não paguei</span>
            <span class="block text-xs text-[var(--color-fg-muted)]">
              O valor fica registrado e aparece na lista, mas só sai da conta quando você clicar em Pagar.
            </span>
          </span>
        </label>
      </div>

        <div class="flex justify-end gap-3 border-t border-[var(--color-border)] pt-4">
          <Button variant="ghost" type="button" @click="router.push('/transactions')">Cancelar</Button>
          <Button type="submit" :loading="saving">
            {{ isEditing ? 'Salvar alterações' : 'Salvar transação' }}
          </Button>
        </div>
      </form>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  useCreateTransaction,
  useUpdateTransaction,
  useTransaction,
  useAccounts,
  useCategories,
} from "../../composables/useApi";
import type { Transaction } from "../../composables/useApi";
import { toIsoDateTime } from "../../utils/format";
import { EXPENSE_ICONS, suggestedIcon } from "../../utils/palette";
import { Button, Card, Input, Select } from "../../components/ui";
import IconColorPicker from "../../components/transactions/IconColorPicker.vue";
import TransactionTypePicker from "../../components/transactions/TransactionTypePicker.vue";

const route = useRoute();
const router = useRouter();

const isEditing = computed(() => route.params.id !== undefined);
const transactionId = computed(() => (route.params.id as string) || "");

const createMutation = useCreateTransaction();
const updateMutation = useUpdateTransaction();
const accountsQuery = useAccounts();
const categoriesQuery = useCategories();
const transactionQuery = useTransaction(transactionId.value);

const saving = ref(false);
const submitError = ref("");

const form = reactive({
  description: "",
  amount: "" as string,
  type: "EXPENSE",
  date: new Date().toISOString().slice(0, 10),
  accountId: "",
  toAccountId: "",
  categoryId: "",
  notes: "",
  tags: "",
  pendingPayment: false,
});

const errors = reactive({
  description: "",
  amount: "",
  type: "",
  date: "",
  accountId: "",
  toAccountId: "",
});

// Par ícone/cor que diferencia a despesa na listagem.
const look = ref({ icon: "", color: "" });

const isTransfer = computed(() => form.type === "TRANSFER");

/** Transferência não é despesa: não ganha ícone nem cor própria. */
const isTaggable = computed(() => !isTransfer.value);

const amountLabel = computed(() => {
  if (form.type === "INCOME") return "Quanto entrou";
  if (form.type === "EXPENSE" || form.type === "FEE") return "Quanto custou";
  if (form.type === "TRANSFER") return "Quanto está transferring";
  if (form.type === "INTEREST") return "Quanto rendeu";
  return "Valor";
});

const amountHint = computed(() => {
  if (form.type === "INCOME") return "O valor total que caiu na conta, sem centavos decorados.";
  if (form.type === "TRANSFER") return "O mesmo valor sai de uma conta e entra na outra.";
  return "";
});

/** Avisa quando a conta escolhida é um cartão — a compra vira fatura. */
const selectedAccount = computed(() =>
  (accountsQuery.data.value ?? []).find((a) => a.id === form.accountId)
);

/** Avisa quando a conta escolhida é um cartão — a compra vira fatura. */
const accountHint = computed(() => {
  const account = selectedAccount.value;
  if (account?.type !== "CREDIT") return "";
  return "Cartão: esta compra entra na fatura do período e pode ser paga pela lista.";
});

function applyTransaction(tx: Transaction) {
  form.description = tx.description ?? "";
  form.amount = String(tx.amount ?? 0);
  form.type = tx.type ?? "EXPENSE";
  form.date = (tx.date || "").slice(0, 10);
  form.accountId = tx.accountId ?? tx.account?.id ?? "";
  form.toAccountId = tx.toAccountId ?? tx.toAccount?.id ?? "";
  form.categoryId = tx.categoryId ?? tx.category?.id ?? "";
  form.notes = tx.notes ?? "";
  form.tags = (tx.tags ?? []).join(", ");
  form.pendingPayment = (tx as any).status === "PENDING";
  look.value = { icon: tx.icon ?? "", color: tx.color ?? "" };
}

const accountOptions = computed(() =>
  (accountsQuery.data.value ?? []).map((a) => ({
    value: a.id,
    label: `${a.name} (${a.currency})`,
  }))
);

const toAccountOptions = computed(() =>
  (accountsQuery.data.value ?? [])
    .filter((a) => a.id !== form.accountId)
    .map((a) => ({ value: a.id, label: `${a.name} (${a.currency})` }))
);

const categoryOptions = computed(() =>
  (categoriesQuery.data.value ?? []).map((c) => ({ value: c.id, label: c.name }))
);

watch(
  () => transactionQuery.data.value,
  (tx) => {
    if (!tx) return;
    applyTransaction(tx);
  },
  { immediate: true }
);

// Sugere o ícone pela palavra da descrição enquanto ninguém escolheu um.
// Nunca sobrescreve uma escolha manual.
watch(
  () => form.description,
  (description) => {
    if (look.value.icon) return;
    look.value.icon = suggestedIcon(description || "");
  }
);

function validate(): boolean {
  errors.description = form.description.trim() ? "" : "Descrição é obrigatória";
  errors.amount = Number(form.amount) > 0 ? "" : "O valor deve ser maior que zero";
  errors.type = form.type ? "" : "Selecione um tipo";
  errors.date = form.date ? "" : "Data é obrigatória";
  errors.accountId = form.accountId ? "" : "Selecione uma conta";
  errors.toAccountId =
    isTransfer.value && (!form.toAccountId || form.toAccountId === form.accountId)
      ? "Selecione a conta de destino"
      : "";
  return !Object.values(errors).some(Boolean);
}

async function onSubmit() {
  submitError.value = "";

  if (!validate()) return;

  saving.value = true;
  try {
    const payload = {
      description: form.description.trim(),
      amount: Number(form.amount),
      type: form.type,
      date: toIsoDateTime(form.date),
      accountId: form.accountId,
      toAccountId: isTransfer.value ? form.toAccountId : undefined,
      ...(form.type === "EXPENSE"
        ? { status: form.pendingPayment ? "PENDING" : "CLEARED" }
        : {}),
      categoryId: form.categoryId || undefined,
      notes: form.notes.trim() || undefined,
      icon: look.value.icon || undefined,
      color: look.value.color || undefined,
      tags: form.tags
        ? form.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
    };

    if (isEditing.value) {
      await updateMutation.mutateAsync({ id: transactionId.value, data: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    router.push("/transactions");
  } catch (e: any) {
    submitError.value =
      e?.response?.data?.error || "Não foi possível salvar a transação. Tente novamente.";
  } finally {
    saving.value = false;
  }
}
</script>
