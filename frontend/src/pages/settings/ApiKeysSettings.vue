<template>
  <div class="space-y-6 stagger-in">
    <!-- Page header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="font-display text-3xl text-[var(--color-fg)]">Chaves de API</h1>
        <p class="mt-1 text-[var(--color-fg-muted)]">
          Crie chaves para integrar aplicativos e serviços aos seus dados financeiros.
        </p>
      </div>
      <Button @click="showCreateForm = true">
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Criar chave
      </Button>
    </div>

    <!-- Warning about the new key -->
    <div
      v-if="showKey"
      class="rounded-xl border border-[var(--color-warning)] bg-[var(--color-warning-light)] p-4"
      role="status"
    >
      <div class="flex items-start gap-3">
        <svg class="h-5 w-5 flex-shrink-0 text-[var(--color-warning)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-semibold text-[var(--color-warning)]">Cuidado: a chave só será exibida uma vez</p>
          <p class="mt-1 text-xs text-[var(--color-fg-muted)]">
            Copie e guarde em local seguro agora — depois disso não será possível recuperar a chave secreta.
          </p>
          <p class="mt-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 py-3 font-mono text-sm break-all text-[var(--color-fg)]">
            {{ newKey }}
          </p>
          <div class="mt-3 flex flex-wrap gap-3">
            <Button size="sm" @click="copyToClipboard(newKey)">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75a2.25 2.25 0 01-2.25-2.25V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
              </svg>
              Copiar chave
            </Button>
            <Button variant="secondary" size="sm" @click="showKey = false">Já salvei a chave</Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Existing keys -->
    <Card
      title="Suas chaves"
      description="Cada chave concede exatamente as permissões marcadas na criação."
      padding="none"
    >
      <template #header-actions>
        <span class="badge badge-neutral">{{ apiKeys.length }} chave{{ apiKeys.length !== 1 ? "s" : "" }}</span>
      </template>

      <ul v-if="apiKeys.length > 0" class="divide-y divide-[var(--color-border)]">
        <li
          v-for="key in apiKeys"
          :key="key.id"
          class="flex flex-col gap-3 px-6 py-4 lg:flex-row lg:items-center lg:justify-between"
        >
          <div class="min-w-0">
            <p class="text-sm font-medium text-[var(--color-fg)]">{{ key.name }}</p>
            <p class="mt-0.5 font-mono text-xs text-[var(--color-fg-muted)]">{{ key.prefix }}••••••••••••</p>
            <p class="mt-1 text-xs text-[var(--color-fg-muted)]">
              Criada em {{ formatDate(key.createdAt, "pt-BR") }} ·
              {{ key.lastUsedAt ? `Último uso em ${formatDate(key.lastUsedAt, "pt-BR")}` : "Nunca usada" }}
            </p>
            <div class="mt-2 flex flex-wrap gap-1.5">
              <Tooltip
                v-for="permission in key.permissions"
                :key="permission"
                :content="permission"
                position="top"
              >
                <template #trigger>
                  <span class="badge badge-info">{{ permissionLabel(permission) }}</span>
                </template>
              </Tooltip>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <Button variant="ghost" size="sm" @click="copyToClipboard(key.prefix)">Copiar</Button>
            <Button variant="outline" size="sm" @click="revokeKey(key.id, key.name)">Revogar</Button>
          </div>
        </li>
      </ul>

      <EmptyState
        v-else
        icon="settings"
        title="Nenhuma chave de API"
        description="Crie sua primeira chave para integrar aplicativos, planilhas e automações aos seus dados."
        :action="{ label: 'Criar chave', onClick: openCreateForm }"
      />
    </Card>

    <!-- Create form -->
    <Card v-if="showCreateForm" title="Criar chave" description="Dê um nome e escolha apenas as permissões necessárias." padding="none">
      <form class="space-y-4 p-6" @submit.prevent="onCreate">
        <Input
          id="apikey-name"
          v-model="form.name"
          label="Nome da chave"
          type="text"
          required
          placeholder="Ex.: Aplicativo Mobile"
          :error="errors.name"
        />

        <div>
          <p class="label">Permissões</p>
          <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <label
              v-for="permission in availablePermissions"
              :key="permission.value"
              class="flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-muted)] px-3 py-2 transition-colors hover:border-[var(--color-border-strong)]"
            >
              <input
                :id="`permission-${permission.value}`"
                v-model="form.permissions"
                :value="permission.value"
                type="checkbox"
                class="h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-brand)] focus:ring-[var(--color-brand)]"
              />
              <span class="text-sm text-[var(--color-fg)]">{{ permission.label }}</span>
            </label>
          </div>
          <p v-if="errors.permissions" class="error-text">{{ errors.permissions }}</p>
        </div>

        <Input
          id="apikey-expires"
          v-model="form.expiresInDays"
          label="Validade em dias (opcional)"
          type="number"
          placeholder="Deixe em branco para não expirar"
          hint="A chave é revogada automaticamente depois deste período."
        />

        <div class="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
          <Button variant="ghost" type="button" @click="closeCreateForm">Cancelar</Button>
          <Button type="submit" :loading="creating" @click="onCreate">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Criar chave
          </Button>
        </div>
      </form>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Button, Card, EmptyState, Input, Tooltip } from "../../components/ui";
