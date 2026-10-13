<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Goal Detail</h1>
        <router-link :to="{ name: 'goals' }" class="text-primary-600 hover:text-primary-700">
          Back to Goals
        </router-link>
      </div>

      <UiCard v-if="goal">
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-900">{{ goal.name }}</h2>
            <span class="px-3 py-1 text-sm rounded-full" :class="goal.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'">
              {{ goal.isActive ? 'Active' : 'Inactive' }}
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="p-4 bg-gray-50 rounded-lg">
              <p class="text-sm text-gray-500">Target Amount</p>
              <p class="text-lg font-medium text-gray-900">{{ goal.currency }} {{ goal.targetAmount.toLocaleString() }}</p>
            </div>
            <div class="p-4 bg-gray-50 rounded-lg">
              <p class="text-sm text-gray-500">Current Amount</p>
              <p class="text-lg font-medium text-gray-900">{{ goal.currency }} {{ goal.currentAmount.toLocaleString() }}</p>
            </div>
            <div class="p-4 bg-gray-50 rounded-lg">
              <p class="text-sm text-gray-500">Progress</p>
              <div class="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div class="h-full bg-primary-600" :style="{ width: `${Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)}%` }"></div>
              </div>
              <p class="mt-1 text-sm text-gray-500">{{ Math.min((goal.currentAmount / goal.targetAmount) * 100, 100).toFixed(1) }}%</p>
            </div>
          </div>

          <div class="pt-4 border-t">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Details</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-gray-500">Type</p>
                <p class="font-medium text-gray-900 capitalize">{{ goal.type.toLowerCase().replace('_', ' ') }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Currency</p>
                <p class="font-medium text-gray-900">{{ goal.currency }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Target Date</p>
                <p class="font-medium text-gray-900">{{ goal.targetDate ? new Date(goal.targetDate).toLocaleDateString() : 'Not set' }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Status</p>
                <span class="px-3 py-1 text-sm rounded-full" :class="goal.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'">
                  {{ goal.isActive ? 'Active' : 'Inactive' }}
                </span>
              </div>
            </div>
          </div>

          <div v-if="goal.description" class="pt-4 border-t">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Description</h3>
            <p class="text-gray-700 whitespace-pre-wrap">{{ goal.description }}</p>
          </div>

          <div class="pt-4 border-t flex justify-end space-x-3">
            <router-link :to="{ path: `/goals/${goal.id}/edit` }" class="px-4 py-2 text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors">
              Edit Goal
            </router-link>
            <Button variant="danger" @click="handleDeleteGoal">Delete</Button>
          </div>
        </div>
      </UiCard>

      <div v-else class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No goal</h3>
        <p class="mt-1 text-sm text-gray-500">Goal not found.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useGoals, useGoal, useDeleteGoal } from "../../composables/useApi";
import UiCard from "../../components/ui/Card.vue";
import Button from "../../components/ui/Button.vue";

const route = useRoute();
const router = useRouter();
const goalId = route.params.id as string;
const { data: goal } = useGoal(goalId);
const { mutateAsync: deleteGoalApi } = useDeleteGoal();

async function handleDeleteGoal() {
  if (!confirm("Are you sure you want to delete this goal?")) return;
  try {
    await deleteGoalApi(goalId);
    router.push({ name: "goals" });
  } catch (error) {
    alert("Failed to delete goal: " + (error as Error).message);
  }
}
</script>