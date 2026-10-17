import { type Request, type Response } from "express";
import type { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { NotFoundError, UnauthorizedError, ValidationError } from "../../shared/errors";
import {
  DEFAULT_CLOSING_DAY,
  DEFAULT_DUE_DAY,
  daysUntil,
  displayStatus,
  invoiceWindow,
  invoiceWindowsAround,
  normalizeDay,
  openInvoiceReference,
  parseReference,
  urgencyOf,
  type InvoiceWindow,
} from "../../shared/invoice";

interface CreditAccount {
  id: string;
  userId: string;
  familyId: string | null;
  name: string;
  currency: string;
  color: string;
  creditLimit: Prisma.Decimal | null;
  closingDay: number | null;
  dueDay: number | null;
}

export type { CreditAccount };

interface StoredRow {
  id: string;
  paidTotal: number;
  paidAt: Date | null;
  paymentTransactionId: string | null;
}

interface Bucket {
  total: number;
  count: number;
  transactions: any[];
}

function requireUserId(req: Request): string {
  const userId = req.user?.id;
  if (!userId) throw new UnauthorizedError("Not authenticated");
  return userId;
}

function toNumber(value: Prisma.Decimal | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  return Number(value);
}

function clampInt(value: unknown, fallback: number, min: number, max: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(Math.trunc(parsed), min), max);
}

function bucketKey(accountId: string, reference: string): string {
  return accountId + ":" + reference;
}

/** Fim exclusivo da janela a partir do dia de fechamento (00:00 + 1 dia). */
function endExclusive(isoDate: string): Date {
  return new Date(new Date(isoDate).getTime() + 86_400_000);
}

async function creditAccounts(userId: string, accountId?: string): Promise<CreditAccount[]> {
  const accounts = await prisma.account.findMany({
    where: {
      userId,
      type: "CREDIT",
      ...(accountId ? { id: accountId } : {}),
    },
    orderBy: { createdAt: "asc" },
  });

  if (accountId && accounts.length === 0) {
    throw new NotFoundError("Cartão de crédito não encontrado");
  }

  return accounts;
}

/** Cria as linhas que ainda não existem e devolve o mapa `conta:referência`. */
async function ensureRows(
  accounts: CreditAccount[],
  windowsByAccount: Map<string, InvoiceWindow[]>
): Promise<Map<string, StoredRow>> {
  const toCreate: Prisma.InvoiceCreateManyInput[] = [];

  for (const account of accounts) {
    for (const window of windowsByAccount.get(account.id) ?? []) {
      toCreate.push({
        userId: account.userId,
        familyId: account.familyId,
        accountId: account.id,
        reference: window.reference,
        periodStart: window.periodStart,
        periodEnd: window.periodEnd,
        closingDate: window.closingDate,
        dueDate: window.dueDate,
      });
    }
  }

  if (toCreate.length > 0) {
    await prisma.invoice.createMany({ data: toCreate, skipDuplicates: true });
  }

  const rows = new Map<string, StoredRow>();
  const stored = await prisma.invoice.findMany({
    where: { accountId: { in: accounts.map((account) => account.id) } },
    select: {
      id: true,
      accountId: true,
      reference: true,
      paidTotal: true,
      paidAt: true,
      paymentTransactionId: true,
    },
  });

  for (const invoice of stored) {
    rows.set(bucketKey(invoice.accountId, invoice.reference), {
      id: invoice.id,
      paidTotal: toNumber(invoice.paidTotal),
      paidAt: invoice.paidAt,
      paymentTransactionId: invoice.paymentTransactionId,
    });
  }

  return rows;
}

/**
 * Soma as compras de todos os cartões dentro das janelas pedidas numa consulta
 * só. Uma fatura por cartão e mês é o menor grão, então tudo cabe em memória.
 */
async function purchaseBuckets(
  userId: string,
  accounts: CreditAccount[],
  windowsByAccount: Map<string, InvoiceWindow[]>
): Promise<Map<string, Bucket>> {
  const buckets = new Map<string, Bucket>();

  let earliest: Date | null = null;
  let latest: Date | null = null;

  for (const account of accounts) {
    for (const window of windowsByAccount.get(account.id) ?? []) {
      buckets.set(bucketKey(account.id, window.reference), { total: 0, count: 0, transactions: [] });
      if (!earliest || window.periodStart < earliest) earliest = window.periodStart;
      if (!latest || window.periodEndExclusive > latest) latest = window.periodEndExclusive;
    }
  }

  if (!earliest || !latest || buckets.size === 0) return buckets;

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      accountId: { in: accounts.map((account) => account.id) },
      // Só compra vira fatura. A transferência gerada no pagamento é
      // exatamente o que NÃO pode entrar aqui.
      type: "EXPENSE",
      status: { not: "CANCELLED" },
      date: { gte: earliest, lt: latest },
    },
    include: { category: true },
    orderBy: [{ date: "asc" }, { createdAt: "asc" }],
  });

  for (const transaction of transactions) {
    const windows = windowsByAccount.get(transaction.accountId) ?? [];
    for (const window of windows) {
      if (transaction.date < window.periodStart || transaction.date >= window.periodEndExclusive) continue;
      const bucket = buckets.get(bucketKey(transaction.accountId, window.reference));
      if (!bucket) continue;
      bucket.total += toNumber(transaction.amount);
      bucket.count += 1;
      bucket.transactions.push(transaction);
    }
  }

  return buckets;
}

