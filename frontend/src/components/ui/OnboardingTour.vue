<template>
  <Teleport to="body">
    <div
      v-if="step"
      class="fixed inset-0 z-[900]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tour-title"
    >
      <!-- Escurece tudo menos o elemento destacado (máscara SVG) -->
      <svg class="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <mask id="tour-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            <rect
              v-if="spotlight"
              :x="spotlight.x"
              :y="spotlight.y"
              :width="spotlight.width"
              :height="spotlight.height"
              rx="16"
              fill="black"
            />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(25, 25, 23, 0.6)" mask="url(#tour-mask)" />
      </svg>

      <!-- Contorno pulsante no alvo -->
      <div
        v-if="spotlight"
        class="pointer-events-none absolute rounded-2xl ring-2 ring-[var(--color-brand)] animate-tour-ring"
        :style="{
          top: `${spotlight.y - 6}px`,
          left: `${spotlight.x - 6}px`,
          width: `${spotlight.width + 12}px`,
          height: `${spotlight.height + 12}px`,
        }"
      ></div>

      <!-- Balão -->
      <div
        class="absolute w-[22rem] max-w-[calc(100vw-2rem)] rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-5 shadow-[var(--shadow-xl)]"
        :style="bubbleStyle"
      >
        <div class="mb-3 flex items-start justify-between gap-3">
          <div class="flex min-w-0 items-center gap-3">
            <span
              v-if="step.icon"
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-brand-light)] text-[var(--color-brand)]"
              aria-hidden="true"
            >
              <AppIcon :name="step.icon" :size="20" :stroke-width="2" />
            </span>
            <h2 id="tour-title" class="font-display text-lg text-[var(--color-fg)]">
              {{ step.title }}
            </h2>
          </div>

          <button
            type="button"
            class="-mr-1.5 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--color-fg-subtle)] transition-colors hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-fg)]"
            aria-label="Fechar tutorial"
            @click="skip"
          >
            <AppIcon name="close" :size="18" />
          </button>
        </div>

        <p class="text-sm leading-relaxed text-[var(--color-fg-muted)]">{{ step.content }}</p>

        <!-- Progresso -->
        <div class="mt-5 flex items-center gap-2">
          <span
            v-for="(s, i) in steps"
            :key="i"
            class="h-1.5 rounded-full transition-all duration-300"
            :class="i === currentIndex ? 'w-6 bg-[var(--color-brand)]' : 'w-1.5 bg-[var(--color-border-strong)]'"
          ></span>
          <span class="ml-auto text-xs font-medium tabular-nums text-[var(--color-fg-muted)]">
            {{ progress }} de {{ totalSteps }}
          </span>
        </div>

        <!-- Ações -->
        <div class="mt-4 flex items-center justify-between gap-3">
          <button
            type="button"
            class="text-sm text-[var(--color-fg-muted)] transition-colors hover:text-[var(--color-fg)]"
            @click="skip"
          >
            Pular
          </button>
          <div class="flex items-center gap-2">
            <Button v-if="!isFirst" variant="ghost" size="sm" @click="previous">Voltar</Button>
            <Button size="sm" @click="next">
              {{ isLast ? "Começar a usar" : "Próximo" }}
            </Button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from "vue";
// Importa direto pelo arquivo: o barrel `./index` também exporta este
// componente, e voltar por ele criaria um ciclo de imports. São default
// exports, não nomeados.
import AppIcon from "./AppIcon.vue";
import Button from "./Button.vue";
import { useOnboarding } from "../../composables/useOnboarding";

const { steps, isActive, currentStep, currentIndex, totalSteps, progress, isFirst, isLast, next, previous, skip } =
  useOnboarding();

const step = currentStep;

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

const spotlight = ref<Rect | null>(null);

const GAP = 16;
const BUBBLE_W = 352;
const BUBBLE_H = 260;

