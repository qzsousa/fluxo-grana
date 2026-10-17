<template>
  <span
    class="relative inline-flex"
    @mouseenter="show = true"
    @mouseleave="show = false"
    @focusin="show = true"
    @focusout="show = false"
  >
    <slot v-if="$slots.default" :open="show" />
    <slot v-else name="trigger" :open="show" />

    <Transition name="tooltip">
      <div v-if="show" class="tooltip" :class="positionClasses" role="tooltip" :id="tooltipId">
        <div class="bg-[var(--color-fg)] text-[var(--color-bg-elevated)] shadow-xl" :class="bubbleClasses">
          {{ content }}
        </div>
        <div :class="arrowClasses" aria-hidden="true"></div>
      </div>
    </Transition>
  </span>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

interface Props {
  content: string;
  position?: "top" | "bottom" | "left" | "right";
  size?: "sm" | "md" | "lg";
}

const props = withDefaults(defineProps<Props>(), {
  position: "top",
  size: "sm",
});

const tooltipId = `tooltip-${Math.random().toString(36).slice(2, 9)}`;
const show = ref(false);

const bubbleClasses = computed(() => ({
  sm: "text-xs px-3 py-2 rounded-lg max-w-[16rem]",
  md: "text-sm px-4 py-2.5 rounded-lg max-w-xs",
  lg: "text-sm px-5 py-3.5 rounded-xl max-w-md leading-relaxed",
})[props.size]);

const positionClasses = computed(() => ({
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
})[props.position]);

const arrowClasses = computed(() => ({
  top: "absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[var(--color-fg)]",
  bottom: "absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-[var(--color-fg)]",
  left: "absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-[var(--color-fg)]",
  right: "absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[var(--color-fg)]",
})[props.position]);
</script>

<style scoped>
.tooltip {
  position: absolute;
  z-index: var(--z-tooltip);
}

.tooltip-enter-active,
.tooltip-leave-active {
  transition: opacity var(--duration-fast) var(--ease-out), transform var(--duration-fast) var(--ease-out);
}

.tooltip-enter-from,
.tooltip-leave-to {
  opacity: 0;
}
</style>