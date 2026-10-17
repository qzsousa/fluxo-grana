<template>
  <div class="w-full space-y-6 stagger-in">
    <div class="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-8">
      <div class="mb-8 text-center">
        <span class="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-brand-light)] text-[var(--color-brand)]">
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 7a3 3 0 11-6 0 3 3 0 016 0zm-3 3.75V21M4.5 10.5a8.5 8.5 0 1115 0v3a1.5 1.5 0 01-3 0v-3a12.5 12.5 0 00-9 0v3a1.5 1.5 0 01-3 0v-3z" />
          </svg>
        </span>
        <h1 class="font-display text-2xl text-[var(--color-fg)] mb-2">Esqueci a senha</h1>
        <p class="text-[var(--color-fg-muted)]">
          Digite seu e-mail e enviaremos um link para redefinir sua senha
        </p>
      </div>

      <div v-if="sent" class="rounded-lg border border-[var(--color-success-muted)] bg-[var(--color-success-light)] p-4 text-sm text-[var(--color-success)]" role="status">
        <p class="font-medium">Link enviado</p>
        <p class="mt-1">
          Se existir uma conta com o e-mail <span class="font-medium">{{ email }}</span>, você receberá o link de recuperação em instantes.
        </p>
      </div>

      <form v-else class="space-y-5" @submit.prevent="onSubmit">
        <Input
          id="email"
          v-model="email"
          type="email"
          label="E-mail"
          placeholder="seu@email.com"
          autocomplete="email"
          required
          :error="errors.email"
          :icon="{
            viewBox: '0 0 24 24',
            stroke: 'currentColor',
            path: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
            strokeWidth: 1.8,
          }"
        />

        <div v-if="error" class="rounded-lg border border-[var(--color-danger-muted)] bg-[var(--color-danger-light)] p-3 text-sm text-[var(--color-danger)]" role="alert">
          {{ error }}
        </div>

        <Button type="submit" variant="primary" fullWidth :loading="sending" class="mt-2">
          Enviar link de recuperação
        </Button>
      </form>

      <div class="mt-6 text-center">
        <p class="text-sm text-[var(--color-fg-muted)]">
          Lembrou a senha?
          <router-link to="/login" class="link font-medium">Voltar para o login</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { Button, Input } from "../../components/ui";

const email = ref("");
const sending = ref(false);
const sent = ref(false);
const error = ref("");

const errors = reactive({ email: "" });

function validateEmail(value: string): string {
  if (!value) return "E-mail é obrigatório";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "E-mail inválido";
  return "";
}

async function onSubmit() {
  error.value = "";
  errors.email = validateEmail(email.value);
  if (errors.email) return;

  sending.value = true;
  try {
    // TODO: Implementar envio do link de recuperação na API
    await new Promise((resolve) => setTimeout(resolve, 1000));
    sent.value = true;
  } catch (e) {
    error.value = "Não foi possível enviar o link de recuperação. Tente novamente.";
  } finally {
    sending.value = false;
  }
}
</script>
