// Test setup - using mock database for tests
// In CI/CD, you would use a real test database

import { vi } from "vitest";

// Mock Prisma client to avoid database connection issues
vi.mock("../src/config/prisma.js", () => {
  const mockPrisma = {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findMany: vi.fn(),
    },
    account: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    transaction: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    category: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    refreshToken: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    $connect: vi.fn(),
    $disconnect: vi.fn(),
    $queryRaw: vi.fn(),
  };

  return {
    prisma: mockPrisma,
  };
});

// Also mock the auth module
vi.mock("../src/shared/auth.js", () => ({
  generateTokens: vi.fn(() => ({
    accessToken: "mock-access-token",
    refreshToken: "mock-refresh-token",
  })),
  hashPassword: vi.fn(async (password: string) => `hashed-${password}`),
  comparePassword: vi.fn(async (password: string, hash: string) => true),
}));

beforeEach(() => {
  vi.clearAllMocks();
});