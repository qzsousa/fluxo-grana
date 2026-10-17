<template>
  <div class="space-y-6 stagger-in">
    <!-- Page header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="font-display text-3xl text-[var(--color-fg)]">Convidar membro</h1>
        <p class="mt-1 text-[var(--color-fg-muted)]">
          Compartilhe suas finanças com pessoas de confiança
        </p>
      </div>
      <Button variant="ghost" @click="router.push('/family')">
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l7-7m0 0l-7-7m7 7H3" />
        </svg>
        Voltar
      </Button>
    </div>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card padding="lg" class="lg:col-span-2">
        <form class="space-y-6" @submit.prevent="onInvite">
          <Input
            id="invite-email"
            v-model="inviteForm.email"
            type="email"
            label="E-mail"
            placeholder="familia@email.com"
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

          <Select
            id="invite-role"
            v-model="inviteForm.role"
            label="Função"
            :options="roleOptions"
            :error="errors.role"
            hint="Administrador pode gerenciar as contas; Leitor só visualiza."
          />

          <div>
            <label for="invite-message" class="label">Mensagem (opcional)</label>
            <textarea
              id="invite-message"
              v-model="inviteForm.message"
              rows="4"
              class="input-base resize-none"
              placeholder="Escreva uma mensagem pessoal para o convite..."
            ></textarea>
          </div>

          <div
            v-if="submitError"
            class="rounded-lg border border-[var(--color-danger-muted)] bg-[var(--color-danger-light)] p-3 text-sm text-[var(--color-danger)]"
            role="alert"
          >
            {{ submitError }}
          </div>

          <div
            v-if="sent"
            class="rounded-lg border border-[var(--color-success-muted)] bg-[var(--color-success-light)] p-3 text-sm text-[var(--color-success)]"
            role="status"
          >
            Convite enviado para <span class="font-medium">{{ inviteForm.email }}</span>. redirecionando…
          </div>

          <div class="flex justify-end gap-3 border-t border-[var(--color-border)] pt-4">
            <Button variant="ghost" type="button" @click="router.push('/family')">Cancelar</Button>
            <Button type="submit" :loading="inviting">Enviar convite</Button>
          </div>
        </form>
      </Card>

      <Card title="Funções" padding="md">
        <ul class="space-y-4">
          <li class="flex gap-3">
            <span class="badge badge-info shrink-0">Administrador</span>
            <p class="text-sm text-[var(--color-fg-muted)]">Gerencia contas, transações e membros da família.</p>
          </li>
          <li class="flex gap-3">
            <span class="badge badge-success shrink-0">Membro</span>
            <p class="text-sm text-[var(--color-fg-muted)]">Cria e edita movimentações das contas compartilhadas.</p>
          </li>
          <li class="flex gap-3">
            <span class="badge badge-neutral shrink-0">Leitor</span>
            <p class="text-sm text-[var(--color-fg-muted)]">Apenas visualiza os dados, sem alterar nada.</p>
          </li>
        </ul>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { Button, Card, Input, Select } from "../../components/ui";

const router = useRouter();

const inviting = ref(false);
const sent = ref(false);
const submitError = ref("");

const inviteForm = reactive({
  email: "",
  role: "MEMBER",
  message: "",
});

const errors = reactive({
  email: "",
  role: "",
});

const roleOptions = [
  { value: "ADMIN", label: "Administrador" },
  { value: "MEMBER", label: "Membro" },
  { value: "VIEWER", label: "Leitor" },
];

function validate(): boolean {
  errors.email = inviteForm.email.trim()
    ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteForm.email)
      ? ""
      : "E-mail inválido"
    : "E-mail é obrigatório";
  errors.role = inviteForm.role ? "" : "Selecione uma função";
  return !errors.email && !errors.role;
}

async function onInvite() {
  submitError.value = "";
  sent.value = false;

  if (!validate()) return;

  inviting.value = true;
  try {
    // TODO: Implementar envio do convite na API
    await new Promise((resolve) => setTimeout(resolve, 1000));
    sent.value = true;
    setTimeout(() => router.push("/family"), 1200);
  } catch (error) {
    submitError.value = "Falha ao enviar o convite. Tente novamente.";
  } finally {
    inviting.value = false;
  }
}
</script>
