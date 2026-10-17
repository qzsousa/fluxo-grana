<template>
  <div class="flex min-h-dvh items-center justify-center bg-[var(--color-bg)] px-4 py-10">
    <div class="w-full max-w-sm">
      <router-link to="/dashboard" class="mb-8 flex items-center justify-center gap-2.5">
        <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-brand)] text-[var(--color-on-brand)]">
          <AppIcon name="trending" :size="20" :stroke-width="2" />
        </span>
        <span class="text-xl font-semibold tracking-tight"><BrandName /></span>
      </router-link>

      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { AppIcon } from "../components/ui";
import BrandName from "../components/BrandName.vue";
</script>