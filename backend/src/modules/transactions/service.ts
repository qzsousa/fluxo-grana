import { type Request, type Response } from "express";
import { prisma } from "../../config/prisma";
import { NotFoundError, UnauthorizedError, ValidationError } from "../../shared/errors";
import { resolveInvoiceForDate } from "../invoices/service";

/**
 * Uma despesa só mexe no saldo quando é quitada.
 *
 *  - Conta comum marcada como "a pagar": nada acontece ainda. O saldo só cai
 *    no momento em que o usuário clica em Pagar.
 *  - Conta comum paga na hora: desconta na criação, como sempre.
 *  - Cartão: sempre vira dívida. O saldo negativo do cartão É a dívida, e quem
 *    quita é a fatura — não faz sentido "adiar" o lançamento do cartão.
 */
function expenseTouchesBalance(status: string | undefined, accountType: string): boolean {
  if (accountType === "CREDIT") return true;
  return status !== "PENDING";
}

/** Despesa que ainda não saiu da conta e precisa de um clique para ser paga. */
function isPayable(status: string | undefined, accountType: string, paidAt: Date | null): boolean {
  if (accountType === "CREDIT") return !paidAt;
  return status === "PENDING";
}

// GET /api/v1/transactions
export async function listTransactions(req: Request, res: Response) {
  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError("Not authenticated");
  }

  const {
    dateFrom,
    dateTo,
    categoryId,
    accountId,
    status,
    search,
    page = "1",
    limit = "20",
  } = req.query;

  const where: any = { userId };

  if (dateFrom || dateTo) {
    where.date = {};
    if (dateFrom) where.date.gte = new Date(dateFrom as string);
    if (dateTo) where.date.lte = new Date(dateTo as string);
  }

  if (categoryId) where.categoryId = categoryId;
  if (accountId) where.accountId = accountId;
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { description: { contains: search, mode: "insensitive" } },
      { notes: { contains: search, mode: "insensitive" } },
    ];
  }

  const transactions = await prisma.transaction.findMany({
    where,
    orderBy: { date: "desc" },
    skip: (parseInt(page as string, 10) - 1) * parseInt(limit as string, 10),
    take: parseInt(limit as string, 10),
    include: {
      account: true,
      category: true,
    },
  });

  const total = await prisma.transaction.count({ where });

  res.json({
    transactions,
    pagination: {
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10),
      total,
    },
  });
}

// POST /api/v1/transactions
export async function createTransaction(req: Request, res: Response) {
  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError("Not authenticated");
  }

  const {
    accountId,
    amount,
    description,
    categoryId,
    type,
    currency,
    date,
    notes,
    tags,
    toAccountId,
    icon,
    color,
    status,
  } = req.body;

  // Validate account ownership
  const account = await prisma.account.findUnique({
    where: { id: accountId, userId },
  });

  if (!account) {
    throw new NotFoundError("Account not found");
  }

  // Validate destination account for transfers
  if (type === "TRANSFER" && toAccountId) {
    const toAccount = await prisma.account.findUnique({
      where: { id: toAccountId, userId },
    });
    if (!toAccount) {
      throw new NotFoundError("Destination account not found");
    }
  }

  // Despesa nasce como "a pagar" só quando o usuário pede explicitamente.
  const wantsPending = status === "PENDING" && type === "EXPENSE";
  const touchesBalance = !wantsPending;

  // Use transaction for atomic balance updates
  const result = await prisma.$transaction(async (tx) => {
    // Só mexe no saldo se a despesa já foi quitada de cara.
    if (type === "INCOME") {
      await tx.account.update({
        where: { id: accountId },
        data: { balance: { increment: amount } },
      });
    } else if (type === "EXPENSE" && touchesBalance) {
      await tx.account.update({
        where: { id: accountId },
        data: { balance: { decrement: amount } },
      });
    }

    // Handle transfers
    if (type === "TRANSFER" && toAccountId) {
      await tx.account.update({
        where: { id: accountId },
        data: { balance: { decrement: amount } },
      });
      await tx.account.update({
        where: { id: toAccountId },
        data: { balance: { increment: amount } },
      });
    }

    // Create transaction
    const transaction = await tx.transaction.create({
      data: {
        userId,
        accountId,
        amount,
        description,
        categoryId,
        type,
        currency: currency || "BRL",
        date: date ? new Date(date) : new Date(),
        notes,
        tags: tags || [],
        toAccountId,
        icon,
        color,
        status: wantsPending ? "PENDING" : "CLEARED",
      },
      include: { account: true, category: true },
    });

    return transaction;
  });

  res.status(201).json({ transaction: result });
}

