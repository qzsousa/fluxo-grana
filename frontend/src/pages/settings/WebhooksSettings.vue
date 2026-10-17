<template>
  <div class="space-y-6 stagger-in">
    <!-- Page header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="font-display text-3xl text-[var(--color-fg)]">Webhooks</h1>
        <p class="mt-1 text-[var(--color-fg-muted)]">
          Receba notificações em tempo real em qualquer serviço que aceite requisições HTTP.
        </p>
      </div>
      <Button @click="openCreateForm">
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Criar webhook
      </Button>
    </div>

    <!-- Existing webhooks -->
    <Card
      title="Seus webhooks"
      description="Cada destino recebe apenas os eventos que você selecionar."
      padding="none"
    >
      <template #header-actions>
        <span class="badge badge-neutral">
          {{ webhooks.length }} webhook{{ webhooks.length !== 1 ? "s" : "" }}
        </span>
      </template>

      <ul v-if="webhooks.length > 0" class="divide-y divide-[var(--color-border)]">
        <li
          v-for="webhook in webhooks"
          :key="webhook.id"
          class="flex flex-col gap-3 px-6 py-4 lg:flex-row lg:items-start lg:justify-between"
        >
          <div class="min-w-0">
            <p class="flex flex-wrap items-center gap-2 text-sm font-medium text-[var(--color-fg)]">
              <span class="truncate">{{ webhook.name }}</span>
              <span v-if="webhook.isActive" class="badge badge-success">Ativo</span>
              <span v-else class="badge badge-neutral">Inativo</span>
            </p>
            <p class="mt-0.5 truncate font-mono text-xs text-[var(--color-fg-muted)]">{{ webhook.url }}</p>
            <p class="mt-1 text-xs text-[var(--color-fg-muted)]">
              Última tentativa: {{ webhook.lastAttemptAt ? formatDate(webhook.lastAttemptAt, "pt-BR") : "nenhuma" }} ·
              Resposta HTTP: {{ webhook.lastStatus ?? "—" }}
            </p>
            <p class="mt-0.5 font-mono text-xs text-[var(--color-fg-subtle)]">
              Secret: {{ webhook.secret }}
            </p>
            <div class="mt-2 flex flex-wrap gap-1.5">
              <span v-for="event in webhook.events" :key="event" class="badge badge-info">
                {{ eventLabel(event) }}
              </span>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" @click="testWebhook(webhook.name)">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
              </svg>
              Testar webhook
            </Button>
            <Button variant="ghost" size="sm" @click="viewLogs(webhook.id)">Registros</Button>
            <Button variant="outline" size="sm" @click="deleteWebhook(webhook.id, webhook.name)">
              Excluir
            </Button>
          </div>
        </li>
      </ul>

      <EmptyState
        v-else
        icon="inbox"
        title="Nenhum webhook cadastrado"
        description="Crie seu primeiro webhook para receber eventos como transação criada ou conta criada."
        :action="{ label: 'Criar webhook', onClick: openCreateForm }"
      />
    </Card>

    <!-- Create form -->
    <Card v-if="showCreateForm" title="Criar webhook" description="Informe o destino e escolha os eventos que deseja receber." padding="none">
      <form class="space-y-4 p-6" @submit.prevent="onCreate">
        <Input
          id="webhook-name"
          v-model="form.name"
          label="Nome do webhook"
          type="text"
          required
          placeholder="Ex.: Notificações do Slack"
          :error="errors.name"
        />

        <Input
          id="webhook-url"
          v-model="form.url"
          label="URL do destino"
          type="url"
          required
          placeholder="https://seu-webhook.com"
          :error="errors.url"
          hint="O endereço que receberá o payload em requisições POST."
        />

        <div>
          <p class="label">Eventos</p>
          <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <label
              v-for="event in availableEvents"
              :key="event.value"
              class="flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-muted)] px-3 py-2 transition-colors hover:border-[var(--color-border-strong)]"
            >
              <input
                :id="`event-${event.value}`"
                v-model="form.events"
                :value="event.value"
                type="checkbox"
                class="h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-brand)] focus:ring-[var(--color-brand)]"
              />
              <span class="text-sm text-[var(--color-fg)]">{{ event.label }}</span>
            </label>
          </div>
          <p v-if="errors.events" class="error-text">{{ errors.events }}</p>
        </div>

        <div class="flex items-center justify-between gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-muted)] p-4">
          <div class="min-w-0">
            <p class="text-sm font-medium text-[var(--color-fg)]">Ativo</p>
            <p class="mt-0.5 text-xs text-[var(--color-fg-muted)]">
              Enquanto ativo, o payload é enviado a cada evento escolhido.
            </p>
          </div>
          <button
            id="webhook-active"
            type="button"
            role="switch"
            :aria-checked="form.isActive"
            aria-label="Ativo"
            class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors"
            :class="form.isActive ? 'bg-[var(--color-brand)]' : 'bg-[var(--color-border-strong)]'"
            @click="form.isActive = !form.isActive"
          >
            <span
              class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
              :class="form.isActive ? 'translate-x-6' : 'translate-x-1'"
            ></span>
          </button>
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
          <Button variant="ghost" type="button" @click="closeCreateForm">Cancelar</Button>
          <Button type="submit" :loading="creating" @click="onCreate">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Criar webhook
          </Button>
        </div>
      </form>
    </Card>

    <!-- Logs -->
    <Card
      v-if="showLogs"
      title="Registros do webhook"
      :description="selectedWebhook ? `Envios recentes para ${selectedWebhook.name}.` : 'Envios recentes.'"
      padding="md"
    >
      <template #header-actions>
        <Button variant="ghost" size="sm" @click="closeLogs">Fechar</Button>
      </template>

      <ul v-if="webhookLogs.length > 0" class="space-y-3">
        <li
          v-for="log in webhookLogs"
          :key="log.id"
          class="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-muted)] p-4"
        >
          <div class="flex flex-wrap items-center justify-between gap-2">
            <span class="text-sm font-medium text-[var(--color-fg)]">{{ eventLabel(log.event) }}</span>
            <span class="badge" :class="log.success ? 'badge-success' : 'badge-danger'">
              {{ log.success ? "Enviado" : "Falhou" }}
            </span>
          </div>
          <p class="mt-1 text-xs text-[var(--color-fg-muted)]">
            Última tentativa: {{ formatDate(log.createdAt, "pt-BR") }} ·
            Resposta HTTP: {{ log.status || "—" }}
          </p>
          <div class="mt-2 overflow-x-auto rounded-lg bg-[var(--color-bg-elevated)] p-3">
            <p class="text-xs font-semibold text-[var(--color-fg-muted)]">Payload enviado</p>
            <pre class="mt-1 text-xs text-[var(--color-fg)]">{{ JSON.stringify(log.payload, null, 2) }}</pre>
          </div>
          <div v-if="log.response" class="mt-2 overflow-x-auto rounded-lg bg-[var(--color-bg-elevated)] p-3">
            <p class="text-xs font-semibold text-[var(--color-fg-muted)]">Resposta do destino</p>
            <pre class="mt-1 text-xs text-[var(--color-fg)]">{{ JSON.stringify(log.response, null, 2) }}</pre>
          </div>
        </li>
      </ul>

      <EmptyState
        v-else
        icon="inbox"
        title="Nenhum registro por aqui"
        description="Assim que este webhook disparar, você verá o payload enviado e a resposta recebida."
      />
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Button, Card, EmptyState, Input } from "../../components/ui";
import { formatDate } from "../../utils/format";

