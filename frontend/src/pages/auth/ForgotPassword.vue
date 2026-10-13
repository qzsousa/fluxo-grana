<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6">
    <div class="relative w-full max-w-md">
      <div class="bg-white rounded-2xl shadow-xl p-8">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Forgot Password</h1>
          <p class="text-gray-600">Enter your email and we'll send you a reset link</p>
        </div>

        <form @submit.prevent="onSubmit" class="space-y-6">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <Input
              id="email"
              v-model="email"
              type="email"
              required
              autocomplete="email"
              placeholder="your@email.com"
            />
          </div>

          <button
            type="submit"
            :disabled="auth.loading"
            class="w-full py-3 px-4 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
          >
            <span v-if="auth.loading">Sending...</span>
            <span v-else>Send Reset Link</span>
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
import { useRouter } from "vue-router";
import Input from "../../components/ui/Input.vue";
import { useAuthStore } from "../../stores/auth";

const email = ref("");
const router = useRouter();
const auth = useAuthStore();

async function onSubmit() {
  alert("Forgot password functionality not yet implemented");
}
</script>