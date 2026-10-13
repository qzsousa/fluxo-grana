import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import { prisma } from "../src/config/prisma.js";

describe("Auth API", () => {
  const app = createApp();

  beforeAll(() => {
    // Mock the bcrypt and jwt modules
    vi.mock("bcryptjs", () => ({
      compare: vi.fn().mockResolvedValue(true),
      hash: vi.fn().mockResolvedValue("hashed-password"),
    }));
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  describe("POST /api/v1/auth/register", () => {
    it("should register a new user", async () => {
      vi.spyOn(prisma.user, "findUnique").mockResolvedValue(null);
      vi.spyOn(prisma.user, "create").mockResolvedValue({
        id: "test-id",
        email: "test@example.com",
        name: "Test User",
        passwordHash: "hashed-password",
        locale: "pt-BR",
        currency: "BRL",
        timezone: "America/Sao_Paulo",
        emailVerified: false,
        twoFactorEnabled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      vi.spyOn(prisma.refreshToken, "create").mockResolvedValue({} as any);

      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          email: "test@example.com",
          password: "password123",
          name: "Test User",
        })
        .expect(201);

      expect(res.body).toHaveProperty("user");
      expect(res.body.user.email).toBe("test@example.com");
      expect(res.body).toHaveProperty("tokens");
    });

    it("should reject duplicate email", async () => {
      vi.spyOn(prisma.user, "findUnique").mockResolvedValueOnce({
        id: "existing-id",
        email: "test@example.com",
        name: "Existing User",
      } as any);

      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          email: "test@example.com",
          password: "password123",
          name: "Test User 2",
        })
        .expect(409);

      expect(res.body).toHaveProperty("error");
    });
  });

  describe("POST /api/v1/auth/login", () => {
    it("should reject invalid credentials", async () => {
      vi.spyOn(prisma.user, "findUnique").mockResolvedValueOnce(null);

      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: "nonexistent@example.com",
          password: "password123",
        })
        .expect(401);
    });
  });

  describe("POST /api/v1/auth/refresh", () => {
    it("should reject invalid refresh token", async () => {
      vi.spyOn(prisma.refreshToken, "findFirst").mockResolvedValue(null);

      const res = await request(app)
        .post("/api/v1/auth/refresh")
        .send({ refreshToken: "invalid-token" })
        .expect(401);
    });
  });
});