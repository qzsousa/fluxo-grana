import { z } from "zod";

// Auth Schemas
export const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters").max(128, "Password too long"),
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name too long"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export const logoutSchema = z.object({
  refreshToken: z.string().optional(),
});

// User Schemas
export const updateMeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name too long").optional(),
  locale: z.string().min(2).max(10).optional(),
  timezone: z.string().min(1).max(50).optional(),
});

// Account Schemas
export const createAccountSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  type: z.enum(["CHECKING", "SAVINGS", "CREDIT", "INVESTMENT", "CRYPTO", "CASH", "OTHER"]),
  currency: z.string().length(3, "Currency must be 3 characters (ISO 4217)").default("BRL"),
  balance: z.number().default(0),
  initialBalance: z.number().default(0),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex color").default("#3B82F6"),
  icon: z.string().optional(),
  institution: z.string().max(100).optional(),
});

export const updateAccountSchema = createAccountSchema.partial().extend({
  isActive: z.boolean().optional(),
});

// Transaction Schemas
export const createTransactionSchema = z.object({
  accountId: z.string().cuid("Invalid account ID"),
  amount: z.number().positive("Amount must be positive"),
  description: z.string().min(1, "Description is required").max(500, "Description too long"),
  categoryId: z.string().cuid("Invalid category ID").optional(),
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER", "INVESTMENT_BUY", "INVESTMENT_SELL", "DIVIDEND", "INTEREST", "FEE"]),
  currency: z.string().length(3, "Currency must be 3 characters (ISO 4217)").default("BRL"),
  exchangeRate: z.number().positive().optional(),
  date: z.string().datetime("Invalid date format").optional(),
  notes: z.string().max(2000).optional(),
  tags: z.array(z.string().max(50)).default([]),
  toAccountId: z.string().cuid("Invalid destination account ID").optional(),
});

export const updateTransactionSchema = createTransactionSchema.partial();

export const transactionFiltersSchema = z.object({
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  categoryId: z.string().cuid().optional(),
  accountId: z.string().cuid().optional(),
  status: z.enum(["PENDING", "CLEARED", "RECONCILED", "CANCELLED"]).optional(),
  search: z.string().max(200).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// Category Schemas
export const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  icon: z.string().min(1, "Icon is required").max(50, "Icon too long"),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex color").default("#6366F1"),
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER", "INVESTMENT"]),
  parentId: z.string().cuid("Invalid parent category ID").optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export const reorderCategoriesSchema = z.object({
  categories: z.array(z.object({
    id: z.string().cuid(),
    sortOrder: z.number().int().nonnegative(),
  })),
});

// Budget Schemas
export const createBudgetSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  period: z.enum(["MONTHLY", "QUARTERLY", "YEARLY", "CUSTOM"]),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  amount: z.number().positive("Amount must be positive"),
  currency: z.string().length(3).default("BRL"),
  categoryIds: z.array(z.string().cuid()).min(1, "At least one category required"),
  alertAt: z.number().int().min(1).max(100).default(80),
});

export const updateBudgetSchema = createBudgetSchema.partial();

// Goal Schemas
export const createGoalSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  description: z.string().max(1000).optional(),
  targetAmount: z.number().positive("Target amount must be positive"),
  currentAmount: z.number().nonnegative().default(0),
  currency: z.string().length(3).default("BRL"),
  targetDate: z.string().datetime().optional(),
  type: z.enum(["SAVINGS", "DEBT_PAYOFF", "INVESTMENT", "EMERGENCY_FUND", "CUSTOM"]),
  accountId: z.string().cuid().optional(),
});

export const updateGoalSchema = createGoalSchema.partial();

export const contributeGoalSchema = z.object({
  amount: z.number().positive("Contribution amount must be positive"),
});

// Recurring Transaction Schemas
export const createRecurringSchema = z.object({
  accountId: z.string().cuid("Invalid account ID"),
  toAccountId: z.string().cuid("Invalid destination account ID").optional(),
  categoryId: z.string().cuid("Invalid category ID").optional(),
  amount: z.number().positive("Amount must be positive"),
  currency: z.string().length(3).default("BRL"),
  description: z.string().min(1, "Description is required").max(500, "Description too long"),
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER", "INVESTMENT_BUY", "INVESTMENT_SELL", "DIVIDEND", "INTEREST", "FEE"]),
  frequency: z.enum(["DAILY", "WEEKLY", "BIWEEKLY", "MONTHLY", "QUARTERLY", "YEARLY", "CUSTOM"]),
  customCron: z.string().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  skipWeekends: z.boolean().default(false),
});

export const updateRecurringSchema = createRecurringSchema.partial();

// Investment Schemas
export const createInvestmentSchema = z.object({
  accountId: z.string().cuid().optional(),
  symbol: z.string().min(1, "Symbol is required").max(20, "Symbol too long"),
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  type: z.enum(["STOCK", "ETF", "FUND", "CRYPTO", "FIXED_INCOME", "REAL_ESTATE", "OTHER"]),
  currency: z.string().length(3).default("BRL"),
  quantity: z.number().positive("Quantity must be positive"),
  averagePrice: z.number().positive("Average price must be positive"),
  currentPrice: z.number().positive().optional(),
  targetPrice: z.number().positive().optional(),
  stopLoss: z.number().positive().optional(),
  sector: z.string().max(100).optional(),
});

export const updateInvestmentSchema = createInvestmentSchema.partial();

// Family Schemas
export const createFamilySchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
});

export const inviteFamilyMemberSchema = z.object({
  email: z.string().email("Invalid email format"),
  role: z.enum(["ADMIN", "MEMBER", "VIEWER"]).default("MEMBER"),
});

export const updateFamilyMemberSchema = z.object({
  role: z.enum(["ADMIN", "MEMBER", "VIEWER"]),
});

// API Key Schemas
export const createApiKeySchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  permissions: z.array(z.string()).min(1, "At least one permission required"),
  expiresAt: z.string().datetime().optional(),
});

// Webhook Schemas
export const createWebhookSchema = z.object({
  url: z.string().url("Invalid URL format"),
  events: z.array(z.string()).min(1, "At least one event required"),
});

export const updateWebhookSchema = createWebhookSchema.partial();

// Validation Middleware
export function validate(schema: z.ZodSchema) {
  return (req: any, res: any, next: any) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: result.error.flatten().fieldErrors,
      });
    }
    req.body = result.data;
    next();
  };
}

export function validateQuery(schema: z.ZodSchema) {
  return (req: any, res: any, next: any) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: result.error.flatten().fieldErrors,
      });
    }
    req.query = result.data;
    next();
  };
}

export function validateParams(schema: z.ZodSchema) {
  return (req: any, res: any, next: any) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: result.error.flatten().fieldErrors,
      });
    }
    req.params = result.data;
    next();
  };
}

// Common param schemas
export const idParamSchema = z.object({
  id: z.string().cuid("Invalid ID format"),
});