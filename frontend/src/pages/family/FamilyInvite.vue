<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-2xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">Invite Family Member</h1>

      <UiCard>
        <form @submit.prevent="onInvite" class="space-y-6">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <Input
              id="email"
              v-model="inviteForm.email"
              type="email"
              required
              autocomplete="email"
              placeholder="family@email.com"
            />
          </div>

          <div>
            <label for="role" class="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <Select
              id="role"
              v-model="inviteForm.role"
              :options="roleOptions"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Message (optional)</label>
            <textarea
              v-model="inviteForm.message"
              rows="4"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Add a personal message to the invitation..."
            ></textarea>
          </div>

          <div class="flex justify-end space-x-3 pt-4 border-t">
            <router-link :to="{ name: 'family' }" class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              Cancel
            </router-link>
            <Button type="submit" :disabled="inviting">
              <span v-if="inviting">Sending...</span>
              <span v-else>Send Invitation</span>
            </Button>
          </div>
        </form>
      </UiCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import UiCard from "../../components/ui/Card.vue";
import Input from "../../components/ui/Input.vue";
import Select from "../../components/ui/Select.vue";
import Button from "../../components/ui/Button.vue";

const inviting = ref(false);
const router = useRouter();

const inviteForm = ref({
  email: "",
  role: "MEMBER",
  message: "",
});

const roleOptions = [
  { value: "ADMIN", label: "Admin" },
  { value: "MEMBER", label: "Member" },
  { value: "VIEWER", label: "Viewer" },
];

async function onInvite() {
  if (!inviteForm.value.email) {
    alert("Email is required");
    return;
  }

  inviting.value = true;
  try {
    // TODO: Implement invite API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert("Invitation sent successfully!");
    router.push({ name: "family" });
  } catch (error) {
    alert("Failed to send invitation: " + error.message);
  } finally {
    inviting.value = false;
  }
}
</script>