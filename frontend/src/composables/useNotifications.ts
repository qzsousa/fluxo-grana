import { computed, ref, watch } from "vue";
import { useQueryClient } from "@tanstack/vue-query";
import { queryKeys, useUpcomingInvoices, type Invoice } from "./useApi";
import { usePreferences } from "./usePreferences";
import { useToast } from "./useToast";
import { formatCurrency } from "../utils/format";

/**
 * Lembretes de fatura vencendo.
 *
 * Duas saídas, controladas separadamente nas preferências:
 *  - dentro do app: sino no topo + toast;
 *  - fora do app: popup nativo do navegador (Notification API).
 *
 * Os dois lados deduplicam por `fatura:dia`. Sem isso, o `refetchInterval` de
 * 30 min dispararia o mesmo aviso dezenas de vezes por dia.
 */

export type ReminderTone = "danger" | "warning" | "info" | "success";

export interface Reminder {
  /** `invoice:<id>` — estável entre recarregamentos. */
  key: string;
  kind: "invoice";
  title: string;
  message: string;
  tone: ReminderTone;
  dueDate: string;
  daysUntilDue: number;
  amount: number;
  currency: string;
  invoiceId: string | null;
  to: string;
}

const SENT_KEY = "reminders-sent";
const READ_KEY = "reminders-read";

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function readMap(key: string): Record<string, string> {
  if (typeof localStorage === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(key) || "{}") as Record<string, string>;
  } catch {
    return {};
  }
}

function writeMap(key: string, value: Record<string, string>) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Sem espaço em cache o aviso ainda aparece nesta sessão.
  }
}

/** Mantém só os últimos 3 dias — o mapa não pode crescer para sempre. */
function prune(map: Record<string, string>): Record<string, string> {
  const cutoff = Date.now() - 3 * 86_400_000;
  const kept: Record<string, string> = {};
  for (const [key, iso] of Object.entries(map)) {
    if (new Date(iso).getTime() >= cutoff) kept[key] = iso;
  }
  return kept;
}

function toneFor(days: number): ReminderTone {
  if (days < 0) return "danger";
  if (days === 0) return "danger";
  if (days <= 2) return "warning";
  return "info";
}

function headlineFor(days: number): string {
  if (days < 0) return `Fatura vencida há ${Math.abs(days)} dia${Math.abs(days) === 1 ? "" : "s"}`;
  if (days === 0) return "Fatura vence hoje";
  if (days === 1) return "Fatura vence amanhã";
  return `Fatura vence em ${days} dias`;
}

function toReminder(invoice: Invoice, locale: string): Reminder {
  const currency = invoice.account.currency || "BRL";
  const amount = formatCurrency(invoice.remaining, currency, locale);

  return {
    key: `invoice:${invoice.id ?? invoice.reference + ":" + invoice.account.id}`,
    kind: "invoice",
    title: headlineFor(invoice.daysUntilDue),
    message: `${invoice.account.name} · ${amount}`,
    tone: toneFor(invoice.daysUntilDue),
    dueDate: invoice.dueDate,
    daysUntilDue: invoice.daysUntilDue,
    amount: invoice.remaining,
    currency,
    invoiceId: invoice.id,
    to: "/invoices",
  };
}

export type NotificationPermission = "unsupported" | "default" | "granted" | "denied";

function currentPermission(): NotificationPermission {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  return Notification.permission as NotificationPermission;
}

export function useNotifications() {
  const queryClient = useQueryClient();
  const { preferences } = usePreferences();
  const toast = useToast();

  const permission = ref<NotificationPermission>(currentPermission());
  const readState = ref<Record<string, string>>(readMap(READ_KEY));

  const days = computed(() => preferences.value.invoiceReminderDays);
  const query = useUpcomingInvoices(days);

  const reminders = computed<Reminder[]>(() =>
    (query.data.value ?? []).map((invoice) => toReminder(invoice, preferences.value.locale))
  );

  const unreadCount = computed(
    () => reminders.value.filter((reminder) => !readState.value[reminder.key]).length
  );

  function isRead(key: string): boolean {
    return !!readState.value[key];
  }

  function markAllRead() {
    if (reminders.value.length === 0) return;
    const next: Record<string, string> = { ...readState.value };
    const stamp = new Date().toISOString();
    for (const reminder of reminders.value) next[reminder.key] = stamp;
    readState.value = prune(next);
    writeMap(READ_KEY, next);
  }

  function markRead(key: string) {
    if (readState.value[key]) return;
    const next = { ...readState.value, [key]: new Date().toISOString() };
    readState.value = prune(next);
    writeMap(READ_KEY, next);
  }

  /** Pedir permissão tem que vir de um clique — browsers bloqueiam o resto. */
  async function requestPermission(): Promise<NotificationPermission> {
    if (currentPermission() === "unsupported") {
      permission.value = "unsupported";
      return "unsupported";
    }

    if (Notification.permission === "default") {
      try {
        await Notification.requestPermission();
      } catch {
        // Navegador recusou o pedido (contexto não seguro, etc).
      }
    }

    permission.value = currentPermission();
    return permission.value;
  }

  function pushBrowserNotification(reminder: Reminder) {
    if (permission.value !== "granted") return;
    try {
      const notification = new Notification(reminder.title, {
        body: reminder.message,
        tag: reminder.key,
        icon: "/favicon.ico",
      });
      notification.onclick = () => {
        window.focus();
        window.location.assign(reminder.to);
        notification.close();
      };
    } catch {
      // Firefox bloqueia Notification em alguns contextos; o sino cobre.
    }
  }

  function announce() {
    const sent = prune(readMap(SENT_KEY));
    const today = todayKey();

    for (const reminder of reminders.value) {
      if (sent[reminder.key] === today) continue;

      sent[reminder.key] = today;

      if (preferences.value.inAppNotifications) {
        toast.warning(reminder.message, reminder.title, 10_000);
      }
      if (preferences.value.browserNotifications) {
        pushBrowserNotification(reminder);
      }
    }

    writeMap(SENT_KEY, sent);
  }

  // Avisa assim que a lista chega e também quando o usuário amplia a
  // antecedência nas preferências (ex.: estava em 3 dias, passou para 7).
  watch(
    () => (query.data.value ?? []).map((invoice) => invoice.id + invoice.reference).join(","),
    () => {
      if (!query.isFetching.value) announce();
    },
    { immediate: true }
  );

  return {
    reminders,
    unreadCount,
    permission,
    isSupported: computed(() => permission.value !== "unsupported"),
    isLoading: query.isLoading,
    isError: query.isError,
    requestPermission,
    isRead,
    markRead,
    markAllRead,
    refetch: query.refetch,
    /** Limpa o histórico para o usuário reavaliar os avisos de hoje. */
    resetHistory: () => {
      writeMap(SENT_KEY, {});
      queryClient.removeQueries({ queryKey: queryKeys.invoices.upcoming(days) });
    },
  };
}
