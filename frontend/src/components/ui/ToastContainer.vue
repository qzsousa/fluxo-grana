<template>
  <div class="fixed bottom-4 right-4 z-[var(--z-toast)] flex flex-col gap-3 pointer-events-none">
    <Toast
      v-for="toast in toasts"
      :key="toast.id"
      :id="toast.id"
      :type="toast.type"
      :title="toast.title"
      :message="toast.message"
      :duration="toast.duration"
      @close="removeToast"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import Toast from "./Toast.vue";

interface ToastItem {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title?: string;
  message: string;
  duration?: number;
}

const toasts = ref<ToastItem[]>([]);

let toastId = 0;

function generateId(): string {
  return `toast-${++toastId}-${Date.now()}`;
}

function showToast(toast: Omit<ToastItem, "id">) {
  const id = generateId();
  toasts.value.push({ ...toast, id });
  return id;
}

function removeToast(id: string) {
  const index = toasts.value.findIndex((t) => t.id === id);
  if (index !== -1) {
    toasts.value.splice(index, 1);
  }
}

const useToast = () => ({
  success: (message: string, title?: string, duration?: number) =>
    showToast({ type: "success", message, title, duration }),
  error: (message: string, title?: string, duration?: number) =>
    showToast({ type: "error", message, title, duration }),
  warning: (message: string, title?: string, duration?: number) =>
    showToast({ type: "warning", message, title, duration }),
  info: (message: string, title?: string, duration?: number) =>
    showToast({ type: "info", message, title, duration }),
});

defineExpose({ useToast });
</script>