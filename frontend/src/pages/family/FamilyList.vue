<template>
  <div class="space-y-6 stagger-in">
    <!-- Page header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="font-display text-3xl text-[var(--color-fg)]">Família</h1>
        <p class="mt-1 text-[var(--color-fg-muted)]">
          Compartilhe suas finanças com pessoas de confiança
        </p>
      </div>
      <Button v-if="family" @click="router.push('/family/invite')">
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Convidar membro
      </Button>
    </div>

    <!-- Loading -->
    <Card v-if="loading" padding="none">
      <div class="divide-y divide-[var(--color-border)]">
        <div v-for="i in 3" :key="i" class="flex items-center gap-4 px-6 py-4">
          <div class="h-10 w-10 skeleton rounded-full"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 w-40 skeleton skeleton-text"></div>
            <div class="h-3 w-56 skeleton skeleton-text"></div>
          </div>
          <div class="h-8 w-28 skeleton skeleton-text"></div>
        </div>
      </div>
    </Card>

    <template v-else-if="family">
      <!-- Resumo da família -->
      <Card padding="md">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex items-center gap-4">
            <span class="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-brand-light)] font-display text-2xl text-[var(--color-brand)]">
              {{ familyInitial }}
            </span>
            <div class="min-w-0">
              <h2 class="truncate font-display text-xl text-[var(--color-fg)]">{{ family.name }}</h2>
              <p class="mt-1 text-sm text-[var(--color-fg-muted)]">
                {{ membersCount }} membro{{ membersCount !== 1 ? 's' : '' }}
                <template v-if="pendingInvites.length">
                  · {{ pendingInvites.length }} convite{{ pendingInvites.length !== 1 ? 's' : '' }} pendente{{ pendingInvites.length !== 1 ? 's' : '' }}
                </template>
              </p>
            </div>
          </div>
          <Button variant="outline" @click="router.push('/family/invite')">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Convidar
          </Button>
        </div>
      </Card>

      <!-- Membros -->
      <Card title="Membros" padding="none">
        <template #header-actions>
          <span class="badge badge-neutral">{{ membersCount }}</span>
        </template>

        <div v-if="family.members.length" class="divide-y divide-[var(--color-border)]">
          <div
            v-for="member in family.members"
            :key="member.id"
            class="flex flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between"
          >
            <div class="flex min-w-0 items-center gap-4">
              <span class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-light)] font-semibold text-[var(--color-brand)]">
                {{ member.user.name.charAt(0).toUpperCase() }}
              </span>
              <div class="min-w-0">
                <p class="truncate font-medium text-[var(--color-fg)]">
                  {{ member.user.name }}
                  <span v-if="isMe(member)" class="ml-1 text-xs font-normal text-[var(--color-fg-subtle)]">(você)</span>
                </p>
                <p class="truncate text-xs text-[var(--color-fg-muted)]">{{ member.user.email }}</p>
              </div>
              <span class="badge" :class="roleBadgeClass(member.role)">{{ roleLabel(member.role) }}</span>
            </div>

            <div class="flex flex-wrap items-center gap-3">
              <template v-if="member.role !== 'OWNER'">
                <Tooltip content="Alterar função" position="top">
                  <template #trigger>
                    <div class="w-44">
                      <Select
                        :id="`member-role-${member.id}`"
                        :model-value="member.role"
                        :options="roleOptions"
                        @update:model-value="onRoleChange(member, $event)"
                      />
                    </div>
                  </template>
                </Tooltip>
                <Button variant="ghost" size="sm" @click="removeTarget = member">Remover</Button>
              </template>
              <Tooltip v-else content="O dono da família não pode ser removido." position="top">
                <template #trigger>
                  <span class="cursor-help text-xs text-[var(--color-fg-subtle)]">
                    {{ isMe(member) ? 'Você é o administrador da família' : 'Administrador da família' }}
                  </span>
                </template>
              </Tooltip>
            </div>
          </div>
        </div>

        <div v-else class="px-6 py-12">
          <EmptyState
            icon="users"
            title="Nenhum membro ainda"
            description="Compartilhe suas finanças com pessoas de confiança convidando alguém para a família."
            :action="{ label: 'Convidar membro', onClick: () => router.push('/family/invite') }"
          />
        </div>
      </Card>

      <!-- Convites pendentes -->
      <Card v-if="pendingInvites.length" title="Convites pendentes" padding="none">
        <div class="divide-y divide-[var(--color-border)]">
          <div
            v-for="invite in pendingInvites"
            :key="invite.id"
            class="flex flex-col gap-2 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div class="min-w-0">
              <p class="truncate font-medium text-[var(--color-fg)]">{{ invite.email }}</p>
              <p class="mt-0.5 text-xs text-[var(--color-fg-muted)]">
                Convite pendente · Enviado em {{ formatDate(invite.sentAt, "pt-BR") }} ({{ formatRelativeDate(invite.sentAt, "pt-BR") }})
              </p>
            </div>
            <div class="flex items-center gap-3">
              <span class="badge badge-warning">{{ roleLabel(invite.role) }}</span>
              <Button variant="ghost" size="sm" @click="cancelInvite(invite)">Cancelar convite</Button>
            </div>
          </div>
        </div>
      </Card>
    </template>

    <!-- Sem família -->
    <Card v-else padding="lg">
      <EmptyState
        icon="users"
        title="Nenhuma família criada"
        description="Crie uma família para compartilhar suas contas e transações com quem você confia."
        :action="{ label: 'Criar Família', onClick: createFamily }"
      />
    </Card>

    <!-- Confirmação de remoção -->
    <Modal
      :model-value="removeTarget !== null"
      title="Remover membro"
      description="A pessoa perderá o acesso às contas e transações da família."
      @update:model-value="removeTarget = null"
    >
      <p class="text-sm text-[var(--color-fg-muted)]">
        Tem certeza que deseja remover
        <span class="font-medium text-[var(--color-fg)]">{{ removeTarget?.user.name }}</span>
        da família?
      </p>
      <template #footer>
        <Button variant="ghost" @click="removeTarget = null">Cancelar</Button>
        <Button variant="danger" :loading="removing" @click="removeMember">Remover</Button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../stores/auth";
