import { type Request, type Response } from "express";
import { prisma } from "../../config/prisma";
import { NotFoundError, UnauthorizedError } from "../../shared/errors";

// Get current user
export async function getMe(req: Request, res: Response) {
  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError("Not authenticated");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      locale: true,
      currency: true,
      timezone: true,
      emailVerified: true,
      twoFactorEnabled: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  res.json({ user });
}

// Update current user
export async function updateMe(req: Request, res: Response) {
  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError("Not authenticated");
  }

  const { name, locale, timezone } = req.body;

  const user = await prisma.user.update({
    where: { id: userId },
    data: { name, locale, timezone },
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      locale: true,
      currency: true,
      timezone: true,
      updatedAt: true,
    },
  });

  res.json({ user });
}