<template>
  <Card
    title="Lembretes"
    description="Anotações rápidas para você. Não afetam saldo nem faturas."
    padding="none"
    data-tour="notes"
  >
    <template #header-actions>
      <!-- O usuário escolhe o estilo e a escolha fica salva. -->
      <div class="flex items-center gap-1 rounded-lg bg-[var(--color-bg-muted)] p-0.5" role="radiogroup" aria-label="Estilo dos lembretes">
        <button
          v-for="option in NOTES_STYLE_OPTIONS"
          :key="option.value"
          type="button"
          role="radio"
          :aria-checked="style === option.value"
          :title="option.hint"
          class="flex h-7 items-center gap-1.5 rounded-md px-2 text-xs font-medium transition-colors"
          :class="
            style === option.value
              ? 'bg-[var(--color-bg-elevated)] text-[var(--color-brand)] shadow-[var(--shadow-xs)]'
              : 'text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]'
          "
          @click="setNotesStyle(option.value)"
        >
          <AppIcon :name="option.value === 'postit' ? 'sticky' : 'note'" :size="14" />
          <span class="hidden sm:inline">{{ option.label }}</span>
        </button>
      </div>
    </template>

    <!-- Novo lembrete -->
    <div class="border-b border-[var(--color-border)] p-4 sm:p-5">
      <form class="space-y-3" @submit.prevent="submit">
        <textarea
          id="note-content"
          v-model="draft"
          rows="2"
          class="input-base resize-none"
          placeholder="Ex: Ligar para o banco sobre a taxa do cartão"
          maxlength="1000"
          :disabled="creating"
          @keydown.enter.exact.prevent="submit"
        ></textarea>

        <div class="flex flex-wrap items-center gap-3">
          <div class="flex items-center gap-1.5" role="radiogroup" aria-label="Cor do lembrete">
            <button
              v-for="color in NOTE_COLORS"
              :key="color.id"
              type="button"
              role="radio"
              :aria-checked="draftColor === color.id"
              :aria-label="color.label"
              :title="color.label"
              class="h-6 w-6 rounded-full border-2 transition-transform hover:scale-110"
              :class="draftColor === color.id ? 'border-[var(--color-fg)]' : 'border-transparent'"
              :style="{ backgroundColor: color.solid }"
              @click="draftColor = draftColor === color.id ? '' : color.id"
            ></button>
          </div>

          <Button type="submit" size="sm" :loading="creating" :disabled="!draft.trim()">
            <AppIcon name="plus" :size="15" :stroke-width="2.4" />
            Lembrar
          </Button>

          <span class="text-xs text-[var(--color-fg-subtle)] tabular-nums">
            {{ draft.length }}/1000
          </span>
        </div>
      </form>
    </div>

    <!-- Lista -->
    <div v-if="notes.length" :class="style === 'postit' ? 'grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-3' : 'divide-y divide-[var(--color-border)]'">
      <article
        v-for="(note, i) in notes"
        :key="note.id"
        class="group relative"
        :class="style === 'postit' ? 'note-card animate-scale-in' : 'density-row flex items-start gap-3 px-4 sm:px-5'"
        :style="[style === 'postit' ? postItStyle(note, i) : {}, style === 'postit' ? { animationDelay: `${i * 45}ms` } : {}]"
      >
        <!-- Post-it: fita no topo e canto "descolado" -->
        <template v-if="style === 'postit'">
          <span class="note-tape" aria-hidden="true"></span>
          <span class="note-fold" aria-hidden="true"></span>
        </template>

        <p
          class="min-w-0 flex-1 whitespace-pre-wrap break-words"
          :class="style === 'postit' ? 'text-sm text-[var(--note-ink)]' : 'text-sm text-[var(--color-fg)]'"
        >
          {{ note.content }}
        </p>

        <div class="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            class="flex h-7 w-7 items-center justify-center rounded-lg transition-opacity"
            :class="[
              style === 'postit' ? 'text-[var(--note-ink)]' : 'text-[var(--color-fg-subtle)]',
              note.pinned ? 'opacity-100' : 'opacity-0 focus-visible:opacity-100 group-hover:opacity-100',
            ]"
            :aria-label="note.pinned ? 'Desafixar' : 'Fixar no topo'"
            :aria-pressed="note.pinned"
            @click="togglePin(note)"
          >
            <AppIcon name="star" :size="14" :class="note.pinned ? 'fill-current' : ''" />
          </button>

          <button
            type="button"
            class="flex h-7 w-7 items-center justify-center rounded-lg transition-opacity"
            :class="[
              style === 'postit' ? 'text-[var(--note-ink)]' : 'text-[var(--color-fg-subtle)]',
              'opacity-0 focus-visible:opacity-100 group-hover:opacity-100',
            ]"
            aria-label="Apagar lembrete"
            @click="remove(note)"
          >
            <AppIcon name="close" :size="14" />
          </button>
        </div>

        <p
          v-if="style === 'postit'"
          class="mt-3 text-[0.6875rem]"
          :class="'text-[var(--note-ink)] opacity-60'"
        >
          {{ formatRelativeDate(note.createdAt, locale) }}
        </p>
      </article>
    </div>

    <EmptyState
      v-else
      icon="sticky"
      title="Nenhum lembrete ainda"
      description="Anote aqui o que você não quer esquecer. Fica só para você, visível na tela inicial."
    />
  </Card>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { AppIcon, Button, Card, EmptyState } from "./ui";
