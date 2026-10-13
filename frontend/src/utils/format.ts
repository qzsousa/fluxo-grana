/**
 * Formatting helpers for currency, numbers and dates.
 */

export function formatCurrency(
  value: number,
  currency = "USD",
  locale = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(value);
}

export function formatNumber(
  value: number,
  options: Intl.NumberFormatOptions = {},
  locale = "en-US"
): string {
  return new Intl.NumberFormat(locale, options).format(value);
}

export function formatDate(
  date: string | Date,
  locale = "en-US",
  options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  }
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat(locale, options).format(d);
}

/**
 * "Today", "Yesterday", "N days ago" (< 7 days), otherwise a short date.
 */
export function formatRelativeDate(date: string | Date, locale = "en-US"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "";

  const now = new Date();
  const startOfDay = (x: Date) =>
    new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diffDays = Math.round((startOfDay(now) - startOfDay(d)) / 86_400_000);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays > 1 && diffDays < 7) return `${diffDays} days ago`;

  return formatDate(d, locale, {
    month: "short",
    day: "numeric",
    year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}
