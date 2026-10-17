<template>
  <div class="space-y-6 stagger-in">
    <!-- Page header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="font-display text-3xl text-[var(--color-fg)]">Família</h1>
        <p class="mt-1 text-[var(--color-fg-muted)]">
          Compartilhe suas contas com pessoas de confiança e controle o que cada uma pode ver.
        </p>
      </div>
      <Button @click="openInviteForm">
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M18 9v3.75a2.25 2.25 0 01-2.25 2.25h-3.75a1.5 1.5 0 00-1.5 1.5v3.75m3-9.75H21a.75.75 0 00-.75-.75h-3a.75.75 0 01-.75-.75V5.25A1.5 1.5 0 0018 3.75h-2.25a.75.75 0 00-.75.75v3a.75.75 0 01-.75.75H11.25a.75.75 0 00-.75.75v3a1.5 1.5 0 001.5 1.5h.75a2.25 2.25 0 012.25 2.25z" />
        </svg>
        Convidar membro
      </Button>
    </div>

    <!-- Members -->
    <Card title="Membros da família" description="A função define o que cada pessoa pode fazer na sua conta." padding="none">
      <template #header-actions>
        <span class="badge badge-neutral">
          {{ familyMembers.length }} membro{{ familyMembers.length !== 1 ? "s" : "" }}
        </span>
      </template>

      <ul v-if="familyMembers.length > 0" class="divide-y divide-[var(--color-border)]">
        <li
          v-for="member in familyMembers"
          :key="member.id"
          class="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div class="flex min-w-0 items-center gap-4">
            <span
              class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-light)] text-sm font-semibold text-[var(--color-brand)]"
              aria-hidden="true"
            >
              {{ member.name.charAt(0).toUpperCase() }}
            </span>
            <div class="min-w-0">
              <p class="flex flex-wrap items-center gap-2 text-sm font-medium text-[var(--color-fg)]">
                <span class="truncate">{{ member.name }}</span>
                <span v-if="member.status === 'PENDING'" class="badge badge-warning">Convite pendente</span>
              </p>
              <p class="truncate text-xs text-[var(--color-fg-muted)]">{{ member.email }}</p>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <span v-if="member.role === 'OWNER'" class="badge badge-info">Proprietário</span>
            <div v-else class="w-44">
              <Select
                :id="`member-role-${member.id}`"
                :model-value="member.role"
                :options="roleOptions"
                @update:model-value="(value) => changeRole(member.id, value)"
              />
            </div>

            <Button
              v-if="member.role !== 'OWNER'"
              variant="ghost"
              size="sm"
              @click="removeMember(member.id)"
            >
              Remover membro
            </Button>
          </div>
        </li>
      </ul>

      <EmptyState
        v-else
        icon="users"
        title="Nenhum membro da família ainda"
        description="Convide alguém de confiança para acompanhar as contas e os orçamentos junto com você."
        :action="{ label: 'Convidar membro', onClick: openInviteForm }"
      />
    </Card>

    <!-- Invite form -->
    <Card
      v-if="showInviteForm"
      title="Convidar membro"
      description="O convidado recebe um e-mail com o link para entrar na sua família."
      padding="none"
    >
      <form class="space-y-4 p-6" @submit.prevent="onInvite">
        <Input
          id="invite-email"
          v-model="inviteForm.email"
          label="E-mail do convidado"
          type="email"
          autocomplete="email"
          required
          placeholder="nome@exemplo.com"
          :error="errors.email"
          hint="Use um e-mail ao qual a pessoa tenha acesso."
        />

        <Select
          id="invite-role"
          v-model="inviteForm.role"
          label="Função"
          :options="roleOptions"
          hint="Leitor apenas visualiza; Membro gerencia os dados; Administrador também convida e remove pessoas."
        />

        <div class="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
          <Button variant="ghost" type="button" @click="closeInviteForm">Cancelar</Button>
          <Button type="submit" :loading="inviting" @click="onInvite">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
            Enviar convite
          </Button>
        </div>
      </form>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useAuthStore } from "../../stores/auth";
import { Button, Card, EmptyState, Input, Select } from "../../components/ui";

const auth = useAuthStore();

const showInviteForm = ref(false);
const inviting = ref(false);

const inviteForm = ref({
  email: "",
  role: "MEMBER",
});

const errors = ref({
  email: "",
});

const roleOptions = [
  { value: "ADMIN", label: "Administrador" },
  { value: "MEMBER", label: "Membro" },
  { value: "VIEWER", label: "Leitor" },
];

const familyMembers = ref([
  {
    id: "1",
    name: auth.user?.name || "Você",
    email: auth.user?.email || "",
    role: "OWNER",
    status: "ACTIVE",
  },
  {
    id: "2",
    name: "Maria Souza",
    email: "maria@exemplo.com",
    role: "ADMIN",
    status: "ACTIVE",
  },
  {
    id: "3",
    name: "João Souza",
    email: "joao@exemplo.com",
    role: "MEMBER",
    status: "PENDING",
  },
]);

function openInviteForm() {
  showInviteForm.value = true;
}

function closeInviteForm() {
  showInviteForm.value = false;
  inviteForm.value = { email: "", role: "MEMBER" };
  errors.value.email = "";
}

async function onInvite() {
  errors.value.email = /.+@.+\..+/.test(inviteForm.value.email) ? "" : "Informe um e-mail válido";
  if (errors.value.email) return;

  inviting.value = true;
  try {
    // TODO: Implementar chamada de convite
    alert("Convite enviado!");
    closeInviteForm();
  } catch (error) {
    alert("Falha ao enviar o convite: " + (error as Error).message);
  } finally {
    inviting.value = false;
  }
}

async function changeRole(memberId: string, role: string) {
  const member = familyMembers.value.find((item) => item.id === memberId);
  if (!member || member.role === role) return;

  const previousRole = member.role;
  member.role = role;
  try {
    // TODO: Implementar alteração de função
    alert(`Função de ${member.name} alterada para ${roleLabel(role)}.`);
  } catch (error) {
    member.role = previousRole;
    alert("Falha ao alterar a função: " + (error as Error).message);
  }
}

async function removeMember(memberId: string) {
  const member = familyMembers.value.find((item) => item.id === memberId);
  if (!member) return;
  if (!confirm(`Remover ${member.name} da família?`)) return;

  // TODO: Implementar remoção de membro
  familyMembers.value = familyMembers.value.filter((item) => item.id !== memberId);
  alert("Membro removido.");
}

function roleLabel(role: string): string {
  return roleOptions.find((option) => option.value === role)?.label ?? role;
}
</script>