import { useCreateNote, useDeleteNote, useNotes, useUpdateNote, type Note } from "../composables/useApi";
import { NOTES_STYLE_OPTIONS, usePreferences } from "../composables/usePreferences";
import { NOTE_COLORS, noteColorByHex, noteColorToHex } from "../utils/palette";
import { formatRelativeDate } from "../utils/format";

const { preferences, setNotesStyle } = usePreferences();
const style = computed(() => preferences.value.notesStyle);
const locale = computed(() => preferences.value.locale);

const notesQuery = useNotes();
const createMutation = useCreateNote();
const updateMutation = useUpdateNote();
const deleteMutation = useDeleteNote();

const notes = computed(() => notesQuery.data.value ?? []);
const creating = computed(() => createMutation.isPending.value);

const draft = ref("");
const draftColor = ref<string>("yellow");

/**
 * Inclinação determinística por posição: um papelzinho que muda de ângulo a
 * cada nota parece colado à mão, mas é sempre o mesmo para o mesmo índice —
 * nada de aleatoriedade que muda a cada render.
 */
const TILTS = [-1.6, 1.1, -0.7, 1.8, -1.2, 0.6];

function postItStyle(note: Note, index: number): Record<string, string> {
  const color = noteColorByHex(note.color) ?? NOTE_COLORS[0];
  return {
    "--note-ink": color.ink,
    "--note-tilt": `${TILTS[index % TILTS.length]}deg`,
    backgroundColor: color.soft,
  } as Record<string, string>;
}

async function submit() {
  const content = draft.value.trim();
  if (!content) return;

  try {
    await createMutation.mutateAsync({
      content,
      // O id fica só na interface; o banco recebe o hex da amostra.
      color: noteColorToHex(draftColor.value),
    });
    draft.value = "";
  } catch {
    // A mutation já devolve erro pelo estado; aqui só evitamos limpar o texto.
  }
}

async function togglePin(note: Note) {
  await updateMutation.mutateAsync({ id: note.id, data: { pinned: !note.pinned } });
}

async function remove(note: Note) {
  await deleteMutation.mutateAsync(note.id);
}
</script>

<style scoped>
/* ===== Post-it =====
   O papel tem canto "descolado" e uma fita no topo. O balanço no hover é
   leve de propósito: distracting num app de finanças seria exagero. */
.note-card {
  position: relative;
  padding: 1.5rem 1rem 0.875rem;
  border-radius: 2px;
  /* A inclinação vem de `--note-tilt`, definido por nota: a animação de hover
     precisa do mesmo valor para não zerar o ângulo no meio do balanço. */
  transform: rotate(var(--note-tilt, 0deg));
  box-shadow:
    0 1px 1px rgb(0 0 0 / 0.08),
    0 8px 16px -10px rgb(0 0 0 / 0.25);
  transition:
    transform var(--duration-base) var(--ease-out),
    box-shadow var(--duration-base) var(--ease-out);
}

.note-card:hover {
  box-shadow:
    0 2px 2px rgb(0 0 0 / 0.08),
    0 14px 26px -12px rgb(0 0 0 / 0.3);
}

@media (prefers-reduced-motion: no-preference) {
  .note-card:hover {
    animation: note-wiggle 620ms var(--ease-out);
  }
}

.note-tape {
  position: absolute;
  top: -0.5rem;
  left: 50%;
  width: 3.25rem;
  height: 1.25rem;
  transform: translateX(-50%) rotate(-2deg);
  border-radius: 2px;
  background: color-mix(in srgb, var(--note-ink) 12%, transparent);
  border: 1px dashed color-mix(in srgb, var(--note-ink) 22%, transparent);
}

.note-fold {
  position: absolute;
  top: 0;
  right: 0;
  width: 1.25rem;
  height: 1.25rem;
  border-bottom-left-radius: 4px;
  background: color-mix(in srgb, var(--note-ink) 16%, transparent);
  clip-path: polygon(0 0, 100% 100%, 0 100%);
}

@keyframes note-wiggle {
  0% { transform: rotate(var(--note-tilt, 0deg)); }
  30% { transform: rotate(calc(var(--note-tilt, 0deg) - 1.4deg)); }
  60% { transform: rotate(calc(var(--note-tilt, 0deg) + 1deg)); }
  100% { transform: rotate(var(--note-tilt, 0deg)); }
}
</style>