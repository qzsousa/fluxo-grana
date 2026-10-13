<template>
  <div class="min-h-screen bg-[var(--color-bg)] text-[var(--color-fg)] font-body antialiased flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-10">
        <router-link to="/dashboard" class="inline-flex items-center gap-3 mb-6">
          <span class="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-brand">
            <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.863.863c.881.881 2.302.881 3.182 0l2.414-2.414M21 12H3" />
            </svg>
          </span>
          <span class="font-display text-2xl text-[var(--color-fg)]">Finanças</span>
        </router-link>
      </div>
      <slot />
    </div>
  </div>
</template>