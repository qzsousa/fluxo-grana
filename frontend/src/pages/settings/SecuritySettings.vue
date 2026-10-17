<template>
  <div class="space-y-6 stagger-in">
    <!-- Page header -->
    <div>
      <h1 class="font-display text-3xl text-[var(--color-fg)]">Segurança</h1>
      <p class="mt-1 text-[var(--color-fg-muted)]">
        Proteja seu acesso: senha, verificação em duas etapas e sessões abertas.
      </p>
    </div>

    <!-- Password -->
    <Card title="Alterar senha" description="Use uma senha longa e diferente das outras que você usa." padding="none">
      <form class="space-y-4 p-6" @submit.prevent="changePassword">
        <Input
          id="current-password"
          v-model="passwordForm.currentPassword"
          label="Senha atual"
          type="password"
          autocomplete="current-password"
          required
          :error="errors.currentPassword"
        />

        <Input
          id="new-password"
          v-model="passwordForm.newPassword"
          label="Nova senha"
          type="password"
          autocomplete="new-password"
          required
          hint="Mínimo de 8 caracteres."
          :error="errors.newPassword"
        />

        <Input
          id="confirm-password"
          v-model="passwordForm.confirmPassword"
          label="Confirmar nova senha"
          type="password"
          autocomplete="new-password"
          required
          :error="errors.confirmPassword"
        />

        <div class="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
          <Button variant="ghost" type="button" @click="clearPasswordForm">Limpar</Button>
          <Button type="submit" :loading="changingPassword" @click="changePassword">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Alterar senha
          </Button>
        </div>
      </form>
    </Card>

    <!-- Two-factor authentication -->
    <Card
      title="Autenticação de dois fatores"
      description="Um código extra é pedido além da sua senha."
      padding="md"
    >
      <div v-if="!twoFactorEnabled" class="flex flex-col gap-4 rounded-xl border border-[var(--color-info)] bg-[var(--color-info-light)] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="min-w-0">
          <p class="text-sm font-medium text-[var(--color-info)]">Autenticação de dois fatores desativada</p>
          <p class="mt-0.5 text-xs text-[var(--color-fg-muted)]">
           Sua conta hoje depende apenas da senha. Ative a 2FA para reduzir o risco de acessos indevidos.
          </p>
        </div>
        <Tooltip content="Você precisará de um aplicativo autenticador ou do seu e-mail para gerar o código." position="left">
          <template #trigger>
            <span class="inline-flex shrink-0">
              <Button @click="enable2FA">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622a12.02 12.02 0 00-3-7.016z" />
                </svg>
                Ativar 2FA
              </Button>
            </span>
          </template>
        </Tooltip>
      </div>

      <div v-else class="flex flex-col gap-4 rounded-xl border border-[var(--color-success)] bg-[var(--color-success-light)] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="min-w-0">
          <p class="text-sm font-medium text-[var(--color-success)]">Autenticação de dois fatores ativa</p>
          <p class="mt-0.5 text-xs text-[var(--color-fg-muted)]">
            Sua conta está protegida com 2FA. Guarde os códigos de recuperação em local seguro.
          </p>
        </div>
        <Tooltip content="Ao desativar, sua conta volta a depender somente da senha." position="left">
          <template #trigger>
            <span class="inline-flex shrink-0">
              <Button variant="outline" @click="disable2FA">Desativar 2FA</Button>
            </span>
          </template>
        </Tooltip>
      </div>
    </Card>

    <!-- Email verification -->
    <Card title="Verificação por e-mail" description="Usada para recuperar o acesso e confirmar novas contas." padding="md">
      <div class="flex flex-col gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-muted)] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex min-w-0 items-center gap-3">
          <span
            class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
            :class="emailVerified ? 'bg-[var(--color-success-light)] text-[var(--color-success)]' : 'bg-[var(--color-warning-light)] text-[var(--color-warning)]'"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </span>
          <div class="min-w-0">
            <p class="truncate text-sm font-medium text-[var(--color-fg)]">{{ auth.user?.email || "—" }}</p>
            <p class="text-xs text-[var(--color-fg-muted)]">
              {{ emailVerified ? "E-mail confirmado." : "E-mail ainda não confirmado." }}
            </p>
          </div>
        </div>
        <span v-if="emailVerified" class="badge badge-success">Verificado</span>
        <span v-else class="badge badge-warning">Pendente</span>
      </div>
    </Card>

    <!-- Active sessions -->
    <Card title="Sessões ativas" description="Dispositivos conectados a esta conta agora." padding="none">
      <template #header-actions>
        <Button
          v-if="sessions.length > 0"
          variant="ghost"
          size="sm"
          @click="revokeAllSessions"
        >
          Encerrar todas as sessões
        </Button>
      </template>

      <ul v-if="sessions.length > 0" class="divide-y divide-[var(--color-border)]">
        <li
          v-for="session in sessions"
          :key="session.id"
          class="flex items-center justify-between gap-4 px-6 py-4"
        >
          <div class="flex min-w-0 items-center gap-3">
            <span class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-bg-muted)] text-[var(--color-fg-muted)]">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </span>
            <div class="min-w-0">
              <p class="truncate text-sm font-medium text-[var(--color-fg)]">{{ session.device }}</p>
              <p class="truncate text-xs text-[var(--color-fg-muted)]">
                {{ session.location }} · {{ session.lastActive }}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" @click="revokeSession(session.id)">Encerrar sessão</Button>
        </li>
      </ul>

      <EmptyState
        v-else
        icon="settings"
        title="Nenhuma sessão ativa"
        description="Não há outros dispositivos conectados a esta conta neste momento."
      />
    </Card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useAuthStore } from "../../stores/auth";
