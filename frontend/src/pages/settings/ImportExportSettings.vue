<template>
  <div class="space-y-6 stagger-in">
    <!-- Page header -->
    <div>
      <h1 class="font-display text-3xl text-[var(--color-fg)]">Importar/Exportar</h1>
      <p class="mt-1 text-[var(--color-fg-muted)]">
        Faça uma cópia dos seus dados ou traga transações de outro aplicativo.
      </p>
    </div>

    <!-- Export -->
    <Card
      title="Exportar todos os dados"
      description="Gere um arquivo com tudo o que está salvo na sua conta."
      padding="none"
    >
      <div class="space-y-4 p-6">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Select
            id="export-format"
            v-model="exportFormat"
            label="Formato"
            :options="exportFormatOptions"
          />

          <div>
            <p class="label">Conteúdo do arquivo</p>
            <div class="space-y-2">
              <label class="flex cursor-pointer items-center gap-2 text-sm text-[var(--color-fg)]">
                <input
                  id="export-categories"
                  v-model="exportOptions.includeCategories"
                  type="checkbox"
                  class="h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-brand)] focus:ring-[var(--color-brand)]"
                />
                Incluir categorias
              </label>
              <label class="flex cursor-pointer items-center gap-2 text-sm text-[var(--color-fg)]">
                <input
                  id="export-budgets"
                  v-model="exportOptions.includeBudgets"
                  type="checkbox"
                  class="h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-brand)] focus:ring-[var(--color-brand)]"
                />
                Incluir orçamentos
              </label>
              <label class="flex cursor-pointer items-center gap-2 text-sm text-[var(--color-fg)]">
                <input
                  id="export-goals"
                  v-model="exportOptions.includeGoals"
                  type="checkbox"
                  class="h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-brand)] focus:ring-[var(--color-brand)]"
                />
                Incluir metas
              </label>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Button variant="secondary" :disabled="exporting" @click="exportData('transactions')">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Exportar transações (CSV)
          </Button>
          <Button variant="secondary" :disabled="exporting" @click="exportData('accounts')">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Exportar contas (CSV)
          </Button>
          <Button variant="secondary" :disabled="exporting" @click="exportData('investments')">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Exportar investimentos (CSV)
          </Button>
          <Button variant="outline" :disabled="exporting" @click="exportData('full')">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-5.5a2.5 2.5 0 01-5 0H4" />
            </svg>
            Backup completo (JSON)
          </Button>
        </div>

        <div class="flex justify-end">
          <Button :loading="exporting" @click="exportData('full')">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Exportar todos os dados
          </Button>
        </div>
      </div>
    </Card>

    <!-- Import -->
    <Card
      title="Enviar arquivo"
      description="Importe transações de arquivos CSV ou OFX."
      padding="none"
    >
      <form class="space-y-4 p-6" @submit.prevent="onImport">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Select
            id="import-type"
            v-model="importType"
            label="Tipo de importação"
            :options="importTypeOptions"
          />

          <Select
            id="import-date-format"
            v-model="dateFormat"
            label="Formato de data"
            :options="dateFormatOptions"
          />
        </div>

        <div v-if="importType === 'transactions'">
          <Select
            id="import-account"
            v-model="importAccountId"
            label="Conta padrão"
            :options="accountOptions"
            hint="As transações importadas serão lançadas nesta conta."
          />
        </div>

        <div>
          <label for="import-file" class="label">Selecionar arquivo</label>
          <input
            id="import-file"
            ref="fileInput"
            type="file"
            accept=".csv,.ofx"
            class="w-full cursor-pointer rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-2 text-sm text-[var(--color-fg-muted)] file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-[var(--color-brand-light)] file:px-4 file:py-2 file:text-sm file:font-medium file:text-[var(--color-brand)] hover:file:bg-[var(--color-brand-muted)]"
            @change="onFileSelect"
          />
          <p class="help-text">
            <span v-if="selectedFile">
              {{ selectedFile.name }} ({{ formatFileSize(selectedFile.size) }})
            </span>
            <span v-else>Nenhum arquivo selecionado. Formatos aceitos: CSV e OFX.</span>
          </p>
        </div>

        <div class="flex items-center justify-between gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-muted)] p-4">
          <div class="min-w-0">
            <p class="text-sm font-medium text-[var(--color-fg)]">Ignorar transações duplicadas</p>
            <p class="mt-0.5 text-xs text-[var(--color-fg-muted)]">
              Registros já existentes com a mesma data, valor e descrição são ignorados.
            </p>
          </div>
          <button
            id="import-skip-duplicates"
            type="button"
            role="switch"
            :aria-checked="skipDuplicates"
            aria-label="Ignorar transações duplicadas"
            class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors"
            :class="skipDuplicates ? 'bg-[var(--color-brand)]' : 'bg-[var(--color-border-strong)]'"
            @click="skipDuplicates = !skipDuplicates"
          >
            <span
              class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
              :class="skipDuplicates ? 'translate-x-6' : 'translate-x-1'"
            ></span>
          </button>
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
          <Button type="submit" :loading="importing" @click="onImport">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M4.5 19.5h15a2.25 2.25 0 002.25-2.25v-6a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 11.25v6a2.25 2.25 0 002.25 2.25z" />
            </svg>
            Iniciar importação
          </Button>
        </div>
      </form>
    </Card>

    <!-- Import result -->
    <div
      v-if="importResult"
      class="rounded-xl border border-[var(--color-success)] bg-[var(--color-success-light)] p-4"
      role="status"
    >
      <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div class="min-w-0">
          <p class="text-sm font-semibold text-[var(--color-success)]">Importação concluída!</p>
          <div class="mt-2 space-y-1 text-xs text-[var(--color-fg-muted)]">
            <p>Transações importadas: <span class="font-semibold text-[var(--color-fg)]">{{ importResult.imported }}</span></p>
            <p>Transações ignoradas: <span class="font-semibold text-[var(--color-fg)]">{{ importResult.skipped }}</span></p>
            <p>Erros: <span class="font-semibold text-[var(--color-fg)]">{{ importResult.errors }}</span></p>
          </div>
        </div>
        <Button variant="secondary" size="sm" @click="importResult = null">Fechar</Button>
      </div>
    </div>

    <!-- Import history -->
    <Card
      title="Histórico de importações"
      description="Últimos arquivos enviados para esta conta."
      padding="none"
    >
      <ul v-if="importHistory.length > 0" class="divide-y divide-[var(--color-border)]">
        <li
          v-for="entry in importHistory"
          :key="entry.id"
          class="flex flex-col gap-2 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div class="flex min-w-0 items-center gap-3">
            <span class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-brand-light)] text-[var(--color-brand)]">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </span>
            <div class="min-w-0">
              <p class="truncate text-sm font-medium text-[var(--color-fg)]">{{ entry.fileName }}</p>
              <p class="truncate text-xs text-[var(--color-fg-muted)]">
                {{ formatDate(entry.createdAt, "pt-BR") }} · {{ entry.imported }} importada{{ entry.imported !== 1 ? "s" : "" }} ·
                {{ entry.skipped }} ignorada{{ entry.skipped !== 1 ? "s" : "" }}
              </p>
            </div>
          </div>
          <span class="badge" :class="entry.errors > 0 ? 'badge-warning' : 'badge-success'">
            {{ entry.errors > 0 ? `${entry.errors} erro${entry.errors !== 1 ? "s" : ""}` : "Concluída" }}
          </span>
        </li>
      </ul>

      <EmptyState
        v-else
        icon="inbox"
        title="Nenhuma importação registrada"
        description="Quando você enviar um arquivo, ele aparecerá aqui com o resumo do resultado."
      />
    </Card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { Button, Card, EmptyState, Select } from "../../components/ui";
