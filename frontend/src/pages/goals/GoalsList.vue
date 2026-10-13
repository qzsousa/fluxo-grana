<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Goals</h1>
        <Button @click="showAddForm = true" class="flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Add Goal
        </Button>
      </div>

      <div v-if="goals.length > 0">
        <UiCard>
          <div class="space-y-4">
            <div v-for="goal in goals" :key="goal.id" class="p-4 bg-gray-50 rounded-lg">
              <div class="flex items-center justify-between">
                <div>
                  <p class="font-medium text-gray-900">{{ goal.name }}</p>
                  <p class="text-sm text-gray-500">{{ goal.currency }} {{ goal.currentAmount.toLocaleString() }} / {{ goal.currency }} {{ goal.targetAmount.toLocaleString() }}</p>
                  <div class="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div class="h-full bg-primary-600" :style="{ width: Math.min((goal.currentAmount / goal.targetAmount) * 100, 100) + '%' }"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </UiCard>
      </div>

      <div v-else class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No goals</h3>
        <p class="mt-1 text-sm text-gray-500">Set your first financial goal.</p>
        <div class="mt-6">
          <Button @click="showAddForm = true">Add Goal</Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useGoals } from "../../composables/useApi";
import UiCard from "../../components/ui/Card.vue";
import Button from "../../components/ui/Button.vue";

const showAddForm = ref(false);
const goals = ref([]);
const { data: goalsData } = useGoals();

if (goalsData.value) {
  goals.value = goalsData.value;
}
</script>