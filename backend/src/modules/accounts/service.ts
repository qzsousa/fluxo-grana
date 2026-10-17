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

  const { name, type, currency, balance, initialBalance, color, icon, institution, closingDay, dueDay, creditLimit } =
    req.body;

  // O saldo nasce do saldo inicial: é o que o formulário manda e o que a
  // pessoa espera ver na conta. Sem isso toda conta nova abre em zero.
  const startingBalance = initialBalance ?? 0;

  const account = await prisma.account.create({
    data: {
      userId,
      name,
      type,
      currency: currency || "BRL",
      balance: balance !== undefined ? balance : startingBalance,
      initialBalance: startingBalance,
      color: color || "#3B82F6",
      icon,
      institution,
      // Só fazem sentido em cartão; o resto dos tipos ignora.
      closingDay: type === "CREDIT" ? closingDay ?? null : null,
      dueDay: type === "CREDIT" ? dueDay ?? null : null,
      creditLimit: type === "CREDIT" ? creditLimit ?? null : null,
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

  const {
    name,
    type,
    currency,
    balance,
    color,
    icon,
    institution,
    isActive,
    closingDay,
    dueDay,
    creditLimit,
  } = req.body;

  const existingAccount = await prisma.account.findUnique({
    where: { id, userId },
  });

  if (!existingAccount) {
    throw new NotFoundError("Account not found");
  }

  // O tipo pode não vir no update; decide pelos campos de cartão se a conta é
  // cartão no estado final, e limpa tudo quando deixa de ser.
  const nextType = type ?? existingAccount.type;
  const isCredit = nextType === "CREDIT";

  // `null` explícito significa "limpe este campo"; campo ausente significa
  // "não mexe". Sem essa distinção, limpar o limite seria impossível.
  const sent = (key: string) => Object.prototype.hasOwnProperty.call(req.body, key);

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
      closingDay: isCredit ? (sent("closingDay") ? closingDay ?? null : existingAccount.closingDay) : null,
      dueDay: isCredit ? (sent("dueDay") ? dueDay ?? null : existingAccount.dueDay) : null,
      creditLimit: isCredit
        ? sent("creditLimit")
          ? creditLimit ?? null
          : existingAccount.creditLimit
        : null,
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