// GET /api/v1/transactions/:id
export async function getTransaction(req: Request, res: Response) {
  const userId = req.user?.id;
  const { id } = req.params;

  if (!userId) {
    throw new UnauthorizedError("Not authenticated");
  }

  const transaction = await prisma.transaction.findUnique({
    where: { id, userId },
    include: { account: true, category: true },
  });

  if (!transaction) {
    throw new NotFoundError("Transaction not found");
  }

  res.json({ transaction });
}

// PUT /api/v1/transactions/:id
export async function updateTransaction(req: Request, res: Response) {
  const userId = req.user?.id;
  const { id } = req.params;

  if (!userId) {
    throw new UnauthorizedError("Not authenticated");
  }

  const existing = await prisma.transaction.findUnique({
    where: { id, userId },
  });

  if (!existing) {
    throw new NotFoundError("Transaction not found");
  }

  const {
    accountId,
    amount,
    description,
    categoryId,
    type,
    currency,
    date,
    notes,
    status,
    tags,
    toAccountId,
    icon,
    color,
  } = req.body;

  // Validate accounts if provided
  if (accountId && accountId !== existing.accountId) {
    const account = await prisma.account.findUnique({
      where: { id: accountId, userId },
    });
    if (!account) {
      throw new NotFoundError("Account not found");
    }
  }

  if (toAccountId && toAccountId !== existing.toAccountId) {
    const toAccount = await prisma.account.findUnique({
      where: { id: toAccountId, userId },
    });
    if (!toAccount) {
      throw new NotFoundError("Destination account not found");
    }
  }

const targetAccountId = accountId || existing.accountId;
  const targetToAccountId = toAccountId || existing.toAccountId;
  const targetType = type || existing.type;
  const targetAmount = Number(amount || existing.amount);
  const targetStatus = status || existing.status;

  // Tipo das contas envolvidas decide se o lançamento mexe no saldo.
  const accounts = await prisma.account.findMany({
    where: { id: { in: Array.from(new Set([existing.accountId, targetAccountId])) } },
  });
  const accountTypeById = new Map(accounts.map((account) => [account.id, account.type as string]));

  const existingAccountType = accountTypeById.get(existing.accountId) ?? "OTHER";
  const targetAccountType = accountTypeById.get(targetAccountId) ?? "OTHER";

  // Só desfaz/aplica o que realmente afetou o saldo. Sem isso, editar uma
  // despesa "a pagar" devolveria dinheiro que nunca saiu.
  const existingTouched =
    existing.type === "INCOME" ||
    (existing.type === "EXPENSE" && expenseTouchesBalance(existing.status, existingAccountType));
  const targetTouched =
    targetType === "INCOME" ||
    (targetType === "EXPENSE" && expenseTouchesBalance(targetStatus, targetAccountType));

  // Despesa comum que acabou de sair de "a pagar" ganha a data de pagamento.
  const becamePaid =
    existing.status === "PENDING" &&
    targetStatus !== "PENDING" &&
    existingAccountType !== "CREDIT" &&
    targetType === "EXPENSE";

  // Use transaction for atomic balance updates
  const result = await prisma.$transaction(async (tx) => {
    if (existingTouched && existing.type !== "TRANSFER") {
      const balanceDiff = existing.type === "INCOME" ? -existing.amount : existing.amount;
      await tx.account.update({
        where: { id: existing.accountId },
        data: { balance: { increment: balanceDiff } },
      });
    }

    if (existing.type === "TRANSFER" && existing.toAccountId) {
      await tx.account.update({
        where: { id: existing.accountId },
        data: { balance: { increment: existing.amount } },
      });
      await tx.account.update({
        where: { id: existing.toAccountId },
        data: { balance: { decrement: existing.amount } },
      });
    }

    if (targetTouched && targetType !== "TRANSFER") {
      const balanceDiff = targetType === "INCOME" ? targetAmount : -targetAmount;
      await tx.account.update({
        where: { id: targetAccountId },
        data: { balance: { increment: balanceDiff } },
      });
    }

    if (targetType === "TRANSFER" && targetToAccountId) {
      await tx.account.update({
        where: { id: targetAccountId },
        data: { balance: { decrement: targetAmount } },
      });
      await tx.account.update({
        where: { id: targetToAccountId },
        data: { balance: { increment: targetAmount } },
      });
    }

    // Update transaction
    const transaction = await tx.transaction.update({
      where: { id, userId },
      data: {
        accountId: targetAccountId,
        amount: targetAmount,
        description,
        categoryId,
        type: targetType,
        currency,
        // Sem `date` no corpo mantém a data original. Antes caía em `new Date()`, e
        // qualquer edição simples empurrava a transação para hoje — o que tirava a
        // compra da janela da fatura e do lugar na lista.
        date: date ? new Date(date) : existing.date,
        notes,
        status: targetStatus,
        tags,
        toAccountId: targetToAccountId,
        icon,
        color,
        ...(becamePaid ? { paidAt: new Date() } : {}),
        // Reabrir como "a pagar" limpa a data de pagamento.
        ...(targetStatus === "PENDING" ? { paidAt: null } : {}),
      },
      include: { account: true, category: true },
    });

    return transaction;
  });

  res.json({ transaction: result });
}

