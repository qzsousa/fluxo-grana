<template>
  <div class="w-full space-y-6 stagger-in">
    <div class="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-8">
      <div class="mb-8 text-center">
        <span class="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-brand-light)] text-[var(--color-brand)]">
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </span>
        <h1 class="font-display text-2xl text-[var(--color-fg)] mb-2">Redefinir senha</h1>
        <p class="text-[var(--color-fg-muted)]">Crie uma nova senha para acessar sua conta</p>
      </div>

      <div
        v-if="!hasToken"
        class="mb-6 rounded-lg border border-[var(--color-warning-muted)] bg-[var(--color-warning-light)] p-3 text-sm text-[var(--color-warning)]"
        role="alert"
      >
        Link inválido ou expirado. Solicite um novo link de recuperação.
      </div>

      <form class="space-y-5" @submit.prevent="onSubmit">
        <Input
          id="password"
          v-model="password"
          type="password"
          label="Nova senha"
          placeholder="••••••••"
          autocomplete="new-password"
          required
          :error="errors.password"
          hint="Mínimo de 8 caracteres"
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
          label="Confirmar nova senha"
          placeholder="••••••••"
          autocomplete="new-password"
          required
          :error="errors.confirmPassword"
        />

        <div v-if="error" class="rounded-lg border border-[var(--color-danger-muted)] bg-[var(--color-danger-light)] p-3 text-sm text-[var(--color-danger)]" role="alert">
          {{ error }}
        </div>

        <div
          v-if="success"
          class="rounded-lg border border-[var(--color-success-muted)] bg-[var(--color-success-light)] p-3 text-sm text-[var(--color-success)]"
          role="status"
        >
          Senha redefinida com sucesso. redirecionando para o login…
        </div>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          :loading="saving"
          :disabled="!hasToken"
          class="mt-2"
        >
          Redefinir senha
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
import { computed, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Button, Input } from "../../components/ui";

const route = useRoute();
const router = useRouter();

const password = ref("");
const confirmPassword = ref("");
const saving = ref(false);
const success = ref(false);
const error = ref("");

const errors = reactive({
  password: "",
  confirmPassword: "",
});

const token = computed(() => (route.params.token as string) || "");
const hasToken = computed(() => !!token.value);

function validate(): boolean {
  errors.password = password.value ? (password.value.length >= 8 ? "" : "A senha deve ter pelo menos 8 caracteres") : "Senha é obrigatória";
  errors.confirmPassword = confirmPassword.value
    ? confirmPassword.value === password.value
      ? ""
      : "Senhas não coincidem"
    : "Confirme a nova senha";
  return !errors.password && !errors.confirmPassword;
}

async function onSubmit() {
  error.value = "";
  success.value = false;

  if (!validate()) return;

  saving.value = true;
  try {
    // TODO: Implementar redefinição de senha na API usando o token
    await new Promise((resolve) => setTimeout(resolve, 1000));
    success.value = true;
    setTimeout(() => router.push("/login"), 1500);
  } catch (e) {
    error.value = "Não foi possível redefinir a senha. Solicite um novo link.";
  } finally {
    saving.value = false;
  }
}
</script>
