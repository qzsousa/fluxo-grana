import type { Invoice, InvoiceStatus, InvoiceUrgency } from "../composables/useApi";

/**
 * Rótulos e formatação de fatura.
 *
 * O cálculo de dias até o vencimento fica no backend (`daysUntilDue`), mas o
 * texto depende do calendário local do usuário — aqui é só apresentação.
 */

const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const MONTH_SHORT = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
];

/** "2026-10" → "Outubro de 2026". Referência inválida volta como o próprio texto. */
export function referenceLabel(reference: string): string {
  const match = /^(\d{4})-(\d{2})$/.exec(reference);
  if (!match) return reference;

  const month = Number(match[2]) - 1;
  if (month < 0 || month > 11) return reference;

  return `${MONTH_NAMES[month]} de ${match[1]}`;
}

/** "2026-10" → "out/26". Para cabeçalhos de tabela e rótulos apertados. */
export function referenceShort(reference: string): string {
  const match = /^(\d{4})-(\d{2})$/.exec(reference);
  if (!match) return reference;

  const month = Number(match[2]) - 1;
  if (month < 0 || month > 11) return reference;

  return `${MONTH_SHORT[month]}/${match[1].slice(2)}`;
}

/** Mês de fechamento da fatura em aberto hoje, no fuso do navegador. */
export function currentReference(now: Date = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

/** Anda `delta` meses a partir de uma referência "YYYY-MM". */
export function shiftReference(reference: string, delta: number): string {
  const match = /^(\d{4})-(\d{2})$/.exec(reference);
  if (!match) return reference;

  const shifted = new Date(Number(match[1]), Number(match[2]) - 1 + delta, 1);
  return `${shifted.getFullYear()}-${String(shifted.getMonth() + 1).padStart(2, "0")}`;
}

export function daysUntilLabel(days: number): string {
  if (days < -1) return `venceu há ${Math.abs(days)} dias`;
  if (days === -1) return "venceu ontem";
  if (days === 0) return "vence hoje";
  if (days === 1) return "vence amanhã";
  return `vence em ${days} dias`;
}

interface StatusBadge {
  label: string;
  badgeClass: string;
}

export function statusBadge(invoice: Invoice): StatusBadge {
  const map: Record<InvoiceStatus, StatusBadge> = {
    PAID: { label: "Paga", badgeClass: "badge-success" },
    PARTIAL: { label: "Paga parcialmente", badgeClass: "badge-warning" },
    OVERDUE: { label: "Vencida", badgeClass: "badge-danger" },
    OPEN: { label: "Em aberto", badgeClass: "badge-info" },
  };
  return map[invoice.status] ?? map.OPEN;
}

/** Cor do aviso na lateral da fatura, por urgência. */
export function urgencyStripe(urgency: InvoiceUrgency): string {
  const map: Record<InvoiceUrgency, string> = {
    paid: "bg-[var(--color-success)]",
    overdue: "bg-[var(--color-danger)]",
    today: "bg-[var(--color-danger)]",
    soon: "bg-[var(--color-warning)]",
    upcoming: "bg-[var(--color-border-strong)]",
  };
  return map[urgency] ?? map.upcoming;
}

/** Mesma barra de limites, mas para o cartão inteiro e não para a fatura. */
export function limitUsage(invoice: Invoice): { used: number; available: number; ratio: number } | null {
  const limit = invoice.account.creditLimit;
  if (!limit || limit <= 0) return null;

  // A fatura em aberto é o que está comprometendo o limite agora.
  const used = Math.max(invoice.total - invoice.paidTotal, 0);
  return {
    used,
    available: Math.max(limit - used, 0),
    ratio: Math.min(used / limit, 1),
  };
}
