<template>
  <div class="min-h-screen bg-[var(--color-bg)] text-[var(--color-fg)] font-body antialiased">
    <!-- Mobile overlay -->
    <Transition name="fade">
      <div
        v-if="sidebarOpen"
        class="fixed inset-0 z-[var(--z-fixed)] bg-black/30 backdrop-blur-sm lg:hidden"
        aria-hidden="true"
        @click="sidebarOpen = false"
      ></div>
    </Transition>

    <!-- Sidebar -->
    <aside
      class="fixed inset-y-0 left-0 z-[var(--z-fixed)] w-64 bg-[var(--color-bg-elevated)] border-r border-[var(--color-border)] flex flex-col transform transition-transform duration-300 ease-out lg:translate-x-0"
      :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full'"
      :aria-hidden="!sidebarOpen"
    >
      <!-- Brand -->
      <div class="h-16 flex items-center justify-between px-5 border-b border-[var(--color-border)]">
        <router-link to="/dashboard" class="flex items-center gap-3" @click="sidebarOpen = false">
          <span class="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-brand">
            <svg class="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.863.863c.881.881 2.302.881 3.182 0l2.414-2.414M21 12H3" />
            </svg>
          </span>
          <span class="font-display text-xl text-[var(--color-fg)]">Finanças</span>
        </router-link>
        <button
          class="lg:hidden rounded-lg p-1.5 text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] hover:bg-[var(--color-bg-muted)] transition-colors"
          aria-label="Fechar menu"
          @click="sidebarOpen = false"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto px-3 py-4 space-y-6" aria-label="Navegação principal">
        <div v-for="group in navGroups" :key="group.label" class="stagger-in">
          <p class="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-fg-subtle)]">
            {{ group.label }}
          </p>
          <router-link
            v-for="item in group.items"
            :key="item.to"
            :to="item.to"
            class="nav-link flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--color-fg-muted)] hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-fg)] transition-colors"
            :class="{
              'bg-[var(--color-brand-light)] text-[var(--color-brand)]': isActive(item.to),
            }"
            @click="sidebarOpen = false"
          >
            <span class="inline-flex h-8 w-8 items-center justify-center rounded-lg" :class="item.iconBg">
              <component :is="item.icon" :class="['h-5 w-5', isActive(item.to) ? 'text-[var(--color-brand)]' : 'text-[var(--color-fg-muted)]']" aria-hidden="true" />
            </span>
            {{ item.label }}
            <span v-if="item.badge" class="ml-auto badge badge-info text-xs">{{ item.badge }}</span>
          </router-link>
        </div>
      </nav>

      <!-- User footer -->
      <div class="border-t border-[var(--color-border)] p-4">
        <div class="flex items-center gap-3 mb-3">
          <span class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--color-brand-light)] text-[var(--color-brand)] text-sm font-semibold">
            {{ userInitial }}
          </span>
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium text-[var(--color-fg)]">{{ userName }}</p>
            <p class="truncate text-xs text-[var(--color-fg-muted)]">{{ userEmail }}</p>
          </div>
        </div>
        <div class="flex gap-2">
          <router-link to="/settings" class="nav-link flex-1 justify-center px-3 py-2 text-sm">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Configurações
          </router-link>
          <button
            class="nav-link flex-1 justify-center px-3 py-2 text-sm text-[var(--color-danger)] hover:bg-[var(--color-danger-light)]"
            @click="logout"
            title="Sair"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sair
          </button>
        </div>
      </div>
    </aside>

    <!-- Main column -->
    <div class="lg:pl-64 flex min-h-screen flex-col">
      <!-- Mobile header -->
      <header class="sticky top-0 z-[var(--z-sticky)] flex h-16 items-center gap-4 border-b border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 lg:hidden glass">
        <button
          class="rounded-lg p-1.5 text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] hover:bg-[var(--color-bg-muted)] transition-colors"
          aria-label="Abrir menu"
          @click="sidebarOpen = true"
        >
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span class="font-display text-lg text-[var(--color-fg)]">Finanças</span>
      </header>

      <!-- Page content -->
      <main class="flex-1 p-4 md:p-6 lg:p-8">
        <div class="mx-auto max-w-[1400px]">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { Tooltip } from "../components/ui";
