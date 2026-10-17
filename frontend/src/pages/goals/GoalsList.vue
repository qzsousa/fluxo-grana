<template>
  <div class="space-y-6 stagger-in">
    <!-- Page header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="font-display text-3xl text-[var(--color-fg)]">Metas</h1>
        <p class="mt-1 text-[var(--color-fg-muted)]">
          Defina objetivos de poupança e acompanhe o quanto falta para atingi-los.
        </p>
      </div>
      <Button @click="router.push('/goals/new')">
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Nova Meta
      </Button>
    </div>

    <!-- Resumo -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <template v-if="isLoading">
        <Card v-for="i in 3" :key="i" padding="md">
          <div class="h-4 w-28 skeleton skeleton-text"></div>
          <div class="mt-3 h-7 w-40 skeleton skeleton-text"></div>
        </Card>
      </template>

      <template v-else>
        <Card padding="md">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-sm font-medium text-[var(--color-fg-muted)]">Valor atual</p>
              <p class="mt-1 font-display text-2xl font-normal text-[var(--color-fg)]">
                {{ money(totalSaved, displayCurrency) }}
              </p>
              <p class="mt-1 text-xs text-[var(--color-fg-subtle)]">Somado em todas as metas</p>
            </div>
            <span class="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-brand-light)] text-[var(--color-brand)]">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 7.5h18M12 3v18m0-9c0-1.66-1.34-3-3-3H6m9 6c0 1.66 1.34 3 3 3h3" />
              </svg>
            </span>
          </div>
          <Tooltip content="Total já guardado em todas as suas metas financeiras." position="top">
            <span class="mt-2 inline-flex text-[var(--color-fg-subtle)] hover:text-[var(--color-brand)] cursor-help">
              <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke-width="1.5" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 16v-4M12 8h.01" />
              </svg>
            </span>
          </Tooltip>
        </Card>

        <Card padding="md">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-sm font-medium text-[var(--color-fg-muted)]">Ainda falta</p>
              <p class="mt-1 font-display text-2xl font-normal text-[var(--color-warning)]">
                {{ money(totalMissing, displayCurrency) }}
              </p>
              <p class="mt-1 text-xs text-[var(--color-fg-subtle)]">Soma das metas não atingidas</p>
            </div>
            <span class="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-warning-light)] text-[var(--color-warning)]">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </div>
          <Tooltip content="Diferença entre o valor alvo e o valor atual de cada meta ainda em andamento." position="top">
            <span class="mt-2 inline-flex text-[var(--color-fg-subtle)] hover:text-[var(--color-brand)] cursor-help">
              <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke-width="1.5" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 16v-4M12 8h.01" />
              </svg>
            </span>
          </Tooltip>
        </Card>

        <Card padding="md">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-sm font-medium text-[var(--color-fg-muted)]">Progresso</p>
              <p class="mt-1 font-display text-2xl font-normal text-[var(--color-success)]">
                {{ completedCount }}<span class="text-base text-[var(--color-fg-muted)]">/{{ goals.length }}</span>
              </p>
              <p class="mt-1 text-xs text-[var(--color-fg-subtle)]">Metas atingidas</p>
            </div>
            <span class="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-success-light)] text-[var(--color-success)]">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </span>
          </div>
          <Tooltip content="Uma meta é considerada atingida quando o valor atual iguala ou supera o valor alvo." position="top">
            <span class="mt-2 inline-flex text-[var(--color-fg-subtle)] hover:text-[var(--color-brand)] cursor-help">
              <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke-width="1.5" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 16v-4M12 8h.01" />
              </svg>
            </span>
          </Tooltip>
        </Card>
      </template>
    </div>

    <!-- Lista de metas -->
    <Card v-if="goals.length > 0" title="Suas Metas" padding="none">
      <template #header-actions>
        <router-link to="/goals/new" class="link text-sm font-medium">Nova Meta</router-link>
      </template>

      <div class="divide-y divide-[var(--color-border)]">
        <article
          v-for="goal in goals"
          :key="goal.id"
          class="p-6 transition-colors hover:bg-[var(--color-bg-muted)]"
        >
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div class="flex items-start gap-3 min-w-0">
              <span class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-brand-light)] text-[var(--color-brand)]">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </span>
              <div class="min-w-0">
                <p class="font-medium text-[var(--color-fg)] truncate">{{ goal.name }}</p>
                <p class="text-xs text-[var(--color-fg-muted)]">
                  {{ goalTypeLabel(goal.type) }}
                  <template v-if="goal.targetDate"> · Prazo: {{ formatDate(goal.targetDate, "pt-BR") }}</template>
                </p>
              </div>
            </div>
            <span
              class="shrink-0 rounded-full px-3 py-1 text-xs font-medium"
              :class="isCompleted(goal) ? 'bg-[var(--color-success-light)] text-[var(--color-success)]' : goal.isActive ? 'bg-[var(--color-brand-light)] text-[var(--color-brand)]' : 'bg-[var(--color-bg-muted)] text-[var(--color-fg-muted)]'"
            >
              {{ isCompleted(goal) ? 'Meta atingida' : goal.isActive ? 'Em andamento' : 'Pausada' }}
            </span>
          </div>

          <div class="mt-4">
            <div class="flex flex-wrap items-baseline justify-between gap-2">
              <p class="text-sm text-[var(--color-fg-muted)]">
                Objetivo:
                <span class="font-semibold text-[var(--color-fg)]">{{ money(goal.targetAmount, goal.currency) }}</span>
              </p>
              <p class="text-sm text-[var(--color-fg-muted)]">
                Valor atual:
                <span class="font-semibold text-[var(--color-fg)]">{{ money(goal.currentAmount, goal.currency) }}</span>
                <span class="text-[var(--color-fg-subtle)]"> · {{ progressLabel(goal) }}</span>
              </p>
            </div>
            <div
              class="mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--color-bg-muted)]"
              role="progressbar"
              :aria-valuenow="progress(goal)"
              aria-valuemin="0"
              aria-valuemax="100"
              :aria-label="`Progresso da meta ${goal.name}`"
            >
              <div
                class="h-full rounded-full transition-all"
                :class="isCompleted(goal) ? 'bg-[var(--color-success)]' : 'bg-[var(--color-brand)]'"
                :style="{ width: progress(goal) + '%' }"
              ></div>
            </div>
            <p v-if="!isCompleted(goal)" class="mt-1.5 text-xs text-[var(--color-fg-subtle)]">
              Faltam {{ money(missingAmount(goal), goal.currency) }} para atingir o objetivo.
            </p>
          </div>

          <div class="mt-4 flex flex-wrap items-center gap-2">
            <Button variant="secondary" size="sm" @click="goToContribute(goal)">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Adicionar
            </Button>
            <Button variant="ghost" size="sm" @click="router.push(`/goals/${goal.id}`)">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542 7z" />
              </svg>
              Detalhes
            </Button>
            <Button variant="ghost" size="sm" @click="goToEdit(goal)">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editar
            </Button>
          </div>
        </article>
      </div>
    </Card>

    <!-- Empty state -->
    <Card v-else-if="isLoading" padding="lg">
      <div class="space-y-4">
        <div v-for="i in 3" :key="i" class="h-24 w-full skeleton rounded-xl"></div>
      </div>
    </Card>

    <Card v-else padding="lg">
      <EmptyState
        icon="inbox"
        title="Nenhuma meta cadastrada"
        description="Crie sua primeira meta para planejar a poupança, quitar uma dívida ou montar um fundo de emergência."
        :action="{ label: 'Criar Meta', onClick: () => router.push('/goals/new') }"
      />
    </Card>

    <!-- Error banner -->
    <div
      v-if="listError"
      class="flex items-center gap-3 rounded-xl border border-[var(--color-danger)] bg-[var(--color-danger-light)] p-4 text-sm text-[var(--color-danger)]"
      role="alert"
    >
      <svg class="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 100 2 1 1 0 000-2z" clip-rule="evenodd" />
      </svg>
      <span>Não foi possível carregar suas metas.</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useGoals } from "../../composables/useApi";
