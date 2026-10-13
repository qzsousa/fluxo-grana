import { type Request, type Response } from "express";
import { prisma } from "../../config/prisma";
import { NotFoundError, UnauthorizedError } from "../../shared/errors";

// GET /api/v1/accounts
export async function listAccounts(req: Request, res: Response) {
  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError("Not authenticated");
  }

  const accounts = await prisma.account.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  res.json({ accounts });
}

// POST /api/v1/accounts
export async function createAccount(req: Request, res: Response) {
  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError("Not authenticated");
  }

  const { name, type, currency, balance, initialBalance, color, icon, institution } =
    req.body;

  const account = await prisma.account.create({
    data: {
      userId,
      name,
      type,
      currency: currency || "BRL",
      balance: balance !== undefined ? balance : 0,
      initialBalance: initialBalance || 0,
      color: color || "#3B82F6",
      icon,
      institution,
    },
  });

  res.status(201).json({ account });
}

// GET /api/v1/accounts/:id
export async function getAccount(req: Request, res: Response) {
  const userId = req.user?.id;
  const { id } = req.params;

  if (!userId) {
    throw new UnauthorizedError("Not authenticated");
  }

  const account = await prisma.account.findUnique({
    where: { id, userId },
  });

  if (!account) {
    throw new NotFoundError("Account not found");
  }

  res.json({ account });
}

// PUT /api/v1/accounts/:id
export async function updateAccount(req: Request, res: Response) {
  const userId = req.user?.id;
  const { id } = req.params;

  if (!userId) {
    throw new UnauthorizedError("Not authenticated");
  }

  const { name, type, currency, balance, color, icon, institution, isActive } =
    req.body;

  const existingAccount = await prisma.account.findUnique({
    where: { id, userId },
  });

  if (!existingAccount) {
    throw new NotFoundError("Account not found");
  }

  const account = await prisma.account.update({
    where: { id, userId },
    data: {
      name,
      type,
      currency,
      balance,
      color,
      icon,
      institution,
      isActive,
    },
  });

  res.json({ account });
}

// DELETE /api/v1/accounts/:id
export async function deleteAccount(req: Request, res: Response) {
  const userId = req.user?.id;
  const { id } = req.params;

  if (!userId) {
    throw new UnauthorizedError("Not authenticated");
  }

  const existingAccount = await prisma.account.findUnique({
    where: { id, userId },
  });

  if (!existingAccount) {
    throw new NotFoundError("Account not found");
  }

  // Check if account has transactions
  const transactionCount = await prisma.transaction.count({
    where: { accountId: id },
  });

  if (transactionCount > 0) {
    // Soft delete - mark as inactive instead
    await prisma.account.update({
      where: { id },
      data: { isActive: false },
    });
    res.json({ message: "Account deactivated (has transactions)" });
    return;
  }

  await prisma.account.delete({ where: { id } });

  res.json({ message: "Account deleted successfully" });
}

// GET /api/v1/accounts/:id/balance-history
export async function getBalanceHistory(req: Request, res: Response) {
  const userId = req.user?.id;
  const { id } = req.params;

  if (!userId) {
    throw new UnauthorizedError("Not authenticated");
  }

  const account = await prisma.account.findUnique({
    where: { id, userId },
  });

  if (!account) {
    throw new NotFoundError("Account not found");
  }

  // Simple balance history simulation
  const transactions = await prisma.transaction.findMany({
    where: { accountId: id, userId },
    orderBy: { date: "desc" },
    take: 30,
  });

  res.json({ transactions });
}