<template>
  <div class="space-y-6 stagger-in">
    <!-- Page header -->
    <div>
      <h1 class="page-title">Configurações</h1>
      <p class="page-subtitle">
        Ajuste o perfil, a aparência, os lembretes e as integrações do FluxoGrana.
      </p>
    </div>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-4">
      <!-- Navegação + busca -->
      <Card padding="sm" class="lg:col-span-1">
        <div class="relative mb-3">
          <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-fg-subtle)]">
            <AppIcon name="search" :size="16" />
          </span>
          <input
            id="settings-search"
            v-model="search"
            type="search"
            class="input-base pl-9 text-sm"
            placeholder="Buscar nas configurações"
            aria-label="Buscar nas configurações"
          />
        </div>

        <nav class="space-y-1" aria-label="Seções das configurações">
          <router-link
            v-for="item in filteredMenu"
            :key="item.path"
            :to="item.path"
            class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--color-fg-muted)] transition-colors hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-fg)]"
            :class="{ 'bg-[var(--color-brand-light)] text-[var(--color-brand)]': isActive(item.path) }"
            :aria-current="isActive(item.path) ? 'page' : undefined"
          >
            <span
              class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
              :class="item.iconBg"
            >
              <AppIcon :name="item.icon" :size="18" />
            </span>
            <span class="min-w-0 truncate">{{ item.label }}</span>
          </router-link>

          <p v-if="!filteredMenu.length" class="px-3 py-4 text-center text-xs text-[var(--color-fg-muted)]">
            Nada encontrado para "{{ search }}".
          </p>
        </nav>

        <!-- Tutorial: dá para rever quando esquecer -->
        <button
          type="button"
          class="mt-3 flex min-h-11 w-full items-center gap-3 rounded-lg border border-[var(--color-border)] px-3 py-2.5 text-sm font-medium text-[var(--color-fg-muted)] transition-colors hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-brand)]"
          @click="restartTour"
        >
          <span class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-warning-light)] text-[var(--color-warning)]">
            <AppIcon name="lightbulb" :size="18" />
          </span>
          <span class="truncate">Rever tutorial</span>
        </button>
      </Card>

      <!-- Conteúdo -->
      <div class="lg:col-span-3">
        <router-view v-if="hasSection" />

        <Card v-else padding="none">
          <EmptyState
            icon="settings"
            title="Escolha uma seção"
            description="Selecione ao lado um tema para ajustar. Se preferir, use a busca acima para filtrar."
          />
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import { AppIcon, Card, EmptyState } from "../../components/ui";
import { useOnboarding } from "../../composables/useOnboarding";

const route = useRoute();
const { restart } = useOnboarding();

const search = ref("");

interface SettingsItem {
  path: string;
  label: string;
  icon: string;
  iconBg: string;
  /** Termos extras que a busca também considera. */
  keywords: string;
}

const settingsMenu: SettingsItem[] = [
  {
    path: "/settings/profile",
    label: "Perfil",
    icon: "user",
    iconBg: "bg-[var(--color-brand-light)] text-[var(--color-brand)]",
    keywords: "nome email usuario conta dado",
  },
  {
    path: "/settings/appearance",
    label: "Aparência",
    icon: "palette",
    iconBg: "bg-[var(--color-success-light)] text-[var(--color-success)]",
    keywords: "cor tema escuro claro acento densidade fonte texto tamanho estilo post-it",
  },
  {
    path: "/settings/preferences",
    label: "Preferências",
    icon: "sliders",
    iconBg: "bg-[var(--color-info-light)] text-[var(--color-info)]",
    keywords: "lembrete fatura vencimento aviso notificacao moeda idioma formato",
  },
  {
    path: "/settings/security",
    label: "Segurança",
    icon: "shield",
    iconBg: "bg-[var(--color-warning-light)] text-[var(--color-warning)]",
    keywords: "senha autenticacao dois fatores 2fa",
  },
  {
    path: "/settings/family",
    label: "Família",
    icon: "users",
    iconBg: "bg-[var(--color-brand-light)] text-[var(--color-brand)]",
    keywords: "compartilhar Convite membro papel",
  },
  {
    path: "/settings/api-keys",
    label: "Chaves de API",
    icon: "key",
    iconBg: "bg-[var(--color-bg-muted)] text-[var(--color-fg-muted)]",
    keywords: "token integracao desenvolvedor programador",
  },
  {
    path: "/settings/webhooks",
    label: "Webhooks",
    icon: "link",
    iconBg: "bg-[var(--color-danger-light)] text-[var(--color-danger)]",
    keywords: "integracao evento automatizar",
  },
  {
    path: "/settings/import-export",
    label: "Importar/Exportar",
    icon: "download",
    iconBg: "bg-[var(--color-bg-muted)] text-[var(--color-fg-muted)]",
    keywords: "csv backup dados migrar planilha",
  },
];

const filteredMenu = computed(() => {
  const term = search.value.trim().toLowerCase();
  if (!term) return settingsMenu;

  // Cada palavra precisa bater em algum lugar: senão buscar "cor vazamento"
  // traria "Aparência" só por causa do "a".
  return settingsMenu.filter((item) => {
    const haystack = `${item.label} ${item.keywords}`.toLowerCase();
    return term.split(/\s+/).every((word) => haystack.includes(word));
  });
});

const hasSection = computed(
  () => route.path.startsWith("/settings/") && route.path.length > "/settings/".length
);

function isActive(path: string): boolean {
  return route.path === path || route.path.startsWith(path + "/");
}

function restartTour() {
  restart();
}
</script>