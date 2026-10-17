<template>
  <div class="space-y-6 stagger-in">
    <!-- Page header -->
    <div>
      <h1 class="font-display text-3xl text-[var(--color-fg)]">Preferências</h1>
      <p class="mt-1 text-[var(--color-fg-muted)]">
        Defina os formatos usados no app e quando você quer ser avisado sobre as faturas.
      </p>
    </div>

    <!-- Formatos -->
    <Card title="Formatos" description="Como moeda, números e datas aparecem." padding="md">
      <div class="space-y-4">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Select
            id="preferences-theme"
            :model-value="theme.preference.value"
            label="Tema"
            :options="themeOptions"
            @update:model-value="theme.setTheme($event as ThemePreference)"
          />

          <Select
            id="preferences-locale"
            :model-value="preferences.locale"
            label="Idioma"
            :options="localeOptions"
            hint="Usado nos números, nas datas e nos avisos."
            @update:model-value="update('locale', $event)"
          />
        </div>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Select
            id="preferences-currency"
            :model-value="preferences.currency"
            label="Moeda padrão"
            :options="currencyOptions"
            hint="Usada quando a conta não define a própria moeda."
            @update:model-value="update('currency', $event)"
          />

          <Select
            id="preferences-date-format"
            v-model="draft.dateFormat"
            label="Formato de data"
            :options="dateFormatOptions"
          />
        </div>

        <Select
          id="preferences-number-format"
          v-model="draft.numberFormat"
          label="Formato de número"
          :options="numberFormatOptions"
        />

        <p class="rounded-lg bg-[var(--color-bg-muted)] px-4 py-3 text-xs text-[var(--color-fg-muted)]">
          Prévia de um valor:
          <span class="font-semibold text-[var(--color-fg)]">{{ currencyPreview }}</span>
        </p>

        <router-link to="/settings/appearance" class="link text-sm">
          Mudar cor, densidade e tamanho do texto
        </router-link>
      </div>
    </Card>

    <!-- Lembretes de fatura -->
    <Card
      title="Lembretes de fatura"
      description="Avisos sobre as faturas dos seus cartões de crédito."
      padding="md"
    >
      <div class="space-y-3">
        <!-- Antecedência -->
        <div class="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-muted)] p-4">
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              <p class="text-sm font-medium text-[var(--color-fg)]">Avisar com antecedência</p>
              <p class="mt-0.5 text-xs text-[var(--color-fg-muted)]">
                Quantos dias antes do vencimento o sino passa a mostrar a fatura.
              </p>
            </div>
            <p class="shrink-0 text-sm font-semibold tabular-nums text-[var(--color-brand)]">
              {{ preferences.invoiceReminderDays }} dias
            </p>
          </div>

          <div
            class="mt-3 flex flex-wrap gap-2"
            role="radiogroup"
            aria-label="Antecedência do aviso"
          >
            <button
              v-for="option in reminderDayOptions"
              :key="option"
              type="button"
              role="radio"
              :aria-checked="preferences.invoiceReminderDays === option"
              class="min-h-9 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors"
              :class="
                preferences.invoiceReminderDays === option
                  ? 'border-[var(--color-brand)] bg-[var(--color-brand-light)] text-[var(--color-brand)]'
                  : 'border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-[var(--color-fg-muted)] hover:bg-[var(--color-bg-muted)]'
              "
              @click="setInvoiceReminderDays(option)"
            >
              {{ option }}d
            </button>
          </div>
        </div>

        <!-- Dentro do app -->
        <div
          class="flex items-start justify-between gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-muted)] p-4"
        >
          <div class="min-w-0">
            <p class="text-sm font-medium text-[var(--color-fg)]">Avisos dentro do app</p>
            <p class="mt-0.5 text-xs text-[var(--color-fg-muted)]">
              O sino no topo ganha um contador e um aviso aparece quando você entra.
            </p>
          </div>
          <button
            id="pref-in-app-notifications"
            type="button"
            role="switch"
            :aria-checked="preferences.inAppNotifications"
            aria-label="Avisos dentro do app"
            class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors"
            :class="preferences.inAppNotifications ? 'bg-[var(--color-brand)]' : 'bg-[var(--color-border-strong)]'"
            @click="update('inAppNotifications', !preferences.inAppNotifications)"
          >
            <span
              class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
              :class="preferences.inAppNotifications ? 'translate-x-6' : 'translate-x-1'"
            ></span>
          </button>
        </div>

        <!-- Notificação do navegador -->
        <div
          class="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-muted)] p-4"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              <p class="text-sm font-medium text-[var(--color-fg)]">Notificação do navegador</p>
              <p class="mt-0.5 text-xs text-[var(--color-fg-muted)]">
                Popup do próprio sistema, mesmo com outra aba aberta.
              </p>
            </div>
            <button
              id="pref-browser-notifications"
              type="button"
              role="switch"
              :aria-checked="preferences.browserNotifications"
              aria-label="Notificação do navegador"
              class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              :class="preferences.browserNotifications ? 'bg-[var(--color-brand)]' : 'bg-[var(--color-border-strong)]'"
              :disabled="!isSupported"
              @click="toggleBrowserNotifications"
            >
              <span
                class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
                :class="preferences.browserNotifications ? 'translate-x-6' : 'translate-x-1'"
              ></span>
            </button>
          </div>

          <p
            v-if="!isSupported"
            class="mt-2 text-xs text-[var(--color-fg-subtle)]"
          >
            Este navegador não suporta notificações. O aviso dentro do app continua funcionando.
          </p>
          <p
            v-else-if="preferences.browserNotifications && permission === 'denied'"
            class="mt-2 text-xs text-[var(--color-warning)]"
          >
            O navegador bloqueou as notificações deste site. Libere nas permissões do site para
            receber os avisos.
          </p>
          <p
            v-else-if="preferences.browserNotifications && permission === 'granted'"
            class="mt-2 text-xs text-[var(--color-success)]"
          >
            Autorizado. Você vai receber o popup do sistema antes do vencimento.
          </p>
        </div>

        <router-link to="/invoices" class="link text-sm">Ver faturas dos cartões</router-link>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { Card, Select } from "../../components/ui";
