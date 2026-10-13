<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-2xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">Security</h1>

      <Card>
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Change Password</h2>
        <form @submit.prevent="changePassword" class="space-y-4">
          <div>
            <label for="currentPassword" class="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <Input
              id="currentPassword"
              v-model="passwordForm.currentPassword"
              type="password"
              required
              autocomplete="current-password"
            />
          </div>
          <div>
            <label for="newPassword" class="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <Input
              id="newPassword"
              v-model="passwordForm.newPassword"
              type="password"
              required
              minlength="8"
              autocomplete="new-password"
            />
            <p class="mt-1 text-sm text-gray-500">Minimum 8 characters</p>
          </div>
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <Input
              id="confirmPassword"
              v-model="passwordForm.confirmPassword"
              type="password"
              required
              autocomplete="new-password"
            />
          </div>
          <Button type="submit" :disabled="changingPassword">{{ changingPassword ? 'Changing...' : 'Change Password' }}</Button>
        </form>
      </Card>

      <Card class="mt-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Two-Factor Authentication (2FA)</h2>
        <div class="space-y-4">
          <div v-if="!twoFactorEnabled" class="p-4 bg-blue-50 rounded-lg">
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium text-gray-900">Two-Factor Authentication</p>
                <p class="text-sm text-gray-500">Add an extra layer of security to your account</p>
              </div>
              <Button variant="primary" @click="enable2FA">Enable 2FA</Button>
            </div>
          </div>

          <div v-else class="p-4 bg-green-50 rounded-lg">
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium text-gray-900">Two-Factor Authentication Enabled</p>
                <p class="text-sm text-gray-500">Your account is protected with 2FA</p>
              </div>
              <Button variant="danger" @click="disable2FA">Disable 2FA</Button>
            </div>
          </div>
        </div>
      </Card>

      <Card class="mt-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Active Sessions</h2>
        <div v-if="sessions.length > 0" class="space-y-3">
          <div v-for="session in sessions" :key="session.id" class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p class="font-medium text-gray-900">{{ session.device }}</p>
              <p class="text-sm text-gray-500">{{ session.location }} • {{ session.lastActive }}</p>
            </div>
            <Button variant="ghost" size="sm" @click="revokeSession(session.id)">Revoke</Button>
          </div>
        </div>
        <div v-else class="text-center py-4 text-gray-500">No active sessions</div>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Card from "../../components/ui/Card.vue";
import Input from "../../components/ui/Input.vue";
import Button from "../../components/ui/Button.vue";

const changingPassword = ref(false);
const twoFactorEnabled = ref(false);

const passwordForm = ref({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const sessions = ref([
  { id: "1", device: "Chrome on Windows", location: "São Paulo, BR", lastActive: "2 minutes ago" },
]);

async function changePassword() {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    alert("Passwords do not match");
    return;
  }
  if (passwordForm.value.newPassword.length < 8) {
    alert("Password must be at least 8 characters");
    return;
  }
  changingPassword.value = true;
  // TODO: Implement change password API call
  alert("Password changed successfully!");
  changingPassword.value = false;
}

async function enable2FA() {
  // TODO: Implement 2FA enable
  alert("2FA setup not yet implemented");
}

async function disable2FA() {
  // TODO: Implement 2FA disable
  alert("2FA disabled");
}

async function revokeSession(id: string) {
  // TODO: Implement session revocation
  alert("Session revoked");
}
</script>