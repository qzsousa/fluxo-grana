<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-2xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h1>

      <Card>
        <form @submit.prevent="onSubmit" class="space-y-6">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <Input
              id="name"
              v-model="form.name"
              type="text"
              required
              autocomplete="name"
            />
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <Input
              id="email"
              v-model="form.email"
              type="email"
              required
              autocomplete="email"
              disabled
            />
            <p class="mt-1 text-sm text-gray-500">Email cannot be changed. Contact support if needed.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="locale" class="block text-sm font-medium text-gray-700 mb-1">Language</label>
              <Select
                id="locale"
                v-model="form.locale"
                :options="localeOptions"
              />
            </div>

            <div>
              <label for="timezone" class="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
              <Select
                id="timezone"
                v-model="form.timezone"
                :options="timezoneOptions"
              />
            </div>
          </div>

          <div class="flex justify-end space-x-3 pt-4 border-t">
            <Button type="submit" :disabled="saving">{{ saving ? 'Saving...' : 'Save Changes' }}</Button>
          </div>
        </form>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useAuthStore } from "../../stores/auth";
import Card from "../../components/ui/Card.vue";
import Input from "../../components/ui/Input.vue";
import Select from "../../components/ui/Select.vue";
import Button from "../../components/ui/Button.vue";

const saving = ref(false);
const auth = useAuthStore();

const form = ref({
  name: auth.user?.name || "",
  email: auth.user?.email || "",
  locale: auth.user?.locale || "pt-BR",
  timezone: auth.user?.timezone || "America/Sao_Paulo",
});

const localeOptions = [
  { value: "pt-BR", label: "Português (Brasil)" },
  { value: "en-US", label: "English (US)" },
  { value: "es-ES", label: "Español" },
];

const timezoneOptions = [
  { value: "America/Sao_Paulo", label: "America/Sao_Paulo (UTC-3)" },
  { value: "America/New_York", label: "America/New_York (UTC-5)" },
  { value: "America/Los_Angeles", label: "America/Los_Angeles (UTC-8)" },
  { value: "Europe/London", label: "Europe/London (UTC+0)" },
  { value: "Europe/Paris", label: "Europe/Paris (UTC+1)" },
  { value: "UTC", label: "UTC" },
];

async function onSubmit() {
  saving.value = true;
  try {
    // TODO: Implement profile update API call
    alert("Profile updated successfully!");
  } catch (error) {
    alert("Failed to update profile: " + (error as Error).message);
  } finally {
    saving.value = false;
  }
}
</script>