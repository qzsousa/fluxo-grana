<template>
  <div class="bg-[var(--color-bg-elevated)] rounded-2xl border border-[var(--color-border)] p-8 stagger-in">
    <div class="text-center mb-8">
      <h1 class="font-display text-2xl text-[var(--color-fg)] mb-2">Entrar na sua conta</h1>
      <p class="text-[var(--color-fg-muted)]">Acesse seu painel financeiro</p>
    </div>

    <form @submit.prevent="onSubmit" class="space-y-5">
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

      <Input
        id="password"
        v-model="password"
        type="password"
        label="Senha"
        placeholder="••••••••"
        autocomplete="current-password"
        required
        :error="errors.password"
        :icon="{
          viewBox: '0 0 24 24',
          stroke: 'currentColor',
          path: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
          strokeWidth: 1.8,
        }"
      />

      <div class="flex items-center justify-between">
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            v-model="remember"
            class="h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-brand)] focus:ring-[var(--color-brand)] focus:ring-offset-2 transition-colors"
          />
          <span class="text-sm text-[var(--color-fg-muted)]">Lembrar-me</span>
        </label>
        <router-link to="/forgot-password" class="link text-sm">Esqueci a senha</router-link>
      </div>

      <div v-if="error" class="p-3 rounded-lg bg-[var(--color-danger-light)] border border-[var(--color-danger-muted)] text-sm text-[var(--color-danger)]" role="alert">
        {{ error }}
      </div>

      <Button type="submit" variant="primary" fullWidth :loading="auth.loading" class="mt-2">
        <span v-if="auth.loading">Entrando…</span>
        <span v-else>Entrar</span>
      </Button>
    </form>

    <div class="mt-6 text-center">
      <p class="text-sm text-[var(--color-fg-muted)]">
        Não tem conta?
        <router-link to="/register" class="link font-medium">Criar conta</router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { useAuthStore } from "../../stores/auth";
import { useRouter } from "vue-router";
import { Input, Button } from "../../components/ui";

const email = ref("");
const password = ref("");
const remember = ref(false);
const error = ref("");

const errors = reactive({
  email: "",
  password: "",
});

const auth = useAuthStore();
const router = useRouter();

function validateEmail(value: string): string {
  if (!value) return "E-mail é obrigatório";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "E-mail inválido";
  return "";
}

function validatePassword(value: string): string {
  if (!value) return "Senha é obrigatória";
  return "";
}

async function onSubmit() {
  error.value = "";
  errors.email = validateEmail(email.value);
  errors.password = validatePassword(password.value);

  if (errors.email || errors.password) return;

  const result = await auth.login(email.value, password.value);

  if (result.success) {
    router.push("/dashboard");
  } else {
    error.value = result.error || "Falha ao entrar. Verifique suas credenciais.";
  }
}
</script>