const showCreateForm = ref(false);
const creating = ref(false);
const showLogs = ref(false);
const selectedWebhook = ref<{ id: string; name: string } | null>(null);

const form = ref({
  name: "",
  url: "",
  events: [] as string[],
  isActive: true,
});

const errors = ref({
  name: "",
  url: "",
  events: "",
});

const availableEvents = [
  { value: "TRANSACTION_CREATED", label: "Transação criada" },
  { value: "TRANSACTION_UPDATED", label: "Transação atualizada" },
  { value: "TRANSACTION_DELETED", label: "Transação excluída" },
  { value: "BUDGET_ALERT", label: "Alerta de orçamento" },
  { value: "GOAL_ACHIEVED", label: "Meta atingida" },
  { value: "RECURRING_DUE", label: "Recorrente vencido" },
];

const webhooks = ref([
  {
    id: "1",
    name: "Notificações do Slack",
    url: "https://hooks.slack.com/services/xxx",
    events: ["TRANSACTION_CREATED", "BUDGET_ALERT"],
    isActive: true,
    secret: "whsec_****abcd",
    createdAt: "2024-01-15",
    lastAttemptAt: "2024-02-01T09:00:00Z",
    lastStatus: 200,
  },
]);

const webhookLogs = ref([
  {
    id: "1",
    event: "TRANSACTION_CREATED",
    payload: { amount: 50, description: "Café" },
    response: { status: 200 },
    status: 200,
    success: true,
    createdAt: "2024-01-15T10:30:00Z",
  },
  {
    id: "2",
    event: "BUDGET_ALERT",
    payload: { budget: "Mercado", spent: 90 },
    response: null,
    status: 0,
    success: false,
    createdAt: "2024-01-15T09:00:00Z",
  },
]);

function eventLabel(event: string): string {
  return availableEvents.find((item) => item.value === event)?.label ?? event;
}

function openCreateForm() {
  showCreateForm.value = true;
}

function closeCreateForm() {
  showCreateForm.value = false;
  form.value = { name: "", url: "", events: [], isActive: true };
  errors.value = { name: "", url: "", events: "" };
}

async function onCreate() {
  errors.value.name = form.value.name.trim() ? "" : "Informe um nome para o webhook";
  errors.value.url = /^https?:\/\/.+/.test(form.value.url) ? "" : "Informe uma URL válida começando com http:// ou https://";
  errors.value.events = form.value.events.length > 0 ? "" : "Selecione ao menos um evento";
  if (errors.value.name || errors.value.url || errors.value.events) return;

  creating.value = true;
  try {
    // TODO: Implementar criação de webhook
    closeCreateForm();
    alert("Webhook criado!");
  } finally {
    creating.value = false;
  }
}

async function testWebhook(name: string) {
  // TODO: Implementar teste de webhook
  alert(`Enviando payload de teste para ${name}...`);
}

async function deleteWebhook(id: string, name: string) {
  if (!confirm(`Excluir o webhook "${name}"?`)) return;

  // TODO: Implementar exclusão de webhook
  webhooks.value = webhooks.value.filter((webhook) => webhook.id !== id);
  alert("Webhook excluído.");
}

function viewLogs(id: string) {
  const webhook = webhooks.value.find((item) => item.id === id);
  selectedWebhook.value = webhook ? { id: webhook.id, name: webhook.name } : null;
  showLogs.value = true;
}

function closeLogs() {
  showLogs.value = false;
  selectedWebhook.value = null;
}
</script>