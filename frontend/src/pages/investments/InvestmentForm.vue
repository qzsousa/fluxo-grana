<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-2xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900">{{ isEditing ? 'Edit Investment' : 'Add New Investment' }}</h1>
        <router-link :to="{ name: 'investments' }" class="text-primary-600 hover:text-primary-700">
          Cancel
        </router-link>
      </div>

      <UiCard>
        <form @submit.prevent="onSubmit" class="space-y-6">
          <div>
            <label for="symbol" class="block text-sm font-medium text-gray-700 mb-1">Symbol</label>
            <Input
              id="symbol"
              v-model="form.symbol"
              type="text"
              required
              autocomplete="off"
              placeholder="e.g., PETR4, AAPL, BTC-USD"
            />
          </div>

          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <Input
              id="name"
              v-model="form.name"
              type="text"
              required
              autocomplete="off"
              placeholder="e.g., Petrobras, Apple Inc., Bitcoin"
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="type" class="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <Select
                id="type"
                v-model="form.type"
                :options="investmentTypes"
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

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label for="quantity" class="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <Input
                id="quantity"
                v-model.number="form.quantity"
                type="number"
                step="0.00000001"
                min="0"
                required
                placeholder="0.00"
              />
            </div>

            <div>
              <label for="averagePrice" class="block text-sm font-medium text-gray-700 mb-1">Average Price</label>
              <Input
                id="averagePrice"
                v-model.number="form.averagePrice"
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="0.00"
              />
            </div>

            <div>
              <label for="currentPrice" class="block text-sm font-medium text-gray-700 mb-1">Current Price (optional)</label>
              <Input
                id="currentPrice"
                v-model.number="form.currentPrice"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="targetPrice" class="block text-sm font-medium text-gray-700 mb-1">Target Price (optional)</label>
              <Input
                id="targetPrice"
                v-model.number="form.targetPrice"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
              />
            </div>

            <div>
              <label for="stopLoss" class="block text-sm font-medium text-gray-700 mb-1">Stop Loss (optional)</label>
              <Input
                id="stopLoss"
                v-model.number="form.stopLoss"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label for="sector" class="block text-sm font-medium text-gray-700 mb-1">Sector (optional)</label>
            <Input
              id="sector"
              v-model="form.sector"
              type="text"
              placeholder="e.g., Technology, Energy, Finance"
            />
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
            <router-link :to="{ name: 'investments' }" class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              Cancel
            </router-link>
            <button
              type="submit"
              :disabled="saving"
              class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              <span v-if="saving">Saving...</span>
              <span v-else>{{ isEditing ? 'Update Investment' : 'Create Investment' }}</span>
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
import { useInvestments, useCreateInvestment, useUpdateInvestment } from "../../composables/useApi";
import UiCard from "../../components/ui/Card.vue";
import Input from "../../components/ui/Input.vue";
import Select from "../../components/ui/Select.vue";
import Button from "../../components/ui/Button.vue";

const route = useRoute();
const router = useRouter();
const isEditing = computed(() => route.params.id !== undefined);
const investmentId = route.params.id as string;

const { mutateAsync: createInvestment } = useCreateInvestment();
const { mutateAsync: updateInvestment } = useUpdateInvestment();

const saving = ref(false);

const form = ref({
  symbol: "",
  name: "",
  type: "STOCK",
  currency: "BRL",
  quantity: 0,
  averagePrice: 0,
  currentPrice: 0,
  targetPrice: 0,
  stopLoss: 0,
  sector: "",
  isActive: true,
});

const investmentTypes = [
  { value: "STOCK", label: "Stock" },
  { value: "ETF", label: "ETF" },
  { value: "FUND", label: "Fund" },
  { value: "CRYPTO", label: "Crypto" },
  { value: "FIXED_INCOME", label: "Fixed Income" },
  { value: "REAL_ESTATE", label: "Real Estate" },
  { value: "OTHER", label: "Other" },
];

const currencyOptions = [
  { value: "BRL", label: "BRL - Brazilian Real" },
  { value: "USD", label: "USD - US Dollar" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "GBP", label: "GBP - British Pound" },
];

async function onSubmit() {
  if (!form.value.symbol) {
    alert("Symbol is required");
    return;
  }
  if (!form.value.name) {
    alert("Name is required");
    return;
  }
  if (!form.value.quantity || form.value.quantity <= 0) {
    alert("Quantity must be greater than 0");
    return;
  }
  if (!form.value.averagePrice || form.value.averagePrice <= 0) {
    alert("Average price must be greater than 0");
    return;
  }

  saving.value = true;
  try {
    if (isEditing.value) {
      await updateInvestment({ id: investmentId, data: form.value });
    } else {
      await createInvestment(form.value);
    }
    router.push({ name: "investments" });
  } catch (error) {
    alert("Failed to save investment: " + (error as Error).message);
  } finally {
    saving.value = false;
  }
}

onMounted(async () => {
  if (isEditing.value) {
    try {
      const response = await fetch(`/api/v1/investments/${investmentId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        form.value = { ...form.value, ...data.investment };
      }
    } catch (error) {
      console.error("Failed to load investment:", error);
    }
  }
});

</script>