import { usePreferences } from "../../composables/usePreferences";
import { useNotifications } from "../../composables/useNotifications";
import { useTheme, type ThemePreference } from "../../composables/useTheme";
import { useToast } from "../../composables/useToast";
import { formatCurrency } from "../../utils/format";

const { preferences, update, setInvoiceReminderDays } = usePreferences();
const theme = useTheme();
const { permission, isSupported, requestPermission } = useNotifications();
const toast = useToast();

const reminderDayOptions = [1, 3, 5, 7, 10, 14];

// Formato de data e de número ainda não alimentam nenhuma tela — ficam como
// rascunho local até existirem componentes que os consumam.
const draft = ref({
  dateFormat: "DD/MM/YYYY",
  numberFormat: "pt-BR",
});

const themeOptions = [
  { value: "light", label: "Claro" },
  { value: "dark", label: "Escuro" },
  { value: "system", label: "Sistema" },
];

const localeOptions = [
  { value: "pt-BR", label: "Português" },
  { value: "en-US", label: "Inglês" },
  { value: "es-ES", label: "Espanhol" },
];

const currencyOptions = [
  { value: "BRL", label: "BRL — Real Brasileiro" },
  { value: "USD", label: "USD — Dólar Americano" },
  { value: "EUR", label: "EUR — Euro" },
  { value: "GBP", label: "GBP — Libra Esterlina" },
];

const dateFormatOptions = [
  { value: "DD/MM/YYYY", label: "DD/MM/AAAA" },
  { value: "MM/DD/YYYY", label: "MM/DD/AAAA" },
  { value: "YYYY-MM-DD", label: "AAAA-MM-DD" },
];

const numberFormatOptions = [
  { value: "pt-BR", label: "1.234,56 (Brasil)" },
  { value: "en-US", label: "1,234.56 (Estados Unidos)" },
  { value: "de-DE", label: "1.234,56 (Alemanha)" },
];

const currencyPreview = computed(() =>
  formatCurrency(1234.56, preferences.value.currency, draft.value.numberFormat)
);

/**
 * O pedido de permissão só funciona dentro de um gesto do usuário — não dá para
 * pedir quando o toggle é lido do storage no carregamento da página.
 */
async function toggleBrowserNotifications() {
  if (preferences.value.browserNotifications) {
    update("browserNotifications", false);
    return;
  }

  if (permission.value === "denied") {
    toast.warning(
      "O navegador está bloqueando as notificações deste site. Libere nas permissões e recarregue a página.",
      "Permissão negada"
    );
    return;
  }

  const result = await requestPermission();

  if (result === "granted") {
    update("browserNotifications", true);
    toast.success("Você será avisado antes do vencimento das faturas.");
  } else if (result === "unsupported") {
    toast.warning("Este navegador não suporta notificações.", "Não disponível");
  } else {
    toast.warning(
      "Sem autorização, o aviso continua aparecendo no sino do app.",
      "Permissão não concedida"
    );
  }
}
</script>
