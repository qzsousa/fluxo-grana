<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Account Detail</h1>
        <router-link :to="{ name: 'accounts' }" class="text-primary-600 hover:text-primary-700">
          Back to Accounts
        </router-link>
      </div>
      
      <Card>
        <template #header-actions>
          <router-link :to="{ path: `/accounts/${route.params.id}/edit` }" class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
            Edit Account
          </router-link>
        </template>
        
        <div class="space-y-4" v-if="account">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-500">Name</label>
              <p class="text-lg font-medium text-gray-900">{{ account.name }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500">Type</label>
              <p class="text-lg font-medium text-gray-900 capitalize">{{ account.type.toLowerCase() }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500">Currency</label>
              <p class="text-lg font-medium text-gray-900">{{ account.currency }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500">Status</label>
              <span :class="account.isActive ? 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800' : 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800'">
                {{ account.isActive ? 'Active' : 'Inactive' }}
              </span>
            </div>
          </div>
          
          <div class="pt-4 border-t">
            <label class="block text-sm font-medium text-gray-500">Balance</label>
            <p class="text-3xl font-bold text-gray-900">{{ account.currency }} {{ account.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</p>
          </div>
        </div>
        
        <div v-else class="text-center py-8">
          <p class="text-gray-500">Loading account...</p>
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAccount } from "../../composables/useApi";
import Card from "../../components/ui/Card.vue";

const route = useRoute();
const router = useRouter();
const accountId = route.params.id as string;
const { data: account } = useAccount(accountId);
</script>