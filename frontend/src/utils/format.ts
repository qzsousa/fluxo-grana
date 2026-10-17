/**
 * Formatting helpers for currency, numbers and dates.
 *
 * O app é pt-BR por padrão: todos os helpers usam "pt-BR" como locale padrão.
 * Antes o padrão era "en-US", e qualquer chamada que esquecesse o terceiro
 * argumento imprimia "Oct 19" no meio de uma interface em português.
 */

/** Locale padrão do app — usado quando a chamada não informa outro. */
export const DEFAULT_LOCALE = "pt-BR";

/** Moeda padrão quando nem a conta nem o usuário dizem qual é. */
export const DEFAULT_CURRENCY = "BRL";

/**
 * Converts a date-picker value (yyyy-MM-dd) or ISO string into a full
 * ISO-8601 datetime expected by the API. Returns "" for empty input.
 */
export function toIsoDateTime(dateStr?: string | null): string {
  if (!dateStr) return "";
  if (dateStr.includes("T")) return dateStr;
  const d = new Date(`${dateStr}T00:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString();
}

/**
 * Start of the given day (yyyy-MM-dd) as ISO-8601 (00:00:00.000Z).
 */
export function startOfDayIso(dateStr?: string | null): string {
  return toIsoDateTime(dateStr);
}

/**
 * End of the given day (yyyy-MM-dd) as ISO-8601 (23:59:59.999Z),
 * so date-range filters include the whole final day.
 */
export function endOfDayIso(dateStr?: string | null): string {
  if (!dateStr) return "";
  if (dateStr.includes("T")) return dateStr;
  const d = new Date(`${dateStr}T23:59:59.999Z`);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString();
}

export function formatCurrency(
  value: number,
  currency = DEFAULT_CURRENCY,
  locale = DEFAULT_LOCALE
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(value);
}

export function formatNumber(
  value: number,
  options: Intl.NumberFormatOptions = {},
  locale = DEFAULT_LOCALE
): string {
  return new Intl.NumberFormat(locale, options).format(value);
}

export function formatDate(
  date: string | Date,
  locale = DEFAULT_LOCALE,
  options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat(locale, options).format(d);
}

/**
 * "Hoje" / "Ontem" / "há 3 dias" / data curta.
 *
 * Usa o calendário local do usuário (não UTC) de propósito: a perceived age de
 * uma compra deve seguir o dia que a pessoa está vendo, e o mesmo para todos —
 * a meia-noite do fuso evita o caso de "ontem" às 23h.
 */
export function formatRelativeDate(date: string | Date, locale = DEFAULT_LOCALE): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "";

  const now = new Date();
  const startOfDay = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diffDays = Math.round((startOfDay(now) - startOfDay(d)) / 86_400_000);

  // Rótulos fixos em português: `Intl.RelativeTimeFormat` existe, mas escrever
  // três strings é mais barato que|formatar| uma data relativa completa.
  if (diffDays === 0) return "Hoje";
  if (diffDays === 1) return "Ontem";
  if (diffDays > 1 && diffDays < 7) return `Há ${diffDays} dias`;
  if (diffDays === -1) return "Amanhã";
  if (diffDays < -1 && diffDays > -7) return `Em ${Math.abs(diffDays)} dias`;

  return formatDate(d, locale, {
    day: "2-digit",
    month: "2-digit",
    year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

/** Só a hora, em 24h. Usado nos lembretes e no detalhe da transação. */
export function formatTime(date: string | Date, locale = DEFAULT_LOCALE): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(d);
}
