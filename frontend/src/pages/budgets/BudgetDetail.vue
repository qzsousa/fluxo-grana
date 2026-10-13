<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Budget Detail</h1>
        <router-link :to="{ name: 'budgets' }" class="text-primary-600 hover:text-primary-700">
          Back to Budgets
        </router-link>
      </div>

      <UiCard v-if="budget">
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-900">{{ budget.name }}</h2>
            <span class="px-3 py-1 text-sm rounded-full" :class="budget.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'">
              {{ budget.isActive ? 'Active' : 'Inactive' }}
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="p-4 bg-gray-50 rounded-lg">
              <p class="text-sm text-gray-500">Period</p>
              <p class="text-lg font-medium text-gray-900 capitalize">{{ budget.period.toLowerCase() }}</p>
            </div>
            <div class="p-4 bg-gray-50 rounded-lg">
              <p class="text-sm text-gray-500">Budget Amount</p>
              <p class="text-lg font-medium text-gray-900">{{ budget.currency }} {{ budget.amount.toLocaleString() }}</p>
            </div>
            <div class="p-4 bg-gray-50 rounded-lg">
              <p class="text-sm text-gray-500">Alert At</p>
              <p class="text-lg font-medium text-gray-900">{{ budget.alertAt }}%</p>
            </div>
          </div>

          <div class="pt-4 border-t">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Categories</h3>
            <div v-if="budget.categories && budget.categories.length > 0" class="flex flex-wrap gap-2">
              <span v-for="cat in budget.categories" :key="cat.id" class="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full" :style="{ backgroundColor: cat.color + '20', color: cat.color }">
                <span>{{ cat.icon }}</span>
                <span class="ml-1">{{ cat.name }}</span>
              </span>
            </div>
            <p v-else class="text-sm text-gray-500">No categories assigned</p>
          </div>
        </div>
      </UiCard>

      <div v-else class="text-center py-8">
        <p class="text-gray-500">Loading budget...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useBudget } from "../../composables/useApi";
import UiCard from "../../components/ui/Card.vue";

const route = useRoute();
const budgetId = route.params.id as string;
const { data: budget } = useBudget(budgetId);
</script>