// DELETE /api/v1/transactions/:id
export async function deleteTransaction(req: Request, res: Response) {
  const userId = req.user?.id;
  const { id } = req.params;

  if (!userId) {
    throw new UnauthorizedError("Not authenticated");
  }

  const existing = await prisma.transaction.findUnique({
    where: { id, userId },
    include: { account: true },
  });

  if (!existing) {
    throw new NotFoundError("Transaction not found");
  }

  // Despesa "a pagar" nunca saiu da conta: não há o que devolver.
  const touched =
    existing.type === "INCOME" ||
    (existing.type === "EXPENSE" && expenseTouchesBalance(existing.status, existing.account.type as string));

  // Use transaction for atomic balance restoration
  await prisma.$transaction(async (tx) => {
    if (touched && existing.type !== "TRANSFER") {
      const balanceAdjustment = existing.type === "INCOME" ? -existing.amount : existing.amount;
      await tx.account.update({
        where: { id: existing.accountId },
        data: { balance: { increment: balanceAdjustment } },
      });
    }

    if (existing.type === "TRANSFER" && existing.toAccountId) {
      await tx.account.update({
        where: { id: existing.accountId },
        data: { balance: { increment: existing.amount } },
      });
      await tx.account.update({
        where: { id: existing.toAccountId },
        data: { balance: { decrement: existing.amount } },
      });
    }

    // Delete transaction
    await tx.transaction.delete({ where: { id, userId } });
  });

  res.json({ message: "Transaction deleted successfully" });
}

// GET /api/v1/transactions/stats
export async function getTransactionsStats(req: Request, res: Response) {
  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError("Not authenticated");
  }

  const stats = await prisma.$queryRaw<{
    _sum: { amount: number | null };
    _count: { amount: number };
    _avg: { amount: number };
    _min: { amount: number | null };
    _max: { amount: number | null };
  }>`
    SELECT
      SUM(amount) as "amount",
      COUNT(amount) as "count",
      AVG(amount) as "avg",
      MIN(amount) as "min",
      MAX(amount) as "max"
    FROM "Transaction"
    WHERE "userId" = ${userId}
  `;

  res.json({ stats });
}

