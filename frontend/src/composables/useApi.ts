import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import api from "../services/api";
import type { Ref } from "vue";

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  locale: string;
  currency: string;
  timezone: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export interface Account {
  id: string;
  name: string;
  type: string;
  currency: string;
  balance: number;
  initialBalance: number;
  color: string;
  icon?: string;
  institution?: string;
  isActive: boolean;
  isDefault: boolean;
  // Só preenchidos em contas do tipo CREDIT.
  closingDay?: number | null;
  dueDay?: number | null;
  creditLimit?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  currency: string;
  date: string;
  type: string;
  status: string;
  notes?: string;
  tags: string[];
  /** Marca visual escolhida no formulário. */
  icon?: string;
  color?: string;
/** Quando a despesa foi de fato quitada. */
  paidAt?: string;
  category?: { id: string; name: string; icon: string; color: string };
  account?: { id: string; name: string; type: string };
  toAccount?: { id: string; name: string };
  categoryId?: string;
  accountId: string;
  toAccountId?: string;
  createdAt: string;
  updatedAt: string;
}

/** Lembrete pessoal da tela inicial. */
export interface Note {
  id: string;
  content: string;
  color?: string | null;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: string;
  parentId?: string;
  children?: Category[];
  isActive: boolean;
  sortOrder: number;
}

export interface Budget {
  id: string;
  name: string;
  period: string;
  startDate: string;
  endDate?: string;
  amount: number;
  currency: string;
  categoryIds: string[];
  // Preenchido só no detalhe, onde o backend devolve as categorias resolvidas.
  categories?: Category[];
  alertAt: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Goal {
  id: string;
  name: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  targetDate?: string;
  type: string;
  accountId?: string;
  isActive: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecurringTransaction {
  id: string;
  accountId: string;
  toAccountId?: string;
  categoryId?: string;
  amount: number;
  currency: string;
  description: string;
  type: string;
  frequency: string;
  customCron?: string;
  startDate: string;
  endDate?: string;
  nextRunAt: string;
  lastRunAt?: string;
  isActive: boolean;
  skipWeekends: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Investment {
  id: string;
  accountId?: string;
  symbol: string;
  name: string;
  type: string;
  currency: string;
  quantity: number;
  averagePrice: number;
  currentPrice?: number;
  targetPrice?: number;
  stopLoss?: number;
  sector?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export type InvoiceStatus = "PAID" | "PARTIAL" | "OVERDUE" | "OPEN";
export type InvoiceUrgency = "paid" | "overdue" | "today" | "soon" | "upcoming";

/**
 * Fatura do cartão. `total` vem sempre recalculado pelo backend a partir das
 * compras na janela — por isso o `id` só aparece depois que a fatura é
 * materializada na listagem.
 */
export interface Invoice {
  id: string | null;
  reference: string;
  account: {
    id: string;
    name: string;
    color: string;
    currency: string;
    creditLimit: number | null;
    closingDay: number;
    dueDay: number;
    isConfigured: boolean;
  };
  periodStart: string;
  periodEnd: string;
  closingDate: string;
  dueDate: string;
  total: number;
  paidTotal: number;
  remaining: number;
  status: InvoiceStatus;
  daysUntilDue: number;
  urgency: InvoiceUrgency;
  paidAt: string | null;
  paymentTransactionId: string | null;
  transactionCount: number;
  transactions?: InvoicePurchase[];
}

export interface InvoicePurchase {
  id: string;
  description: string;
  amount: number;
  currency: string;
  date: string;
  notes?: string;
  tags: string[];
  category: { id: string; name: string; color: string } | null;
}

export interface InvoiceFilters {
  accountId?: string;
  reference?: string;
  monthsBack?: number;
  monthsForward?: number;
}

export interface TransactionFilters {
  dateFrom?: string;
  dateTo?: string;
  categoryId?: string;
  accountId?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// Query Keys
export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  accounts: {
    all: ["accounts"] as const,
    detail: (id: string) => ["accounts", id] as const,
    balanceHistory: (id: string) => ["accounts", id, "balance-history"] as const,
  },
  transactions: {
    all: ["transactions"] as const,
    list: (filters: Ref<TransactionFilters>) => ["transactions", "list", filters] as const,
    detail: (id: string) => ["transactions", id] as const,
    stats: ["transactions", "stats"] as const,
  },
  notes: {
    all: ["notes"] as const,
  },
  invoices: {
    all: ["invoices"] as const,
    list: (filters: Ref<InvoiceFilters>) => ["invoices", "list", filters] as const,
    detail: (id: string) => ["invoices", "detail", id] as const,
    // Recebe o ref direto (como `transactions.list`) para que mudar a
    // antecedência nas preferências dispare um refetch com a nova janela.
    upcoming: (days: number | Ref<number>) => ["invoices", "upcoming", days] as const,
  },
  categories: {
    all: ["categories"] as const,
    detail: (id: string) => ["categories", id] as const,
  },
  budgets: {
    all: ["budgets"] as const,
    detail: (id: string) => ["budgets", id] as const,
    progress: (id: string) => ["budgets", id, "progress"] as const,
    alerts: ["budgets", "alerts"] as const,
  },
  goals: {
    all: ["goals"] as const,
    detail: (id: string) => ["goals", id] as const,
  },
  recurring: {
    all: ["recurring"] as const,
    detail: (id: string) => ["recurring", id] as const,
    upcoming: ["recurring", "upcoming"] as const,
  },
  investments: {
    all: ["investments"] as const,
    detail: (id: string) => ["investments", id] as const,
    history: (id: string) => ["investments", id, "history"] as const,
    portfolio: ["investments", "portfolio"] as const,
    performance: ["investments", "performance"] as const,
    dividends: ["investments", "dividends"] as const,
  },
  reports: {
    dashboard: ["reports", "dashboard"] as const,
    cashflow: ["reports", "cashflow"] as const,
    byCategory: ["reports", "by-category"] as const,
    netWorth: ["reports", "net-worth"] as const,
    tax: ["reports", "tax"] as const,
  },
  settings: {
    profile: ["settings", "profile"] as const,
    preferences: ["settings", "preferences"] as const,
    security: ["settings", "security"] as const,
    apiKeys: ["settings", "api-keys"] as const,
    webhooks: ["settings", "webhooks"] as const,
  },
  family: {
    all: ["family"] as const,
    detail: (id: string) => ["family", id] as const,
  },
};

// Auth API
export function useAuth() {
  const login = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await api.post("/auth/login", credentials);
      return response.data;
    },
  });

  const register = useMutation({
    mutationFn: async (data: { email: string; password: string; name: string }) => {
      const response = await api.post("/auth/register", data);
      return response.data;
    },
  });

  const refresh = useMutation({
    mutationFn: async (refreshToken: string) => {
      const response = await api.post("/auth/refresh", { refreshToken });
      return response.data;
    },
  });

  const logout = useMutation({
    mutationFn: async (refreshToken: string) => {
      const response = await api.post("/auth/logout", { refreshToken });
      return response.data;
    },
  });

  return { login, register, refresh, logout };
}

export function useMe() {
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: async () => {
      const response = await api.get("/auth/me");
      return response.data.user as User;
    },
    retry: false,
  });
}

