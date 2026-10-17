<template>
  <Modal
    :model-value="open"
    :title="invoice ? `Pagar fatura de ${referenceLabel(invoice.reference)}` : 'Pagar fatura'"
    :description="invoice ? `${invoice.account.name} · vence em ${formatDate(invoice.dueDate, locale)}` : ''"
    @update:model-value="$emit('update:open', $event)"
  >
    <div v-if="invoice" class="space-y-5">
      <div class="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-muted)] p-4">
        <p class="text-xs font-medium text-[var(--color-fg-muted)]">Total da fatura</p>
        <p class="mt-1 text-2xl font-semibold tabular-nums text-[var(--color-fg)]">
          {{ formatCurrency(invoice.total, invoice.account.currency, locale) }}
        </p>
        <p v-if="invoice.paidTotal > 0" class="mt-1 text-xs text-[var(--color-fg-muted)]">
          Já pago: {{ formatCurrency(invoice.paidTotal, invoice.account.currency, locale) }}
        </p>
      </div>

      <Select
        id="pay-from-account"
        v-model="form.fromAccountId"
        label="Pagar com"
        :options="sourceOptions"
        placeholder="Escolha a conta de origem"
        :error="errors.fromAccountId"
        hint="A transferência sai desta conta e reduz a dívida do cartão."
      />

      <Input
        id="pay-amount"
        v-model="form.amount"
        label="Valor"
        type="number"
        step="0.01"
        min="0"
        inputmode="decimal"
        :error="errors.amount"
        :hint="remainingHint"
      />

      <div>
        <label for="pay-date" class="label">Data do pagamento</label>
        <input
          id="pay-date"
          v-model="form.paidAt"
          type="date"
          class="input-base"
          :max="today"
        />
        <p class="help-text">Em dia, use a data de vencimento para não atrasar a fatura.</p>
      </div>

      <div
        v-if="submitError"
        class="flex items-start gap-2 rounded-lg border border-[var(--color-danger-muted)] bg-[var(--color-danger-light)] p-3 text-sm text-[var(--color-danger)]"
        role="alert"
      >
        <AppIcon name="alert" :size="16" class="mt-0.5 shrink-0" />
        <span>{{ submitError }}</span>
      </div>

      <p v-if="sourceWarning" class="text-xs text-[var(--color-warning)]">
        {{ sourceWarning }}
      </p>
    </div>

    <template #footer>
      <Button variant="ghost" @click="$emit('update:open', false)">Cancelar</Button>
      <Button :loading="paying" @click="submit">
        <AppIcon name="check" :size="16" :stroke-width="2.4" />
        Pagar fatura
      </Button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { AppIcon, Button, Input, Modal, Select } from "../ui";
import { useAccounts, usePayInvoice, type Invoice } from "../../composables/useApi";
import { usePreferences } from "../../composables/usePreferences";
import { useToast } from "../../composables/useToast";
import { friendlyApiError } from "../../utils/api-error";
import { formatCurrency, formatDate, startOfDayIso } from "../../utils/format";
import { referenceLabel } from "../../utils/invoices";

const props = defineProps<{ open: boolean; invoice: Invoice | null }>();
const emit = defineEmits<{ "update:open": [value: boolean]; paid: [invoice: Invoice] }>();

const { preferences } = usePreferences();
const locale = computed(() => preferences.value.locale);

const accountsQuery = useAccounts();
const payMutation = usePayInvoice();
const toast = useToast();

const paying = ref(false);
const submitError = ref("");

const form = reactive({
  fromAccountId: "",
  amount: "",
  paidAt: startOfDayIso(new Date().toISOString().slice(0, 10)),
});

const errors = reactive({ fromAccountId: "", amount: "" });

const today = new Date().toISOString().slice(0, 10);

// O cartão não pode ser a origem: a transferência viraria um laço.
const sourceOptions = computed(() =>
  (accountsQuery.data.value ?? [])
    .filter((account) => account.isActive && account.id !== props.invoice?.account.id)
    .map((account) => ({
      value: account.id,
      label: `${account.name} · ${formatCurrency(account.balance, account.currency, locale.value)}`,
    }))
);

const remainingHint = computed(() => {
  if (!props.invoice) return "";
  const value = Number(form.amount || props.invoice.remaining);
  const remaining = props.invoice.remaining;
  if (value === remaining) return `Paga o valor total em aberto.`;
  if (value > remaining) {
    return `Acima do saldo em aberto (${formatCurrency(remaining, props.invoice.account.currency, locale.value)}).`;
  }
  return `Ainda restam ${formatCurrency(remaining - value, props.invoice.account.currency, locale.value)} depois deste pagamento.`;
});

const sourceWarning = computed(() => {
  if (!form.fromAccountId || !props.invoice) return "";
  const source = (accountsQuery.data.value ?? []).find((account) => account.id === form.fromAccountId);
  if (!source) return "";

  const value = Number(form.amount || props.invoice.remaining);
  if (Number(source.balance) >= value) return "";

  return `A conta ${source.name} tem saldo ${formatCurrency(source.balance, source.currency, locale.value)}. O pagamento vai deixá-la negativa.`;
});

function reset() {
  submitError.value = "";
  errors.fromAccountId = "";
  errors.amount = "";

  const preferred = sourceOptions.value.find((option) => {
    const account = (accountsQuery.data.value ?? []).find((item) => item.id === option.value);
    return account?.isDefault;
  });

  form.fromAccountId = preferred?.value ?? sourceOptions.value[0]?.value ?? "";
  form.amount = props.invoice ? String(props.invoice.remaining) : "";
  form.paidAt = startOfDayIso(new Date().toISOString().slice(0, 10));
}

// Reabrir o modal para outra fatura tem que recarregar os valores.
watch(
  () => [props.open, props.invoice?.id] as const,
  ([open]) => {
    if (open) reset();
  }
);

watch(
  () => sourceOptions.value.length,
  () => {
    if (props.open && !form.fromAccountId) reset();
  }
);

function validate(): boolean {
  errors.fromAccountId = form.fromAccountId ? "" : "Escolha a conta que vai pagar";
  errors.amount = "";

  const value = Number(form.amount);
  if (!form.amount || !Number.isFinite(value) || value <= 0) {
    errors.amount = "Informe um valor maior que zero";
  }

  return !Object.values(errors).some(Boolean);
}

async function submit() {
  if (!props.invoice?.id) return;

  submitError.value = "";
  if (!validate()) return;

  paying.value = true;
  try {
    await payMutation.mutateAsync({
      id: props.invoice.id,
      data: {
        amount: Number(form.amount),
        fromAccountId: form.fromAccountId,
        paidAt: startOfDayIso(form.paidAt),
      },
    });

    toast.success(
      `Fatura de ${referenceLabel(props.invoice.reference)} paga.`,
      "Pagamento registrado"
    );
    emit("paid", props.invoice);
    emit("update:open", false);
  } catch (error) {
    submitError.value = friendlyApiError(error, "Não foi possível pagar a fatura.");
  } finally {
    paying.value = false;
  }
}
</script>
