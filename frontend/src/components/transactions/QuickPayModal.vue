<template>
  <Modal
    v-model="open"
    title="Pagar esta compra"
    :description="purchase ? `${purchase.description} · ${formatCurrency(purchase.amount, purchase.currency, locale)}` : ''"
    @update:model-value="$emit('update:open', $event)"
  >
    <div v-if="purchase" class="space-y-5">
      <div class="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-muted)] p-4">
        <div class="flex items-center gap-3">
          <span
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
            :style="purchaseStyle"
          >
            <AppIcon :name="purchase.icon || 'inbox'" :size="19" :stroke-width="2" />
          </span>
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium text-[var(--color-fg)]">{{ purchase.description }}</p>
            <p class="truncate text-xs text-[var(--color-fg-muted)]">
              {{ cardName }} · {{ formatDate(purchase.date, locale) }}
            </p>
          </div>
          <p class="shrink-0 text-base font-semibold tabular-nums text-[var(--color-fg)]">
            {{ formatCurrency(purchase.amount, purchase.currency, locale) }}
          </p>
        </div>
      </div>

      <Select
        id="quickpay-from-account"
        v-model="fromAccountId"
        label="Pagar com"
        :options="sourceOptions"
        placeholder="Escolha a conta de origem"
        :error="errors.account"
        hint="O valor sai desta conta e reduz a dívida do cartão."
      />

      <div>
        <label for="quickpay-date" class="label">Data do pagamento</label>
        <input id="quickpay-date" v-model="paidAt" type="date" class="input-base" :max="today" />
      </div>

      <p v-if="warning" class="text-xs text-[var(--color-warning)]">{{ warning }}</p>

      <div
        v-if="submitError"
        class="flex items-start gap-2 rounded-lg border border-[var(--color-danger-muted)] bg-[var(--color-danger-light)] p-3 text-sm text-[var(--color-danger)]"
        role="alert"
      >
        <AppIcon name="alert" :size="16" class="mt-0.5 shrink-0" />
        <span>{{ submitError }}</span>
      </div>

      <p class="text-xs text-[var(--color-fg-muted)]">
        Esta compra entra como paga na fatura que a contém. Se quiser quitar a fatura inteira,
        use a tela de Faturas.
      </p>
    </div>

    <template #footer>
      <Button variant="ghost" @click="open = false">Cancelar</Button>
      <Button :loading="paying" @click="submit">
        <AppIcon name="check" :size="16" :stroke-width="2.4" />
        Pagar
      </Button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { AppIcon, Button, Modal, Select } from "../ui";
import { useAccounts, usePayTransaction, type Transaction } from "../../composables/useApi";
import { usePreferences } from "../../composables/usePreferences";
import { useToast } from "../../composables/useToast";
import { friendlyApiError } from "../../utils/api-error";
import { formatCurrency, formatDate, startOfDayIso } from "../../utils/format";
import { expenseColorByHex } from "../../utils/palette";

const props = defineProps<{ open: boolean; purchase: Transaction | null }>();
const emit = defineEmits<{ "update:open": [value: boolean]; paid: [transaction: Transaction] }>();

const { preferences } = usePreferences();
const locale = computed(() => preferences.value.locale);

const accountsQuery = useAccounts();
const payMutation = usePayTransaction();
const toast = useToast();

const open = computed({
  get: () => props.open,
  set: (value) => emit("update:open", value),
});

const paying = ref(false);
const submitError = ref("");
const fromAccountId = ref("");
const paidAt = ref(startOfDayIso(new Date().toISOString().slice(0, 10)));

const errors = reactive({ account: "" });

const today = new Date().toISOString().slice(0, 10);

const cardName = computed(
  () => props.purchase?.account?.name || "Cartão de crédito"
);

const purchaseStyle = computed(() => {
  const color = expenseColorByHex(props.purchase?.color);
  return {
    backgroundColor: color?.soft ?? "var(--color-bg-muted)",
    color: color?.ink ?? "var(--color-fg-subtle)",
  };
});

const sourceOptions = computed(() =>
  (accountsQuery.data.value ?? [])
    .filter((account) => account.isActive && account.id !== props.purchase?.accountId)
    .map((account) => ({
      value: account.id,
      label: `${account.name} · ${formatCurrency(account.balance, account.currency, locale.value)}`,
    }))
);

const warning = computed(() => {
  if (!fromAccountId.value || !props.purchase) return "";
  const source = (accountsQuery.data.value ?? []).find((a) => a.id === fromAccountId.value);
  if (!source || Number(source.balance) >= Number(props.purchase.amount)) return "";
  return `A conta ${source.name} não cobe a compra inteira e vai ficar negativa.`;
});

watch(
  () => [props.open, props.purchase?.id] as const,
  ([isOpen]) => {
    if (!isOpen) return;
    submitError.value = "";
    errors.account = "";
    paidAt.value = startOfDayIso(new Date().toISOString().slice(0, 10));

    const preferred = sourceOptions.value.find((option) =>
      (accountsQuery.data.value ?? []).find((a) => a.id === option.value)?.isDefault
    );
    fromAccountId.value = preferred?.value ?? sourceOptions.value[0]?.value ?? "";
  }
);

async function submit() {
  if (!props.purchase) return;

  submitError.value = "";
  errors.account = fromAccountId.value ? "" : "Escolha a conta que paga";

  if (!fromAccountId.value) return;

  paying.value = true;
  try {
    await payMutation.mutateAsync({
      id: props.purchase.id,
      data: { fromAccountId: fromAccountId.value, paidAt: startOfDayIso(paidAt.value) },
    });

    toast.success(`"${props.purchase.description}" foi paga.`, "Compra quitada");
    emit("paid", props.purchase);
    open.value = false;
  } catch (error) {
    submitError.value = friendlyApiError(error, "Não foi possível pagar esta compra.");
  } finally {
    paying.value = false;
  }
}
</script>