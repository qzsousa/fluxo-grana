import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";
import LoginPage from "../pages/auth/Login.vue";
import RegisterPage from "../pages/auth/Register.vue";
import DashboardPage from "../pages/dashboard/Dashboard.vue";
import AccountsList from "../pages/accounts/AccountsList.vue";
import TransactionsList from "../pages/transactions/TransactionsList.vue";

const routes = [
  {
    path: "/",
    redirect: "/dashboard",
  },
  {
    path: "/login",
    component: LoginPage,
    meta: { requiresAuth: false, layout: "auth" },
  },
  {
    path: "/register",
    component: RegisterPage,
    meta: { requiresAuth: false, layout: "auth" },
  },
  {
    path: "/forgot-password",
    component: () => import("../pages/auth/ForgotPassword.vue"),
    meta: { requiresAuth: false, layout: "auth" },
  },
  {
    path: "/reset-password/:token",
    component: () => import("../pages/auth/ResetPassword.vue"),
    meta: { requiresAuth: false, layout: "auth" },
  },
  {
    path: "/verify-email/:token",
    component: () => import("../pages/auth/VerifyEmail.vue"),
    meta: { requiresAuth: false, layout: "auth" },
  },
  {
    path: "/dashboard",
    component: DashboardPage,
    meta: { requiresAuth: true, layout: "default" },
  },
  {
    path: "/accounts",
    component: AccountsList,
    meta: { requiresAuth: true, layout: "default" },
  },
  {
    path: "/accounts/new",
    component: () => import("../pages/accounts/AccountForm.vue"),
    meta: { requiresAuth: true, layout: "default" },
  },
  {
    path: "/accounts/:id",
    component: () => import("../pages/accounts/AccountDetail.vue"),
    meta: { requiresAuth: true, layout: "default" },
  },
  {
    path: "/accounts/:id/edit",
    component: () => import("../pages/accounts/AccountForm.vue"),
    meta: { requiresAuth: true, layout: "default" },
  },
  {
    path: "/transactions",
    component: TransactionsList,
    meta: { requiresAuth: true, layout: "default" },
  },
  {
    path: "/transactions/new",
    component: () => import("../pages/transactions/TransactionForm.vue"),
    meta: { requiresAuth: true, layout: "default" },
  },
  {
    path: "/transactions/:id",
    component: () => import("../pages/transactions/TransactionDetail.vue"),
    meta: { requiresAuth: true, layout: "default" },
  },
  {
    path: "/transactions/:id/edit",
    component: () => import("../pages/transactions/TransactionForm.vue"),
    meta: { requiresAuth: true, layout: "default" },
  },
  {
    path: "/transactions/import",
    component: () => import("../pages/transactions/Import.vue"),
    meta: { requiresAuth: true, layout: "default" },
  },
  {
    path: "/categories",
    component: () => import("../pages/categories/CategoriesList.vue"),
    meta: { requiresAuth: true, layout: "default" },
  },
  {
    path: "/categories/new",
    component: () => import("../pages/categories/CategoryForm.vue"),
    meta: { requiresAuth: true, layout: "default" },
  },
  {
    path: "/categories/:id/edit",
    component: () => import("../pages/categories/CategoryForm.vue"),
    meta: { requiresAuth: true, layout: "default" },
  },
  {
    path: "/budgets",
    component: () => import("../pages/budgets/BudgetsList.vue"),
    meta: { requiresAuth: true, layout: "default" },
  },
  {
    path: "/budgets/new",
    component: () => import("../pages/budgets/BudgetForm.vue"),
    meta: { requiresAuth: true, layout: "default" },
  },
  {
    path: "/budgets/:id",
    component: () => import("../pages/budgets/BudgetDetail.vue"),
    meta: { requiresAuth: true, layout: "default" },
  },
  {
    path: "/goals",
    component: () => import("../pages/goals/GoalsList.vue"),
    meta: { requiresAuth: true, layout: "default" },
  },
  {
    path: "/goals/new",
    component: () => import("../pages/goals/GoalForm.vue"),
    meta: { requiresAuth: true, layout: "default" },
  },
  {
    path: "/goals/:id",
    component: () => import("../pages/goals/GoalDetail.vue"),
    meta: { requiresAuth: true, layout: "default" },
  },
  {
    path: "/recurring",
    component: () => import("../pages/recurring/RecurringList.vue"),
    meta: { requiresAuth: true, layout: "default" },
  },
  {
    path: "/recurring/new",
    component: () => import("../pages/recurring/RecurringForm.vue"),
    meta: { requiresAuth: true, layout: "default" },
  },
  {
    path: "/recurring/:id/edit",
    component: () => import("../pages/recurring/RecurringForm.vue"),
    meta: { requiresAuth: true, layout: "default" },
  },
  {
    path: "/investments",
    component: () => import("../pages/investments/InvestmentsList.vue"),
    meta: { requiresAuth: true, layout: "default" },
  },
  {
    path: "/investments/new",
    component: () => import("../pages/investments/InvestmentForm.vue"),
    meta: { requiresAuth: true, layout: "default" },
  },
  {
    path: "/investments/:id",
    component: () => import("../pages/investments/InvestmentDetail.vue"),
    meta: { requiresAuth: true, layout: "default" },
  },
  {
    path: "/reports",
    component: () => import("../pages/reports/ReportsDashboard.vue"),
    meta: { requiresAuth: true, layout: "default" },
  },
  {
    path: "/reports/cashflow",
    component: () => import("../pages/reports/CashflowReport.vue"),
    meta: { requiresAuth: true, layout: "default" },
  },
  {
    path: "/reports/net-worth",
    component: () => import("../pages/reports/NetWorthReport.vue"),
    meta: { requiresAuth: true, layout: "default" },
  },
  {
    path: "/reports/tax",
    component: () => import("../pages/reports/TaxReport.vue"),
    meta: { requiresAuth: true, layout: "default" },
  },
  {
    path: "/settings",
    component: () => import("../pages/settings/Settings.vue"),
    meta: { requiresAuth: true, layout: "default" },
  },
  {
    path: "/settings/profile",
    component: () => import("../pages/settings/ProfileSettings.vue"),
    meta: { requiresAuth: true, layout: "default" },
  },
  {
    path: "/settings/preferences",
    component: () => import("../pages/settings/PreferencesSettings.vue"),
    meta: { requiresAuth: true, layout: "default" },
  },
  {
    path: "/settings/security",
    component: () => import("../pages/settings/SecuritySettings.vue"),
    meta: { requiresAuth: true, layout: "default" },
  },
  {
    path: "/settings/family",
    component: () => import("../pages/settings/FamilySettings.vue"),
    meta: { requiresAuth: true, layout: "default" },
  },
  {
    path: "/settings/api-keys",
    component: () => import("../pages/settings/ApiKeysSettings.vue"),
    meta: { requiresAuth: true, layout: "default" },
  },
  {
    path: "/settings/webhooks",
    component: () => import("../pages/settings/WebhooksSettings.vue"),
    meta: { requiresAuth: true, layout: "default" },
  },
  {
    path: "/settings/import-export",
    component: () => import("../pages/settings/ImportExportSettings.vue"),
    meta: { requiresAuth: true, layout: "default" },
  },
  {
    path: "/family",
    component: () => import("../pages/family/FamilyList.vue"),
    meta: { requiresAuth: true, layout: "default" },
  },
  {
    path: "/family/invite",
    component: () => import("../pages/family/FamilyInvite.vue"),
    meta: { requiresAuth: true, layout: "default" },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const isLoggedIn = authStore.isAuthenticated;
  
  if (to.meta.requiresAuth && !isLoggedIn) {
    next({ path: "/login", query: { redirect: to.fullPath } });
  } else if (!to.meta.requiresAuth && isLoggedIn && (to.path === "/login" || to.path === "/register")) {
    next({ path: "/dashboard" });
  } else {
    next();
  }
});

export default router;