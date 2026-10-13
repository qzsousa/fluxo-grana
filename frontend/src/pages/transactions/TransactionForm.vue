<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-2xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900">{{ isEditing ? 'Edit Transaction' : 'Add New Transaction' }}</h1>
        <router-link :to="{ name: 'transactions' }" class="text-primary-600 hover:text-primary-700">
          Cancel
        </router-link>
      </div>

      <Card>
        <form @submit.prevent="onSubmit" class="space-y-6">
          <div>
            <label for="description" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <Input
              id="description"
              v-model="form.description"
              type="text"
              required
              placeholder="e.g., Grocery shopping"
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
              <label for="date" class="block text-sm font-medium text-gray-700 mb-1">Date</label>
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

          <div>
            <label for="notes" class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              id="notes"
              v-model="form.notes"
              rows="3"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
              placeholder="Optional notes..."
            ></textarea>
          </div>

          <div>
            <label for="tags" class="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
            <Input
              id="tags"
              v-model="form.tags"
              type="text"
              placeholder="groceries, weekly, essential"
            />
          </div>

          <div class="flex justify-end space-x-3 pt-4 border-t">
            <router-link :to="{ name: 'transactions' }" class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              Cancel
            </router-link>
            <button
              type="submit"
              :disabled="saving"
              class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              <span v-if="saving">Saving...</span>
              <span v-else>{{ isEditing ? 'Update Transaction' : 'Create Transaction' }}</span>
            </button>
          </div>
        </form>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useCreateTransaction, useUpdateTransaction, useAccounts, useCategories } from "../../composables/useApi";
import Card from "../../components/ui/Card.vue";
import Input from "../../components/ui/Input.vue";
import Select from "../../components/ui/Select.vue";

const route = useRoute();
const router = useRouter();
const isEditing = computed(() => route.params.id !== undefined);
const transactionId = route.params.id as string;

const { mutateAsync: createTransaction } = useCreateTransaction();
const { mutateAsync: updateTransaction } = useUpdateTransaction();
const { data: accounts } = useAccounts();
const { data: categories } = useCategories();

const saving = ref(false);

const form = ref({
  description: "",
  amount: 0,
  type: "EXPENSE",
  date: new Date().toISOString().split("T")[0],
  accountId: "",
  categoryId: "",
  notes: "",
  tags: "",
});

const transactionTypes = [
  { value: "INCOME", label: "Income" },
  { value: "EXPENSE", label: "Expense" },
  { value: "TRANSFER", label: "Transfer" },
  { value: "INVESTMENT_BUY", label: "Investment Buy" },
  { value: "INVESTMENT_SELL", label: "Investment Sell" },
  { value: "DIVIDEND", label: "Dividend" },
  { value: "INTEREST", label: "Interest" },
  { value: "FEE", label: "Fee" },
];

const accountOptions = computed(() => 
  (accounts.value || []).map(acc => ({ value: acc.id, label: `${acc.name} (${acc.currency})` }))
);

const categoryOptions = computed(() => 
  [{ value: "", label: "Select category" }, ...(categories.value || []).map(cat => ({ value: cat.id, label: `${cat.icon} ${cat.name}` }))]
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
    const payload = {
      ...form.value,
      tags: form.value.tags ? form.value.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
    };

    if (isEditing.value) {
      await updateTransaction({ id: transactionId, data: payload });
    } else {
      await createTransaction(payload);
    }
    router.push({ name: "transactions" });
  } catch (error) {
    alert("Failed to save transaction: " + (error as Error).message);
  } finally {
    saving.value = false;
  }
}

onMounted(async () => {
  if (isEditing.value) {
    try {
      const response = await fetch(`/api/v1/transactions/${transactionId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        form.value = { ...form.value, ...data.transaction };
        if (data.transaction.tags) {
          form.value.tags = data.transaction.tags.join(", ");
        }
      }
    } catch (error) {
      console.error("Failed to load transaction:", error);
    }
  }
});
</script>