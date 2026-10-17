/**
 * Janela de fechamento da fatura do cartão.
 *
 * Uma fatura é identificada pelo mês em que ela FECHA (não no mês em que vence):
 * cartão que fecha dia 25 e vence dia 5 tem a fatura "2026-10" referring às
 * compras de 25/09 até 25/10, vencendo em 05/11.
 *
 * Todas as datas são calculadas em UTC porque as transações do app são gravadas
 * com `yyyy-MM-ddT00:00:00.000Z` (ver `toIsoDateTime` no frontend). Misturar
 * fuso aqui faria a compra da virada de dia cair na fatura errada.
 */

export const MS_PER_DAY = 86_400_000;

/** Dia do fechamento/vencimento usado quando o cartão não foi configurado. */
export const DEFAULT_CLOSING_DAY = 25;
export const DEFAULT_DUE_DAY = 5;

export interface InvoiceWindow {
  /** Mês de fechamento no formato "YYYY-MM". */
  reference: string;
  /** Primeiro dia incluído na fatura (00:00 UTC). */
  periodStart: Date;
  /** Último dia incluído, para exibição. */
  periodEnd: Date;
  /** Fim da janela exclusivo — usado nas queries (`lt`). */
  periodEndExclusive: Date;
  closingDate: Date;
  dueDate: Date;
}

export interface YearMonth {
  year: number;
  /** 0-11, igual ao Date. */
  month: number;
}

/** Trava o dia no intervalo 1-31 e cai no valor padrão quando não informado. */
export function normalizeDay(day: number | null | undefined, fallback: number): number {
  if (day === null || day === undefined || Number.isNaN(Number(day))) return fallback;
  const value = Math.trunc(Number(day));
  if (value < 1) return 1;
  if (value > 31) return 31;
  return value;
}

/** Último dia do mês (28, 29, 30 ou 31). */
export function lastDayOfMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

/**
 * Dia X do mês em UTC, sem transbordar: dia 31 em fevereiro vira 28/29.
 * Útil porque banco e operadora costumam fechar no "último dia" do mês.
 */
export function dayInMonth(year: number, month: number, day: number): Date {
  const clamped = Math.min(normalizeDay(day, 1), lastDayOfMonth(year, month));
  return new Date(Date.UTC(year, month, clamped));
}

export function addMonths({ year, month }: YearMonth, delta: number): YearMonth {
  // Usa o dia 1 para não suffers overflow ao passar de dezembro para janeiro.
  const shifted = new Date(Date.UTC(year, month + delta, 1));
  return { year: shifted.getUTCFullYear(), month: shifted.getUTCMonth() };
}

export function formatReference({ year, month }: YearMonth): string {
  return `${year}-${String(month + 1).padStart(2, "0")}`;
}

export function parseReference(reference: string): YearMonth | null {
  const match = /^(\d{4})-(\d{2})$/.exec(reference);
  if (!match) return null;
  const month = Number(match[2]) - 1;
  if (month < 0 || month > 11) return null;
  return { year: Number(match[1]), month };
}

/** Meia-noite UTC do dia corrente da data informada. */
export function startOfUtcDay(now: Date): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

/**
 * Monta a janela da fatura que fecha em `reference`.
 *
 * A janela é (fechamento anterior, fechamento atual] — a compra feita no
 * próprio dia do fechamento entra na fatura, como manda o uso no cartão.
 *
 * O vencimento cai no mesmo mês do fechamento quando `dueDay > closingDay`
 * (fecha dia 1, vence dia 10 do mesmo mês) e no mês seguinte caso contrário
 * (fecha dia 25, vence dia 5 do mês seguinte).
 */
