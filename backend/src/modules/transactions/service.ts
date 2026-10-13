import { type Request, type Response } from "express";
import { prisma } from "../../config/prisma";
import { NotFoundError, UnauthorizedError } from "../../shared/errors";

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

  // Use transaction for atomic balance updates
  const result = await prisma.$transaction(async (tx) => {
    // Update account balances for income/expense
    if (type === "EXPENSE" || type === "INCOME") {
      const balanceDiff = type === "INCOME" ? amount : -amount;
      await tx.account.update({
        where: { id: accountId },
        data: { balance: { increment: balanceDiff } },
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

  // Use transaction for atomic balance updates
  const result = await prisma.$transaction(async (tx) => {
    // Revert old balance changes
    if (existing.type === "EXPENSE" || existing.type === "INCOME") {
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

    // Apply new balance changes
    const targetAccountId = accountId || existing.accountId;
    const targetToAccountId = toAccountId || existing.toAccountId;
    const targetType = type || existing.type;
    const targetAmount = Number(amount || existing.amount);

    if (targetType === "EXPENSE" || targetType === "INCOME") {
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
        date: date ? new Date(date) : new Date(),
        notes,
        status,
        tags,
        toAccountId: targetToAccountId,
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
  });

  if (!existing) {
    throw new NotFoundError("Transaction not found");
  }

  // Use transaction for atomic balance restoration
  await prisma.$transaction(async (tx) => {
    // Restore account balance
    if (existing.type === "EXPENSE" || existing.type === "INCOME") {
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