function serialize(
  account: CreditAccount,
  window: InvoiceWindow,
  row: StoredRow | undefined,
  bucket: Bucket | undefined,
  now: Date,
  withTransactions: boolean
) {
  const total = bucket?.total ?? 0;
  const paidTotal = row?.paidTotal ?? 0;
  const daysLeft = daysUntil(window.dueDate, now);
  const status = displayStatus(total, paidTotal, window.dueDate, now);

  return {
    id: row?.id ?? null,
    reference: window.reference,
    account: {
      id: account.id,
      name: account.name,
      color: account.color,
      currency: account.currency,
      creditLimit: account.creditLimit ? toNumber(account.creditLimit) : null,
      closingDay: normalizeDay(account.closingDay, DEFAULT_CLOSING_DAY),
      dueDay: normalizeDay(account.dueDay, DEFAULT_DUE_DAY),
      // Cartão sem dias configurados funciona, mas os números são um palpite
      // (25/5) — a interface usa isto para pedir a configuração.
      isConfigured: account.closingDay !== null && account.dueDay !== null,
    },
    periodStart: window.periodStart.toISOString(),
    periodEnd: window.periodEnd.toISOString(),
    closingDate: window.closingDate.toISOString(),
    dueDate: window.dueDate.toISOString(),
    total,
    paidTotal,
    remaining: Math.max(total - paidTotal, 0),
    status,
    daysUntilDue: daysLeft,
    urgency: status === "PAID" ? "paid" : urgencyOf(daysLeft),
    paidAt: row?.paidAt ? row.paidAt.toISOString() : null,
    paymentTransactionId: row?.paymentTransactionId ?? null,
    transactionCount: bucket?.count ?? 0,
    ...(withTransactions
      ? {
          transactions: (bucket?.transactions ?? []).map((transaction) => ({
            id: transaction.id,
            description: transaction.description,
            amount: toNumber(transaction.amount),
            currency: transaction.currency,
            date: transaction.date.toISOString(),
            notes: transaction.notes,
            tags: transaction.tags,
            category: transaction.category
              ? {
                  id: transaction.category.id,
                  name: transaction.category.name,
                  color: transaction.category.color,
                }
              : null,
          })),
        }
      : {}),
  };
}

interface LoadOptions {
  monthsBack?: number;
  monthsForward?: number;
  withTransactions?: boolean;
  onlyUnpaid?: boolean;
  withinDays?: number;
  now?: Date;
}

