import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useLogin, useRegister, useRefreshToken, useLogout, useMe } from "../composables/useApi";

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
}

export const useAuthStore = defineStore("auth", () => {
  // State
  const user = ref<User | null>(null);
  const accessToken = ref<string | null>(localStorage.getItem("accessToken"));
  const refreshToken = ref<string | null>(localStorage.getItem("refreshToken"));
  const isAuthenticated = ref(!!localStorage.getItem("accessToken"));
  const loading = ref(false);

  // Computed
  const isAdmin = computed(() => user.value?.role === "admin");

  // API Composables
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const refreshMutation = useRefreshToken();
  const logoutMutation = useLogout();
  const meQuery = useMe();

  // Sync user from query
  const syncUser = () => {
    if (meQuery.data.value) {
      user.value = meQuery.data.value;
      isAuthenticated.value = true;
    }
  };

  // Actions
  async function login(email: string, password: string) {
    loading.value = true;
    try {
      await loginMutation.mutateAsync({ email, password });
      
      // Sync tokens from mutation result
      if (loginMutation.data.value) {
        const { user: userData, tokens } = loginMutation.data.value;
        user.value = userData;
        accessToken.value = tokens.accessToken;
        refreshToken.value = tokens.refreshToken;
        isAuthenticated.value = true;
        
        localStorage.setItem("accessToken", tokens.accessToken);
        localStorage.setItem("refreshToken", tokens.refreshToken);
      }
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || error.message || "Login failed" };
    } finally {
      loading.value = false;
    }
  }

  async function register(email: string, password: string, name: string) {
    loading.value = true;
    try {
      await registerMutation.mutateAsync({ email, password, name });
      
      if (registerMutation.data.value) {
        const { user: userData, tokens } = registerMutation.data.value;
        user.value = userData;
        accessToken.value = tokens.accessToken;
        refreshToken.value = tokens.refreshToken;
        isAuthenticated.value = true;
        
        localStorage.setItem("accessToken", tokens.accessToken);
        localStorage.setItem("refreshToken", tokens.refreshToken);
      }
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || error.message || "Registration failed" };
    } finally {
      loading.value = false;
    }
  }

  async function logout() {
    try {
      if (refreshToken.value) {
        await logoutMutation.mutateAsync(refreshToken.value);
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      user.value = null;
      accessToken.value = null;
      refreshToken.value = null;
      isAuthenticated.value = false;
      
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      
      // Invalidate all queries
      // This will be handled by the query client
    }
  }

  async function refresh() {
    if (!refreshToken.value) return false;
    
    try {
      await refreshMutation.mutateAsync(refreshToken.value);
      
      if (refreshMutation.data.value) {
        const { tokens } = refreshMutation.data.value;
        accessToken.value = tokens.accessToken;
        refreshToken.value = tokens.refreshToken;
        
        localStorage.setItem("accessToken", tokens.accessToken);
        localStorage.setItem("refreshToken", tokens.refreshToken);
      }
      
      return true;
    } catch (error) {
      await logout();
      return false;
    }
  }

  async function getMe() {
    try {
      await meQuery.refetch();
      syncUser();
    } catch (error) {
      await logout();
    }
  }

  // Initialize auth on store creation
  if (isAuthenticated.value && !user.value) {
    getMe();
  }

  return {
    // State
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    loading,
    
    // Getters
    isAdmin,
    
    // Actions
    login,
    register,
    logout,
    refresh,
    getMe,
    syncUser,
  };
});