import { Button, Card, EmptyState, Input, Tooltip } from "../../components/ui";

const auth = useAuthStore();

const changingPassword = ref(false);
const twoFactorEnabled = ref(auth.user?.twoFactorEnabled ?? false);

const passwordForm = ref({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const errors = ref({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const sessions = ref([
  {
    id: "1",
    device: "Chrome no Windows",
    location: "São Paulo, BR",
    lastActive: "agora mesmo",
  },
]);

const emailVerified = computed(() => auth.user?.emailVerified ?? false);

function clearPasswordForm() {
  passwordForm.value = {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  };
  errors.value = { currentPassword: "", newPassword: "", confirmPassword: "" };
}

async function changePassword() {
  errors.value.currentPassword = passwordForm.value.currentPassword ? "" : "Informe sua senha atual";
  errors.value.newPassword =
    passwordForm.value.newPassword.length >= 8 ? "" : "A nova senha deve ter pelo menos 8 caracteres";
  errors.value.confirmPassword =
    passwordForm.value.newPassword === passwordForm.value.confirmPassword
      ? ""
      : "As senhas não conferem";

  if (errors.value.currentPassword || errors.value.newPassword || errors.value.confirmPassword) {
    return;
  }

  changingPassword.value = true;
  try {
    // TODO: Implementar chamada de alteração de senha
    alert("Senha alterada com sucesso!");
    clearPasswordForm();
  } catch (error) {
    alert("Falha ao alterar a senha: " + (error as Error).message);
  } finally {
    changingPassword.value = false;
  }
}

async function enable2FA() {
  // TODO: Implementar ativação da 2FA
  alert("A configuração da 2FA ainda não está disponível.");
}

async function disable2FA() {
  // TODO: Implementar desativação da 2FA
  twoFactorEnabled.value = false;
  alert("2FA desativada.");
}

async function revokeSession(id: string) {
  // TODO: Implementar revogação de sessão
  sessions.value = sessions.value.filter((session) => session.id !== id);
  alert("Sessão encerrada.");
}

async function revokeAllSessions() {
  // TODO: Implementar revogação de todas as sessões
  sessions.value = [];
  alert("Todas as sessões foram encerradas.");
}
</script>