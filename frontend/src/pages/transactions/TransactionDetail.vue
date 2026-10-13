<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-3xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Transaction Detail</h1>
        <router-link :to="{ name: 'transactions' }" class="text-primary-600 hover:text-primary-700">
          Back to Transactions
        </router-link>
      </div>

      <Card v-if="transaction">
        <div class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-500">Description</label>
              <p class="text-lg font-medium text-gray-900">{{ transaction.description }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500">Amount</label>
              <p class="text-lg font-medium" :class="transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'">
                {{ transaction.type === 'INCOME' ? '+' : '-' }}{{ transaction.currency }} {{ transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }}
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500">Type</label>
              <p class="text-lg font-medium text-gray-900 capitalize">{{ transaction.type.toLowerCase().replace('_', ' ') }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500">Date</label>
              <p class="text-lg font-medium text-gray-900">{{ new Date(transaction.date).toLocaleDateString('pt-BR') }}</p>
            </div>
          </div>

          <div v-if="transaction.category" class="pt-4 border-t">
            <label class="block text-sm font-medium text-gray-500">Category</label>
            <p class="text-lg font-medium text-gray-900 flex items-center gap-2">
              <span class="text-2xl">{{ transaction.category.icon }}</span>
              {{ transaction.category.name }}
            </p>
          </div>

          <div class="pt-4 border-t">
            <label class="block text-sm font-medium text-gray-500">Account</label>
            <p class="text-lg font-medium text-gray-900">{{ transaction.account?.name }}</p>
          </div>

          <div v-if="transaction.notes" class="pt-4 border-t">
            <label class="block text-sm font-medium text-gray-500">Notes</label>
            <p class="text-lg text-gray-900 whitespace-pre-wrap">{{ transaction.notes }}</p>
          </div>

          <div v-if="transaction.tags && transaction.tags.length > 0" class="pt-4 border-t">
            <label class="block text-sm font-medium text-gray-500">Tags</label>
            <div class="flex flex-wrap gap-2 mt-2">
              <span v-for="tag in transaction.tags" :key="tag" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {{ tag }}
              </span>
            </div>
          </div>
        </div>
      </Card>

      <div v-else class="text-center py-8">
        <p class="text-gray-500">Loading transaction...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { useTransaction } from "../../composables/useApi";
import Card from "../../components/ui/Card.vue";

const route = useRoute();
const transactionId = route.params.id as string;
const { data: transaction } = useTransaction(transactionId);
</script>