import { useAccounts } from "../../composables/useApi";
import { formatDate } from "../../utils/format";

const exporting = ref(false);
const importing = ref(false);

const importResult = ref<{ imported: number; skipped: number; errors: number } | null>(null);
const selectedFile = ref<File | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);

const importType = ref("transactions");
const importAccountId = ref("");
const dateFormat = ref("DD/MM/YYYY");
const skipDuplicates = ref(true);

const exportFormat = ref("json");
const exportOptions = ref({
  includeCategories: true,
  includeBudgets: true,
  includeGoals: true,
});

const importTypeOptions = [
  { value: "transactions", label: "Transações (CSV/OFX)" },
  { value: "accounts", label: "Contas (CSV)" },
];

const exportFormatOptions = [
  { value: "json", label: "JSON — completo, ideal para backup" },
  { value: "csv", label: "CSV — compatível com planilhas" },
];

const dateFormatOptions = [
  { value: "DD/MM/YYYY", label: "DD/MM/AAAA" },
  { value: "MM/DD/YYYY", label: "MM/DD/AAAA" },
  { value: "YYYY-MM-DD", label: "AAAA-MM-DD" },
];

const importHistory = ref([
  {
    id: "1",
    fileName: "extrato-janeiro.csv",
    createdAt: "2024-02-01",
    imported: 42,
    skipped: 3,
    errors: 0,
  },
]);

const { data: accountsData } = useAccounts();

const accountOptions = computed(() => [
  { value: "", label: "Selecione uma conta" },
  ...(accountsData.value || []).map((acc) => ({
    value: acc.id,
    label: `${acc.name} (${acc.currency})`,
  })),
]);

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function onFileSelect(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0];
  }
}

async function exportData(type: string) {
  exporting.value = true;
  try {
    // TODO: Implementar exportação
    alert(`Exportando ${type}... (ainda não implementado)`);
  } catch (error) {
    alert("Falha ao exportar: " + (error as Error).message);
  } finally {
    exporting.value = false;
  }
}

async function onImport() {
  if (!selectedFile.value) {
    alert("Selecione um arquivo para importar.");
    return;
  }
  if (!importAccountId.value && importType.value === "transactions") {
    alert("Selecione a conta padrão das transações importadas.");
    return;
  }

  importing.value = true;
  try {
    // TODO: Implementar importação
    await new Promise((resolve) => setTimeout(resolve, 2000));
    importResult.value = { imported: 42, skipped: 3, errors: 0 };
    importHistory.value.unshift({
      id: String(importHistory.value.length + 1),
      fileName: selectedFile.value.name,
      createdAt: new Date().toISOString(),
      imported: 42,
      skipped: 3,
      errors: 0,
    });
    selectedFile.value = null;
    if (fileInput.value) fileInput.value.value = "";
  } catch (error) {
    alert("Falha ao importar: " + (error as Error).message);
  } finally {
    importing.value = false;
  }
}
</script>