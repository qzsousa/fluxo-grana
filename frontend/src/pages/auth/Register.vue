<template>
  <div class="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-5 sm:p-7 stagger-in">
    <div class="mb-6 text-center sm:mb-7">
      <h1 class="mb-1.5 text-xl font-semibold tracking-tight text-[var(--color-fg)]">Criar sua conta</h1>
      <p class="text-sm text-[var(--color-fg-muted)]">Comece a organizar suas finanças hoje</p>
    </div>

    <form @submit.prevent="onSubmit" class="space-y-4">
      <Input
        id="name"
        v-model="name"
        type="text"
        label="Nome completo"
        placeholder="João Silva"
        autocomplete="name"
        required
        :error="errors.name"
        :icon="{
          viewBox: '0 0 24 24',
          stroke: 'currentColor',
          path: 'M18 20V10M18 20a6 6 0 00-12 0M18 20A8 8 0 016 10m12 0a8 8 0 00-16 0',
          strokeWidth: 1.8,
        }"
      />

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
        autocomplete="new-password"
        required
        minlength="8"
        :error="errors.password"
        :hint="errors.password ? undefined : 'Mínimo 8 caracteres'"
        :icon="{
          viewBox: '0 0 24 24',
          stroke: 'currentColor',
          path: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
          strokeWidth: 1.8,
        }"
      />

      <Input
        id="confirmPassword"
        v-model="confirmPassword"
        type="password"
        label="Confirmar senha"
        placeholder="••••••••"
        autocomplete="new-password"
        required
        :error="errors.confirmPassword"
        :icon="{
          viewBox: '0 0 24 24',
          stroke: 'currentColor',
          path: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
          strokeWidth: 1.8,
        }"
      />

      <div
        v-if="error"
        class="flex items-start gap-2.5 rounded-xl border border-[var(--color-danger-muted)] bg-[var(--color-danger-light)] px-4 py-3 text-sm text-[var(--color-danger)]"
        role="alert"
      >
        <AppIcon name="alert" :size="18" class="mt-px shrink-0" />
        <span>{{ error }}</span>
      </div>

      <Button type="submit" variant="primary" fullWidth :loading="auth.loading" class="mt-2">
        <span v-if="auth.loading">Criando conta…</span>
        <span v-else>Criar conta</span>
      </Button>
    </form>

    <div class="mt-6 text-center">
      <p class="text-sm text-[var(--color-fg-muted)]">
        Já tem conta?
        <router-link to="/login" class="link font-medium">Entrar</router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from "vue";
import { useAuthStore } from "../../stores/auth";
import { useRouter } from "vue-router";
import { Input, Button, AppIcon } from "../../components/ui";

const name = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const error = ref("");

const errors = reactive({
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
});

const auth = useAuthStore();
const router = useRouter();

function validateName(value: string): string {
  if (!value.trim()) return "Nome é obrigatório";
  if (value.trim().length < 2) return "Nome muito curto";
  return "";
}

function validateEmail(value: string): string {
  if (!value) return "E-mail é obrigatório";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "E-mail inválido";
  return "";
}

function validatePassword(value: string): string {
  if (!value) return "Senha é obrigatória";
  if (value.length < 8) return "Mínimo 8 caracteres";
  return "";
}

function validateConfirmPassword(value: string): string {
  if (!value) return "Confirme sua senha";
  if (value !== password.value) return "Senhas não coincidem";
  return "";
}

watch(() => [name.value, email.value, password.value, confirmPassword.value], () => {
  errors.name = validateName(name.value);
  errors.email = validateEmail(email.value);
  errors.password = validatePassword(password.value);
  errors.confirmPassword = validateConfirmPassword(confirmPassword.value);
});

async function onSubmit() {
  error.value = "";
  errors.name = validateName(name.value);
  errors.email = validateEmail(email.value);
  errors.password = validatePassword(password.value);
  errors.confirmPassword = validateConfirmPassword(confirmPassword.value);

  if (errors.name || errors.email || errors.password || errors.confirmPassword) return;

  const result = await auth.register(email.value, password.value, name.value);

  if (result.success) {
    router.push("/dashboard");
  } else {
    error.value = result.error || "Falha ao criar conta. Tente novamente.";
  }
}
</script>