/**
 * POST /api/v1/transactions/:id/pay
 *
 * Paga UMA despesa direto da lista. Dois caminhos:
 *
 *  - Cartão: gera a transferência da conta de origem para o cartão, como o
 *    pagamento da fatura faria, e soma o valor na fatura da compra.
 *  - Conta comum "a pagar": não existe transferência. O dinheiro simplesmente
 *    sai da conta agora, que é o que o usuário estava esperando.
 *
 * Nos dois casos a transação ganha `paidAt`, que é o único marcador de "quitada".
 */
export async function payTransaction(req: Request, res: Response) {
  const userId = req.user?.id;
  const { id } = req.params;
  const { fromAccountId, paidAt } = req.body ?? {};

  if (!userId) throw new UnauthorizedError("Not authenticated");

  const purchase = await prisma.transaction.findFirst({
    where: { id, userId },
    include: { account: true },
  });

  if (!purchase) throw new NotFoundError("Transação não encontrada");

  if (purchase.type !== "EXPENSE") {
    throw new ValidationError("Só despesa pode ser paga por aqui", {
      type: ["Esta transação não é uma despesa"],
    });
  }

  const isCard = purchase.account.type === "CREDIT";

  if (!isCard && purchase.status !== "PENDING") {
    throw new ValidationError("Esta despesa não está esperando pagamento", {
      status: ["Ela já foi paga, ou nunca ficou pendente"],
    });
  }

  if (purchase.paidAt) {
    throw new ValidationError("Esta compra já foi paga", { paidAt: ["Já quitada"] });
  }

  const amount = Number(purchase.amount);
  const paymentDate = paidAt ? new Date(paidAt) : new Date();
  if (Number.isNaN(paymentDate.getTime())) {
    throw new ValidationError("Data de pagamento inválida", { paidAt: ["Use uma data ISO 8601"] });
  }

  // ---------- Caminho 1: conta comum marcada como "a pagar" ----------
  if (!isCard) {
    const paid = await prisma.$transaction(async (tx) => {
      await tx.account.update({
        where: { id: purchase.accountId },
        data: { balance: { decrement: amount } },
      });

      return tx.transaction.update({
        where: { id },
        data: { status: "CLEARED", paidAt: paymentDate },
        include: { account: true },
      });
    });

    res.json({
      message: `"${purchase.description}" paga. R$ ${amount.toFixed(2)} saiu de ${purchase.account.name}.`,
      transaction: paid,
    });
    return;
  }

  // ---------- Caminho 2: cartão ----------
  const source =
    fromAccountId !== undefined && fromAccountId !== null
      ? await prisma.account.findFirst({ where: { id: fromAccountId, userId } })
      : await prisma.account.findFirst({
          where: { userId, type: { not: "CREDIT" }, isActive: true },
          orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
        });

  if (!source) {
    throw new ValidationError("Cadastre uma conta corrente ou poupança para pagar", {
      fromAccountId: ["Nenhuma conta de origem disponível"],
    });
  }

  if (source.id === purchase.accountId) {
    throw new ValidationError("A conta de origem não pode ser o próprio cartão", {
      fromAccountId: ["Escolha uma conta diferente do cartão"],
    });
  }

  // Descobre a fatura a partir da data da compra e soma o valor nela.
  const { invoice, total } = await resolveInvoiceForDate(userId, purchase.account, purchase.date);

  const result = await prisma.$transaction(async (tx) => {
    const payment = await tx.transaction.create({
      data: {
        userId,
        accountId: source.id,
        toAccountId: purchase.accountId,
        amount,
        currency: purchase.currency,
        description: `Pagamento de ${purchase.description}`,
        type: "TRANSFER",
        date: paymentDate,
        tags: ["fatura"],
        metadata: { purchaseId: id, invoiceId: invoice.id },
      },
    });

    await tx.account.update({ where: { id: source.id }, data: { balance: { decrement: amount } } });
    await tx.account.update({
      where: { id: purchase.accountId },
      data: { balance: { increment: amount } },
    });

    await tx.transaction.update({
      where: { id },
      data: { paidAt: paymentDate, paymentId: payment.id },
    });

    const paidTotal = Number(invoice.paidTotal) + amount;
    await tx.invoice.update({
      where: { id: invoice.id },
      data: {
        paidTotal,
        // Só marca como paga a fatura inteira quando o total já cobre tudo.
        status: paidTotal >= total ? "PAID" : "PARTIAL",
        paidAt: paymentDate,
        paymentTransactionId: payment.id,
      },
    });

    return { payment, invoiceId: invoice.id, reference: invoice.reference };
  });

  res.status(201).json({
    message: `"${purchase.description}" paga com ${source.name}`,
    payment: result.payment,
    invoiceId: result.invoiceId,
    invoiceReference: result.reference,
  });
}