import type { Goal } from "../../composables/useApi";
import { Button, Card, EmptyState, Tooltip } from "../../components/ui";
import { formatCurrency, formatDate } from "../../utils/format";

const router = useRouter();
const goalsQuery = useGoals();

const goals = computed<Goal[]>(() => goalsQuery.data.value ?? []);
const isLoading = computed(() => goalsQuery.isLoading.value);
const listError = computed(() => goalsQuery.isError.value);

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

function progress(goal: Goal): number {
  const target = Number(goal.targetAmount || 0);
  const current = Number(goal.currentAmount || 0);
  if (target <= 0) return 0;
  return Math.min((current / target) * 100, 100);
}

function progressLabel(goal: Goal): string {
  return `${progress(goal).toFixed(1).replace(".", ",")}%`;
}

function isCompleted(goal: Goal): boolean {
  const target = Number(goal.targetAmount || 0);
  return target > 0 && Number(goal.currentAmount || 0) >= target;
}

function missingAmount(goal: Goal): number {
  return Math.max(0, Number(goal.targetAmount || 0) - Number(goal.currentAmount || 0));
}

function goToContribute(goal: Goal) {
  router.push({ path: `/goals/${goal.id}`, query: { aporte: "1" } });
}

function goToEdit(goal: Goal) {
  router.push({ path: "/goals/new", query: { id: goal.id } });
}

const displayCurrency = computed(() => goals.value[0]?.currency || "BRL");

const totalSaved = computed(() =>
  goals.value.reduce((sum, goal) => sum + Number(goal.currentAmount || 0), 0)
);

const totalMissing = computed(() =>
  goals.value.reduce((sum, goal) => sum + missingAmount(goal), 0)
);

const completedCount = computed(() => goals.value.filter(isCompleted).length);
</script>