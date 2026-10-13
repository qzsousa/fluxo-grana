import { Request, Response } from "express";
import { prisma } from "../../config/prisma";
import { hashPassword, generateTokens } from "../../shared/auth";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ConflictError, UnauthorizedError, NotFoundError } from "../../shared/errors";

// Register user
export async function register(
  req: Request,
  res: Response
): Promise<void> {
  const { email, password, name } = req.body;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new ConflictError("User already exists with this email");
  }

  const hashedPassword = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash: hashedPassword,
    },
  });

  const tokens = generateTokens(user.id, user.email);

  await prisma.refreshToken.create({
    data: {
      token: tokens.refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  res.status(201).json({
    user: { id: user.id, email: user.email, name: user.name },
    tokens,
  });
}

// Login user
export async function login(
  req: Request,
  res: Response
): Promise<void> {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new UnauthorizedError("Invalid credentials");
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);

  if (!isValidPassword) {
    throw new UnauthorizedError("Invalid credentials");
  }

  const tokens = generateTokens(user.id, user.email);

  await prisma.refreshToken.create({
    data: {
      token: tokens.refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  res.json({
    user: { id: user.id, email: user.email, name: user.name },
    tokens,
  });
}

// Refresh tokens
export async function refresh(
  req: Request,
  res: Response
): Promise<void> {
  const { refreshToken: token } = req.body;

  if (!token) {
    throw new UnauthorizedError("Refresh token required");
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as any;

    if (payload.type !== "refresh") {
      throw new UnauthorizedError("Invalid token type");
    }

    const dbToken = await prisma.refreshToken.findFirst({
      where: { token },
    });

    if (!dbToken || dbToken.revokedAt) {
      throw new UnauthorizedError("Invalid or revoked token");
    }

    if (dbToken.expiresAt < new Date()) {
      throw new UnauthorizedError("Token expired");
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    const tokens = generateTokens(user.id, user.email);

    await prisma.refreshToken.update({
      where: { id: dbToken.id },
      data: { revokedAt: new Date() },
    });

    await prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    res.json({
      user: { id: user.id, email: user.email, name: user.name },
      tokens,
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) throw error;
    throw new UnauthorizedError("Invalid refresh token");
  }
}

// Logout user
export async function logout(
  req: Request,
  res: Response
): Promise<void> {
  const { refreshToken } = req.body;

  if (refreshToken) {
    await prisma.refreshToken.updateMany({
      where: { token: refreshToken },
      data: { revokedAt: new Date() },
    });
  }

  res.json({ message: "Logged out successfully" });
}

// Get current user
export async function getMe(
  req: Request,
  res: Response
): Promise<void> {
  if (!req.user) {
    throw new UnauthorizedError("Not authenticated");
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
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