// Accounts API
export function useAccounts() {
  return useQuery({
    queryKey: queryKeys.accounts.all,
    queryFn: async () => {
      const response = await api.get("/accounts");
      return response.data.accounts as Account[];
    },
  });
}

export function useAccount(id: string) {
  return useQuery({
    queryKey: queryKeys.accounts.detail(id),
    queryFn: async () => {
      const response = await api.get(`/accounts/${id}`);
      return response.data.account as Account;
    },
    enabled: !!id,
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<Account>) => {
      const response = await api.post("/accounts", data);
      return response.data.account as Account;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
    },
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Account> }) => {
      const response = await api.put(`/accounts/${id}`, data);
      return response.data.account as Account;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.detail(data.id) });
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/accounts/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
    },
  });
}

export function useAccountBalanceHistory(id: string) {
  return useQuery({
    queryKey: queryKeys.accounts.balanceHistory(id),
    queryFn: async () => {
      const response = await api.get(`/accounts/${id}/balance-history`);
      return response.data.transactions;
    },
    enabled: !!id,
  });
}

// Transactions API
export function useTransactions(filters: Ref<TransactionFilters>) {
  return useQuery({
    queryKey: queryKeys.transactions.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters.value).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, String(value));
        }
      });
      const response = await api.get(`/transactions?${params.toString()}`);
      return response.data as PaginatedResponse<Transaction> & { transactions: Transaction[] };
    },
    placeholderData: (previousData) => previousData,
  });
}

