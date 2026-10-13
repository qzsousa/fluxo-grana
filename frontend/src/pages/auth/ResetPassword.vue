<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6">
    <div class="relative w-full max-w-md">
      <div class="bg-white rounded-2xl shadow-xl p-8">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
          <p class="text-gray-600">Enter your new password below</p>
        </div>

        <form @submit.prevent="onSubmit" class="space-y-6">
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <Input
              id="password"
              v-model="password"
              type="password"
              required
              minlength="8"
              autocomplete="new-password"
              placeholder="••••••••"
            />
            <p class="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
          </div>

          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <Input
              id="confirmPassword"
              v-model="confirmPassword"
              type="password"
              required
              autocomplete="new-password"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            :disabled="auth.loading"
            class="w-full py-3 px-4 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
          >
            <span v-if="auth.loading">Resetting...</span>
            <span v-else>Reset Password</span>
          </button>
        </form>

        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600">
            Remember your password?
            <router-link to="/login" class="text-primary-600 hover:text-primary-700 font-medium transition-colors">
              Sign in
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import Input from "../../components/ui/Input.vue";
import { useAuthStore } from "../../stores/auth";

const password = ref("");
const confirmPassword = ref("");
const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

async function onSubmit() {
  if (password.value !== confirmPassword.value) {
    alert("Passwords do not match");
    return;
  }

  if (password.value.length < 8) {
    alert("Password must be at least 8 characters");
    return;
  }

  const token = route.params.token as string;
  
  // TODO: Implement reset password API call
  alert("Reset password functionality not yet implemented");
}
</script>