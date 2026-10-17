<template>
  <div class="space-y-6 stagger-in">
    <!-- Page header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="font-display text-3xl text-[var(--color-fg)]">
          {{ isEditing ? 'Editar conta' : 'Nova conta' }}
        </h1>
        <p class="mt-1 text-[var(--color-fg-muted)]">
          {{ isEditing
            ? 'Atualize os dados desta conta bancária'
            : 'Adicione uma conta bancária, carteira ou cartão' }}
        </p>
      </div>
      <Button variant="ghost" @click="router.push('/accounts')">
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l7-7m0 0l-7-7m7 7H3" />
        </svg>
        Cancelar
      </Button>
    </div>

    <Card padding="lg">
      <form class="space-y-6" @submit.prevent="onSubmit">
        <Input
          id="account-name"
          v-model="form.name"
          label="Nome da conta"
          placeholder="Ex: Banco do Brasil, Carteira, Cartão Nubank"
          autocomplete="off"
          required
          :error="errors.name"
        />

        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Select
            id="account-type"
            v-model="form.type"
            label="Tipo"
            :options="accountTypes"
            required
            :error="errors.type"
          />

          <Select
            id="account-currency"
            v-model="form.currency"
            label="Moeda"
            :options="currencyOptions"
            :error="errors.currency"
          />
        </div>

        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Input
            id="account-balance"
            v-model="form.initialBalance"
            label="Saldo inicial"
            type="number"
            step="0.01"
            placeholder="0,00"
            :error="errors.initialBalance"
            hint="Valor da conta antes das transações registradas"
          />

          <Input
            id="account-institution"
            v-model="form.institution"
            label="Instituição"
            placeholder="Ex: Banco do Brasil, Nubank, XP"
          />
        </div>

        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label for="account-color" class="label">Cor da conta</label>
            <div class="flex items-center gap-3">
              <input
                id="account-color"
                v-model="form.color"
                type="color"
                class="h-10 w-16 cursor-pointer rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-1"
              />
              <span class="font-mono text-sm text-[var(--color-fg-muted)]">{{ form.color }}</span>
            </div>
          </div>

          <Input
            id="account-icon"
            v-model="form.icon"
            label="Ícone"
            placeholder="🏦 ou account_balance"
          />
        </div>

        <!-- Só cartão tem fechamento, vencimento e limite -->
        <div
          v-if="form.type === 'CREDIT'"
          class="space-y-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-muted)] p-4"
        >
          <div class="flex items-start gap-2.5">
            <span class="mt-0.5 shrink-0 text-[var(--color-brand)]">
              <AppIcon name="creditCard" :size="18" />
            </span>
            <div class="min-w-0">
              <p class="text-sm font-medium text-[var(--color-fg)]">Fechamento e vencimento</p>
              <p class="mt-0.5 text-xs text-[var(--color-fg-muted)]">
                Usamos esses dias para agrupar as compras em faturas e avisar antes do vencimento.
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label for="account-closing-day" class="label">Fecha no dia</label>
              <select
                id="account-closing-day"
                v-model.number="form.closingDay"
                class="input-base"
                :class="{ error: errors.closingDay }"
              >
                <option v-for="day in days" :key="day" :value="day">Dia {{ day }}</option>
              </select>
              <p v-if="errors.closingDay" class="error-text">{{ errors.closingDay }}</p>
            </div>

            <div>
              <label for="account-due-day" class="label">Vence no dia</label>
              <select
                id="account-due-day"
                v-model.number="form.dueDay"
                class="input-base"
                :class="{ error: errors.dueDay }"
              >
                <option v-for="day in days" :key="day" :value="day">Dia {{ day }}</option>
              </select>
              <p v-if="errors.dueDay" class="error-text">{{ errors.dueDay }}</p>
            </div>

            <Input
              id="account-credit-limit"
              v-model="form.creditLimit"
              label="Limite"
              type="number"
              step="0.01"
              min="0"
              inputmode="decimal"
              placeholder="0,00"
              hint="Opcional. Mostra quanto do limite está comprometido."
            />
          </div>

          <p v-if="closingPreview" class="text-xs text-[var(--color-fg-muted)]">
            {{ closingPreview }}
          </p>
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label class="flex cursor-pointer items-center gap-2">
            <input
              id="account-default"
              v-model="form.isDefault"
              type="checkbox"
              class="h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-brand)] focus:ring-[var(--color-brand)] focus:ring-offset-2 transition-colors"
            />
            <span class="text-sm text-[var(--color-fg-muted)]">Conta padrão</span>
          </label>

          <label class="flex cursor-pointer items-center gap-2">
            <input
              id="account-active"
              v-model="form.isActive"
              type="checkbox"
              class="h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-brand)] focus:ring-[var(--color-brand)] focus:ring-offset-2 transition-colors"
            />
            <span class="text-sm text-[var(--color-fg-muted)]">Ativa</span>
          </label>
        </div>

        <div
          v-if="submitError"
          class="rounded-lg border border-[var(--color-danger-muted)] bg-[var(--color-danger-light)] p-3 text-sm text-[var(--color-danger)]"
          role="alert"
        >
          {{ submitError }}
        </div>

        <div class="flex justify-end gap-3 border-t border-[var(--color-border)] pt-4">
          <Button variant="ghost" type="button" @click="router.push('/accounts')">Cancelar</Button>
          <Button type="submit" :loading="saving">
            {{ isEditing ? 'Salvar alterações' : 'Criar conta' }}
          </Button>
        </div>
      </form>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAccount, useCreateAccount, useUpdateAccount } from "../../composables/useApi";
