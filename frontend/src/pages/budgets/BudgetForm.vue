<template>
  <form @submit.prevent="onSubmit" class="space-y-5">
    <Input
      v-model="form.name"
      id="budget-name"
      label="Nome do orçamento"
      type="text"
      required
      autocomplete="off"
      placeholder="Ex: Supermercado Mensal"
      :error="errors.name"
    />

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Select
        v-model="form.period"
        id="budget-period"
        label="Período"
        :options="periodOptions"
        required
        :error="errors.period"
      />

      <Input
        v-model="form.startDate"
        id="budget-start-date"
        label="Data de início"
        type="date"
        required
        :error="errors.startDate"
      />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Input
        v-model="form.endDate"
        id="budget-end-date"
        label="Data de fim (opcional)"
        type="date"
      />

      <Input
        v-model.number="form.amount"
        id="budget-amount"
        label="Valor do orçamento"
        type="number"
        step="0.01"
        min="0.01"
        required
        placeholder="0,00"
        :error="errors.amount"
      />
    </div>

    <Select
      v-model="form.currency"
      id="budget-currency"
      label="Moeda"
      :options="currencyOptions"
      :error="errors.currency"
    />

    <div>
      <label for="budget-categories" class="label">Categorias</label>
      <Select
        id="budget-categories"
        v-model="form.categoryIds"
        :options="categoryOptions"
        multiple
        :error="errors.categoryIds"
        class="min-h-[120px]"
      />
      <p class="mt-1 text-xs text-[var(--color-fg-muted)]">Segure Ctrl/Cmd para selecionar múltiplas</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label for="budget-alert" class="label">Alerta em (%)</label>
        <Input
          id="budget-alert"
          v-model.number="form.alertAt"
          type="number"
          min="1"
          max="100"
          class="w-full"
        />
        <p class="mt-1 text-xs text-[var(--color-fg-muted)]">Notificar quando atingir esta porcentagem</p>
      </div>
    </div>

    <div class="flex items-center">
      <input
        id="budget-active"
        v-model="form.isActive"
        type="checkbox"
        class="h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-brand)] focus:ring-[var(--color-brand)] focus:ring-2"
      />
      <label for="budget-active" class="ml-2 text-sm text-[var(--color-fg)]">Ativo</label>
    </div>

    <div class="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
      <Button type="button" variant="ghost" @click="$emit('cancel')">Cancelar</Button>
      <Button type="submit" :loading="saving">{{ isEditing ? 'Atualizar Orçamento' : 'Criar Orçamento' }}</Button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useBudgets, useCreateBudget, useUpdateBudget, useCategories } from "../../composables/useApi";
import { Button, Input, Select } from "../../components/ui";

const route = useRoute();
const router = useRouter();
const isEditing = computed(() => route.params.id !== undefined);
const budgetId = route.params.id as string;

const { data: categoriesData } = useCategories();
const { mutateAsync: createBudget } = useCreateBudget();
const { mutateAsync: updateBudget } = useUpdateBudget();

const saving = ref(false);

const form = ref({
  name: "",
  period: "MONTHLY",
  startDate: new Date().toISOString().split("T")[0],
  endDate: "",
  amount: 0,
  currency: "BRL",
  categoryIds: [],
  alertAt: 80,
  isActive: true,
});

const errors = ref({
  name: "",
  period: "",
  startDate: "",
  amount: "",
  currency: "",
  categoryIds: "",
});

const periodOptions = [
  { value: "MONTHLY", label: "Mensal" },
  { value: "QUARTERLY", label: "Trimestral" },
  { value: "YEARLY", label: "Anual" },
  { value: "CUSTOM", label: "Personalizado" },
];

const currencyOptions = [
  { value: "BRL", label: "BRL - Real Brasileiro" },
  { value: "USD", label: "USD - Dólar Americano" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "GBP", label: "GBP - Libra Esterlina" },
];

const categoryOptions = computed(() =>
  (categoriesData.value || []).map((cat) => ({ value: cat.id, label: `${cat.icon} ${cat.name}` }))
);

function validateForm(): boolean {
  let valid = true;
  errors.value.name = form.value.name.trim() ? "" : "Nome é obrigatório";
  errors.value.period = form.value.period ? "" : "Selecione um período";
  errors.value.startDate = form.value.startDate ? "" : "Data de início é obrigatória";
  errors.value.amount = form.value.amount && form.value.amount > 0 ? "" : "Valor deve ser maior que zero";
  errors.value.currency = form.value.currency ? "" : "Selecione uma moeda";
  errors.value.categoryIds = form.value.categoryIds.length > 0 ? "" : "Selecione pelo menos uma categoria";
  valid = !Object.values(errors.value).some((e) => e);
  return valid;
}

async function onSubmit() {
  if (!validateForm()) return;
  saving.value = true;
  try {
    if (isEditing.value) {
      await updateBudget({ id: budgetId, data: form.value });
    } else {
      await createBudget(form.value);
    }
    $emit("saved");
  } catch (error) {
    alert("Falha ao salvar orçamento: " + (error as Error).message);
  } finally {
    saving.value = false;
  }
}

onMounted(async () => {
  if (isEditing.value) {
    try {
      const response = await fetch(`/api/v1/budgets/${budgetId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        form.value = { ...form.value, ...data.budget };
      }
    } catch (error) {
      console.error("Failed to load budget:", error);
    }
  }
});

defineEmits<{ saved: []; cancel: [] }>();
</script>