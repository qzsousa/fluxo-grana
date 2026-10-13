<template>
  <div class="space-y-6 stagger-in">
    <!-- Page header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="font-display text-3xl text-[var(--color-fg)]">{{ isEditing ? 'Editar Categoria' : 'Nova Categoria' }}</h1>
        <p class="mt-1 text-[var(--color-fg-muted)]">{{ isEditing ? 'Atualize os dados da categoria' : 'Crie uma nova categoria para organizar suas finanças' }}</p>
      </div>
      <router-link :to="{ name: 'categories' }" class="link text-sm font-medium">
        <svg class="h-4 w-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Voltar
      </router-link>
    </div>

    <!-- Form -->
    <Card>
      <form @submit.prevent="onSubmit" class="space-y-6">
        <Input
          v-model="form.name"
          id="name"
          label="Nome da categoria"
          type="text"
          required
          autocomplete="off"
          placeholder="Ex: Supermercado"
          :error="errors.name"
        />

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            v-model="form.type"
            id="type"
            label="Tipo"
            :options="categoryTypes"
            required
            :error="errors.type"
          />

          <div>
            <label for="color" class="label">Cor</label>
            <Input
              id="color"
              v-model="form.color"
              type="color"
              class="h-10 w-full p-1 cursor-pointer"
              :error="errors.color"
            />
          </div>

          <Input
            v-model="form.icon"
            id="icon"
            label="Ícone (emoji)"
            type="text"
            placeholder="🍔"
            maxlength="4"
            :error="errors.icon"
          />
        </div>

        <div class="flex items-center">
          <input
            id="isActive"
            v-model="form.isActive"
            type="checkbox"
            class="h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-brand)] focus:ring-[var(--color-brand)] focus:ring-2"
          />
          <label for="isActive" class="ml-2 text-sm text-[var(--color-fg)]">Ativa</label>
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
          <router-link :to="{ name: 'categories' }" class="btn-ghost">Cancelar</router-link>
          <Button type="submit" :loading="saving">{{ isEditing ? 'Atualizar Categoria' : 'Criar Categoria' }}</Button>
        </div>
      </form>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useCreateCategory, useUpdateCategory, useCategory } from "../../composables/useApi";
import { Button, Card, Input, Select } from "../../components/ui";

const route = useRoute();
const router = useRouter();
const isEditing = computed(() => route.params.id !== undefined);
const categoryId = route.params.id as string;

const { mutateAsync: createCategory } = useCreateCategory();
const { mutateAsync: updateCategory } = useUpdateCategory();
const { data: categoryData } = useCategory(categoryId);

const saving = ref(false);

const form = ref({
  name: "",
  type: "EXPENSE",
  icon: "📁",
  color: "#6366F1",
  isActive: true,
});

const errors = ref({
  name: "",
  type: "",
  color: "",
  icon: "",
});

const categoryTypes = [
  { value: "INCOME", label: "Receita" },
  { value: "EXPENSE", label: "Despesa" },
  { value: "TRANSFER", label: "Transferência" },
  { value: "INVESTMENT", label: "Investimento" },
];

function validateForm(): boolean {
  let valid = true;
  errors.value.name = form.value.name.trim() ? "" : "Nome é obrigatório";
  errors.value.type = form.value.type ? "" : "Selecione um tipo";
  errors.value.color = form.value.color.trim() ? "" : "Cor é obrigatória";
  errors.value.icon = form.value.icon.trim() ? "" : "Ícone é obrigatório";
  valid = !errors.value.name && !errors.value.type && !errors.value.color && !errors.value.icon;
  return valid;
}

async function onSubmit() {
  if (!validateForm()) return;
  saving.value = true;
  try {
    if (isEditing.value) {
      await updateCategory({ id: categoryId, data: form.value });
    } else {
      await createCategory(form.value);
    }
    router.push({ name: "categories" });
  } catch (error) {
    alert("Falha ao salvar categoria: " + (error as Error).message);
  } finally {
    saving.value = false;
  }
}

onMounted(async () => {
  if (isEditing.value && categoryData.value) {
    form.value = { ...form.value, ...categoryData.value.category };
  }
});
</script>