import { formatDate } from "../../utils/format";

const showCreateForm = ref(false);
const creating = ref(false);
const showKey = ref(false);
const newKey = ref("");

const form = ref({
  name: "",
  permissions: [] as string[],
  expiresInDays: "",
});

const errors = ref({
  name: "",
  permissions: "",
});

const availablePermissions = [
  { value: "READ_TRANSACTIONS", label: "Ler transações" },
  { value: "WRITE_TRANSACTIONS", label: "Criar e editar transações" },
  { value: "READ_ACCOUNTS", label: "Ler contas" },
  { value: "WRITE_ACCOUNTS", label: "Criar e editar contas" },
  { value: "READ_INVESTMENTS", label: "Ler investimentos" },
  { value: "WRITE_INVESTMENTS", label: "Criar e editar investimentos" },
  { value: "READ_BUDGETS", label: "Ler orçamentos" },
  { value: "WRITE_BUDGETS", label: "Criar e editar orçamentos" },
  { value: "READ_GOALS", label: "Ler metas" },
  { value: "WRITE_GOALS", label: "Criar e editar metas" },
  { value: "READ_REPORTS", label: "Ler relatórios" },
];

const apiKeys = ref([
  {
    id: "1",
    name: "Aplicativo Mobile",
    prefix: "sk_live_abc",
    permissions: ["READ_TRANSACTIONS", "READ_ACCOUNTS"],
    createdAt: "2024-01-15",
    lastUsedAt: "2024-02-01",
  },
]);

function openCreateForm() {
  showCreateForm.value = true;
}

function closeCreateForm() {
  showCreateForm.value = false;
  form.value = { name: "", permissions: [], expiresInDays: "" };
  errors.value = { name: "", permissions: "" };
}

function permissionLabel(permission: string): string {
  return availablePermissions.find((item) => item.value === permission)?.label ?? permission;
}

async function copyToClipboard(value: string) {
  try {
    await navigator.clipboard.writeText(value);
    alert("Copiado para a área de transferência.");
  } catch {
    alert("Não foi possível copiar automaticamente. Selecione e copie manualmente.");
  }
}

async function onCreate() {
  errors.value.name = form.value.name.trim() ? "" : "Informe um nome para a chave";
  errors.value.permissions = form.value.permissions.length > 0 ? "" : "Selecione ao menos uma permissão";
  if (errors.value.name || errors.value.permissions) return;

  creating.value = true;
  try {
    // TODO: Implementar criação de chave de API
    newKey.value = "sk_live_" + Math.random().toString(36).substr(2, 32);
    showCreateForm.value = false;
    showKey.value = true;
  } finally {
    creating.value = false;
  }
}

async function revokeKey(id: string, name: string) {
  if (!confirm(`Revogar a chave "${name}"? Aplicativos que a usarem vão parar de funcionar.`)) return;

  // TODO: Implementar revogação de chave
  apiKeys.value = apiKeys.value.filter((key) => key.id !== id);
  alert("Chave revogada.");
}
</script>