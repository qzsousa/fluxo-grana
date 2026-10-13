<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Net Worth Report</h1>
        <p class="text-gray-600 mt-1">Track your net worth over time</p>
      </div>

      <Card>
        <div class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">Net Worth Chart</h3>
          <p class="mt-1 text-sm text-gray-500">Interactive chart coming soon</p>
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import Card from "../../components/ui/Card.vue";
</script>