export function useTransaction(id: string) {
  return useQuery({
    queryKey: queryKeys.transactions.detail(id),
    queryFn: async () => {
      const response = await api.get(`/transactions/${id}`);
      return response.data.transaction as Transaction;
    },
    enabled: !!id,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<Transaction>) => {
      const response = await api.post("/transactions", data);
      return response.data.transaction as Transaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Transaction> }) => {
      const response = await api.put(`/transactions/${id}`, data);
      return response.data.transaction as Transaction;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/transactions/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
    },
  });
}

export function useTransactionStats() {
  return useQuery({
    queryKey: queryKeys.transactions.stats,
    queryFn: async () => {
      const response = await api.get("/transactions/stats");
      return response.data.stats;
    },
  });
}

/** Paga uma despesa de cartão avulsa, direto da lista. */
export function usePayTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data?: { fromAccountId?: string; paidAt?: string } }) => {
      const response = await api.post(`/transactions/${id}/pay`, data ?? {});
      return response.data as { message: string; invoiceId: string; invoiceReference: string };
    },
    onSuccess: () => {
      // Mexe na transação, na fatura dela e nos saldos das contas.
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
    },
  });
}

export function useRevertTransactionPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/transactions/${id}/pay`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
    },
  });
}

// Notes API
export function useNotes() {
  return useQuery({
    queryKey: queryKeys.notes.all,
    queryFn: async () => {
      const response = await api.get("/notes");
      return response.data.notes as Note[];
    },
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Note>) => {
      const response = await api.post("/notes", data);
      return response.data.note as Note;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notes.all });
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Note> }) => {
      const response = await api.put(`/notes/${id}`, data);
      return response.data.note as Note;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notes.all });
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/notes/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notes.all });
    },
  });
}

// Invoices API
export function useInvoices(filters: Ref<InvoiceFilters>) {
  return useQuery({
    queryKey: queryKeys.invoices.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters.value).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, String(value));
        }
      });
      const response = await api.get(`/invoices?${params.toString()}`);
      return response.data.invoices as Invoice[];
    },
    placeholderData: (previousData) => previousData,
  });
}

/** Fatura única com as compras do período. */
export function useInvoice(id: Ref<string> | string) {
  const invoiceId = typeof id === "string" ? id : id.value;
  return useQuery({
    queryKey: queryKeys.invoices.detail(invoiceId),
    queryFn: async () => {
      const response = await api.get(`/invoices/${invoiceId}`);
      return response.data.invoice as Invoice;
    },
    enabled: !!invoiceId,
  });
}

/** Faturas não pagas que vencem em breve — a fonte dos lembretes. */
export function useUpcomingInvoices(days: Readonly<Ref<number>>) {
  return useQuery({
    queryKey: queryKeys.invoices.upcoming(days),
    queryFn: async () => {
      const response = await api.get(`/invoices/upcoming?days=${days.value}`);
      return response.data.invoices as Invoice[];
    },
    // Lembrete de fatura não pode ficar preso no cache por muito tempo.
    staleTime: 5 * 60 * 1000,
    refetchInterval: 30 * 60 * 1000,
  });
}

export function usePayInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data?: { amount?: number; paidAt?: string; fromAccountId?: string; description?: string };
    }) => {
      const response = await api.post(`/invoices/${id}/pay`, data ?? {});
      return response.data as { invoice: Invoice; message: string };
    },
    onSuccess: () => {
      // O pagamento mexe na fatura, nos lançamentos e nos saldos das contas.
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
    },
  });
}

export function useRevertInvoicePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/invoices/${id}/payment`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
    },
  });
}

// Categories API
export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: async () => {
      const response = await api.get("/categories");
      return response.data.categories as Category[];
    },
  });
}

export function useCategory(id: string) {
  return useQuery({
    queryKey: queryKeys.categories.detail(id),
    queryFn: async () => {
      const response = await api.get(`/categories/${id}`);
      return response.data.category as Category;
    },
    enabled: !!id,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<Category>) => {
      const response = await api.post("/categories", data);
      return response.data.category as Category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Category> }) => {
      const response = await api.put(`/categories/${id}`, data);
      return response.data.category as Category;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.detail(data.id) });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/categories/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
  });
}

// Budgets API
export function useBudgets() {
  return useQuery({
    queryKey: queryKeys.budgets.all,
    queryFn: async () => {
      const response = await api.get("/budgets");
      return response.data.budgets as Budget[];
    },
  });
}

