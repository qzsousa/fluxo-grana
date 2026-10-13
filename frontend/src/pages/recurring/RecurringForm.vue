<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-2xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900">{{ isEditing ? 'Edit Recurring Transaction' : 'Add New Recurring Transaction' }}</h1>
        <router-link :to="{ name: 'recurring' }" class="text-primary-600 hover:text-primary-700">
          Cancel
        </router-link>
      </div>

      <UiCard>
        <form @submit.prevent="onSubmit" class="space-y-6">
          <div>
            <label for="description" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <Input
              id="description"
              v-model="form.description"
              type="text"
              required
              placeholder="e.g., Netflix Subscription"
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="amount" class="block text-sm font-medium text-gray-700 mb-1">Amount</label>
              <Input
                id="amount"
                v-model.number="form.amount"
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0.00"
              />
            </div>

            <div>
              <label for="type" class="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <Select
                id="type"
                v-model="form.type"
                :options="transactionTypes"
                required
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="date" class="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <Input
                id="date"
                v-model="form.date"
                type="date"
                required
              />
            </div>

            <div>
              <label for="accountId" class="block text-sm font-medium text-gray-700 mb-1">Account</label>
              <Select
                id="accountId"
                v-model="form.accountId"
                :options="accountOptions"
                required
              />
            </div>
          </div>

          <div>
            <label for="categoryId" class="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <Select
              id="categoryId"
              v-model="form.categoryId"
              :options="categoryOptions"
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="frequency" class="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
              <Select
                id="frequency"
                v-model="form.frequency"
                :options="frequencyOptions"
                required
              />
            </div>

            <div>
              <label for="endDate" class="block text-sm font-medium text-gray-700 mb-1">End Date (optional)</label>
              <Input
                id="endDate"
                v-model="form.endDate"
                type="date"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="skipWeekends" class="block text-sm font-medium text-gray-700 mb-1">Skip Weekends</label>
              <div class="flex items-center">
                <input
                  id="skipWeekends"
                  v-model="form.skipWeekends"
                  type="checkbox"
                  class="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label for="skipWeekends" class="ml-2 text-sm text-gray-700">Skip weekends</label>
              </div>
            </div>
          </div>

          <div>
            <label for="notes" class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              id="notes"
              v-model="form.notes"
              rows="3"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Optional notes..."
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
            <router-link :to="{ name: 'recurring' }" class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              Cancel
            </router-link>
            <button
              type="submit"
              :disabled="saving"
              class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              <span v-if="saving">Saving...</span>
              <span v-else>{{ isEditing ? 'Update Recurring Transaction' : 'Create Recurring Transaction' }}</span>
            </button>
          </div>
        </form>
      </UiCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useRecurringTransactions, useCreateRecurring, useUpdateRecurring, useAccounts, useCategories } from "../../composables/useApi";
import UiCard from "../../components/ui/Card.vue";
import Input from "../../components/ui/Input.vue";
import Select from "../../components/ui/Select.vue";
import Button from "../../components/ui/Button.vue";

const route = useRoute();
const router = useRouter();
const isEditing = computed(() => route.params.id !== undefined);
const recurringId = route.params.id as string;

const { data: accountsData } = useAccounts();
const { data: categoriesData } = useCategories();
const { mutateAsync: createRecurring } = useCreateRecurring();
const { mutateAsync: updateRecurring } = useUpdateRecurring();

const saving = ref(false);

const form = ref({
  description: "",
  amount: 0,
  type: "EXPENSE",
  date: new Date().toISOString().split("T")[0],
  accountId: "",
  categoryId: "",
  frequency: "MONTHLY",
  endDate: "",
  skipWeekends: false,
  notes: "",
  isActive: true,
});

const transactionTypes = [
  { value: "EXPENSE", label: "Expense" },
  { value: "INCOME", label: "Income" },
  { value: "TRANSFER", label: "Transfer" },
];

const frequencyOptions = [
  { value: "DAILY", label: "Daily" },
  { value: "WEEKLY", label: "Weekly" },
  { value: "BIWEEKLY", label: "Biweekly" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "QUARTERLY", label: "Quarterly" },
  { value: "YEARLY", label: "Yearly" },
];

const accountOptions = computed(() =>
  (accountsData.value || []).map(acc => ({ value: acc.id, label: `${acc.name} (${acc.currency})` }))
);

const categoryOptions = computed(() =>
  [{ value: "", label: "Select category" }, ...(categoriesData.value || []).map(cat => ({ value: cat.id, label: `${cat.icon} ${cat.name}` }))]
);

async function onSubmit() {
  if (!form.value.description) {
    alert("Description is required");
    return;
  }
  if (!form.value.amount || form.value.amount <= 0) {
    alert("Amount must be greater than 0");
    return;
  }
  if (!form.value.accountId) {
    alert("Account is required");
    return;
  }

  saving.value = true;
  try {
    if (isEditing.value) {
      await updateRecurring({ id: recurringId, data: form.value });
    } else {
      await createRecurring(form.value);
    }
    router.push({ name: "recurring" });
  } catch (error) {
    alert("Failed to save recurring transaction: " + (error as Error).message);
  } finally {
    saving.value = false;
  }
}

onMounted(async () => {
  if (isEditing.value) {
    try {
      const response = await fetch(`/api/v1/recurring/${recurringId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        form.value = { ...form.value, ...data.recurring };
      }
    } catch (error) {
      console.error("Failed to load recurring transaction:", error);
    }
  }
});
</script>