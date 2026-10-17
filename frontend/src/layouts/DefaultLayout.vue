<template>
  <div class="min-h-dvh bg-[var(--color-bg)] text-[var(--color-fg)]">
    <!-- ================= DESKTOP: menu lateral ================= -->
    <aside
      class="fixed inset-y-0 left-0 z-[var(--z-fixed)] hidden w-64 flex-col border-r border-[var(--color-border)] bg-[var(--color-bg-elevated)] lg:flex"
    >
      <router-link
        to="/dashboard"
        class="flex items-center gap-2.5 px-5 py-5 text-lg font-semibold tracking-tight"
      >
        <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-brand)] text-[var(--color-on-brand)]">
          <AppIcon name="trending" :size="18" :stroke-width="2" />
        </span>
        <BrandName />
      </router-link>

      <nav class="flex-1 overflow-y-auto px-3 pb-4" aria-label="Navegação principal">
        <div v-for="group in navGroups" :key="group.label" class="mb-5">
          <p class="mb-1 px-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-fg-subtle)]">
            {{ group.label }}
          </p>
          <router-link
            v-for="item in group.items"
            :key="item.to"
            :to="item.to"
            :data-tour="tourAnchor(item.to)"
            class="nav-item"
            :class="isActive(item.to) ? 'nav-item-active' : ''"
          >
            <AppIcon :name="item.icon" :size="19" class="shrink-0" />
            <span class="truncate">{{ item.label }}</span>
            <span v-if="item.badge" class="badge badge-neutral ml-auto">{{ item.badge }}</span>
          </router-link>
        </div>
      </nav>

      <div class="border-t border-[var(--color-border)] p-3">
        <div class="flex items-center gap-2.5 rounded-xl px-2 py-2">
          <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-light)] text-sm font-semibold text-[var(--color-brand)]">
            {{ userInitial }}
          </span>
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium">{{ userName }}</p>
            <p class="truncate text-xs text-[var(--color-fg-muted)]">{{ userEmail }}</p>
          </div>
          <button
            class="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-fg-subtle)] transition-colors hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-danger)]"
            aria-label="Sair"
            @click="logout"
          >
            <AppIcon name="logout" :size="18" />
          </button>
        </div>
      </div>
    </aside>

    <!-- ================= COLUNA PRINCIPAL ================= -->
    <div class="flex min-h-dvh flex-col lg:pl-64">
      <!-- Topo: compacto no celular, completo no desktop -->
      <header
        class="sticky top-0 z-[var(--z-sticky)] flex h-14 items-center gap-3 border-b border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 sm:px-6 lg:h-16 lg:px-8"
      >
        <router-link to="/dashboard" class="flex items-center gap-2 font-semibold tracking-tight lg:hidden">
          <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-brand)] text-[var(--color-on-brand)]">
            <AppIcon name="trending" :size="16" :stroke-width="2" />
          </span>
          <BrandName />
        </router-link>

        <div class="ml-auto flex items-center gap-2">
          <div data-tour="theme">
            <ThemeToggle />
          </div>
          <NotificationBell />

          <!-- No desktop não existe a barra inferior, então o atalho de novo
               lançamento vive aqui. O mesmo data-tour da barra móvel; o tour
               escolhe o que estiver visível na tela. -->
          <router-link
            to="/transactions/new"
            data-tour="new-transaction"
            class="hidden h-9 items-center gap-1.5 rounded-lg bg-[var(--color-brand)] px-3 text-sm font-semibold text-[var(--color-on-brand)] shadow-[var(--shadow-brand)] transition-colors hover:bg-[var(--color-brand-hover)] lg:flex"
          >
            <AppIcon name="plus" :size="16" :stroke-width="2.4" />
            Nova transação
          </router-link>

          <router-link
            to="/settings"
            class="hidden h-9 items-center gap-2 rounded-lg px-2 text-sm font-medium text-[var(--color-fg-muted)] transition-colors hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-fg)] lg:flex"
          >
            <AppIcon name="sliders" :size="18" />
            Configurações
          </router-link>
          <span
            class="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-brand-light)] text-sm font-semibold text-[var(--color-brand)] lg:hidden"
            aria-hidden="true"
          >
            {{ userInitial }}
          </span>
        </div>
      </header>

      <!-- Conteúdo: espaço extra embaixo por causa da barra inferior -->
      <main class="flex-1 px-4 pb-28 pt-5 sm:px-6 lg:px-8 lg:pb-12">
        <div class="mx-auto max-w-[1200px]">
          <slot />
        </div>
      </main>

      <!-- ================= MOBILE: barra inferior ================= -->
      <nav
        class="fixed inset-x-0 bottom-0 z-[var(--z-fixed)] border-t border-[var(--color-border)] bg-[var(--color-bg-elevated)] safe-bottom lg:hidden"
        aria-label="Navegação principal"
      >
        <div class="grid grid-cols-5 items-center">
          <router-link
            v-for="tab in tabs.left"
            :key="tab.to"
            :to="tab.to"
            class="flex min-h-14 flex-col items-center justify-center gap-1 px-1 text-[0.6875rem] font-medium transition-colors"
            :class="isActive(tab.to) ? 'text-[var(--color-brand)]' : 'text-[var(--color-fg-subtle)]'"
          >
            <AppIcon :name="tab.icon" :size="22" :stroke-width="isActive(tab.to) ? 2.1 : 1.7" />
            <span>{{ tab.label }}</span>
          </router-link>

          <!-- Atalho principal: registrar transação -->
          <router-link
            to="/transactions/new"
            data-tour="new-transaction"
            class="flex min-h-14 items-center justify-center"
            aria-label="Nova transação"
          >
            <span class="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-brand)] text-[var(--color-on-brand)] shadow-[var(--shadow-brand)] ring-4 ring-[var(--color-bg-elevated)]">
              <AppIcon name="plus" :size="26" :stroke-width="2.4" />
            </span>
          </router-link>

          <router-link
            v-for="tab in tabs.right"
            :key="tab.to"
            :to="tab.to"
            class="flex min-h-14 flex-col items-center justify-center gap-1 px-1 text-[0.6875rem] font-medium transition-colors"
            :class="isActive(tab.to) ? 'text-[var(--color-brand)]' : 'text-[var(--color-fg-subtle)]'"
          >
            <AppIcon :name="tab.icon" :size="22" :stroke-width="isActive(tab.to) ? 2.1 : 1.7" />
            <span>{{ tab.label }}</span>
          </router-link>

          <button
            type="button"
            class="flex min-h-14 flex-col items-center justify-center gap-1 px-1 text-[0.6875rem] font-medium text-[var(--color-fg-subtle)]"
            :class="moreActive ? 'text-[var(--color-brand)]' : ''"
            @click="moreOpen = true"
          >
            <AppIcon name="more" :size="22" :stroke-width="2.6" />
            <span>Mais</span>
          </button>
        </div>
      </nav>
    </div>

    <!-- ================= MOBILE: menu "Mais" ================= -->
    <Transition name="sheet">
      <div v-if="moreOpen" class="fixed inset-0 z-[var(--z-modal)] lg:hidden" role="dialog" aria-modal="true">
        <div class="absolute inset-0 bg-black/45 animate-fade-in" @click="moreOpen = false"></div>

        <div class="absolute inset-x-0 bottom-0 animate-slide-up rounded-t-2xl border-t border-[var(--color-border)] bg-[var(--color-bg-elevated)] pb-2 safe-bottom">
          <div class="mx-auto mt-2 h-1 w-9 rounded-full bg-[var(--color-border-strong)]"></div>

          <div class="grid grid-cols-3 gap-1 p-3">
            <button
              v-for="item in moreItems"
              :key="item.to"
              class="flex flex-col items-center gap-2 rounded-xl px-2 py-3.5 text-xs font-medium text-[var(--color-fg-muted)] transition-colors active:bg-[var(--color-bg-muted)]"
              @click="go(item.to)"
            >
              <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-bg-muted)] text-[var(--color-fg)]">
                <AppIcon :name="item.icon" :size="20" />
              </span>
              <span class="text-center leading-tight">{{ item.label }}</span>
            </button>
          </div>

          <div class="border-t border-[var(--color-border)] p-3">
            <div class="flex items-center justify-between gap-3 rounded-xl px-2 py-2">
              <span class="text-sm font-medium text-[var(--color-fg-muted)]">Aparência</span>
              <ThemeToggle />
            </div>
            <button
              class="mt-1 flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-[var(--color-danger)] transition-colors active:bg-[var(--color-danger-light)]"
              @click="logout"
            >
              <AppIcon name="logout" :size="19" />
              Sair da conta
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>

  <!-- Tutorial de primeiro acesso -->
  <OnboardingTour />