export function invoiceWindow(
  closingDayInput: number | null | undefined,
  dueDayInput: number | null | undefined,
  reference: YearMonth
): InvoiceWindow {
  const closingDay = normalizeDay(closingDayInput, DEFAULT_CLOSING_DAY);
  const dueDay = normalizeDay(dueDayInput, DEFAULT_DUE_DAY);

  const previous = addMonths(reference, -1);
  const previousClosing = dayInMonth(previous.year, previous.month, closingDay);
  const closingDate = dayInMonth(reference.year, reference.month, closingDay);

  const dueMonth = dueDay > closingDay ? reference : addMonths(reference, 1);
  const dueDate = dayInMonth(dueMonth.year, dueMonth.month, dueDay);

  const periodStart = new Date(previousClosing.getTime() + MS_PER_DAY);

  return {
    reference: formatReference(reference),
    periodStart,
    periodEnd: closingDate,
    periodEndExclusive: new Date(closingDate.getTime() + MS_PER_DAY),
    closingDate,
    dueDate,
  };
}

/**
 * Fatura que está aberta agora.
 *
 * Antes do dia de fechamento o mês corrente ainda está em curso; depois dele a
 * compra já entra na fatura do mês seguinte.
 */
export function openInvoiceReference(now: Date, closingDayInput?: number | null): YearMonth {
  const closingDay = normalizeDay(closingDayInput, DEFAULT_CLOSING_DAY);
  const current: YearMonth = { year: now.getUTCFullYear(), month: now.getUTCMonth() };
  const today = now.getUTCDate();

  return today <= closingDay ? current : addMonths(current, 1);
}

/** Janela da fatura que está em aberto no momento. */
export function openInvoiceWindow(
  closingDay?: number | null,
  dueDay?: number | null,
  now: Date = new Date()
): InvoiceWindow {
  return invoiceWindow(closingDay, dueDay, openInvoiceReference(now, closingDay));
}

/**
 * Faturas em torno de `now`: `monthsBack` já fechadas, a que está em aberto e
 * `monthsForward` futuras. É o que a tela de faturas e os lembretes consomem.
 */
export function invoiceWindowsAround(
  closingDay: number | null | undefined,
  dueDay: number | null | undefined,
  options: { now?: Date; monthsBack?: number; monthsForward?: number } = {}
): InvoiceWindow[] {
  const now = options.now ?? new Date();
  const monthsBack = options.monthsBack ?? 3;
  const monthsForward = options.monthsForward ?? 1;
  const open = openInvoiceReference(now, closingDay);

  const windows: InvoiceWindow[] = [];
  for (let offset = -monthsBack; offset <= monthsForward; offset += 1) {
    windows.push(invoiceWindow(closingDay, dueDay, addMonths(open, offset)));
  }
  return windows;
}

/** Dias inteiros até o vencimento. Negativo = já venceu. */
export function daysUntil(date: Date, now: Date = new Date()): number {
  const from = startOfUtcDay(now).getTime();
  const to = startOfUtcDay(date).getTime();
  return Math.round((to - from) / MS_PER_DAY);
}

export type InvoiceUrgency = "overdue" | "today" | "soon" | "upcoming";

export function urgencyOf(daysLeft: number): InvoiceUrgency {
  if (daysLeft < 0) return "overdue";
  if (daysLeft === 0) return "today";
  if (daysLeft <= 3) return "soon";
  return "upcoming";
}

/**
 * Status exibido ao usuário. `PAID`/`PARTIAL` vêm do que foi efetivamente
 * registrado; `OVERDUE` é derivado do calendário quando não há pagamento.
 */
export type InvoiceDisplayStatus = "PAID" | "PARTIAL" | "OVERDUE" | "OPEN" | "CLOSED";

export function displayStatus(
  total: number,
  paidTotal: number,
  dueDate: Date,
  now: Date = new Date()
): InvoiceDisplayStatus {
  if (total > 0 && paidTotal >= total) return "PAID";
  if (paidTotal > 0) return "PARTIAL";
  // Fatura sem compras não está vencida: não há nada a pagar, e marcar como
  // OVERDUE só faria o sino acusar o usuário à toa.
  if (total <= 0) return "OPEN";
  if (daysUntil(dueDate, now) < 0) return "OVERDUE";
  return "OPEN";
}
