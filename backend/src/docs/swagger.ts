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
          closingDay: { type: "integer", nullable: true, description: "Cartão: dia do fechamento (1-31)" },
          dueDay: { type: "integer", nullable: true, description: "Cartão: dia do vencimento (1-31)" },
          creditLimit: { type: "number", nullable: true, description: "Cartão: limite total" },
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
          icon: { type: "string", nullable: true, description: "Ícone escolhido para a despesa" },
          color: { type: "string", nullable: true, example: "#EF4444" },
          paidAt: {
            type: "string",
            format: "date-time",
            nullable: true,
            description: "Quando a despesa foi quitada (conta a pagar ou compra de cartão)",
          },
        },
      },
      Invoice: {
        type: "object",
        description:
          "Fatura de cartão. O total é sempre recalculado a partir das compras na janela; a linha guarda apenas o pagamento.",
        properties: {
          id: { type: "string", nullable: true },
          reference: { type: "string", example: "2026-10", description: "Mês de fechamento (YYYY-MM)" },
          account: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              currency: { type: "string" },
              creditLimit: { type: "number", nullable: true },
              closingDay: { type: "integer" },
              dueDay: { type: "integer" },
              isConfigured: { type: "boolean" },
            },
          },
          periodStart: { type: "string", format: "date-time" },
          periodEnd: { type: "string", format: "date-time" },
          closingDate: { type: "string", format: "date-time" },
          dueDate: { type: "string", format: "date-time" },
          total: { type: "number" },
          paidTotal: { type: "number" },
          remaining: { type: "number" },
          status: { type: "string", enum: ["PAID", "PARTIAL", "OVERDUE", "OPEN"] },
          daysUntilDue: { type: "integer" },
          urgency: { type: "string", enum: ["paid", "overdue", "today", "soon", "upcoming"] },
          paidAt: { type: "string", format: "date-time", nullable: true },
          paymentTransactionId: { type: "string", nullable: true },
          transactionCount: { type: "integer" },
          transactions: { type: "array", items: { $ref: "#/components/schemas/Transaction" } },
        },
      },
      Note: {
        type: "object",
        description: "Lembrete pessoal da tela inicial (post-it). Sem efeito financeiro.",
        properties: {
          id: { type: "string" },
          content: { type: "string", maxLength: 1000 },
          color: { type: "string", nullable: true, example: "#FDE68A" },
          pinned: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
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
    "/transactions/{id}/pay": {
      post: {
        summary: "Pay a single credit-card purchase",
        description:
          "Paga uma despesa avulsa direto da lista. Gera a transferência, marca a compra como quitada e soma o valor na fatura correspondente (calculada pela data da compra).",
        tags: ["Transactions"],
        security: [{ Bearer: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  fromAccountId: { type: "string", description: "Padrão: conta padrão do usuário" },
                  paidAt: { type: "string", format: "date-time" },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Purchase paid" },
          "400": { description: "Not a credit-card expense, or already paid" },
          "404": { description: "Transaction not found" },
        },
      },
      delete: {
        summary: "Undo a purchase payment",
        description: "Apaga a transferência, reabre a compra e desconta o valor da fatura.",
        tags: ["Transactions"],
        security: [{ Bearer: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Payment reverted" },
          "400": { description: "Purchase has no payment registered" },
          "404": { description: "Transaction not found" },
        },
      },
    },
    "/notes": {
      get: {
        summary: "List personal notes",
        description: "Lembretes da tela inicial, fixadas primeiro.",
        tags: ["Notes"],
        security: [{ Bearer: [] }],
        responses: {
          "200": {
            description: "List of notes",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { notes: { type: "array", items: { $ref: "#/components/schemas/Note" } } },
                },
              },
            },
          },
        },
      },
      post: {
        summary: "Create a note",
        tags: ["Notes"],
        security: [{ Bearer: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["content"],
                properties: {
                  content: { type: "string", maxLength: 1000 },
                  color: { type: "string", nullable: true, example: "#FDE68A" },
                  pinned: { type: "boolean", default: false },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Note created",
            content: {
              "application/json": {
                schema: { type: "object", properties: { note: { $ref: "#/components/schemas/Note" } } },
              },
            },
          },
          "400": { description: "Empty note, or the 50-note limit was reached" },
        },
      },
    },
    "/notes/{id}": {
      put: {
        summary: "Update a note",
        tags: ["Notes"],
        security: [{ Bearer: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  content: { type: "string", maxLength: 1000 },
                  color: { type: "string", nullable: true },
                  pinned: { type: "boolean" },
                },
              },
            },
          },
        },
        responses: { "200": { description: "Note updated" }, "404": { description: "Note not found" } },
      },
      delete: {
        summary: "Delete a note",
        tags: ["Notes"],
        security: [{ Bearer: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Note deleted" }, "404": { description: "Note not found" } },
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
    "/invoices": {
      get: {
        summary: "List credit card invoices",
        description:
          "Faturas agrupadas pela janela de fechamento do cartão. Por padrão traz 3 meses anteriores, a fatura em aberto e a próxima.",
        tags: ["Invoices"],
        security: [{ Bearer: [] }],
        parameters: [
          { name: "accountId", in: "query", schema: { type: "string" }, description: "Filtra por um cartão" },
          { name: "reference", in: "query", schema: { type: "string" }, description: "Filtra por mês de fechamento (YYYY-MM)" },
          { name: "monthsBack", in: "query", schema: { type: "integer", default: 3, minimum: 0, maximum: 24 } },
          { name: "monthsForward", in: "query", schema: { type: "integer", default: 1, minimum: 0, maximum: 24 } },
        ],
        responses: {
          "200": {
            description: "List of invoices",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    invoices: { type: "array", items: { $ref: "#/components/schemas/Invoice" } },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/invoices/upcoming": {
      get: {
        summary: "Invoices due soon (drives reminders)",
        description: "Somente faturas não pagas que vencem dentro da janela informada.",
        tags: ["Invoices"],
        security: [{ Bearer: [] }],
        parameters: [
          { name: "days", in: "query", schema: { type: "integer", default: 7, minimum: 0, maximum: 60 } },
          { name: "accountId", in: "query", schema: { type: "string" } },
        ],
        responses: {
          "200": {
            description: "Upcoming invoices",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    invoices: { type: "array", items: { $ref: "#/components/schemas/Invoice" } },
                    withinDays: { type: "integer" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/invoices/{id}": {
      get: {
        summary: "Get one invoice with its purchases",
        tags: ["Invoices"],
        security: [{ Bearer: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": {
            description: "Invoice details",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { invoice: { $ref: "#/components/schemas/Invoice" } },
                },
              },
            },
          },
          "404": { description: "Invoice not found" },
        },
      },
    },
    "/invoices/{id}/pay": {
      post: {
        summary: "Pay an invoice",
        description:
          "Gera uma transferência da conta de origem para o cartão e devolve a dívida a zero. Sem `amount`, paga o saldo restante; sem `fromAccountId`, usa a conta padrão.",
        tags: ["Invoices"],
        security: [{ Bearer: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  amount: { type: "number", description: "Padrão: saldo restante" },
                  paidAt: { type: "string", format: "date-time" },
                  fromAccountId: { type: "string", description: "Conta que paga a fatura" },
                  description: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Invoice paid",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    invoice: { type: "object" },
                    payment: { $ref: "#/components/schemas/Transaction" },
                    message: { type: "string" },
                  },
                },
              },
            },
          },
          "400": { description: "Fatura já quitada ou conta de origem inválida" },
          "404": { description: "Invoice not found" },
        },
      },
    },
    "/invoices/{id}/payment": {
      delete: {
        summary: "Undo an invoice payment",
        description: "Apaga a transferência gerada, devolve o valor à conta de origem e reabre a fatura.",
        tags: ["Invoices"],
        security: [{ Bearer: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Payment reverted" },
          "400": { description: "Invoice has no payment registered" },
          "404": { description: "Invoice not found" },
        },
      },
    },
  },
};

export { swaggerUi, swaggerDocument };