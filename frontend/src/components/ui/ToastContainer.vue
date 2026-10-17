<template>
  <div
    class="pointer-events-none fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom,0px)+5.5rem)] z-[var(--z-toast)] flex flex-col gap-2 sm:inset-x-auto sm:bottom-4 sm:right-4 sm:w-[380px]"
  >
    <Toast
      v-for="toast in toasts"
      :key="toast.id"
      :id="toast.id"
      :type="toast.type"
      :title="toast.title"
      :message="toast.message"
      :duration="toast.duration"
      @close="remove"
    />
  </div>
</template>

<script setup lang="ts">
import { useToast } from "../../composables/useToast";
import Toast from "./Toast.vue";

// Consome o estado de módulo de `useToast` — antes este componente mantinha a
// própria lista, então `toast.success(...)` em qualquer página nunca aparecia.
const { toasts, remove } = useToast();
</script>