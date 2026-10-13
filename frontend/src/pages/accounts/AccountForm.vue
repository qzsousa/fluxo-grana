<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-2xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900">{{ isEditing ? 'Edit Account' : 'Add New Account' }}</h1>
        <router-link :to="{ name: 'accounts' }" class="text-primary-600 hover:text-primary-700">
          Cancel
        </router-link>
      </div>

      <Card>
        <form @submit.prevent="onSubmit" class="space-y-6">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
            <Input
              id="name"
              v-model="form.name"
              type="text"
              required
              autocomplete="off"
              placeholder="e.g., Checking Account"
            />
          </div>

          <div>
            <label for="type" class="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
            <Select
              id="type"
              v-model="form.type"
              :options="accountTypes"
              required
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="currency" class="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <Select
                id="currency"
                v-model="form.currency"
                :options="currencyOptions"
              />
            </div>

            <div>
              <label for="balance" class="block text-sm font-medium text-gray-700 mb-1">Initial Balance</label>
              <Input
                id="balance"
                v-model.number="form.balance"
                type="number"
                step="0.01"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label for="color" class="block text-sm font-medium text-gray-700 mb-1">Color</label>
            <Input
              id="color"
              v-model="form.color"
              type="color"
              class="h-10 w-full p-1 border border-gray-300 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <label for="icon" class="block text-sm font-medium text-gray-700 mb-1">Icon (emoji or icon name)</label>
            <Input
              id="icon"
              v-model="form.icon"
              type="text"
              placeholder="🏦 or account_balance"
            />
          </div>

          <div>
            <label for="institution" class="block text-sm font-medium text-gray-700 mb-1">Institution</label>
            <Input
              id="institution"
              v-model="form.institution"
              type="text"
              placeholder="Bank name (optional)"
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
            <router-link :to="{ name: 'accounts' }" class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              Cancel
            </router-link>
            <button
              type="submit"
              :disabled="saving"
              class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              <span v-if="saving">Saving...</span>
              <span v-else>{{ isEditing ? 'Update Account' : 'Create Account' }}</span>
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
import { useAccounts, useCreateAccount, useUpdateAccount } from "../../composables/useApi";
import Card from "../../components/ui/Card.vue";
import Input from "../../components/ui/Input.vue";
import Select from "../../components/ui/Select.vue";

const route = useRoute();
const router = useRouter();
const isEditing = computed(() => route.params.id !== undefined);
const accountId = route.params.id as string;

const { mutateAsync: createAccount } = useCreateAccount();
const { mutateAsync: updateAccount } = useUpdateAccount();

const saving = ref(false);

const form = ref({
  name: "",
  type: "CHECKING",
  currency: "BRL",
  balance: 0,
  initialBalance: 0,
  color: "#3B82F6",
  icon: "",
  institution: "",
  isActive: true,
});

const accountTypes = [
  { value: "CHECKING", label: "Checking" },
  { value: "SAVINGS", label: "Savings" },
  { value: "CREDIT", label: "Credit Card" },
  { value: "INVESTMENT", label: "Investment" },
  { value: "CRYPTO", label: "Crypto" },
  { value: "CASH", label: "Cash" },
  { value: "OTHER", label: "Other" },
];

const currencyOptions = [
  { value: "BRL", label: "BRL - Brazilian Real" },
  { value: "USD", label: "USD - US Dollar" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "GBP", label: "GBP - British Pound" },
];

async function onSubmit() {
  if (!form.value.name) {
    alert("Account name is required");
    return;
  }

  saving.value = true;
  try {
    if (isEditing.value) {
      await updateAccount({ id: accountId, data: form.value });
    } else {
      await createAccount(form.value);
    }
    router.push({ name: "accounts" });
  } catch (error) {
    alert("Failed to save account: " + (error as Error).message);
  } finally {
    saving.value = false;
  }
}

onMounted(async () => {
  if (isEditing.value) {
    try {
      // Fetch account data
      const response = await fetch(`/api/v1/accounts/${accountId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        form.value = { ...form.value, ...data.account };
      }
    } catch (error) {
      console.error("Failed to load account:", error);
    }
  }
});
</script>