import { useTheme } from "../composables/useTheme";

const sidebarOpen = ref(false);
const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

watch(
  () => route.fullPath,
  () => {
    sidebarOpen.value = false;
  }
);

const userName = computed(() => auth.user?.name || "Usuário");
const userEmail = computed(() => auth.user?.email || "");
const userInitial = computed(() => (auth.user?.name?.charAt(0) || "U").toUpperCase());

function isActive(path: string): boolean {
  return route.path === path || route.path.startsWith(path + "/");
}

const icons = {
  dashboard: {
    component: { template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V10" /></svg>` },
    iconBg: "bg-[var(--color-brand-light)]",
  },
  accounts: {
    component: { template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>` },
    iconBg: "bg-[var(--color-success-light)]",
  },
  transactions: {
    component: { template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>` },
    iconBg: "bg-[var(--color-info-light)]",
  },
  categories: {
    component: { template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>` },
    iconBg: "bg-[var(--color-warning-light)]",
  },
  budgets: {
    component: { template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>` },
    iconBg: "bg-[var(--color-brand-light)]",
  },
  goals: {
    component: { template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>` },
    iconBg: "bg-[var(--color-success-light)]",
  },
  recurring: {
    component: { template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>` },
    iconBg: "bg-[var(--color-info-light)]",
  },
  investments: {
    component: { template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>` },
    iconBg: "bg-[var(--color-warning-light)]",
  },
  reports: {
    component: { template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>` },
    iconBg: "bg-[var(--color-danger-light)]",
  },
  family: {
    component: { template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>` },
    iconBg: "bg-[var(--color-info-light)]",
  },
  settings: {
    component: { template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>` },
    iconBg: "bg-[var(--color-bg-muted)]",
  },
};

const navGroups = [
  {
    label: "Principal",
    items: [
      { to: "/dashboard", label: "Dashboard", icon: icons.dashboard.component, iconBg: icons.dashboard.iconBg },
      { to: "/accounts", label: "Contas", icon: icons.accounts.component, iconBg: icons.accounts.iconBg },
      { to: "/transactions", label: "Transações", icon: icons.transactions.component, iconBg: icons.transactions.iconBg },
      { to: "/categories", label: "Categorias", icon: icons.categories.component, iconBg: icons.categories.iconBg },
    ],
  },
  {
    label: "Planejamento",
    items: [
      { to: "/budgets", label: "Orçamentos", icon: icons.budgets.component, iconBg: icons.budgets.iconBg, badge: "Em breve" },
      { to: "/goals", label: "Metas", icon: icons.goals.component, iconBg: icons.goals.iconBg, badge: "Em breve" },
      { to: "/recurring", label: "Recorrentes", icon: icons.recurring.component, iconBg: icons.recurring.iconBg, badge: "Em breve" },
    ],
  },
  {
    label: "Patrimônio",
    items: [
      { to: "/investments", label: "Investimentos", icon: icons.investments.component, iconBg: icons.investments.iconBg, badge: "Em breve" },
      { to: "/reports", label: "Relatórios", icon: icons.reports.component, iconBg: icons.reports.iconBg, badge: "Em breve" },
    ],
  },
  {
    label: "Outros",
    items: [
      { to: "/family", label: "Família", icon: icons.family.component, iconBg: icons.family.iconBg, badge: "Em breve" },
      { to: "/settings", label: "Configurações", icon: icons.settings.component, iconBg: icons.settings.iconBg },
    ],
  },
];

async function logout() {
  await auth.logout();
  router.push("/login");
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--duration-base) var(--ease-out);
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.nav-link {
  border-radius: var(--radius-lg);
}
.nav-link:hover {
  background-color: var(--color-bg-muted);
}
.nav-link:focus-visible {
  outline: 2px solid var(--color-brand);
  outline-offset: 2px;
}
</style>