import { useToast } from "../../composables/useToast";
import { formatDate, formatRelativeDate } from "../../utils/format";
import { Button, Card, EmptyState, Modal, Select, Tooltip } from "../../components/ui";

interface FamilyMember {
  id: string;
  user: { id: string; name: string; email: string };
  role: string;
  joinedAt: string;
}

interface Family {
  id: string;
  name: string;
  members: FamilyMember[];
}

interface PendingInvite {
  id: string;
  email: string;
  role: string;
  sentAt: string;
}

const router = useRouter();
const auth = useAuthStore();
const toast = useToast();

const loading = ref(false);
const family = ref<Family | null>(null);
const pendingInvites = ref<PendingInvite[]>([]);
const removeTarget = ref<FamilyMember | null>(null);
const removing = ref(false);

const familyInitial = computed(() => (family.value?.name || "F").charAt(0).toUpperCase());
const membersCount = computed(() => family.value?.members.length ?? 0);

const roleOptions = [
  { value: "ADMIN", label: "Administrador" },
  { value: "MEMBER", label: "Membro" },
  { value: "VIEWER", label: "Leitor" },
];

function roleLabel(role: string): string {
  if (role === "OWNER" || role === "ADMIN") return "Administrador";
  if (role === "VIEWER") return "Leitor";
  if (role === "MEMBER") return "Membro";
  return role;
}

function roleBadgeClass(role: string): string {
  if (role === "OWNER" || role === "ADMIN") return "badge-info";
  if (role === "VIEWER") return "badge-neutral";
  return "badge-success";
}

function isMe(member: FamilyMember): boolean {
  return !!auth.user && member.user.email === auth.user.email;
}

function createFamily() {
  // TODO: Implementar criação de família na API
  toast.info("A criação de família ainda será conectada à API.", "Em breve");
}

function onRoleChange(member: FamilyMember, role: string) {
  // TODO: Implementar alteração de função na API
  toast.info(`${member.user.name} agora é ${roleLabel(role)}.`, "Função alterada");
}

async function removeMember() {
  const target = removeTarget.value;
  if (!target) return;
  removing.value = true;
  try {
    // TODO: Implementar remoção de membro na API
    toast.success(`${target.user.name} foi removido da família.`, "Membro removido");
    removeTarget.value = null;
  } finally {
    removing.value = false;
  }
}

function cancelInvite(invite: PendingInvite) {
  // TODO: Implementar cancelamento de convite na API
  toast.info(`O convite para ${invite.email} foi cancelado.`, "Convite");
}
</script>