import type { Account } from "../../composables/useApi";
import { AppIcon, Button, Card, Input, Select } from "../../components/ui";

const route = useRoute();
const router = useRouter();

const isEditing = computed(() => route.params.id !== undefined);
const accountId = computed(() => (route.params.id as string) || "");

const createMutation = useCreateAccount();
const updateMutation = useUpdateAccount();
const accountQuery = useAccount(accountId.value);

const saving = ref(false);
const submitError = ref("");

const form = reactive({
  name: "",
  type: "CHECKING",
  currency: "BRL",
  initialBalance: "" as string,
  institution: "",
  color: "#0e6e63",
  icon: "",
  isActive: true,
  isDefault: false,
  closingDay: 25 as number,
  dueDay: 5 as number,
  creditLimit: "" as string,
});

const errors = reactive({
  name: "",
  type: "",
  currency: "",
  initialBalance: "",
  closingDay: "",
  dueDay: "",
});

const days = Array.from({ length: 31 }, (_, index) => index + 1);

const accountTypes = [
  { value: "CHECKING", label: "Conta Corrente" },
  { value: "SAVINGS", label: "Poupança" },
  { value: "CREDIT", label: "Cartão de Crédito" },
  { value: "INVESTMENT", label: "Investimento" },
  { value: "CRYPTO", label: "Criptomoedas" },
  { value: "CASH", label: "Dinheiro" },
  { value: "OTHER", label: "Outro" },
];

const currencyOptions = [
  { value: "BRL", label: "BRL - Real" },
  { value: "USD", label: "USD - Dólar" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "GBP", label: "GBP - Libra" },
];

watch(
  () => accountQuery.data.value,
  (account) => {
    if (!account) return;
    applyAccount(account);
  },
  { immediate: true }
);

function applyAccount(account: Account) {
  form.name = account.name ?? "";
  form.type = account.type ?? "CHECKING";
  form.currency = account.currency ?? "BRL";
  form.initialBalance = String(account.initialBalance ?? 0);
  form.institution = account.institution ?? "";
  form.color = account.color || "#0e6e63";
  form.icon = account.icon ?? "";
  form.isActive = account.isActive ?? true;
  form.isDefault = account.isDefault ?? false;
  form.closingDay = account.closingDay ?? 25;
  form.dueDay = account.dueDay ?? 5;
  form.creditLimit = account.creditLimit ? String(account.creditLimit) : "";
}

/** Frase que mostra ao usuário a fatura que vai sair dos dias escolhidos. */
const closingPreview = computed(() => {
  if (form.type !== "CREDIT") return "";

  const closing = form.closingDay;
  const due = form.dueDay;
  // Mesma regra do backend: vence no mesmo mês do fechamento quando o dia de
  // vencimento é maior que o de fechamento; caso contrário, no mês seguinte.
  const sameMonth = due > closing;

  return sameMonth
    ? `A fatura fecha no dia ${closing} e vence no dia ${due} do mesmo mês.`
    : `A fatura fecha no dia ${closing} e vence no dia ${due} do mês seguinte.`;
});

function validate(): boolean {
  errors.name = form.name.trim() ? "" : "Nome da conta é obrigatório";
  errors.type = form.type ? "" : "Selecione um tipo";
  errors.currency = form.currency ? "" : "Selecione uma moeda";
  errors.initialBalance =
    form.initialBalance === "" || form.initialBalance === null || form.initialBalance === undefined
      ? "Saldo inicial é obrigatório"
      : "";

  errors.closingDay =
    form.type === "CREDIT" && (!form.closingDay || form.closingDay < 1 || form.closingDay > 31)
      ? "Escolha o dia de fechamento"
      : "";
  errors.dueDay =
    form.type === "CREDIT" && (!form.dueDay || form.dueDay < 1 || form.dueDay > 31)
      ? "Escolha o dia de vencimento"
      : "";

  return !Object.values(errors).some(Boolean);
}

async function onSubmit() {
  submitError.value = "";

  if (!validate()) return;

  const isCredit = form.type === "CREDIT";

  const payload = {
    name: form.name.trim(),
    type: form.type,
    currency: form.currency,
    initialBalance: Number(form.initialBalance || 0),
    institution: form.institution.trim() || undefined,
    color: form.color,
    icon: form.icon.trim() || undefined,
    isActive: form.isActive,
    isDefault: form.isDefault,
    // Enviados como null quando não é cartão para o backend limpar os campos.
    closingDay: isCredit ? form.closingDay : null,
    dueDay: isCredit ? form.dueDay : null,
    creditLimit: isCredit && form.creditLimit ? Number(form.creditLimit) : null,
  };

  saving.value = true;
  try {
    if (isEditing.value) {
      await updateMutation.mutateAsync({ id: accountId.value, data: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    router.push("/accounts");
  } catch (e: any) {
    submitError.value = e?.response?.data?.error || "Não foi possível salvar a conta. Tente novamente.";
  } finally {
    saving.value = false;
  }
}
</script>
