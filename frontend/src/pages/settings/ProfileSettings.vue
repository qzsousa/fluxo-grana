<template>
  <div class="space-y-6 stagger-in">
    <!-- Page header -->
    <div>
      <h1 class="font-display text-3xl text-[var(--color-fg)]">Perfil</h1>
      <p class="mt-1 text-[var(--color-fg-muted)]">
        Mantenha seus dados pessoais e de exibição sempre atualizados.
      </p>
    </div>

    <!-- Profile photo -->
    <Card title="Foto do perfil" description="Usada nas telas de família e nos compartilhamentos." padding="md">
      <div class="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <span
          class="inline-flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-brand-light)] text-2xl font-semibold text-[var(--color-brand)]"
          aria-hidden="true"
        >
          {{ userInitial }}
        </span>
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-medium text-[var(--color-fg)]">{{ auth.user?.name || "Usuário" }}</p>
          <p class="truncate text-xs text-[var(--color-fg-muted)]">{{ auth.user?.email }}</p>
          <div class="mt-3">
            <Tooltip content="O envio de foto ainda não está disponível — por enquanto mostramos as iniciais do seu nome." position="top">
              <template #trigger>
                <span class="inline-flex">
                  <Button variant="outline" size="sm" disabled>
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M3 7.5A1.5 1.5 0 014.5 6h3l2 2.5h8A1.5 1.5 0 0119 10v8a1.5 1.5 0 01-1.5 1.5h-13A1.5 1.5 0 013 18V7.5z" />
                    </svg>
                    Alterar foto
                  </Button>
                </span>
              </template>
            </Tooltip>
          </div>
        </div>
      </div>
    </Card>

    <!-- Profile data -->
    <Card title="Dados pessoais" description="Usados nos relatórios e nas exportações de dados." padding="none">
      <form class="space-y-6 p-6" @submit.prevent="onSubmit">
        <Input
          id="profile-name"
          v-model="form.name"
          label="Nome completo"
          type="text"
          autocomplete="name"
          required
          :error="errors.name"
        />

        <Input
          id="profile-email"
          v-model="form.email"
          label="E-mail"
          type="email"
          autocomplete="email"
          disabled
          hint="O e-mail não pode ser alterado. Fale com o suporte caso precise trocá-lo."
        />

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Select
            id="profile-locale"
            v-model="form.locale"
            label="Idioma"
            :options="localeOptions"
          />

          <Select
            id="profile-currency"
            v-model="form.currency"
            label="Moeda padrão"
            :options="currencyOptions"
          />
        </div>

        <Select
          id="profile-timezone"
          v-model="form.timezone"
          label="Fuso horário"
          :options="timezoneOptions"
          hint="Define como datas e horários são exibidos em todo o aplicativo."
        />
      </form>

      <template #footer>
        <Button variant="ghost" type="button" @click="resetForm">Descartar</Button>
        <Button type="button" :loading="saving" @click="onSubmit">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Salvar alterações
        </Button>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useAuthStore } from "../../stores/auth";
import { Button, Card, Input, Select, Tooltip } from "../../components/ui";

const auth = useAuthStore();

const saving = ref(false);

const form = ref({
  name: auth.user?.name || "",
  email: auth.user?.email || "",
  locale: auth.user?.locale || "pt-BR",
  currency: auth.user?.currency || "BRL",
  timezone: auth.user?.timezone || "America/Sao_Paulo",
});

const errors = ref({
  name: "",
});

const userInitial = computed(() => (auth.user?.name?.charAt(0) || "U").toUpperCase());

const localeOptions = [
  { value: "pt-BR", label: "Português (Brasil)" },
  { value: "en-US", label: "Inglês (Estados Unidos)" },
  { value: "es-ES", label: "Espanhol" },
];

const currencyOptions = [
  { value: "BRL", label: "BRL — Real Brasileiro" },
  { value: "USD", label: "USD — Dólar Americano" },
  { value: "EUR", label: "EUR — Euro" },
  { value: "GBP", label: "GBP — Libra Esterlina" },
];

const timezoneOptions = [
  { value: "America/Sao_Paulo", label: "Brasília (UTC-3)" },
  { value: "America/New_York", label: "Nova York (UTC-5)" },
  { value: "America/Los_Angeles", label: "Los Angeles (UTC-8)" },
  { value: "Europe/London", label: "Londres (UTC+0)" },
  { value: "Europe/Paris", label: "Paris (UTC+1)" },
  { value: "UTC", label: "UTC" },
];

function resetForm() {
  form.value = {
    name: auth.user?.name || "",
    email: auth.user?.email || "",
    locale: auth.user?.locale || "pt-BR",
    currency: auth.user?.currency || "BRL",
    timezone: auth.user?.timezone || "America/Sao_Paulo",
  };
  errors.value.name = "";
}

async function onSubmit() {
  errors.value.name = form.value.name.trim() ? "" : "Informe seu nome completo";
  if (errors.value.name) return;

  saving.value = true;
  try {
    // TODO: Implementar chamada de atualização de perfil
    alert("Perfil atualizado com sucesso!");
  } catch (error) {
    alert("Falha ao atualizar o perfil: " + (error as Error).message);
  } finally {
    saving.value = false;
  }
}
</script>