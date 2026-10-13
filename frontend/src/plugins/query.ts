import { QueryClient, VueQueryPlugin } from "@tanstack/vue-query";
import type { App } from "vue";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
  },
});

export function setupQueryClient(app: App) {
  app.use(VueQueryPlugin, { queryClient });
}

export { queryClient };