<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6">
    <div class="relative w-full max-w-md">
      <div class="bg-white rounded-2xl shadow-xl p-8">
        <div class="text-center mb-8">
          <div v-if="verifying" class="mb-6">
            <svg class="animate-spin mx-auto h-12 w-12 text-primary-600" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p class="mt-4 text-gray-600">Verifying your email...</p>
          </div>

          <div v-else-if="success" class="mb-6">
            <svg class="mx-auto h-12 w-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h1 class="mt-4 text-3xl font-bold text-gray-900">Email Verified!</h1>
            <p class="mt-2 text-gray-600">Your email has been successfully verified.</p>
          </div>

          <div v-else class="mb-6">
            <svg class="mx-auto h-12 w-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h1 class="mt-4 text-3xl font-bold text-gray-900">Verification Failed</h1>
            <p class="mt-2 text-gray-600">{{ errorMessage }}</p>
          </div>

          <div class="mt-6">
            <router-link
              to="/login"
              class="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              Go to Login
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "../../stores/auth";

const verifying = ref(true);
const success = ref(false);
const errorMessage = ref("");
const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

onMounted(async () => {
  const token = route.params.token as string;
  
  try {
    // TODO: Implement email verification API call
    // const response = await api.post("/auth/verify-email", { token });
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate success
    verifying.value = false;
    success.value = true;
  } catch (error: any) {
    verifying.value = false;
    success.value = false;
    errorMessage.value = error.response?.data?.error || "Invalid or expired verification link";
  }
});
</script>