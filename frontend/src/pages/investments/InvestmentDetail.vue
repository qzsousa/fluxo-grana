<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Investment Detail</h1>
        <router-link :to="{ name: 'investments' }" class="text-primary-600 hover:text-primary-700">
          Back to Investments
        </router-link>
      </div>

      <UiCard v-if="investment">
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-900">{{ investment.name }} ({{ investment.symbol }})</h2>
            <span class="px-3 py-1 text-sm rounded-full" :class="investment.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'">
              {{ investment.isActive ? 'Active' : 'Inactive' }}
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="p-4 bg-gray-50 rounded-lg">
              <p class="text-sm text-gray-500">Quantity</p>
              <p class="text-lg font-medium text-gray-900">{{ investment.quantity.toLocaleString() }}</p>
            </div>
            <div class="p-4 bg-gray-50 rounded-lg">
              <p class="text-sm text-gray-500">Average Price</p>
              <p class="text-lg font-medium text-gray-900">{{ investment.currency }} {{ investment.averagePrice.toLocaleString() }}</p>
            </div>
            <div class="p-4 bg-gray-50 rounded-lg">
              <p class="text-sm text-gray-500">Current Price</p>
              <p class="text-lg font-medium" :class="investment.currentPrice >= investment.averagePrice ? 'text-green-600' : 'text-red-600'">
                {{ investment.currentPrice ? investment.currency + ' ' + investment.currentPrice.toLocaleString() : 'N/A' }}
              </p>
            </div>
            <div class="p-4 bg-gray-50 rounded-lg">
              <p class="text-sm text-gray-500">Total Value</p>
              <p class="text-lg font-medium text-gray-900">{{ investment.currency }} {{ (investment.quantity * (investment.currentPrice || investment.averagePrice)).toLocaleString() }}</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="p-4 bg-gray-50 rounded-lg">
              <p class="text-sm text-gray-500">Average Cost</p>
              <p class="text-lg font-medium text-gray-900">{{ investment.currency }} {{ (investment.quantity * investment.averagePrice).toLocaleString() }}</p>
            </div>
            <div class="p-4 bg-gray-50 rounded-lg">
              <p class="text-sm text-gray-500">Current Value</p>
              <p class="text-lg font-medium" :class="investment.currentPrice >= investment.averagePrice ? 'text-green-600' : 'text-red-600'">
                {{ investment.currency }} {{ (investment.quantity * (investment.currentPrice || investment.averagePrice)).toLocaleString() }}
              </p>
            </div>
            <div class="p-4 bg-gray-50 rounded-lg">
              <p class="text-sm text-gray-500">Gain/Loss</p>
              <p class="text-lg font-medium" :class="(investment.currentPrice || investment.averagePrice) >= investment.averagePrice ? 'text-green-600' : 'text-red-600'">
                {{ (investment.currentPrice || investment.averagePrice) >= investment.averagePrice ? '+' : '-' }}{{ investment.currency }} {{ Math.abs((investment.quantity * ((investment.currentPrice || investment.averagePrice) - investment.averagePrice))).toLocaleString() }}
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
            <div>
              <p class="text-sm text-gray-500">Type</p>
              <p class="font-medium text-gray-900 capitalize">{{ investment.type.toLowerCase().replace('_', ' ') }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Currency</p>
              <p class="font-medium text-gray-900">{{ investment.currency }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Sector</p>
              <p class="font-medium text-gray-900">{{ investment.sector || 'Not specified' }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Status</p>
              <span class="px-3 py-1 text-sm rounded-full" :class="investment.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'">
                {{ investment.isActive ? 'Active' : 'Inactive' }}
              </span>
            </div>
          </div>

          <div v-if="investment.targetPrice || investment.stopLoss" class="pt-4 border-t">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Price Alerts</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div v-if="investment.targetPrice" class="p-4 bg-green-50 rounded-lg">
                <p class="text-sm text-gray-500">Target Price</p>
                <p class="text-lg font-medium text-green-600">{{ investment.currency }} {{ investment.targetPrice.toLocaleString() }}</p>
              </div>
              <div v-if="investment.stopLoss" class="p-4 bg-red-50 rounded-lg">
                <p class="text-sm text-gray-500">Stop Loss</p>
                <p class="text-lg font-medium text-red-600">{{ investment.currency }} {{ investment.stopLoss.toLocaleString() }}</p>
              </div>
            </div>
          </div>

          <div v-if="investment.sector" class="pt-4 border-t">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Sector</h3>
            <p class="text-gray-700">{{ investment.sector }}</p>
          </div>

          <div class="pt-4 border-t flex justify-end space-x-3">
            <router-link :to="{ path: `/investments/${investment.id}/edit` }" class="px-4 py-2 text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors">
              Edit Investment
            </router-link>
            <Button variant="danger" @click="handleDeleteInvestment">Delete</Button>
          </div>
        </div>
      </UiCard>

      <div v-else class="text-center py-8">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 012-2h2a2 2 0 012 2v10z"></path>
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

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useInvestments, useInvestment, useDeleteInvestment } from "../../composables/useApi";
import UiCard from "../../components/ui/Card.vue";
import Button from "../../components/ui/Button.vue";

const route = useRoute();
const router = useRouter();
const investmentId = route.params.id as string;
const { data: investment } = useInvestment(investmentId);
const { mutateAsync: deleteInvestmentApi } = useDeleteInvestment();

async function handleDeleteInvestment() {
  if (!confirm("Are you sure you want to delete this investment?")) return;
  try {
    await deleteInvestmentApi(investmentId);
    router.push({ name: "investments" });
  } catch (error) {
    alert("Failed to delete investment: " + (error as Error).message);
  }
}
</script>