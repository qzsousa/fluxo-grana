<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Settings</h1>
        <p class="text-gray-600 mt-1">Manage your account and preferences</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- Sidebar Navigation -->
        <div class="lg:col-span-1">
          <nav class="space-y-1">
            <router-link
              v-for="item in settingsMenu"
              :key="item.path"
              :to="item.path"
              class="block px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              :class="{ 'bg-primary-50 text-primary-700 font-medium': $route.path.startsWith(item.path) }"
            >
              {{ item.label }}
            </router-link>
          </nav>
        </div>

        <!-- Content Area -->
        <div class="lg:col-span-3">
          <router-view></router-view>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

const settingsMenu = [
  { path: "/settings/profile", label: "Profile" },
  { path: "/settings/preferences", label: "Preferences" },
  { path: "/settings/security", label: "Security" },
  { path: "/settings/family", label: "Family Sharing" },
  { path: "/settings/api-keys", label: "API Keys" },
  { path: "/settings/webhooks", label: "Webhooks" },
  { path: "/settings/import-export", label: "Import/Export" },
];
</script>