const fs = require('fs');

const files = {
  'src/pages/recurring/RecurringList.vue': `<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Recurring Transactions</h1>
        <Button @click="showAddForm = true" class="flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Add Recurring
        </Button>
      </div>

      <div v-if="recurring.length > 0">
        <UiCard>
          <div class="space-y-4">
            <div v-for="rec in recurring" :key="rec.id" class="p-4 bg-gray-50 rounded-lg">
              <div class="flex items-center justify-between">
                <div>
                  <p class="font-medium text-gray-900">{{ rec.description }}</p>
                  <p class="text-sm text-gray-500">{{ rec.amount }} {{ rec.currency }} • {{ rec.frequency }}</p>
                </div>
                <div class="flex items-center gap-2">
                  <span class="px-2 py-1 text-xs rounded-full" :class="rec.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'">
                    {{ rec.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </UiCard>
      </div>

      <div v-else class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No recurring transactions</h3>
        <p class="mt-1 text-sm text-gray-500">Set up recurring transactions for subscriptions and bills.</p>
        <div class="mt-6">
          <Button @click="showAddForm = true">Add Recurring</Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRecurringTransactions } from "../../composables/useApi";
import UiCard from "../../components/ui/Card.vue";
import Button from "../../components/ui/Button.vue";

const showAddForm = ref(false);
const recurring = ref([]);
const { data: recurringData } = useRecurringTransactions();

if (recurringData.value) {
  recurring.value = recurringData.value;
}
</script>`,

  'src/pages/investments/InvestmentsList.vue': `<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Investments</h1>
        <Button @click="showAddForm = true" class="flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Add Investment
        </Button>
      </div>

      <div v-if="investments.length > 0">
        <UiCard>
          <div class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 012-2h2a2 2 0 012 2v10z"></path>
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">Investments list</h3>
            <p class="mt-1 text-sm text-gray-500">Investment portfolio coming soon</p>
          </div>
        </UiCard>
      </div>

      <div v-else class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 012-2h2a2 2 0 012 2v10z"></path>
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No investments</h3>
        <p class="mt-1 text-sm text-gray-500">Track your investment portfolio.</p>
        <div class="mt-6">
          <Button @click="showAddForm = true">Add Investment</Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts>
import { ref } from "vue";
import { useInvestments } from "../../composables/useApi";
import UiCard from "../../components/ui/Card.vue";
import Button from "../../components/ui/Button.vue";

const showAddForm = ref(false);
const investments = ref([]);
const { data: investmentsData } = useInvestments();

if (investmentsData.value) {
  investments.value = investmentsData.value;
}
</script>`
};

for (const [path, content] of Object.entries(files)) {
  fs.writeFileSync(path, content, { encoding: 'utf8' });
  console.log('Written:', path);
}

console.log('All files written successfully');