// DELETE /api/v1/transactions/:id/pay
// Desfaz o pagamento: apaga a transferência do cartão ou, na conta comum,
// devolve o valor e reabre a despesa como "a pagar".
export async function revertTransactionPayment(req: Request, res: Response) {
  const userId = req.user?.id;
  const { id } = req.params;

  if (!userId) throw new UnauthorizedError("Not authenticated");

  const purchase = await prisma.transaction.findFirst({
    where: { id, userId },
    include: { account: true },
  });

  if (!purchase) throw new NotFoundError("Transação não encontrada");
  if (!purchase.paidAt) {
    throw new ValidationError("Esta compra não tem pagamento registrado", {});
  }

  const isCard = purchase.account.type === "CREDIT";

  // ---------- Conta comum: só volta a ser "a pagar" ----------
  if (!isCard) {
    await prisma.$transaction(async (tx) => {
      await tx.account.update({
        where: { id: purchase.accountId },
        data: { balance: { increment: Number(purchase.amount) } },
      });
      await tx.transaction.update({
        where: { id },
        data: { status: "PENDING", paidAt: null, paymentId: null },
      });
    });

    res.json({ message: "Pagamento desfeito. A despesa voltou para a pagar." });
    return;
  }

  // ---------- Cartão ----------
  await prisma.$transaction(async (tx) => {
    const payment = purchase.paymentId
      ? await tx.transaction.findUnique({ where: { id: purchase.paymentId } })
      : null;

    if (payment && payment.type === "TRANSFER" && payment.toAccountId) {
      await tx.account.update({
        where: { id: payment.accountId },
        data: { balance: { increment: Number(payment.amount) } },
      });
      await tx.account.update({
        where: { id: payment.toAccountId },
        data: { balance: { decrement: Number(payment.amount) } },
      });

      // Desconta da fatura e reabre o status. Se a fatura tiver outro
      // pagamento registrado, ele continua valendo.
      const meta = payment.metadata as Record<string, unknown> | null;
      const invoiceId = meta && typeof meta.invoiceId === "string" ? meta.invoiceId : null;

      if (invoiceId) {
        const invoice = await tx.invoice.findUnique({ where: { id: invoiceId } });
        if (invoice) {
          const paidTotal = Math.max(Number(invoice.paidTotal) - Number(payment.amount), 0);
          await tx.invoice.update({
            where: { id: invoiceId },
            data: {
              paidTotal,
              status: paidTotal > 0 ? "PARTIAL" : "OPEN",
              paidAt: paidTotal > 0 ? invoice.paidAt : null,
            },
          });
        }
      }

      await tx.transaction.delete({ where: { id: payment.id } });
    }

    await tx.transaction.update({
      where: { id },
      data: { paidAt: null, paymentId: null },
    });
  });

  res.json({ message: "Pagamento desfeito" });
}