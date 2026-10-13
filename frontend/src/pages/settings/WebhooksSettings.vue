<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-2xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Webhooks</h1>
        <Button @click="showCreateForm = true" class="flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Add Webhook
        </Button>
      </div>

      <div v-if="webhooks.length > 0">
        <UiCard>
          <div class="space-y-4">
            <div v-for="webhook in webhooks" :key="webhook.id" class="p-4 bg-gray-50 rounded-lg">
              <div class="flex items-start justify-between">
                <div>
                  <p class="font-medium text-gray-900">{{ webhook.name }}</p>
                  <p class="text-sm text-gray-500">URL: {{ webhook.url }}</p>
                  <p class="text-xs text-gray-400 mt-1">Events: {{ webhook.events.join(", ") }} • {{ webhook.isActive ? "Active" : "Inactive" }}</p>
                </div>
                <div class="flex items-center gap-2">
                  <Button variant="ghost" size="sm" @click="viewLogs(webhook.id)">Logs</Button>
                  <Button variant="danger" size="sm" @click="deleteWebhook(webhook.id)">Delete</Button>
                </div>
              </div>
            </div>
          </div>
        </UiCard>
      </div>

      <div v-else class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No webhooks</h3>
        <p class="mt-1 text-sm text-gray-500">Create your first webhook to receive real-time notifications.</p>
        <div class="mt-6">
          <Button @click="showCreateForm = true">Add Webhook</Button>
        </div>
      </div>

      <UiCard v-if="showCreateForm" class="mt-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Create Webhook</h2>
        <form @submit.prevent="onCreate" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Webhook Name</label>
            <Input v-model="form.name" type="text" required placeholder="e.g., Slack Notifications" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Webhook URL</label>
            <Input v-model="form.url" type="url" required placeholder="https://your-webhook-url.com" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Events</label>
            <div class="grid grid-cols-2 gap-2">
              <label class="flex items-center gap-2" v-for="event in availableEvents" :key="event">
                <input type="checkbox" :value="event" v-model="form.events" class="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" />
                <span class="text-sm text-gray-700">{{ event }}</span>
              </label>
            </div>
          </div>

          <div class="flex items-center">
            <input type="checkbox" v-model="form.isActive" id="isActive" class="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" />
            <label for="isActive" class="ml-2 text-sm text-gray-700">Active</label>
          </div>

          <div class="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="secondary" @click="showCreateForm = false">Cancel</Button>
            <Button type="submit" :disabled="creating">{{ creating ? 'Creating...' : 'Create Webhook' }}</Button>
          </div>
        </form>
      </UiCard>

      <UiCard v-if="showLogs" class="mt-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold text-gray-900">Webhook Logs</h2>
          <Button variant="ghost" @click="showLogs = false">Close</Button>
        </div>
        <div class="space-y-4 max-h-96 overflow-y-auto">
          <div v-for="log in webhookLogs" :key="log.id" class="p-4 bg-gray-50 rounded-lg">
            <div class="flex items-center justify-between mb-2">
              <span class="font-medium text-gray-900">{{ log.event }}</span>
              <span class="text-sm" :class="log.success ? 'text-green-600' : 'text-red-600'">{{ log.success ? 'Success' : 'Failed' }}</span>
            </div>
            <p class="text-sm text-gray-500">{{ new Date(log.createdAt).toLocaleString() }}</p>
            <div class="mt-2 p-2 bg-gray-100 rounded text-xs font-mono overflow-x-auto">
              <pre>{{ JSON.stringify(log.payload, null, 2) }}</pre>
            </div>
            <div v-if="log.response" class="mt-2 p-2 bg-gray-100 rounded text-xs font-mono overflow-x-auto">
              <pre>{{ JSON.stringify(log.response, null, 2) }}</pre>
            </div>
          </div>
        </div>
      </UiCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import UiCard from "../../components/ui/Card.vue";
import Input from "../../components/ui/Input.vue";
import Button from "../../components/ui/Button.vue";

const showCreateForm = ref(false);
const creating = ref(false);
const selectedWebhook = ref(null);

const form = ref({
  name: "",
  url: "",
  events: [],
  isActive: true,
});

const availableEvents = [
  "TRANSACTION_CREATED",
  "TRANSACTION_UPDATED",
  "TRANSACTION_DELETED",
  "BUDGET_ALERT",
  "GOAL_ACHIEVED",
  "RECURRING_DUE",
];

const webhooks = ref([
  { id: "1", name: "Slack Notifications", url: "https://hooks.slack.com/services/xxx", events: ["TRANSACTION_CREATED", "BUDGET_ALERT"], isActive: true, createdAt: "2024-01-15" },
]);

const selectedWebhookId = ref(null);
const webhookLogs = ref([
  { id: "1", event: "TRANSACTION_CREATED", payload: { amount: 50, description: "Coffee" }, response: { status: 200 }, status: 200, success: true, createdAt: "2024-01-15T10:30:00Z" },
  { id: "2", event: "BUDGET_ALERT", payload: { budget: "Groceries", spent: 90 }, response: null, status: 0, success: false, createdAt: "2024-01-15T09:00:00Z" },
]);

async function onCreate() {
  if (!form.value.name || !form.value.url || form.value.events.length === 0) {
    alert("Name, URL, and at least one event are required");
    return;
  }
  // TODO: Implement create webhook
  alert("Webhook created!");
  showCreateForm.value = false;
  form.value = { name: "", url: "", events: [], isActive: true };
}

async function deleteWebhook(id: string) {
  if (!confirm("Delete this webhook?")) return;
  alert("Webhook deleted!");
}

async function viewLogs(webhook: any) {
  selectedWebhook.value = webhook;
  showLogs.value = true;
}

function closeLogs() {
  showLogs.value = false;
  selectedWebhook.value = null;
}

</script>