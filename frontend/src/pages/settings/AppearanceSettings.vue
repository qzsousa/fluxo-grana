<template>
  <div class="space-y-6 stagger-in">
    <!-- Cabeçalho -->
    <div>
      <h1 class="font-display text-3xl text-[var(--color-fg)]">Aparência</h1>
      <p class="mt-1 text-[var(--color-fg-muted)]">
        Ajuste cor, densidade e tamanho do texto. As mudanças valem na hora e ficam guardadas neste
        navegador.
      </p>
    </div>

    <!-- ================= COR DE DESTAQUE ================= -->
    <Card
      title="Cor de destaque"
      description="Botões, links, seleções e o aviso do sino usam esta cor."
      padding="md"
    >
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <button
          v-for="accent in ACCENTS"
          :key="accent.id"
          type="button"
          role="radio"
          :aria-checked="preferences.accent === accent.id"
          :title="accent.label"
          class="group flex items-center gap-2.5 rounded-xl border p-3 text-left transition-colors"
          :class="
            preferences.accent === accent.id
              ? 'border-[var(--color-brand)] bg-[var(--color-brand-light)]'
              : 'border-[var(--color-border)] hover:bg-[var(--color-bg-muted)]'
          "
          @click="setAccent(accent.id)"
        >
          <span
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white"
            :style="{ backgroundColor: isDark ? accent.swatchDark : accent.swatch }"
          >
            <AppIcon v-if="preferences.accent === accent.id" name="check" :size="16" :stroke-width="3" />
          </span>
          <span class="min-w-0 truncate text-sm font-medium text-[var(--color-fg)]">
            {{ accent.label }}
          </span>
        </button>
      </div>
    </Card>

    <!-- ================= DENSIDADE ================= -->
    <Card title="Densidade" description="Quanto respiro fica entre as linhas das listas." padding="md">
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          v-for="option in DENSITY_OPTIONS"
          :key="option.value"
          type="button"
          role="radio"
          :aria-checked="preferences.density === option.value"
          class="rounded-xl border p-3 text-left transition-colors"
          :class="
            preferences.density === option.value
              ? 'border-[var(--color-brand)] bg-[var(--color-brand-light)]'
              : 'border-[var(--color-border)] hover:bg-[var(--color-bg-muted)]'
          "
          @click="setDensity(option.value)"
        >
          <span class="flex items-center justify-between gap-2">
            <span class="text-sm font-medium text-[var(--color-fg)]">{{ option.label }}</span>
            <span v-if="preferences.density === option.value" class="text-[var(--color-brand)]">
              <AppIcon name="check" :size="16" :stroke-width="3" />
            </span>
          </span>
          <span class="mt-1 block text-xs text-[var(--color-fg-muted)]">{{ option.hint }}</span>
        </button>
      </div>
    </Card>

    <!-- ================= TAMANHO DO TEXTO ================= -->
    <Card
      title="Tamanho do texto"
      description="Escala toda a interface. Útil em telas pequenas ou para leitura mais confortável."
      padding="md"
    >
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <button
          v-for="option in FONT_SCALE_OPTIONS"
          :key="option.value"
          type="button"
          role="radio"
          :aria-checked="preferences.fontScale === option.value"
          class="rounded-xl border p-3 text-left transition-colors"
          :class="
            preferences.fontScale === option.value
              ? 'border-[var(--color-brand)] bg-[var(--color-brand-light)]'
              : 'border-[var(--color-border)] hover:bg-[var(--color-bg-muted)]'
          "
          @click="setFontScale(option.value)"
        >
          <span class="flex items-center justify-between gap-2">
            <span
              class="font-medium text-[var(--color-fg)]"
              :class="{
                'text-xs': option.value === 'small',
                'text-sm': option.value === 'normal',
                'text-lg': option.value === 'large',
              }"
            >
              {{ option.label }}
            </span>
            <span v-if="preferences.fontScale === option.value" class="text-[var(--color-brand)]">
              <AppIcon name="check" :size="16" :stroke-width="3" />
            </span>
          </span>
        </button>
      </div>
    </Card>

    <!-- ================= LEMBRETES ================= -->
    <Card
      title="Estilo dos lembretes"
      description="Como as anotações da tela inicial aparecem. A escolha fica salva."
      padding="md"
    >
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          v-for="option in NOTES_STYLE_OPTIONS"
          :key="option.value"
          type="button"
          role="radio"
          :aria-checked="preferences.notesStyle === option.value"
          class="rounded-xl border p-3 text-left transition-colors"
          :class="
            preferences.notesStyle === option.value
              ? 'border-[var(--color-brand)] bg-[var(--color-brand-light)]'
              : 'border-[var(--color-border)] hover:bg-[var(--color-bg-muted)]'
          "
          @click="setNotesStyle(option.value)"
        >
          <span class="flex items-center justify-between gap-2">
            <span class="flex items-center gap-2 text-sm font-medium text-[var(--color-fg)]">
              <AppIcon :name="option.value === 'postit' ? 'sticky' : 'note'" :size="16" />
              {{ option.label }}
            </span>
            <span v-if="preferences.notesStyle === option.value" class="text-[var(--color-brand)]">
              <AppIcon name="check" :size="16" :stroke-width="3" />
            </span>
          </span>
          <span class="mt-1 block text-xs text-[var(--color-fg-muted)]">{{ option.hint }}</span>
        </button>
      </div>
    </Card>

    <!-- ================= PRÉVIA ================= -->
    <Card title="Prévia" description="Como os elementos aparecem com a sua configuração." padding="none">
      <div class="space-y-4 p-5">
        <div class="flex flex-wrap items-center gap-2">
          <Button size="sm">Botão principal</Button>
          <Button size="sm" variant="secondary">Secundário</Button>
          <Button size="sm" variant="ghost">Fantasma</Button>
          <a href="#" class="link text-sm" @click.prevent>Um link</a>
          <span class="badge badge-success">Paga</span>
          <span class="badge badge-warning">Vence em 2 dias</span>
          <span class="badge badge-danger">Vencida</span>
        </div>

        <div class="rounded-xl border border-[var(--color-border)]">
          <div class="density-row flex items-center gap-3 border-b border-[var(--color-border)] px-4">
            <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-light)] text-[var(--color-brand)]">
              <AppIcon name="arrows" :size="17" />
            </span>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium text-[var(--color-fg)]">Supermercado da esquina</p>
              <p class="truncate text-xs text-[var(--color-fg-muted)]">Alimentação · 12 de out</p>
            </div>
            <p class="shrink-0 text-sm font-semibold tabular-nums text-[var(--color-fg)]">
              R$ 284,50
            </p>
          </div>

          <div class="density-row flex items-center gap-3 px-4">
            <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-success-light)] text-[var(--color-success)]">
              <AppIcon name="arrowUp" :size="17" />
            </span>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium text-[var(--color-fg)]">Salário</p>
              <p class="truncate text-xs text-[var(--color-fg-muted)]">Renda · 5 de out</p>
            </div>
            <p class="shrink-0 text-sm font-semibold tabular-nums text-[var(--color-success)]">
              R$ 7.200,00
            </p>
          </div>
        </div>

        <div>
          <label for="preview-input" class="label">Um campo de formulário</label>
          <input id="preview-input" class="input-base" placeholder="Digite algo" />
        </div>
      </div>
    </Card>

    <!-- ================= RESTAURAR ================= -->
    <div class="flex justify-end">
      <Button variant="ghost" @click="confirmReset = true">
        <AppIcon name="repeat" :size="16" />
        Restaurar appearance padrão
      </Button>
    </div>

    <Modal
      v-model="confirmReset"
      title="Restaurar aparência padrão?"
      description="Cor, densidade e tamanho do texto voltam ao original. Os lembretes de fatura não mudam."
    >
      <p class="text-sm text-[var(--color-fg-muted)]">
        Só vale para este navegador. Seu tema e os dados ficam intactos.
      </p>
      <template #footer>
        <Button variant="ghost" @click="confirmReset = false">Cancelar</Button>
        <Button variant="danger" @click="restore">Restaurar</Button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { AppIcon, Button, Card, Modal } from "../../components/ui";
import {
  ACCENTS,
  DENSITY_OPTIONS,
  FONT_SCALE_OPTIONS,
  NOTES_STYLE_OPTIONS,
  usePreferences,
} from "../../composables/usePreferences";
import { useTheme } from "../../composables/useTheme";

const { preferences, setAccent, setDensity, setFontScale, setNotesStyle, reset } = usePreferences();
// A amostra da cor precisa mostrar a variante certa para o tema ativo.
const { isDark } = useTheme();

const confirmReset = ref(false);

function restore() {
  reset();
  confirmReset.value = false;
}
</script>
