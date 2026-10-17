<template>
  <div class="space-y-6 stagger-in">
    <!-- Page header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="font-display text-3xl text-[var(--color-fg)]">Relatórios</h1>
        <p class="mt-1 text-[var(--color-fg-muted)]">
          Analise suas finanças por período e exporte os resultados para conferir com o seu contador.
        </p>
      </div>
      <Button variant="outline" @click="router.push('/transactions')">
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
        Ver transações
      </Button>
    </div>

    <!-- Report cards -->
    <div class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      <router-link
        v-for="report in reports"
        :key="report.to"
        :to="report.to"
        class="block rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] focus-visible:ring-offset-2"
      >
        <Card interactive padding="lg" class="h-full">
          <div class="flex items-start justify-between gap-3">
            <div
              class="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
              :class="report.iconBg"
            >
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
                <path
                  v-for="(d, i) in report.paths"
                  :key="i"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  :d="d"
                />
              </svg>
            </div>
            <Tooltip :content="report.tooltip" position="top">
              <span class="cursor-help text-[var(--color-fg-subtle)] hover:text-[var(--color-brand)]" tabindex="0">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" stroke-width="1.5" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 16v-4M12 8h.01" />
                </svg>
              </span>
            </Tooltip>
          </div>

          <h2 class="mt-4 font-display text-xl font-normal text-[var(--color-fg)]">{{ report.title }}</h2>
          <p class="mt-1 text-sm text-[var(--color-fg-muted)]">{{ report.description }}</p>

          <ul class="mt-4 space-y-2">
            <li
              v-for="item in report.highlights"
              :key="item"
              class="flex items-start gap-2 text-sm text-[var(--color-fg-muted)]"
            >
              <svg class="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-brand)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>{{ item }}</span>
            </li>
          </ul>

          <span class="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-brand)]">
            Gerar relatório
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
        </Card>
      </router-link>
    </div>

    <!-- Tips -->
    <Card variant="filled" padding="md">
      <div class="flex items-start gap-4">
        <div class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-info-light)] text-[var(--color-info)]">
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4m-1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="min-w-0">
          <h2 class="font-display text-lg font-normal text-[var(--color-fg)]">Como funcionam os relatórios</h2>
          <ul class="mt-2 space-y-1.5 text-sm text-[var(--color-fg-muted)]">
            <li>
              <span class="font-medium text-[var(--color-fg)]">Período (De / Até):</span>
              todos os relatórios respeitam o intervalo de datas escolhido no topo da página.
            </li>
            <li>
              <span class="font-medium text-[var(--color-fg)]">Exportar:</span>
              gera um arquivo CSV no seu computador, sem enviar dados para fora.
            </li>
            <li>
              <span class="font-medium text-[var(--color-fg)]">Fonte dos dados:</span>
             suas transações e contas cadastradas — quanto mais completo o lançamento, mais fiel é o relatório.
            </li>
          </ul>
        </div>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { Button, Card, Tooltip } from "../../components/ui";

const router = useRouter();

const reports = [
  {
    to: "/reports/cashflow",
    title: "Fluxo de Caixa",
    description: "Entradas, saídas e resultado do período, mês a mês.",
    iconBg: "bg-[var(--color-success-light)] text-[var(--color-success)]",
    paths: [
      "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 012-2h2a2 2 0 012 2v10",
    ],
    highlights: ["Entradas e saídas do período", "Evolução mensal", "Exportar para CSV"],
    tooltip: "Mostra todo o dinheiro que entrou e saiu das suas contas dentro do período selecionado.",
  },
  {
    to: "/reports/net-worth",
    title: "Patrimônio Líquido",
    description: "Quanto você tem, mês a mês, somando todas as contas.",
    iconBg: "bg-[var(--color-brand-light)] text-[var(--color-brand)]",
    paths: [
      "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    ],
    highlights: ["Saldo consolidado das contas", "Variação do período", "Contas com saldo negativo"],
    tooltip: "Patrimônio líquido é tudo o que você possui (saldos positivos) menos o que está devendo (saldos negativos).",
  },
  {
    to: "/reports/tax",
    title: "Impostos",
    description: "Base de despesas dedutíveis para a declaração do período.",
    iconBg: "bg-[var(--color-info-light)] text-[var(--color-info)]",
    paths: [
      "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    ],
    highlights: ["Total de despesas dedutíveis", "Despesas por categoria", "Estimativa de impostos a pagar"],
    tooltip: "Reúne as despesas lançadas no período para você conferir a base de cálculo antes de enviar para o contador.",
  },
];
</script>
