<template>
  <div class="space-y-6 stagger-in">
    <!-- Page header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="font-display text-3xl text-[var(--color-fg)]">Importar transações</h1>
        <p class="mt-1 text-[var(--color-fg-muted)]">
          Envie um arquivo do seu banco para criar várias transações de uma vez
        </p>
      </div>
      <Button variant="ghost" @click="router.push('/transactions')">
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l7-7m0 0l-7-7m7 7H3" />
        </svg>
        Voltar para transações
      </Button>
    </div>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <!-- Envio do arquivo -->
      <Card title="Enviar arquivo" padding="lg" class="lg:col-span-2">
        <form class="space-y-6" @submit.prevent="onImport">
          <div>
            <span class="label">Arquivo</span>
            <label
              for="import-file"
              class="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--color-border-strong)] bg-[var(--color-bg-muted)] px-6 py-10 text-center transition-colors hover:border-[var(--color-brand)] hover:bg-[var(--color-brand-light)]"
            >
              <span class="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-bg-elevated)] text-[var(--color-brand)]">
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 16V4m0 0L8 8m4-4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
                </svg>
              </span>
              <span class="mt-3 font-medium text-[var(--color-fg)]">Selecione um arquivo</span>
              <span class="mt-1 text-sm text-[var(--color-fg-muted)]">Formato aceito: CSV, OFX, QIF</span>
              <input
                id="import-file"
                ref="fileInput"
                type="file"
                class="sr-only"
                accept=".csv,.ofx,.qif"
                @change="onFileSelect"
              />
            </label>

            <p v-if="fileError" class="error-text" role="alert">{{ fileError }}</p>
            <p v-else-if="selectedFile" class="help-text">
              {{ selectedFile.name }} ({{ formatFileSize(selectedFile.size) }})
            </p>
          </div>

          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Select
              id="import-account"
              v-model="importAccountId"
              label="Conta"
              :options="accountOptions"
              placeholder="Selecione a conta"
              required
              :error="errors.accountId"
            />

            <Select
              id="import-date-format"
              v-model="dateFormat"
              label="Formato de data"
              :options="dateFormatOptions"
            />
          </div>

          <label class="flex cursor-pointer items-center gap-2">
            <input
              id="import-skip-duplicates"
              v-model="skipDuplicates"
              type="checkbox"
              class="h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-brand)] focus:ring-[var(--color-brand)] focus:ring-offset-2 transition-colors"
            />
            <span class="text-sm text-[var(--color-fg-muted)]">Ignorar transações duplicadas</span>
          </label>

          <div
            v-if="submitError"
            class="rounded-lg border border-[var(--color-danger-muted)] bg-[var(--color-danger-light)] p-3 text-sm text-[var(--color-danger)]"
            role="alert"
          >
            {{ submitError }}
          </div>

          <div class="flex justify-end gap-3 border-t border-[var(--color-border)] pt-4">
            <Button type="submit" :loading="importing" :disabled="!selectedFile">
              Importar
            </Button>
          </div>
        </form>
      </Card>

      <!-- Pré-visualização -->
      <Card title="Pré-visualização" padding="md">
        <div v-if="previewRows.length" class="space-y-3">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead>
                <tr class="border-b border-[var(--color-border)]">
                  <th class="py-2 pr-3 text-xs font-medium uppercase tracking-wide text-[var(--color-fg-muted)]">Data</th>
                  <th class="py-2 pr-3 text-xs font-medium uppercase tracking-wide text-[var(--color-fg-muted)]">Descrição</th>
                  <th class="py-2 text-right text-xs font-medium uppercase tracking-wide text-[var(--color-fg-muted)]">Valor</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, index) in previewRows" :key="index" class="border-b border-[var(--color-border)] last:border-0">
                  <td class="py-2 pr-3 font-mono text-xs text-[var(--color-fg-muted)]">{{ row.date }}</td>
                  <td class="py-2 pr-3 max-w-[10rem] truncate text-[var(--color-fg)]">{{ row.description }}</td>
                  <td class="py-2 text-right font-medium" :class="row.amount < 0 ? 'text-[var(--color-danger)]' : 'text-[var(--color-success)]'">
                    {{ formatCurrency(Math.abs(row.amount), currency) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="text-xs text-[var(--color-fg-subtle)]">
            Exibindo {{ previewRows.length }} de {{ previewTotal }} transações encontradas.
          </p>
        </div>

        <div v-else-if="parsing" class="space-y-3 py-2">
          <div class="h-4 w-full skeleton skeleton-text"></div>
          <div class="h-4 w-4/5 skeleton skeleton-text"></div>
          <div class="h-4 w-3/5 skeleton skeleton-text"></div>
        </div>

        <EmptyState
          v-else
          icon="table"
          title="Nenhuma transação para importar"
          description="Selecione um arquivo CSV para visualizar as transações antes de importar."
        />
      </Card>
    </div>

    <!-- Resultado -->
    <Card v-if="importResult" padding="md">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 class="font-display text-lg text-[var(--color-fg)]">Importação concluída</h3>
          <p class="mt-1 text-sm text-[var(--color-fg-muted)]">
            Importadas: <span class="font-medium text-[var(--color-fg)]">{{ importResult.imported }}</span> ·
            Ignoradas: <span class="font-medium text-[var(--color-fg)]">{{ importResult.skipped }}</span> ·
            Erros: <span class="font-medium text-[var(--color-fg)]">{{ importResult.errors }}</span>
          </p>
        </div>
        <div class="flex flex-wrap gap-3">
          <Button variant="ghost" @click="resetResult">Fechar</Button>
          <Button variant="outline" @click="router.push('/transactions')">Ver transações</Button>
        </div>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useAccounts } from "../../composables/useApi";
import { useAuthStore } from "../../stores/auth";
import { useToast } from "../../composables/useToast";
import { formatCurrency } from "../../utils/format";
import { Button, Card, EmptyState, Select } from "../../components/ui";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const PREVIEW_LIMIT = 8;

interface PreviewRow {
  date: string;
  description: string;
  amount: number;
}

const router = useRouter();
const auth = useAuthStore();
const toast = useToast();

const accountsQuery = useAccounts();

const importing = ref(false);
const parsing = ref(false);
const selectedFile = ref<File | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const fileError = ref("");
const submitError = ref("");
const previewRows = ref<PreviewRow[]>([]);
const previewTotal = ref(0);
const importResult = ref<{ imported: number; skipped: number; errors: number } | null>(null);

const importAccountId = ref("");
const dateFormat = ref("DD/MM/YYYY");
const skipDuplicates = ref(true);

const errors = reactive({
  accountId: "",
});

const currency = computed(() => auth.user?.currency || "BRL");

const accountOptions = computed(() =>
  (accountsQuery.data.value ?? []).map((a) => ({ value: a.id, label: `${a.name} (${a.currency})` }))
);

const dateFormatOptions = [
  { value: "DD/MM/YYYY", label: "DD/MM/AAAA" },
  { value: "MM/DD/YYYY", label: "MM/DD/AAAA" },
  { value: "YYYY-MM-DD", label: "AAAA-MM-DD" },
];

const DATE_KEYS = ["date", "data", "dtposted", "transactiondate"];
const DESCRIPTION_KEYS = ["description", "descricao", "descrição", "memo", "payee", "historico", "histórico", "name"];
const AMOUNT_KEYS = ["amount", "valor", "value"];

function normalizeHeader(header: string): string {
  return header
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase();
}

function splitLine(line: string, delimiter: string): string[] {
  return line.split(delimiter).map((cell) => cell.replace(/^"|"$/g, "").trim());
}

function detectDelimiter(sample: string): string {
  return (sample.split(";")[1] ?? "").includes(",") ? ";" : ",";
}

function parseAmount(value: string): number {
  const normalized = value.replace(/[^\d,.-]/g, "");
  const lastComma = normalized.lastIndexOf(",");
  const lastDot = normalized.lastIndexOf(".");
  let parsed = Number(normalized);
  if (lastComma > -1 && lastDot === -1) {
    parsed = Number(normalized.replace(/\./g, "").replace(",", "."));
  }
  return Number.isFinite(parsed) ? parsed : 0;
}

function buildPreview(headerLine: string, dataLines: string[], delimiter: string): void {
  const headers = splitLine(headerLine, delimiter).map(normalizeHeader);

  const dateIndex = headers.findIndex((h) => DATE_KEYS.includes(h));
  const descriptionIndex = headers.findIndex((h) => DESCRIPTION_KEYS.includes(h));
  const amountIndex = headers.findIndex((h) => AMOUNT_KEYS.includes(h));

  previewTotal.value = dataLines.length;
  previewRows.value = dataLines.slice(0, PREVIEW_LIMIT).map((line) => {
    const cells = splitLine(line, delimiter);
    return {
      date: dateIndex >= 0 ? cells[dateIndex] || "—" : "—",
      description: descriptionIndex >= 0 ? cells[descriptionIndex] || "—" : "—",
      amount: amountIndex >= 0 ? parseAmount(cells[amountIndex] || "") : 0,
    };
  });
}

function parseCsvPreview(text: string): void {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (!lines.length) {
    previewRows.value = [];
    previewTotal.value = 0;
    return;
  }

  buildPreview(lines[0], lines.slice(1), detectDelimiter(lines[0]));
}

async function onFileSelect(event: Event): Promise<void> {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  fileError.value = "";
  submitError.value = "";
  importResult.value = null;
  previewRows.value = [];
  previewTotal.value = 0;

  if (!file) {
    selectedFile.value = null;
    return;
  }

  if (file.size > MAX_FILE_SIZE) {
    fileError.value = "Arquivo muito grande (máx 5MB)";
    selectedFile.value = null;
    target.value = "";
    return;
  }

  selectedFile.value = file;

  if (!file.name.toLowerCase().endsWith(".csv")) {
    return;
  }

  parsing.value = true;
  try {
    parseCsvPreview(await file.text());
  } catch {
    previewRows.value = [];
    previewTotal.value = 0;
  } finally {
    parsing.value = false;
  }
}

function resetResult(): void {
  importResult.value = null;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function onImport() {
  submitError.value = "";

  if (!selectedFile.value) {
    submitError.value = "Selecione um arquivo para importar.";
    return;
  }

  errors.accountId = importAccountId.value ? "" : "Selecione a conta";
  if (errors.accountId) return;

  importing.value = true;
  try {
    // TODO: Implementar envio do arquivo para a API
    await new Promise((resolve) => setTimeout(resolve, 2000));
    importResult.value = { imported: 42, skipped: 3, errors: 0 };
    toast.success("Transações importadas com sucesso.", "Importação concluída");

    selectedFile.value = null;
    previewRows.value = [];
    previewTotal.value = 0;
    if (fileInput.value) fileInput.value.value = "";
  } catch (e) {
    submitError.value = "Não foi possível importar o arquivo. Tente novamente.";
  } finally {
    importing.value = false;
  }
}
</script>
