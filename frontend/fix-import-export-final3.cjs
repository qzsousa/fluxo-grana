const fs = require('fs');
const content = `<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-2xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">Import & Export Data</h1>

      <UiCard>
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Export Data</h2>
        <p class="text-gray-600 mb-6">Download your financial data in various formats.</p>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button variant="secondary" @click="exportData('transactions')" :disabled="exporting">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
            </svg>
            Export Transactions (CSV)
          </Button>
          <Button variant="secondary" @click="exportData('accounts')" :disabled="exporting">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
            </svg>
            Export Accounts (CSV)
          </Button>
          <Button variant="secondary" @click="exportData('investments')" :disabled="exporting">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
            </svg>
            Export Investments (CSV)
          </Button>
          <Button variant="secondary" @click="exportData('full')" :disabled="exporting">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
            </svg>
            Full Backup (JSON)
          </Button>
        </div>
      </UiCard>

      <UiCard class="mt-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Import Data</h2>
        <p class="text-gray-600 mb-6">Import transactions from CSV or OFX files.</p>
        
        <form @submit.prevent="onImport" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Import Type</label>
            <Select v-model="importType" :options="importTypeOptions" required />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">File</label>
            <input
              type="file"
              ref="fileInput"
              @change="onFileSelect"
              accept=".csv,.ofx"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <p v-if="selectedFile" class="mt-1 text-sm text-gray-500">{{ selectedFile.name }} ({{ formatFileSize(selectedFile.size) }})</p>
          </div>

          <div v-if="importType === 'transactions'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Default Account</label>
              <Select v-model="importAccountId" :options="accountOptions" required />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Date Format</label>
              <Select v-model="dateFormat" :options="dateFormatOptions" />
            </div>
          </div>

          <div>
            <label class="flex items-center gap-2">
              <input type="checkbox" v-model="skipDuplicates" class="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" />
              <span class="text-sm text-gray-700">Skip duplicate transactions</span>
            </label>
          </div>

          <div class="flex justify-end space-x-3 pt-4 border-t">
            <Button type="submit" :disabled="importing">{{ importing ? 'Importing...' : 'Import Data' }}</Button>
          </div>
        </form>
      </UiCard>

      <UiCard v-if="importResult" class="mt-6 border-green-200 bg-green-50">
        <h3 class="text-lg font-semibold text-green-800 mb-2">Import Successful!</h3>
        <div class="space-y-2 text-sm text-green-700">
          <p>Transactions imported: <span class="font-medium">{{ importResult.imported }}</span></p>
          <p>Transactions skipped: <span class="font-medium">{{ importResult.skipped }}</span></p>
          <p>Errors: <span class="font-medium">{{ importResult.errors }}</span></p>
        </div>
        <Button @click="importResult = null" class="mt-4" variant="secondary">Dismiss</Button>
      </UiCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import UiCard from "../../components/ui/Card.vue";
import Button from "../../components/ui/Button.vue";
import Select from "../../components/ui/Select.vue";
import { useAccounts } from "../../composables/useApi";

const exporting = ref(false);
const importing = ref(false);
const importResult = ref(null);
const selectedFile = ref(null);
const fileInput = ref(null);

const importType = ref("transactions");
const importAccountId = ref("");
const dateFormat = ref("DD/MM/YYYY");
const skipDuplicates = ref(true);

const importTypeOptions = [
  { value: "transactions", label: "Transactions (CSV/OFX)" },
  { value: "accounts", label: "Accounts (CSV)" },
];

const dateFormatOptions = [
  { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
  { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
  { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
];

const { data: accountsData } = useAccounts();

const accountOptions = computed(() => 
  [{ value: "", label: "Select account" }, ...(accountsData.value || []).map(acc => ({ value: acc.id, label: acc.name + " (" + acc.currency + ")" }))]
);

function onFileSelect(event) {
  const target = event.target;
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0];
  }
}

async function exportData(type) {
  exporting.value = true;
  try {
    // TODO: Implement export API call
    alert("Exporting " + type + "... (not implemented yet)");
  } catch (error) {
    alert("Export failed: " + error.message);
  } finally {
    exporting.value = false;
  }
}

async function onImport() {
  if (!selectedFile.value) {
    alert("Please select a file");
    return;
  }
  if (!importAccountId.value && importType.value === "transactions") {
    alert("Please select an account");
    return;
  }

  importing.value = true;
  try {
    // TODO: Implement import API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    importResult.value = {
      imported: 42,
      skipped: 3,
      errors: 0,
    };
    selectedFile.value = null;
    if (fileInput.value) fileInput.value.value = "";
  } catch (error) {
    alert("Import failed: " + error.message);
  } finally {
    importing.value = false;
  }
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}
</script>
`;
fs.writeFileSync('src/pages/settings/ImportExportSettings.vue', content, { encoding: 'utf8' });
console.log('File written successfully');