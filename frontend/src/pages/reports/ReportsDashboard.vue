<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Reports</h1>
        <p class="text-gray-600 mt-1">View your financial reports and analytics</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <router-link
          to="/reports/cashflow"
          class="block p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 012-2h2a2 2 0 012 2v10z"></path>
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900">Cash Flow</h3>
              <p class="text-sm text-gray-500">Income vs expenses over time</p>
            </div>
          </div>
        </router-link>

        <router-link
          to="/reports/net-worth"
          class="block p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900">Net Worth</h3>
              <p class="text-sm text-gray-500">Track your net worth over time</p>
            </div>
          </div>
        </router-link>

        <router-link
          to="/reports/tax"
          class="block p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900">Tax Report</h3>
              <p class="text-sm text-gray-500">Generate tax reports (DARF, GCAP)</p>
            </div>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import UiCard from "../../components/ui/Card.vue";
</script>