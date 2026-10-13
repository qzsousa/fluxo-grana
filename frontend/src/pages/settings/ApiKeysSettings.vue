<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-2xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900">API Keys</h1>
        <Button @click="showCreateForm = true" class="flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Create API Key
        </Button>
      </div>

      <div v-if="apiKeys.length > 0">
        <UiCard>
          <div class="space-y-4">
            <div v-for="key in apiKeys" :key="key.id" class="p-4 bg-gray-50 rounded-lg">
              <div class="flex items-center justify-between">
                <div>
                  <p class="font-medium text-gray-900">{{ key.name }}</p>
                  <p class="text-sm text-gray-500">Prefix: {{ key.prefix }} • Created: {{ new Date(key.createdAt).toLocaleDateString() }}</p>
                  <p class="text-xs text-gray-400 mt-1">Permissions: {{ key.permissions.join(", ") }}</p>
                </div>
                <Button variant="danger" size="sm" @click="revokeKey(key.id)">Revoke</Button>
              </div>
            </div>
          </div>
        </UiCard>
      </div>

      <div v-else class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No API keys</h3>
        <p class="mt-1 text-sm text-gray-500">Create your first API key to access the API.</p>
        <div class="mt-6">
          <Button @click="showCreateForm = true">Create API Key</Button>
        </div>
      </div>

      <UiCard v-if="showCreateForm" class="mt-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Create API Key</h2>
        <form @submit.prevent="onCreate" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Key Name</label>
            <Input v-model="form.name" type="text" required placeholder="e.g., Mobile App" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Permissions</label>
            <div class="grid grid-cols-2 gap-2">
              <label class="flex items-center gap-2" v-for="perm in availablePermissions" :key="perm">
                <input type="checkbox" :value="perm" v-model="form.permissions" class="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" />
                <span class="text-sm text-gray-700">{{ perm }}</span>
              </label>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Expires In (days, optional)</label>
            <Input v-model.number="form.expiresInDays" type="number" min="1" placeholder="Leave blank for no expiration" />
          </div>

          <div class="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="secondary" @click="showCreateForm = false">Cancel</Button>
            <Button type="submit" :disabled="creating">{{ creating ? 'Creating...' : 'Create API Key' }}</Button>
          </div>
        </form>
      </UiCard>

      <UiCard v-if="showKey" class="mt-6 border-green-200 bg-green-50">
        <h3 class="text-lg font-semibold text-green-800 mb-2">API Key Created!</h3>
        <p class="text-sm text-green-700 mb-4">Save this key now. You won't be able to see it again.</p>
        <div class="bg-white p-4 rounded-lg border border-gray-200 font-mono text-sm break-all">{{ newKey }}</div>
        <Button @click="showKey = false" class="mt-4" variant="secondary">I've saved it</Button>
      </UiCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import UiCard from "../../components/ui/Card.vue";
import Input from "../../components/ui/Input.vue";
import Button from "../../components/ui/Button.vue";
import Select from "../../components/ui/Select.vue";

const showCreateForm = ref(false);
const creating = ref(false);
const showKey = ref(false);
const newKey = ref("");

const form = ref({
  name: "",
  permissions: [],
  expiresInDays: null,
});

const availablePermissions = [
  "READ_TRANSACTIONS",
  "WRITE_TRANSACTIONS",
  "READ_ACCOUNTS",
  "WRITE_ACCOUNTS",
  "READ_INVESTMENTS",
  "WRITE_INVESTMENTS",
  "READ_BUDGETS",
  "WRITE_BUDGETS",
  "READ_GOALS",
  "WRITE_GOALS",
  "READ_REPORTS",
];

const apiKeys = ref([
  { id: "1", name: "Mobile App", prefix: "sk_live_abc", permissions: ["READ_TRANSACTIONS", "READ_ACCOUNTS"], createdAt: "2024-01-15" },
]);

async function onCreate() {
  if (!form.value.name) {
    alert("Key name is required");
    return;
  }
  if (form.value.permissions.length === 0) {
    alert("At least one permission is required");
    return;
  }
  // TODO: Implement create API key
  alert("API key created! (mock)");
  showCreateForm.value = false;
  showKey.value = true;
  newKey.value = "sk_live_" + Math.random().toString(36).substr(2, 32);
}

async function revokeKey(id) {
  if (!confirm("Are you sure you want to revoke this API key?")) return;
  // TODO: Implement revoke API call
  alert("API key revoked!");
}
</script>
