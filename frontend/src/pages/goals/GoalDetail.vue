<template>
  <div class="space-y-6 stagger-in">
    <!-- Page header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="min-w-0">
        <router-link to="/goals" class="link text-sm font-medium">Metas</router-link>
        <h1 class="mt-1 truncate font-display text-3xl text-[var(--color-fg)]">
          {{ goal ? goal.name : "Meta" }}
        </h1>
        <p class="mt-1 text-[var(--color-fg-muted)]">
          Detalhes do objetivo, do prazo e do quanto você já acumulou.
        </p>
      </div>
      <div class="flex flex-wrap gap-3">
        <Button variant="outline" @click="router.push('/goals')">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10 19H5a2 2 0 01-2-2V7a2 2 0 012-2h5m7 10l5-5m0 0l-5-5m5 5H9" />
          </svg>
          Voltar
        </Button>
        <Button v-if="goal" @click="openContribute">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Adicionar
        </Button>
      </div>
    </div>

    <!-- Loading -->
    <Card v-if="isLoading" padding="lg">
      <div class="space-y-4">
        <div class="h-8 w-64 skeleton skeleton-text"></div>
        <div class="h-2 w-full skeleton skeleton-text"></div>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div v-for="i in 3" :key="i" class="h-20 w-full skeleton rounded-xl"></div>
        </div>
      </div>
    </Card>

    <!-- Erro / não encontrado -->
    <Card v-else-if="!goal" padding="lg">
      <EmptyState
        icon="inbox"
        title="Meta não encontrada"
        description="A meta que você procura não existe mais ou foi removida."
        :action="{ label: 'Voltar para Metas', onClick: () => router.push('/goals') }"
      />
    </Card>

    <template v-else>
      <!-- Números -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card padding="md">
          <p class="text-sm font-medium text-[var(--color-fg-muted)]">Valor alvo</p>
          <p class="mt-1 font-display text-2xl font-normal text-[var(--color-fg)]">
            {{ money(goal.targetAmount, goal.currency) }}
          </p>
          <p class="mt-1 text-xs text-[var(--color-fg-subtle)]">Objetivo da meta</p>
        </Card>

        <Card padding="md">
          <p class="text-sm font-medium text-[var(--color-fg-muted)]">Valor atual</p>
          <p class="mt-1 font-display text-2xl font-normal text-[var(--color-brand)]">
            {{ money(goal.currentAmount, goal.currency) }}
          </p>
          <p class="mt-1 text-xs text-[var(--color-fg-subtle)]">Já guardado</p>
        </Card>

        <Card padding="md">
          <p class="text-sm font-medium text-[var(--color-fg-muted)]">Progresso</p>
          <p class="mt-1 font-display text-2xl font-normal" :class="isCompleted ? 'text-[var(--color-success)]' : 'text-[var(--color-fg)]'">
            {{ progressLabel }}
          </p>
          <p class="mt-1 text-xs text-[var(--color-fg-subtle)]">
            {{ isCompleted ? "Meta atingida" : `Faltam ${money(missingAmount, goal.currency)}` }}
          </p>
        </Card>

        <Card padding="md">
          <p class="text-sm font-medium text-[var(--color-fg-muted)]">Prazo</p>
          <p class="mt-1 font-display text-2xl font-normal text-[var(--color-fg)]">
            {{ goal.targetDate ? formatDate(goal.targetDate, "pt-BR") : "— —" }}
          </p>
          <p class="mt-1 text-xs text-[var(--color-fg-subtle)]">
            {{ daysRemaining !== null ? `Faltam ${daysRemaining} dia(s)` : "Sem prazo definido" }}
          </p>
        </Card>
      </div>

      <!-- Progresso -->
      <Card title="Progresso" padding="lg">
        <div
          class="h-3 w-full overflow-hidden rounded-full bg-[var(--color-bg-muted)]"
          role="progressbar"
          :aria-valuenow="progress"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-label="Progresso da meta"
        >
          <div
            class="h-full rounded-full transition-all"
            :class="isCompleted ? 'bg-[var(--color-success)]' : 'bg-[var(--color-brand)]'"
            :style="{ width: progress + '%' }"
          ></div>
        </div>
        <div class="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p class="text-sm text-[var(--color-fg-muted)]">
            {{ money(goal.currentAmount, goal.currency) }} de {{ money(goal.targetAmount, goal.currency) }}
          </p>
          <span class="badge" :class="isCompleted ? 'badge-success' : 'badge-warning'">
            {{ isCompleted ? "Meta atingida" : "Em andamento" }}
          </span>
        </div>
        <div class="mt-4">
          <Tooltip
            :content="isCompleted ? 'Sua meta foi concluída. Que bom trabalho!' : 'Registre um aporte com o botão Adicionar sempre que guardar dinheiro para esta meta.'"
            position="top"
          >
            <span class="inline-flex items-center gap-1 text-xs text-[var(--color-fg-subtle)] hover:text-[var(--color-brand)] cursor-help">
              <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke-width="1.5" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 16v-4M12 8h.01" />
              </svg>
              Como funciona o progresso
            </span>
          </Tooltip>
        </div>
      </Card>

      <!-- Informações -->
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Detalhes" padding="lg">
          <dl class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt class="text-xs font-medium uppercase tracking-wide text-[var(--color-fg-subtle)]">Objetivo</dt>
              <dd class="mt-1 text-sm font-medium text-[var(--color-fg)]">{{ goalTypeLabel(goal.type) }}</dd>
            </div>
            <div>
              <dt class="text-xs font-medium uppercase tracking-wide text-[var(--color-fg-subtle)]">Moeda</dt>
              <dd class="mt-1 text-sm font-medium text-[var(--color-fg)]">{{ goal.currency }}</dd>
            </div>
            <div>
              <dt class="text-xs font-medium uppercase tracking-wide text-[var(--color-fg-subtle)]">Status</dt>
              <dd class="mt-1">
                <span class="badge" :class="goal.isActive ? 'badge-info' : 'badge-neutral'">
                  {{ goal.isActive ? "Ativa" : "Inativa" }}
                </span>
              </dd>
            </div>
            <div>
              <dt class="text-xs font-medium uppercase tracking-wide text-[var(--color-fg-subtle)]">Criada em</dt>
              <dd class="mt-1 text-sm font-medium text-[var(--color-fg)]">{{ formatDate(goal.createdAt, "pt-BR") || "—" }}</dd>
            </div>
          </dl>
        </Card>

        <Card title="Descrição" padding="lg">
          <p v-if="goal.description" class="whitespace-pre-wrap text-sm text-[var(--color-fg-muted)]">
            {{ goal.description }}
          </p>
          <p v-else class="text-sm italic text-[var(--color-fg-subtle)]">
            Esta meta ainda não tem descrição.
          </p>
        </Card>
      </div>

      <!-- Ações -->
      <Card padding="lg">
        <div class="flex flex-wrap justify-end gap-3">
          <Button variant="ghost" @click="router.push('/goals')">Voltar</Button>
          <Button variant="outline" @click="goToEdit">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Editar
          </Button>
          <Button variant="danger" :loading="deleting" @click="handleDeleteGoal">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Excluir
          </Button>
        </div>
      </Card>
    </template>

    <!-- Modal: adicionar aporte -->
    <Modal v-model="showContribute" title="Adicionar" description="Registre um aporte para esta meta.">
      <form class="space-y-5" @submit.prevent="onContribute">
        <Input
          v-model="contributeAmount"
          id="contribute-amount"
          label="Valor do aporte"
          type="number"
          placeholder="0,00"
          required
          :error="contributeError"
          :hint="`Valor atual: ${money(goal?.currentAmount ?? 0, goal?.currency)}`"
        />

        <div class="rounded-xl bg-[var(--color-info-light)] p-4 text-sm text-[var(--color-info)]">
          <p class="font-medium">Novo valor atual</p>
          <p class="mt-1 font-display text-xl">
            {{ money((Number(goal?.currentAmount ?? 0) || 0) + (Number(contributeAmount) || 0), goal?.currency) }}
          </p>
        </div>

        <div class="flex justify-end gap-3 border-t border-[var(--color-border)] pt-4">
          <Button variant="ghost" type="button" @click="showContribute = false">Cancelar</Button>
          <Button type="submit" :loading="contributing">Confirmar</Button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useDeleteGoal, useGoal, useUpdateGoal } from "../../composables/useApi";
