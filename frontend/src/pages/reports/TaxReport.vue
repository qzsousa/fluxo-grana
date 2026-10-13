<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Tax Report</h1>
        <p class="text-gray-600 mt-1">Generate tax reports (DARF, GCAP, etc.)</p>
      </div>

      <Card>
        <div class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">Tax Reports</h3>
          <p class="mt-1 text-sm text-gray-500">Generate DARF, GCAP, and other Brazilian tax reports</p>
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import Card from "../../components/ui/Card.vue";
</script>