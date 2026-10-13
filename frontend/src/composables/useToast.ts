import { ref, computed } from "vue";

export interface Toast {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title?: string;
  message: string;
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
}

const state = ref<ToastState>({
  toasts: [],
});

let toastId = 0;

function generateId() {
  return `toast-${Date.now()}-${toastId++}`;
}

function addToast(toast: Omit<Toast, "id">) {
  const id = generateId();
  const newToast: Toast = {
    ...toast,
    id,
    duration: toast.duration ?? 5000,
  };
  
  state.value.toasts.push(newToast);
  
  // Auto-remove after duration
  if (newToast.duration && newToast.duration > 0) {
    setTimeout(() => {
      removeToast(id);
    }, newToast.duration);
  }
  
  return id;
}

function removeToast(id: string) {
  const index = state.value.toasts.findIndex((t) => t.id === id);
  if (index !== -1) {
    state.value.toasts.splice(index, 1);
  }
}

function removeAllToasts() {
  state.value.toasts = [];
}

export function useToast() {
  const toasts = computed(() => state.value.toasts);
  
  function success(message: string, title?: string, duration?: number) {
    return addToast({ type: "success", title, message, duration });
  }
  
  function error(message: string, title?: string, duration?: number) {
    return addToast({ type: "error", title, message, duration: duration ?? 8000 });
  }
  
  function warning(message: string, title?: string, duration?: number) {
    return addToast({ type: "warning", title, message, duration });
  }
  
  function info(message: string, title?: string, duration?: number) {
    return addToast({ type: "info", title, message, duration });
  }
  
  function remove(id: string) {
    const index = state.value.toasts.findIndex((t) => t.id === id);
    if (index !== -1) {
      state.value.toasts.splice(index, 1);
    }
  }
  
  function clear() {
    state.value.toasts = [];
  }
  
  return {
    toasts,
    addToast,
    removeToast: remove,
    removeAll: clear,
    success,
    error,
    warning,
    info,
  };
}

export type { Toast };