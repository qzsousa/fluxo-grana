<template>
  <Transition name="toast">
    <div
      v-if="visible"
      :class="[
        'toast',
        typeClasses,
        { 'toast-exit': exiting },
      ]"
      role="alert"
      aria-live="polite"
      @mouseenter="pauseTimer"
      @mouseleave="resumeTimer"
    >
      <div class="flex items-start gap-3">
        <div class="flex-shrink-0 mt-0.5" :class="iconClasses">
          <!-- Success icon -->
          <svg v-if="props.type === 'success'" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <!-- Error icon -->
          <svg v-else-if="props.type === 'error'" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <!-- Warning icon -->
          <svg v-else-if="props.type === 'warning'" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <!-- Info icon -->
          <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <p v-if="title" class="font-medium text-[var(--color-fg)]">{{ title }}</p>
          <p v-else class="font-medium text-[var(--color-fg)]">{{ message }}</p>
          <p v-if="title && message" class="mt-1 text-sm text-[var(--color-fg-muted)]">{{ message }}</p>
        </div>
        <button
          type="button"
          class="flex-shrink-0 p-1 text-[var(--color-fg-subtle)] hover:text-[var(--color-fg)] transition-colors rounded-lg"
          @click="close"
          aria-label="Fechar notificação"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div
        v-if="progress > 0"
        class="mt-3 h-1 bg-[var(--color-border)] rounded-full overflow-hidden"
        role="progressbar"
        :aria-valuenow="progress"
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <div
          class="h-full bg-current rounded-full transition-all duration-100 linear"
          :style="{ width: `${progress}%` }"
          :class="progressColor"
        ></div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";

interface Props {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title?: string;
  message: string;
  duration?: number;
}

const props = withDefaults(defineProps<Props>(), {
  duration: 5000,
});

// O `Toast` é dono do tempo de vida: pausa no hover e emite `close` ao terminar.
// O composable `useToast` só guarda a lista, senão os dois timers brigariam.
const emit = defineEmits<{ close: [id: string] }>();

const visible = ref(true);
const exiting = ref(false);
const progress = ref(100);
const startTime = ref(Date.now());
const pausedTime = ref(0);
let timer: ReturnType<typeof setInterval> | null = null;

const typeClasses = computed(() => ({
  success: "border-l-4 border-[var(--color-success)]",
  error: "border-l-4 border-[var(--color-danger)]",
  warning: "border-l-4 border-[var(--color-warning)]",
  info: "border-l-4 border-[var(--color-info)]",
})[props.type]);

const iconClasses = computed(() => ({
  success: "text-[var(--color-success)]",
  error: "text-[var(--color-danger)]",
  warning: "text-[var(--color-warning)]",
  info: "text-[var(--color-info)]",
})[props.type]);

const progressColor = computed(() => ({
  success: "bg-[var(--color-success)]",
  error: "bg-[var(--color-danger)]",
  warning: "bg-[var(--color-warning)]",
  info: "bg-[var(--color-info)]",
})[props.type]);

function startTimer() {
  // `duration: 0` = fixo, só sai no X.
  if (props.duration <= 0) {
    progress.value = 0;
    return;
  }

  const elapsed = pausedTime.value;
  const remaining = props.duration - elapsed;
  if (remaining <= 0) {
    close();
    return;
  }
  progress.value = (remaining / props.duration) * 100;
  timer = setInterval(() => {
    const now = Date.now();
    const totalElapsed = pausedTime.value + (now - startTime.value);
    if (totalElapsed >= props.duration) {
      close();
    } else {
      progress.value = ((props.duration - totalElapsed) / props.duration) * 100;
    }
  }, 50);
}

function pauseTimer() {
  if (timer) {
    clearInterval(timer);
    timer = null;
    pausedTime.value += Date.now() - startTime.value;
  }
}

function resumeTimer() {
  startTime.value = Date.now();
  startTimer();
}

function close() {
  if (exiting.value) return;
  exiting.value = true;
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  setTimeout(() => {
    visible.value = false;
    emit("close", props.id);
  }, 200);
}

onMounted(() => {
  startTimer();
});

onBeforeUnmount(() => {
  if (timer) clearInterval(timer);
});
</script>

<style scoped>
.toast {
  width: 100%;
  padding: 0.875rem 1rem;
  background: var(--color-bg-elevated);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--color-border);
  animation: slideInRight var(--duration-base) var(--ease-out) forwards;
}

@media (min-width: 640px) {
  .toast {
    min-width: 320px;
  }
}

.toast-exit {
  animation: slideOutRight var(--duration-fast) var(--ease-out) forwards;
}

@keyframes slideInRight {
  from { opacity: 0; transform: translateX(100%) scale(0.95); }
  to { opacity: 1; transform: translateX(0) scale(1); }
}

@keyframes slideOutRight {
  from { opacity: 1; transform: translateX(0) scale(1); }
  to { opacity: 0; transform: translateX(100%) scale(0.95); }
}
</style>