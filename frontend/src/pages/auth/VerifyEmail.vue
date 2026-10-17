<template>
  <div class="w-full space-y-6 stagger-in">
    <div class="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-8">
      <!-- Verificando -->
      <div v-if="verifying" class="py-6 text-center">
        <svg class="mx-auto h-12 w-12 animate-spin text-[var(--color-brand)]" fill="none" viewBox="0 0 24 24" aria-hidden="true">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <h1 class="font-display text-2xl text-[var(--color-fg)] mb-2">Verificar e-mail</h1>
        <p class="text-[var(--color-fg-muted)]">Verificando seu e-mail…</p>
      </div>

      <!-- Sucesso -->
      <div v-else-if="success" class="py-6 text-center">
        <span class="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-success-light)] text-[var(--color-success)]">
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </span>
        <h1 class="font-display text-2xl text-[var(--color-fg)] mb-2">E-mail verificado com sucesso</h1>
        <p class="text-[var(--color-fg-muted)]">Sua conta está pronta para uso.</p>
      </div>

      <!-- Erro -->
      <div v-else class="py-6 text-center">
        <span class="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-danger-light)] text-[var(--color-danger)]">
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </span>
        <h1 class="font-display text-2xl text-[var(--color-fg)] mb-2">Verificação não concluída</h1>
        <p class="text-[var(--color-fg-muted)]">{{ errorMessage }}</p>
      </div>

      <div class="mt-6 text-center">
        <router-link to="/login" class="link font-medium">Voltar para o login</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";

const verifying = ref(true);
const success = ref(false);
const errorMessage = ref("");
const route = useRoute();

onMounted(async () => {
  const token = (route.params.token as string) || "";

  try {
    // TODO: Implementar verificação de e-mail na API
    // const response = await api.post("/auth/verify-email", { token });

    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (!token) throw new Error("Link de verificação inválido");

    verifying.value = false;
    success.value = true;
  } catch (error: any) {
    verifying.value = false;
    success.value = false;
    errorMessage.value =
      error?.response?.data?.error || "Link de verificação inválido ou expirado.";
  }
});
</script>