export function useBudget(id: string) {
  return useQuery({
    queryKey: queryKeys.budgets.detail(id),
    queryFn: async () => {
      const response = await api.get(`/budgets/${id}`);
      return response.data.budget as Budget;
    },
    enabled: !!id,
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<Budget>) => {
      const response = await api.post("/budgets", data);
      return response.data.budget as Budget;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets.all });
    },
  });
}

export function useUpdateBudget() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Budget> }) => {
      const response = await api.put(`/budgets/${id}`, data);
      return response.data.budget as Budget;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets.detail(data.id) });
    },
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/budgets/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets.all });
    },
  });
}

// Goals API
export function useGoals() {
  return useQuery({
    queryKey: queryKeys.goals.all,
    queryFn: async () => {
      const response = await api.get("/goals");
      return response.data.goals as Goal[];
    },
  });
}

export function useGoal(id: string) {
  return useQuery({
    queryKey: queryKeys.goals.detail(id),
    queryFn: async () => {
      const response = await api.get(`/goals/${id}`);
      return response.data.goal as Goal;
    },
    enabled: !!id,
  });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<Goal>) => {
      const response = await api.post("/goals", data);
      return response.data.goal as Goal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.all });
    },
  });
}

export function useUpdateGoal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Goal> }) => {
      const response = await api.put(`/goals/${id}`, data);
      return response.data.goal as Goal;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.detail(data.id) });
    },
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/goals/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.all });
    },
  });
}

// Recurring Transactions API
export function useRecurringTransactions() {
  return useQuery({
    queryKey: queryKeys.recurring.all,
    queryFn: async () => {
      const response = await api.get("/recurring");
      return response.data.recurring as RecurringTransaction[];
    },
  });
}

export function useRecurringTransaction(id: string) {
  return useQuery({
    queryKey: queryKeys.recurring.detail(id),
    queryFn: async () => {
      const response = await api.get(`/recurring/${id}`);
      return response.data.recurring as RecurringTransaction;
    },
    enabled: !!id,
  });
}

export function useCreateRecurring() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<RecurringTransaction>) => {
      const response = await api.post("/recurring", data);
      return response.data.recurring as RecurringTransaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recurring.all });
    },
  });
}

export function useUpdateRecurring() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<RecurringTransaction> }) => {
      const response = await api.put(`/recurring/${id}`, data);
      return response.data.recurring as RecurringTransaction;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recurring.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.recurring.detail(data.id) });
    },
  });
}

export function useDeleteRecurring() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/recurring/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recurring.all });
    },
  });
}

// Investments API
export function useInvestments() {
  return useQuery({
    queryKey: queryKeys.investments.all,
    queryFn: async () => {
      const response = await api.get("/investments");
      return response.data.investments as Investment[];
    },
  });
}

export function useInvestment(id: string) {
  return useQuery({
    queryKey: queryKeys.investments.detail(id),
    queryFn: async () => {
      const response = await api.get(`/investments/${id}`);
      return response.data.investment as Investment;
    },
    enabled: !!id,
  });
}

export function useCreateInvestment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<Investment>) => {
      const response = await api.post("/investments", data);
      return response.data.investment as Investment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.investments.all });
    },
  });
}

export function useUpdateInvestment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Investment> }) => {
      const response = await api.put(`/investments/${id}`, data);
      return response.data.investment as Investment;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.investments.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.investments.detail(data.id) });
    },
  });
}

export function useDeleteInvestment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/investments/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.investments.all });
    },
  });
}

// Reports API
export function useDashboardReport() {
  return useQuery({
    queryKey: queryKeys.reports.dashboard,
    queryFn: async () => {
      const response = await api.get("/reports/dashboard");
      return response.data;
    },
  });
}

export function useCashflowReport() {
  return useQuery({
    queryKey: queryKeys.reports.cashflow,
    queryFn: async () => {
      const response = await api.get("/reports/cashflow");
      return response.data;
    },
  });
}

// Auth mutations
export function useLogin() {
  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await api.post("/auth/login", credentials);
      return response.data;
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: async (data: { email: string; password: string; name: string }) => {
      const response = await api.post("/auth/register", data);
      return response.data;
    },
  });
}

export function useRefreshToken() {
  return useMutation({
    mutationFn: async (refreshToken: string) => {
      const response = await api.post("/auth/refresh", { refreshToken });
      return response.data;
    },
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: async (refreshToken: string) => {
      const response = await api.post("/auth/logout", { refreshToken });
      return response.data;
    },
  });
}