import { Button, Card, EmptyState, Input, Modal, Tooltip } from "../../components/ui";
import { formatCurrency, formatDate } from "../../utils/format";

const route = useRoute();
const router = useRouter();

const goalId = route.params.id as string;
const goalQuery = useGoal(goalId);
const updateGoalMutation = useUpdateGoal();
const deleteGoalMutation = useDeleteGoal();

const goal = computed(() => goalQuery.data.value);
const isLoading = computed(() => goalQuery.isLoading.value);

const showContribute = ref(route.query.aporte === "1");
const contributeAmount = ref("");
const contributeError = ref("");
const contributing = ref(false);
const deleting = ref(false);

const GOAL_TYPE_LABELS: Record<string, string> = {
  SAVINGS: "Poupança",
  DEBT_PAYOFF: "Quitar dívida",
  INVESTMENT: "Investimento",
  EMERGENCY_FUND: "Fundo de emergência",
  CUSTOM: "Personalizada",
};

function goalTypeLabel(type: string): string {
  return GOAL_TYPE_LABELS[type] ?? type;
}

function money(value: number, currency?: string | null): string {
  return formatCurrency(Number(value || 0), currency || "BRL", "pt-BR");
}

const progress = computed(() => {
  const target = Number(goal.value?.targetAmount || 0);
  const current = Number(goal.value?.currentAmount || 0);
  if (target <= 0) return 0;
  return Math.min((current / target) * 100, 100);
});