</template>

<script setup lang="ts">
import { computed, ref, watch, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { AppIcon, ThemeToggle, OnboardingTour } from "../components/ui";
import BrandName from "../components/BrandName.vue";
import NotificationBell from "../components/NotificationBell.vue";
import { useTheme } from "../composables/useTheme";
import { useOnboarding } from "../composables/useOnboarding";

useTheme();

// Primeira visita: abre o tutorial. Depois disso o flag no localStorage
// segura, e dá para rever em Configurações → Rever tutorial.
const { start: startTour } = useOnboarding();
startTour();

const sidebarOpen = ref(false);
const moreOpen = ref(false);
const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

watch(
  () => route.fullPath,
  () => {
    sidebarOpen.value = false;
    moreOpen.value = false;
  }
);

watch(moreOpen, (open) => {
  document.body.style.overflow = open ? "hidden" : "";
});

onBeforeUnmount(() => {
  document.body.style.overflow = "";
});

const userName = computed(() => auth.user?.name || "Usuário");
const userEmail = computed(() => auth.user?.email || "");
const userInitial = computed(() => (auth.user?.name?.charAt(0) || "U").toUpperCase());

function isActive(path: string): boolean {
  return route.path === path || route.path.startsWith(path + "/");
}

function go(to: string) {
  moreOpen.value = false;
  router.push(to);
}

interface NavItem {
  to: string;
  label: string;
  icon: string;
  badge?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

/** Ancora usada pelo tutorial para destacar o item de menu. */
function tourAnchor(path: string): string | undefined {
  const map: Record<string, string> = {
    "/dashboard": "dashboard",
    "/accounts": "accounts",
    "/transactions": "transactions",
    "/invoices": "invoices",
  };
  return map[path];
}

// Abas da barra inferior — só o que o usuário usa todo dia
const tabs = {
  left: [
    { to: "/dashboard", label: "Início", icon: "home" },
    { to: "/accounts", label: "Contas", icon: "wallet" },
  ] as NavItem[],
  right: [{ to: "/transactions", label: "Lançamentos", icon: "arrows" }] as NavItem[],
};

const moreItems: NavItem[] = [
  { to: "/invoices", label: "Faturas", icon: "receipt" },
  { to: "/categories", label: "Categorias", icon: "tag" },
  { to: "/budgets", label: "Orçamentos", icon: "grid" },
  { to: "/goals", label: "Metas", icon: "target" },
  { to: "/recurring", label: "Recorrentes", icon: "repeat" },
  { to: "/investments", label: "Investimentos", icon: "trending" },
  { to: "/reports", label: "Relatórios", icon: "box" },
  { to: "/family", label: "Família", icon: "users" },
  { to: "/settings", label: "Ajustes", icon: "sliders" },
  { to: "/docs", label: "Documentação", icon: "fileText" },
];

const moreActive = computed(() => moreItems.some((item) => isActive(item.to)));

const navGroups: NavGroup[] = [
  {
    label: "Principal",
    items: [
      { to: "/dashboard", label: "Início", icon: "home" },
      { to: "/accounts", label: "Contas", icon: "wallet" },
      { to: "/transactions", label: "Transações", icon: "arrows" },
      { to: "/invoices", label: "Faturas", icon: "receipt" },
      { to: "/categories", label: "Categorias", icon: "tag" },
    ],
  },
  {
    label: "Planejamento",
    items: [
      { to: "/budgets", label: "Orçamentos", icon: "grid", badge: "Breve" },
      { to: "/goals", label: "Metas", icon: "target", badge: "Breve" },
      { to: "/recurring", label: "Recorrentes", icon: "repeat", badge: "Breve" },
    ],
  },
  {
    label: "Patrimônio",
    items: [
      { to: "/investments", label: "Investimentos", icon: "trending", badge: "Breve" },
      { to: "/reports", label: "Relatórios", icon: "box", badge: "Breve" },
      { to: "/family", label: "Família", icon: "users", badge: "Breve" },
    ],
  },
  {
    label: "Conta",
    items: [
      { to: "/settings", label: "Configurações", icon: "sliders" },
      { to: "/docs", label: "Documentação", icon: "fileText" },
    ],
  },
];

async function logout() {
  await auth.logout();
  router.push("/login");
}
</script>

<style scoped>
.nav-item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  min-height: 2.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-lg);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-fg-muted);
  transition: background-color var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out);
}
.nav-item:hover {
  background-color: var(--color-bg-muted);
  color: var(--color-fg);
}
.nav-item-active,
.nav-item-active:hover {
  background-color: var(--color-brand-light);
  color: var(--color-brand);
}

.sheet-enter-active,
.sheet-leave-active {
  transition: opacity var(--duration-base) var(--ease-out);
}
.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}
</style>