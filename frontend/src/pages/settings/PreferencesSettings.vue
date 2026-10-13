<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-2xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">Preferences</h1>

      <Card>
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Currency & Locale</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Default Currency</label>
            <Select v-model="preferences.currency" :options="currencyOptions" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Date Format</label>
            <Select v-model="preferences.dateFormat" :options="dateFormatOptions" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Number Format</label>
            <Select v-model="preferences.numberFormat" :options="numberFormatOptions" />
          </div>
        </div>
      </Card>

      <Card class="mt-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Notifications</h2>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-gray-900">Email Notifications</p>
              <p class="text-sm text-gray-500">Receive email updates about your finances</p>
            </div>
            <input
              type="checkbox"
              v-model="preferences.emailNotifications"
              class="h-5 w-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
          </div>

          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-gray-900">Budget Alerts</p>
              <p class="text-sm text-gray-500">Get notified when approaching budget limits</p>
            </div>
            <input
              type="checkbox"
              v-model="preferences.budgetAlerts"
              class="h-5 w-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
          </div>

          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-gray-900">Goal Reminders</p>
              <p class="text-sm text-gray-500">Get reminded about your financial goals</p>
            </div>
            <input
              type="checkbox"
              v-model="preferences.goalReminders"
              class="h-5 w-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
          </div>
        </div>
      </Card>

      <Card class="mt-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Display</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Theme</label>
            <Select v-model="preferences.theme" :options="themeOptions" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Compact Mode</label>
            <input
              type="checkbox"
              v-model="preferences.compactMode"
              class="h-5 w-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Show Charts</label>
            <input
              type="checkbox"
              v-model="preferences.showCharts"
              class="h-5 w-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import Card from "../../components/ui/Card.vue";
import Select from "../../components/ui/Select.vue";

const preferences = ref({
  currency: "BRL",
  dateFormat: "DD/MM/YYYY",
  numberFormat: "pt-BR",
  emailNotifications: true,
  budgetAlerts: true,
  goalReminders: true,
  theme: "system",
  compactMode: false,
  showCharts: true,
});

const currencyOptions = [
  { value: "BRL", label: "BRL - Brazilian Real" },
  { value: "USD", label: "USD - US Dollar" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "GBP", label: "GBP - British Pound" },
];

const dateFormatOptions = [
  { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
  { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
  { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
];

const numberFormatOptions = [
  { value: "pt-BR", label: "1.234,56 (Brazil)" },
  { value: "en-US", label: "1,234.56 (US)" },
  { value: "de-DE", label: "1.234,56 (Germany)" },
];

const themeOptions = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];
</script>