const progressLabel = computed(() =>
  `${progress.value.toFixed(1).replace(".", ",")}%`
);

const isCompleted = computed(() => {
  const target = Number(goal.value?.targetAmount || 0);
  return target > 0 && Number(goal.value?.currentAmount || 0) >= target;
});

const missingAmount = computed(() =>
  Math.max(
    0,
    Number(goal.value?.targetAmount || 0) - Number(goal.value?.currentAmount || 0)
  )
);

const daysRemaining = computed<number | null>(() => {
  const target = goal.value?.targetDate;
  if (!target) return null;
  const diff = new Date(target).getTime() - Date.now();
  if (Number.isNaN(diff)) return null;
  return Math.ceil(diff / 86_400_000);
});

function openContribute() {
  contributeAmount.value = "";
  contributeError.value = "";
  showContribute.value = true;
}

function goToEdit() {
  router.push({ path: "/goals/new", query: { id: goalId } });
}

async function onContribute() {
  const amount = Number(contributeAmount.value);
  if (!amount || amount <= 0) {
    contributeError.value = "Informe um valor maior que zero";
    return;
  }

  contributing.value = true;
  try {
    const newAmount = Number(goal.value?.currentAmount || 0) + amount;
    await updateGoalMutation.mutateAsync({
      id: goalId,
      data: { currentAmount: Number(newAmount.toFixed(2)) },
    });
    showContribute.value = false;
    contributeAmount.value = "";
  } catch (error) {
    contributeError.value =
      "Não foi possível registrar o aporte: " +
      ((error as Error)?.message || "tente novamente.");
  } finally {
    contributing.value = false;
  }
}

async function handleDeleteGoal() {
  if (!confirm("Tem certeza que deseja excluir esta meta?")) return;
  deleting.value = true;
  try {
    await deleteGoalMutation.mutateAsync(goalId);
    router.push("/goals");
  } catch (error) {
    alert("Não foi possível excluir a meta: " + (error as Error).message);
  } finally {
    deleting.value = false;
  }
}
</script>