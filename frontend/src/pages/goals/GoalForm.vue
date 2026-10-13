<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-2xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900">{{ isEditing ? 'Edit Goal' : 'Add New Goal' }}</h1>
        <router-link :to="{ name: 'goals' }" class="text-primary-600 hover:text-primary-700">
          Cancel
        </router-link>
      </div>

      <UiCard>
        <form @submit.prevent="onSubmit" class="space-y-6">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Goal Name</label>
            <Input
              id="name"
              v-model="form.name"
              type="text"
              required
              autocomplete="off"
              placeholder="e.g., Emergency Fund"
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="type" class="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <Select
                id="type"
                v-model="form.type"
                :options="goalTypes"
                required
              />
            </div>

            <div>
              <label for="currency" class="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <Select
                id="currency"
                v-model="form.currency"
                :options="currencyOptions"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="targetAmount" class="block text-sm font-medium text-gray-700 mb-1">Target Amount</label>
              <Input
                id="targetAmount"
                v-model.number="form.targetAmount"
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0.00"
              />
            </div>

            <div>
              <label for="currentAmount" class="block text-sm font-medium text-gray-700 mb-1">Current Amount</label>
              <Input
                id="currentAmount"
                v-model.number="form.currentAmount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="targetDate" class="block text-sm font-medium text-gray-700 mb-1">Target Date (optional)</label>
              <Input
                id="targetDate"
                v-model="form.targetDate"
                type="date"
              />
            </div>

            <div>
              <label for="accountId" class="block text-sm font-medium text-gray-700 mb-1">Linked Account (optional)</label>
              <Select
                id="accountId"
                v-model="form.accountId"
                :options="accountOptions"
              />
            </div>
          </div>

          <div>
            <label for="description" class="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
            <textarea
              id="description"
              v-model="form.description"
              rows="3"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Add a description..."
            ></textarea>
          </div>

          <div class="flex items-center">
            <input
              id="isActive"
              v-model="form.isActive"
              type="checkbox"
              class="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <label for="isActive" class="ml-2 block text-sm text-gray-700">Active</label>
          </div>

          <div class="flex justify-end space-x-3 pt-4 border-t">
            <router-link :to="{ name: 'goals' }" class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              Cancel
            </router-link>
            <Button type="submit" :disabled="saving">
              <span v-if="saving">Saving...</span>
              <span v-else>{{ isEditing ? 'Update Goal' : 'Create Goal' }}</span>
            </Button>
          </div>
        </form>
      </UiCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useGoals, useCreateGoal, useUpdateGoal, useAccounts } from "../../composables/useApi";
import UiCard from "../../components/ui/Card.vue";
import Input from "../../components/ui/Input.vue";
import Select from "../../components/ui/Select.vue";
import Button from "../../components/ui/Button.vue";

const route = useRoute();
const router = useRouter();
const isEditing = computed(() => route.params.id !== undefined);
const goalId = route.params.id as string;

const { data: accountsData } = useAccounts();
const saving = ref(false);

const form = ref({
  name: "",
  type: "SAVINGS",
  targetAmount: 0,
  currentAmount: 0,
  currency: "BRL",
  targetDate: "",
  accountId: "",
  description: "",
  isActive: true,
});

const goalTypes = [
  { value: "SAVINGS", label: "Savings" },
  { value: "DEBT_PAYOFF", label: "Debt Payoff" },
  { value: "INVESTMENT", label: "Investment" },
  { value: "EMERGENCY_FUND", label: "Emergency Fund" },
  { value: "CUSTOM", label: "Custom" },
];

const currencyOptions = [
  { value: "BRL", label: "BRL - Brazilian Real" },
  { value: "USD", label: "USD - US Dollar" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "GBP", label: "GBP - British Pound" },
];

const accountOptions = computed(() =>
  [{ value: "", label: "Select account" }, ...(accountsData.value || []).map(acc => ({ value: acc.id, label: `${acc.name} (${acc.currency})` }))]
);

async function onSubmit() {
  if (!form.value.name) {
    alert("Goal name is required");
    return;
  }
  if (!form.value.targetAmount || form.value.targetAmount <= 0) {
    alert("Target amount must be greater than 0");
    return;
  }

  saving.value = true;
  try {
    if (isEditing.value) {
      await updateGoal({ id: goalId, data: form.value });
    } else {
      await createGoal(form.value);
    }
    router.push({ name: "goals" });
  } catch (error) {
    alert("Failed to save goal: " + (error as Error).message);
  } finally {
    saving.value = false;
  }
}

onMounted(async () => {
  if (isEditing.value) {
    try {
      const response = await fetch(`/api/v1/goals/${goalId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        form.value = { ...form.value, ...data.goal };
      }
    } catch (error) {
      console.error("Failed to load goal:", error);
    }
  }
});
</script>