function measure() {
  const target = step.value?.target;
  if (!target) {
    spotlight.value = null;
    return;
  }

  // Pode haver mais de um elemento com o mesmo data-tour (o botão de nova
  // transação existe no desktop e na barra inferior). `querySelector` pegaria
  // o primeiro do DOM, que pode estar escondido — daí o filtro por visibilidade.
  const candidates = Array.from(document.querySelectorAll(target));
  const el = candidates.find((node) => node.getClientRects().length > 0);

  // Alvo ausente (rota diferente, item não renderizado): mostra o balão no
  // centro em vez de quebrar o tour.
  if (!el) {
    spotlight.value = null;
    return;
  }

  // Rola até o alvo antes de medir: sem isso o spotlight fica no lugar errado.
  el.scrollIntoView({ block: "center", behavior: "smooth" });

  const r = el.getBoundingClientRect();
  spotlight.value = { x: r.left, y: r.top, width: r.width, height: r.height };
}

const bubbleStyle = computed(() => {
  const s = step.value;
  if (!s) return {};

  // Passo sem alvo: centralizado.
  if (!s.target || !spotlight.value) {
    return {
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
    };
  }

  const r = spotlight.value;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const styles: Record<string, string> = {};

  switch (s.placement) {
    case "right":
      styles.left = `${r.x + r.width + GAP}px`;
      styles.top = `${r.y + r.height / 2}px`;
      styles.transform = "translateY(-50%)";
      break;
    case "left":
      styles.right = `${vw - r.x + GAP}px`;
      styles.top = `${r.y + r.height / 2}px`;
      styles.transform = "translateY(-50%)";
      break;
    case "bottom":
      styles.top = `${r.y + r.height + GAP}px`;
      styles.left = `${r.x}px`;
      break;
    case "top":
      styles.bottom = `${vh - r.y + GAP}px`;
      styles.left = `${r.x}px`;
      break;
  }

  // Mantém o balão inteiro dentro da viewport.
  if (styles.left) {
    const left = parseFloat(styles.left);
    if (left + BUBBLE_W > vw - 16) styles.left = `${Math.max(16, vw - BUBBLE_W - 16)}px`;
    if (left < 16) styles.left = "16px";
  }
  if (styles.top) {
    const top = parseFloat(styles.top);
    if (top > vh - BUBBLE_H - 16) styles.top = `${Math.max(16, vh - BUBBLE_H - 16)}px`;
  }

  return styles;
});

watch(
  [isActive, currentIndex],
  async () => {
    if (isActive.value) {
      await nextTick();
      measure();
    } else {
      spotlight.value = null;
    }
  },
  { immediate: true }
);

function onViewportChange() {
  if (isActive.value) measure();
}

function onKeydown(event: KeyboardEvent) {
  // Esc fecha; setas navegam — quem usa teclado não fica preso no tour.
  if (!isActive.value) return;
  if (event.key === "Escape") skip();
  if (event.key === "ArrowRight") next();
  if (event.key === "ArrowLeft") previous();
}

onMounted(() => {
  window.addEventListener("resize", onViewportChange);
  window.addEventListener("scroll", onViewportChange, true);
  window.addEventListener("keydown", onKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", onViewportChange);
  window.removeEventListener("scroll", onViewportChange, true);
  window.removeEventListener("keydown", onKeydown);
  document.body.style.overflow = "";
});
</script>

<style scoped>
/* Pulso em torno do alvo. Usa a cor de marca via color-mix para acompanhar
   o acento escolhido, sem repetir o hex aqui. */
@keyframes tour-ring {
  0%,
  100% {
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--color-brand) 55%, transparent);
  }
  50% {
    box-shadow: 0 0 0 10px color-mix(in srgb, var(--color-brand) 0%, transparent);
  }
}

.animate-tour-ring {
  animation: tour-ring 1.8s var(--ease-out) infinite;
}

@media (prefers-reduced-motion: reduce) {
  .animate-tour-ring {
    animation: none;
  }
}
</style>