async function loadInvoices(userId: string, accountId: string | undefined, options: LoadOptions = {}) {
  const now = options.now ?? new Date();
  const accounts = await creditAccounts(userId, accountId);
  if (accounts.length === 0) return [];

  const windowsByAccount = new Map<string, InvoiceWindow[]>();
  for (const account of accounts) {
    windowsByAccount.set(
      account.id,
      invoiceWindowsAround(account.closingDay, account.dueDay, {
        now,
        monthsBack: options.monthsBack ?? 3,
        monthsForward: options.monthsForward ?? 1,
      })
    );
  }

  const rows = await ensureRows(accounts, windowsByAccount);
  const buckets = await purchaseBuckets(userId, accounts, windowsByAccount);
  const results: any[] = [];

  for (const account of accounts) {
    for (const window of windowsByAccount.get(account.id) ?? []) {
      const key = bucketKey(account.id, window.reference);
      const invoice = serialize(
        account,
        window,
        rows.get(key),
        buckets.get(key),
        now,
        !!options.withTransactions
      );

      if (options.onlyUnpaid && invoice.status === "PAID") continue;
      if (options.withinDays !== undefined && invoice.daysUntilDue > options.withinDays) continue;

      results.push(invoice);
    }
  }

  // Vencimento mais próximo primeiro; as já pagas vão para o fim.
  results.sort((a, b) => {
    if (a.status === "PAID" && b.status !== "PAID") return 1;
    if (b.status === "PAID" && a.status !== "PAID") return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  return results;
}

/**
 * Fatura que contém uma compra de uma data específica, criando a linha se
 * ainda não existir. Usado pelo pagamento avulso, que precisa localizar a fatura
 * a partir da data da transação em vez de varrer a lista.
 */
export async function resolveInvoiceForDate(userId: string, account: CreditAccount, date: Date) {
  const window = invoiceWindow(account.closingDay, account.dueDay, openInvoiceReference(date, account.closingDay));

  const invoice = await prisma.invoice.upsert({
    where: { accountId_reference: { accountId: account.id, reference: window.reference } },
    create: {
      userId,
      familyId: account.familyId,
      accountId: account.id,
      reference: window.reference,
      periodStart: window.periodStart,
      periodEnd: window.periodEnd,
      closingDate: window.closingDate,
      dueDate: window.dueDate,
    },
    // A janela é derivada do cartão; se os dias mudaram, a linha acompanha.
    update: {
      periodStart: window.periodStart,
      periodEnd: window.periodEnd,
      closingDate: window.closingDate,
      dueDate: window.dueDate,
    },
  });

  const total = await invoiceTotal(userId, account.id, window);

  return { invoice, window, total };
}

/** Soma das compras dentro da janela — o total da fatura. */
export async function invoiceTotal(userId: string, accountId: string, window: InvoiceWindow): Promise<number> {
  const agg = await prisma.transaction.aggregate({
    where: {
      userId,
      accountId,
      type: "EXPENSE",
      status: { not: "CANCELLED" },
      date: { gte: window.periodStart, lt: window.periodEndExclusive },
    },
    _sum: { amount: true },
  });

  return toNumber(agg._sum.amount);
}

/** Carrega uma fatura pelo id sem varrer meses irrelevantes. */
async function loadInvoiceById(userId: string, id: string, withTransactions: boolean) {
  const stored = await prisma.invoice.findFirst({
    where: { id, userId },
    include: { account: true },
  });

  if (!stored) throw new NotFoundError("Fatura não encontrada");
  if (stored.account.type !== "CREDIT") {
    throw new ValidationError("Esta fatura não pertence a um cartão de crédito", {});
  }

  const reference = parseReference(stored.reference);
  if (!reference) throw new NotFoundError("Fatura não encontrada");

  const account: CreditAccount = stored.account;
  const window = invoiceWindow(account.closingDay, account.dueDay, reference);
  const windowsByAccount = new Map<string, InvoiceWindow[]>([[account.id, [window]]]);

  const rows = await ensureRows([account], windowsByAccount);
  const buckets = await purchaseBuckets(userId, [account], windowsByAccount);

  const row = rows.get(bucketKey(account.id, window.reference));
  return { invoice: serialize(account, window, row, buckets.get(bucketKey(account.id, window.reference)), new Date(), withTransactions), account };
}

// GET /api/v1/invoices
export async function listInvoices(req: Request, res: Response) {
  const userId = requireUserId(req);

  const accountId = typeof req.query.accountId === "string" ? req.query.accountId : undefined;
  const reference = typeof req.query.reference === "string" ? req.query.reference : undefined;

  if (reference && !parseReference(reference)) {
    throw new ValidationError("Referência inválida", { reference: ["Use o formato YYYY-MM"] });
  }

  let invoices = await loadInvoices(userId, accountId, {
    monthsBack: clampInt(req.query.monthsBack, 3, 0, 24),
    monthsForward: clampInt(req.query.monthsForward, 1, 0, 24),
  });

  if (reference) {
    invoices = invoices.filter((invoice) => invoice.reference === reference);
  }

  res.json({ invoices });
}

// GET /api/v1/invoices/upcoming
// Alimenta os lembretes: só o que ainda não foi pago e vence nos próximos dias.
export async function listUpcomingInvoices(req: Request, res: Response) {
  const userId = requireUserId(req);
  const withinDays = clampInt(req.query.days, 7, 0, 60);
  const accountId = typeof req.query.accountId === "string" ? req.query.accountId : undefined;

  const invoices = await loadInvoices(userId, accountId, {
    monthsBack: 1,
    monthsForward: 1,
    onlyUnpaid: true,
    withinDays,
  });

  res.json({ invoices, withinDays });
}

// GET /api/v1/invoices/:id
export async function getInvoice(req: Request, res: Response) {
  const userId = requireUserId(req);
  const { invoice } = await loadInvoiceById(userId, req.params.id, true);
  res.json({ invoice });
}

// POST /api/v1/invoices/:id/pay
//
// Gera uma TRANSFERência da conta de origem para o cartão. Marcar só um
// booleano deixaria o saldo do cartão errado para sempre — a transferência é o
// que devolve a dívida a zero.
export async function payInvoice(req: Request, res: Response) {
  const userId = requireUserId(req);
  const { id } = req.params;
  const { amount, paidAt, fromAccountId, description } = req.body ?? {};

  const { invoice, account: card } = await loadInvoiceById(userId, id, false);

  if (invoice.remaining <= 0) {
    throw new ValidationError("Esta fatura já está quitada", { remaining: 0 });
  }

  const value = amount === undefined || amount === null ? invoice.remaining : Number(amount);
  if (!Number.isFinite(value) || value <= 0) {
    throw new ValidationError("Valor do pagamento inválido", { amount: ["Informe um valor maior que zero"] });
  }

  const paymentDate = paidAt ? new Date(paidAt) : new Date();
  if (Number.isNaN(paymentDate.getTime())) {
    throw new ValidationError("Data de pagamento inválida", { paidAt: ["Use uma data ISO 8601"] });
  }

  // Sem conta de origem informada, cai na conta padrão ou na primeira ativa.
  const source =
    fromAccountId !== undefined && fromAccountId !== null
      ? await prisma.account.findFirst({ where: { id: fromAccountId, userId } })
      : await prisma.account.findFirst({
          where: { userId, type: { not: "CREDIT" }, isActive: true },
          orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
        });

  if (!source) {
    throw new ValidationError("Cadastre uma conta corrente ou poupança para pagar a fatura", {
      fromAccountId: ["Nenhuma conta de origem disponível"],
    });
  }

  if (source.id === card.id) {
    throw new ValidationError("A conta de origem não pode ser o próprio cartão", {
      fromAccountId: ["Escolha uma conta diferente do cartão"],
    });
  }

  const stored = await prisma.invoice.findFirstOrThrow({ where: { id } });
  const label = (typeof description === "string" && description.trim()) || `Pagamento da fatura ${invoice.reference}`;

  const result = await prisma.$transaction(async (tx) => {
    const payment = await tx.transaction.create({
      data: {
        userId,
        familyId: stored.familyId,
        accountId: source.id,
        toAccountId: card.id,
        amount: value,
        currency: card.currency,
        description: label,
        type: "TRANSFER",
        date: paymentDate,
        tags: ["fatura", invoice.reference],
        metadata: { invoiceId: id, reference: invoice.reference },
      },
      include: { account: true, toAccount: true },
    });

    await tx.account.update({ where: { id: source.id }, data: { balance: { decrement: value } } });
    await tx.account.update({ where: { id: card.id }, data: { balance: { increment: value } } });

    // Quita as compras da janela: é o que permite ver, na lista, quais
    // despesas já foram pagas e quais ainda estão em aberto.
    await tx.transaction.updateMany({
      where: {
        userId,
        accountId: card.id,
        type: "EXPENSE",
        status: { not: "CANCELLED" },
        paidAt: null,
        date: { gte: new Date(invoice.periodStart), lt: endExclusive(invoice.periodEnd) },
      },
      data: { paidAt: paymentDate, paymentId: payment.id },
    });

    const newPaidTotal = invoice.paidTotal + value;
    const updated = await tx.invoice.update({
      where: { id },
      data: {
        paidTotal: newPaidTotal,
        status: newPaidTotal >= invoice.total ? "PAID" : "PARTIAL",
        paidAt: paymentDate,
        paymentTransactionId: payment.id,
      },
    });

    return { payment, invoice: updated };
  });

  res.status(201).json({
    invoice: result.invoice,
    payment: result.payment,
    message: `Fatura ${invoice.reference} paga com ${source.name}`,
  });
}

// DELETE /api/v1/invoices/:id/payment
// Desfaz o pagamento: apaga a transferência e devolve o dinheiro à origem.
export async function revertInvoicePayment(req: Request, res: Response) {
  const userId = requireUserId(req);
  const { id } = req.params;

  const stored = await prisma.invoice.findFirst({ where: { id, userId } });
  if (!stored) throw new NotFoundError("Fatura não encontrada");
  if (!stored.paymentTransactionId) {
    throw new ValidationError("Esta fatura não tem pagamento registrado", {});
  }

  await prisma.$transaction(async (tx) => {
    const payment = await tx.transaction.findUnique({ where: { id: stored.paymentTransactionId! } });

    if (payment && payment.type === "TRANSFER" && payment.toAccountId) {
      await tx.account.update({
        where: { id: payment.accountId },
        data: { balance: { increment: toNumber(payment.amount) } },
      });
      await tx.account.update({
        where: { id: payment.toAccountId },
        data: { balance: { decrement: toNumber(payment.amount) } },
      });

      // Reabre as compras que este pagamento tinha quitado.
      await tx.transaction.updateMany({
        where: { userId, paymentId: payment.id, paidAt: { not: null } },
        data: { paidAt: null, paymentId: null },
      });

      await tx.transaction.delete({ where: { id: payment.id } });
    }

    await tx.invoice.update({
      where: { id },
      data: { paidTotal: 0, status: "OPEN", paidAt: null, paymentTransactionId: null },
    });
  });

  res.json({ message: "Pagamento desfeito" });
}
