<template>
  <span
    class="relative inline-flex"
    @mouseenter="show = true"
    @mouseleave="show = false"
    @focusin="show = true"
    @focusout="show = false"
  >
    <slot name="trigger" :open="show" />
    <Transition name="tooltip">
      <div
        v-if="show"
        :class="[
          'tooltip',
          positionClasses,
        ]"
        role="tooltip"
        :id="tooltipId"
      >
        <div class="bg-[var(--color-fg)] text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap max-w-xs text-wrap">
          {{ content }}
        </div>
        <div :class="arrowClasses" aria-hidden="true"></div>
      </div>
    </Transition>
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
  content: string;
  position?: "top" | "bottom" | "left" | "right";
  offset?: number;
}

const props = withDefaults(defineProps<Props>(), {
  position: "top",
  offset: 8,
});

const tooltipId = `tooltip-${Math.random().toString(36).slice(2, 9)}`;

const positionClasses = computed(() => ({
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
})[props.position]);

const arrowClasses = computed(() => ({
  top: "absolute top-full left-1/2 -translate-x-1/2 border-5 border-transparent border-t-[var(--color-fg)]",
  bottom: "absolute bottom-full left-1/2 -translate-x-1/2 border-5 border-transparent border-b-[var(--color-fg)]",
  left: "absolute left-full top-1/2 -translate-y-1/2 border-5 border-transparent border-l-[var(--color-fg)]",
  right: "absolute right-full top-1/2 -translate-y-1/2 border-5 border-transparent border-r-[var(--color-fg)]",
})[props.position]);
</script>

<style scoped>
.tooltip {
  position: absolute;
  z-index: var(--z-tooltip);
  animation: tooltipIn var(--duration-fast) var(--ease-out) forwards;
}

@keyframes tooltipIn {
  from { opacity: 0; transform: translateY(4px) var(--tooltip-transform); }
  to { opacity: 1; transform: translateY(0) var(--tooltip-transform); }
}

.tooltip[data-position="top"] { --tooltip-transform: translateX(-50%); }
.tooltip[data-position="bottom"] { --tooltip-transform: translateX(-50%); }
.tooltip[data-position="left"] { --tooltip-transform: translateY(-50%); }
.tooltip[data-position="right"] { --tooltip-transform: translateY(-50%); }
</style>