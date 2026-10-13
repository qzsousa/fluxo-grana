import swaggerUi from "swagger-ui-express";
import type { Request, Response } from "express";

const swaggerDocument = {
  openapi: "3.1.0",
  info: {
    title: "Finance API",
    description: "Full-stack financial system API",
    version: "1.0.0",
    contact: {
      name: "Finance App",
    },
  },
  servers: [
    {
      url: "http://localhost:3000/api/v1",
      description: "Development server",
    },
  ],
  components: {
    securitySchemes: {
      Bearer: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Access token for authentication",
      },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          id: { type: "string" },
          email: { type: "string", format: "email" },
          name: { type: "string" },
          avatar: { type: "string", nullable: true },
          locale: { type: "string" },
          currency: { type: "string" },
          timezone: { type: "string" },
          emailVerified: { type: "boolean" },
          twoFactorEnabled: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      Tokens: {
        type: "object",
        properties: {
          accessToken: { type: "string" },
          refreshToken: { type: "string" },
        },
      },
      Account: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          type: { type: "string", enum: ["CHECKING", "SAVINGS", "CREDIT", "INVESTMENT", "CRYPTO", "CASH", "OTHER"] },
          currency: { type: "string" },
          balance: { type: "number" },
          color: { type: "string" },
          icon: { type: "string", nullable: true },
          isActive: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      Transaction: {
        type: "object",
        properties: {
          id: { type: "string" },
          description: { type: "string" },
          amount: { type: "number" },
          currency: { type: "string" },
          date: { type: "string", format: "date-time" },
          notes: { type: "string", nullable: true },
          tags: { type: "array", items: { type: "string" } },
          status: { type: "string", enum: ["PENDING", "CLEARED", "RECONCILED", "CANCELLED"] },
        },
      },
    },
  },
  security: [{ Bearer: [] }],
  paths: {
    "/auth/register": {
      post: {
        summary: "Register a new user",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password", "name"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string", minLength: 8 },
                  name: { type: "string", minLength: 2 },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "User registered",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    user: { $ref: "#/components/schemas/User" },
                    tokens: { $ref: "#/components/schemas/Tokens" },
                  },
                },
              },
            },
          },
          "409": {
            description: "User already exists",
          },
        },
      },
    },
    "/auth/login": {
      post: {
        summary: "Login with email and password",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Login successful",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    user: { $ref: "#/components/schemas/User" },
                    tokens: { $ref: "#/components/schemas/Tokens" },
                  },
                },
              },
            },
          },
          "401": {
            description: "Invalid credentials",
          },
        },
      },
    },
    "/auth/refresh": {
      post: {
        summary: "Refresh access token",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["refreshToken"],
                properties: {
                  refreshToken: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Tokens refreshed",
          },
          "401": {
            description: "Invalid or expired token",
          },
        },
      },
    },
    "/auth/me": {
      get: {
        summary: "Get current user",
        tags: ["Auth"],
        security: [{ Bearer: [] }],
        responses: {
          "200": {
            description: "User profile",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    user: { $ref: "#/components/schemas/User" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/accounts": {
      get: {
        summary: "List all accounts",
        tags: ["Accounts"],
        security: [{ Bearer: [] }],
        responses: {
          "200": {
            description: "List of accounts",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    accounts: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Account" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: "Create account",
        tags: ["Accounts"],
        security: [{ Bearer: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "type"],
                properties: {
                  name: { type: "string" },
                  type: { type: "string", enum: ["CHECKING", "SAVINGS", "CREDIT", "INVESTMENT", "CRYPTO", "CASH", "OTHER"] },
                  currency: { type: "string", default: "BRL" },
                  balance: { type: "number", default: 0 },
                  color: { type: "string", default: "#3B82F6" },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Account created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    account: { $ref: "#/components/schemas/Account" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/accounts/{id}": {
      get: {
        summary: "Get account by ID",
        tags: ["Accounts"],
        security: [{ Bearer: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": {
            description: "Account details",
          },
          "404": {
            description: "Account not found",
          },
        },
      },
      put: {
        summary: "Update account",
        tags: ["Accounts"],
        security: [{ Bearer: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": {
            description: "Account updated",
          },
        },
      },
      delete: {
        summary: "Delete account",
        tags: ["Accounts"],
        security: [{ Bearer: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": {
            description: "Account deleted",
          },
        },
      },
    },
    "/transactions": {
      get: {
        summary: "List transactions with filters",
        tags: ["Transactions"],
        security: [{ Bearer: [] }],
        parameters: [
          { name: "dateFrom", in: "query", schema: { type: "string", format: "date" } },
          { name: "dateTo", in: "query", schema: { type: "string", format: "date" } },
          { name: "categoryId", in: "query", schema: { type: "string" } },
          { name: "accountId", in: "query", schema: { type: "string" } },
          { name: "status", in: "query", schema: { type: "string", enum: ["PENDING", "CLEARED", "RECONCILED", "CANCELLED"] } },
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
        ],
        responses: {
          "200": {
            description: "List of transactions",
          },
        },
      },
    },
    "/transactions/stats": {
      get: {
        summary: "Get transaction statistics",
        tags: ["Transactions"],
        security: [{ Bearer: [] }],
        responses: {
          "200": {
            description: "Statistics",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    stats: {
                      type: "object",
                      properties: {
                        _sum: { type: "object", properties: { amount: { type: "number" } } },
                        _count: { type: "object", properties: { amount: { type: "integer" } } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/dashboard": {
      get: {
        summary: "Get dashboard data",
        tags: ["Reports"],
        security: [{ Bearer: [] }],
        responses: {
          "200": {
            description: "Dashboard overview",
          },
        },
      },
    },
  },
};

export { swaggerUi, swaggerDocument };