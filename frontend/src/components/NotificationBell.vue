<template>
  <div ref="root" class="relative">
    <button
      type="button"
      class="relative flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-fg-muted)] transition-colors hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-fg)]"
      :aria-label="buttonLabel"
      :aria-expanded="open"
      aria-haspopup="true"
      @click="toggle"
    >
      <AppIcon name="bell" :size="19" />

      <span
        v-if="unreadCount > 0"
        class="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-danger)] px-1 text-[0.625rem] font-bold leading-none text-white tabular-nums"
      >
        {{ unreadCount > 9 ? "9+" : unreadCount }}
      </span>
    </button>

    <Transition name="pop">
      <div
        v-if="open"
        class="absolute right-0 z-[var(--z-popover)] mt-2 w-[min(22rem,calc(100vw-2rem))] animate-scale-in overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] shadow-[var(--shadow-lg)]"
        role="dialog"
        aria-label="Lembretes"
      >
        <div class="flex items-center justify-between gap-2 border-b border-[var(--color-border)] px-4 py-3">
          <p class="text-sm font-semibold text-[var(--color-fg)]">Lembretes</p>
          <button
            v-if="unreadCount > 0"
            type="button"
            class="text-xs font-medium text-[var(--color-brand)] hover:underline"
            @click="markAllRead"
          >
            Marcar como lidas
          </button>
        </div>

        <div v-if="reminders.length" class="max-h-80 overflow-y-auto">
          <router-link
            v-for="reminder in reminders"
            :key="reminder.key"
            :to="reminder.to"
            class="flex items-start gap-3 border-b border-[var(--color-border)] px-4 py-3 transition-colors last:border-b-0 hover:bg-[var(--color-bg-muted)]"
            @click="openItem(reminder.key)"
          >
            <span
              class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
              :class="toneClasses[reminder.tone]"
            >
              <AppIcon :name="reminder.daysUntilDue < 0 ? 'alert' : 'clock'" :size="16" :stroke-width="2" />
            </span>

            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-[var(--color-fg)]">{{ reminder.title }}</p>
              <p class="truncate text-xs text-[var(--color-fg-muted)]">{{ reminder.message }}</p>
            </div>

            <span v-if="!isRead(reminder.key)" class="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--color-brand)]"></span>
          </router-link>
        </div>

        <div v-else-if="isLoading" class="space-y-3 px-4 py-4">
          <div v-for="i in 2" :key="i" class="flex items-center gap-3">
            <div class="h-8 w-8 shrink-0 rounded-full skeleton"></div>
            <div class="flex-1 space-y-2">
              <div class="h-3.5 w-28 skeleton skeleton-text"></div>
              <div class="h-3 w-20 skeleton skeleton-text"></div>
            </div>
          </div>
        </div>

        <div v-else class="px-4 py-8 text-center">
          <span class="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-bg-muted)] text-[var(--color-fg-subtle)]">
            <AppIcon name="checkCircle" :size="20" />
          </span>
          <p class="mt-3 text-sm font-medium text-[var(--color-fg)]">Nada vencendo por perto</p>
          <p class="mt-1 text-xs text-[var(--color-fg-muted)]">
            Avisamos {{ reminderDays }} dias antes do vencimento da fatura.
          </p>
        </div>

        <!-- Convite para as notificações do sistema: só aparece quando o
             usuário liga a opção e ainda não deu permissão. -->
        <div
          v-if="showPermissionPrompt"
          class="flex items-center gap-3 border-t border-[var(--color-border)] bg-[var(--color-brand-light)] px-4 py-3"
        >
          <AppIcon name="bellOff" :size="17" class="shrink-0 text-[var(--color-brand)]" />
          <p class="min-w-0 flex-1 text-xs text-[var(--color-brand)]">
            Autorize o navegador para receber o aviso fora do app.
          </p>
          <button
            type="button"
            class="shrink-0 rounded-lg bg-[var(--color-brand)] px-2.5 py-1.5 text-xs font-semibold text-[var(--color-on-brand)]"
            @click="requestPermission"
          >
            Autorizar
          </button>
        </div>

        <div class="border-t border-[var(--color-border)] px-4 py-2.5">
          <router-link to="/invoices" class="link text-sm" @click="close">
            Ver todas as faturas
          </router-link>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { AppIcon } from "./ui";
import { useNotifications, type ReminderTone } from "../composables/useNotifications";
import { usePreferences } from "../composables/usePreferences";

const { preferences } = usePreferences();
const {
  reminders,
  unreadCount,
  permission,
  isLoading,
  isRead,
  requestPermission,
  markRead,
  markAllRead,
} = useNotifications();

const root = ref<HTMLElement | null>(null);
const open = ref(false);

const reminderDays = computed(() => preferences.value.invoiceReminderDays);

const showPermissionPrompt = computed(
  () =>
    preferences.value.browserNotifications &&
    permission.value !== "granted" &&
    permission.value !== "unsupported"
);

const buttonLabel = computed(() =>
  unreadCount.value > 0 ? `${unreadCount.value} lembrete(s) não lido(s)` : "Lembretes"
);

const toneClasses: Record<ReminderTone, string> = {
  danger: "bg-[var(--color-danger-light)] text-[var(--color-danger)]",
  warning: "bg-[var(--color-warning-light)] text-[var(--color-warning)]",
  info: "bg-[var(--color-info-light)] text-[var(--color-info)]",
  success: "bg-[var(--color-success-light)] text-[var(--color-success)]",
};

function openItem(key: string) {
  markRead(key);
  close();
}

function toggle() {
  open.value = !open.value;
}

function close() {
  open.value = false;
}

async function onRequestPermission() {
  const result = await requestPermission();
  // O popup do sistema só pode ser pedido em resposta a um clique.
  if (result === "granted") {
    new Notification("Avisos ativados", {
      body: "Você será lembrado antes do vencimento das faturas.",
    });
  }
}

function onDocumentClick(event: MouseEvent) {
  if (!open.value) return;
  if (root.value && !root.value.contains(event.target as Node)) close();
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") close();
}

onMounted(() => {
  document.addEventListener("click", onDocumentClick);
  document.addEventListener("keydown", onKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", onDocumentClick);
  document.removeEventListener("keydown", onKeydown);
});

// Abrir o painel já conta como ler — evita badge eterno.
watch(open, (value) => {
  if (value) markAllRead();
});
</script>

<style scoped>
.pop-enter-active,
.pop-leave-active {
  transition: opacity var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out);
}
.pop-enter-from,
.pop-leave-to {
  opacity: 0;
  transform: scale(0.97) translateY(-4px);
}
</style>
