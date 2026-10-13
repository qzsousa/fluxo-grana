<template>
  <div class="space-y-6 stagger-in">
    <!-- Page header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="font-display text-3xl text-[var(--color-fg)]">Contas</h1>
        <p class="mt-1 text-[var(--color-fg-muted)]">Gerencie suas contas bancárias, carteiras e cartões</p>
      </div>
      <Button @click="showAddForm = true">
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Nova Conta
      </Button>
    </div>

    <!-- Accounts Grid -->
    <div v-if="accountsQuery.isLoading.value" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card v-for="i in 6" :key="i" padding="md" class="animate-pulse">
        <div class="flex items-center gap-3">
          <div class="h-10 w-10 skeleton rounded-lg"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 w-32 skeleton skeleton-text"></div>
            <div class="h-3 w-16 skeleton skeleton-text"></div>
          </div>
        </div>
        <div class="mt-4 h-8 w-24 skeleton skeleton-text"></div>
      </Card>
    </div>

    <div v-else-if="accounts.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card
        v-for="account in accounts"
        :key="account.id"
        padding="md"
        variant="default"
        interactive
        @click="router.push(`/accounts/${account.id}`)"
      >
        <div class="flex items-center gap-3 mb-3">
          <span class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-brand-light)] text-[var(--color-brand)]">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </span>
          <span class="badge badge-neutral text-xs capitalize">{{ accountTypeLabel(account.type) }}</span>
        </div>
        <h3 class="font-medium text-[var(--color-fg)] truncate">{{ account.name }}</h3>
        <p class="mt-2 font-display text-xl font-normal" :class="account.balance >= 0 ? 'text-[var(--color-fg)]' : 'text-[var(--color-danger)]'">
          {{ formatCurrency(account.balance, account.currency) }}
        </p>
        <p class="mt-1 text-xs text-[var(--color-fg-muted)]">{{ account.institution || 'Sem instituição' }}</p>
      </Card>
    </div>

    <!-- Empty State -->
    <Card v-else padding="lg" class="text-center">
      <EmptyState
        icon="wallet"
        title="Nenhuma conta cadastrada"
        description="Adicione sua primeira conta bancária, carteira digital ou cartão de crédito para começar a organizar suas finanças."
        :action="{ label: 'Adicionar Conta', onClick: () => showAddForm.value = true }"
      />
    </Card>

    <!-- Add Account Modal -->
    <Transition name="modal" appear>
      <div v-if="showAddForm" class="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-4" @click.self="showAddForm = false">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" aria-hidden="true"></div>

        <div class="relative w-full max-w-md bg-[var(--color-bg-elevated)] rounded-2xl shadow-xl animate-scale-in glass border border-[var(--color-border)] overflow-hidden">
          <div class="px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-bg-muted)] flex items-center justify-between">
            <h2 class="font-display text-xl text-[var(--color-fg)]">Nova Conta</h2>
            <button
              type="button"
              class="rounded-lg p-1.5 text-[var(--color-fg-subtle)] hover:text-[var(--color-fg)] hover:bg-[var(--color-border)] transition-colors"
              @click="showAddForm = false"
              aria-label="Fechar"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form @submit.prevent="onSubmit" class="p-6 space-y-5">
            <Input
              v-model="form.name"
              id="account-name"
              label="Nome da conta"
              placeholder="Ex: Banco do Brasil, Carteira, Cartão Nubank"
              required
              autocomplete="off"
              :error="errors.name"
            />

            <Select
              v-model="form.type"
              id="account-type"
              label="Tipo"
              :options="accountTypeOptions"
              placeholder="Selecione o tipo"
              required
              :error="errors.type"
            />

            <Input
              v-model="form.currency"
              id="account-currency"
              label="Moeda"
              type="text"
              placeholder="BRL"
              required
              :error="errors.currency"
            />

            <Input
              v-model.number="form.initialBalance"
              id="account-balance"
              label="Saldo inicial"
              type="number"
              step="0.01"
              placeholder="0,00"
              :error="errors.initialBalance"
            />

            <Input
              v-model="form.institution"
              id="account-institution"
              label="Instituição (opcional)"
              placeholder="Ex: Banco do Brasil, Nubank, XP"
            />

            <div class="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
              <Button variant="ghost" @click="showAddForm = false">Cancelar</Button>
              <Button type="submit" :loading="submitting">Criar Conta</Button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { useRouter } from "vue-router";
import { useAccounts, useCreateAccount } from "../../composables/useApi";
import { formatCurrency } from "../../utils/format";
import { Button, Card, Input, Select, EmptyState } from "../../components/ui";

const router = useRouter();
const accountsQuery = useAccounts();
const createAccountMutation = useCreateAccount();

const accounts = computed(() => accountsQuery.data.value ?? []);
const showAddForm = ref(false);

const form = reactive({
  name: "",
  type: "CHECKING",
  currency: "BRL",
  initialBalance: 0,
  institution: "",
});

const errors = reactive({
  name: "",
  type: "",
  currency: "",
  initialBalance: "",
});

const accountTypeOptions = [
  { value: "CHECKING", label: "Conta Corrente" },
  { value: "SAVINGS", label: "Poupança" },
  { value: "CREDIT", label: "Cartão de Crédito" },
  { value: "INVESTMENT", label: "Investimento" },
  { value: "CRYPTO", label: "Criptomoedas" },
  { value: "CASH", label: "Dinheiro" },
  { value: "OTHER", label: "Outro" },
];

function accountTypeLabel(type: string): string {
  const opt = accountTypeOptions.find((o) => o.value === type);
  return opt?.label || type;
}

function validateForm(): boolean {
  let valid = true;
  errors.name = form.name.trim() ? "" : "Nome é obrigatório";
  errors.type = form.type ? "" : "Selecione um tipo";
  errors.currency = form.currency.trim() ? "" : "Moeda é obrigatória";
  errors.initialBalance = form.initialBalance !== null && form.initialBalance !== undefined ? "" : "Saldo inicial é obrigatório";
  valid = !errors.name && !errors.type && !errors.currency && !errors.initialBalance;
  return valid;
}

async function onSubmit() {
  if (!validateForm()) return;
  try {
    await createAccountMutation.mutateAsync({
      name: form.name,
      type: form.type,
      currency: form.currency,
      initialBalance: form.initialBalance,
      institution: form.institution || undefined,
    });
    showAddForm.value = false;
    form.name = "";
    form.type = "CHECKING";
    form.currency = "BRL";
    form.initialBalance = 0;
    form.institution = "";
  } catch (e) {
    console.error("Failed to add account:", e);
  }
}

// Use useAccounts mutation instead of direct api call
// The form submit will be handled by the mutation in the composable
</script>