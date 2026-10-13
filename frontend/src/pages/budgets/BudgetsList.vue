<template>
  <div class="space-y-6 stagger-in">
    <!-- Page header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="font-display text-3xl text-[var(--color-fg)]">Orçamentos</h1>
        <p class="mt-1 text-[var(--color-fg-muted)]">Acompanhe seus limites de gastos por categoria</p>
      </div>
      <Button @click="showAddForm = true">
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Novo Orçamento
      </Button>
    </div>

    <!-- Budgets List -->
    <Card title="Orçamentos" padding="none" v-if="budgets.length > 0">
      <template #header-actions>
        <router-link to="/budgets/new" class="link text-sm font-medium">Novo Orçamento</router-link>
      </template>
      <div class="divide-y divide-[var(--color-border)]">
        <div
          v-for="budget in budgets"
          :key="budget.id"
          class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 py-4 hover:bg-[var(--color-bg-muted)] transition-colors"
        >
          <div class="min-w-0 flex-1">
            <p class="font-medium text-[var(--color-fg)] truncate">{{ budget.name }}</p>
            <p class="text-sm text-[var(--color-fg-muted)]">
              {{ periodLabel(budget.period) }} · {{ formatCurrency(budget.amount, budget.currency) }}
              <span v-if="budget.alertAt" class="mx-2">· Alerta em {{ budget.alertAt }}%</span>
            </p>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <span
              class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
              :class="budget.isActive ? 'bg-[var(--color-success-light)] text-[var(--color-success)]' : 'bg-[var(--color-fg-muted)] text-[var(--color-fg-subtle)]'"
            >
              {{ budget.isActive ? 'Ativo' : 'Inativo' }}
            </span>
            <router-link :to="`/budgets/${budget.id}`" class="btn-ghost btn-sm">Ver Detalhes</router-link>
          </div>
        </div>
      </div>
    </Card>

    <!-- Empty State -->
    <Card v-else padding="lg" class="text-center">
      <EmptyState
        icon="chart"
        title="Nenhum orçamento criado"
        description="Defina limites de gastos por categoria para controlar melhor suas finanças."
        :action="{ label: 'Criar Orçamento', onClick: () => showAddForm.value = true }"
      />
    </Card>

    <!-- Add Budget Modal -->
    <Modal v-model="showAddForm" title="Novo Orçamento" description="Defina um limite de gastos para uma ou mais categorias.">
      <BudgetForm @saved="showAddForm = false" />
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useBudgets } from "../../composables/useApi";
import { formatCurrency } from "../../utils/format";
import { Button, Card, EmptyState, Modal } from "../../components/ui";
import BudgetForm from "./BudgetForm.vue";

const router = useRouter();
const budgetsQuery = useBudgets();

const budgets = computed(() => budgetsQuery.data.value ?? []);
const showAddForm = ref(false);

function periodLabel(period: string): string {
  const labels: Record<string, string> = {
    MONTHLY: "Mensal",
    QUARTERLY: "Trimestral",
    YEARLY: "Anual",
    CUSTOM: "Personalizado",
  };
  return labels[period] || period;
}
</script>