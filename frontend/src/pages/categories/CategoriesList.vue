<template>
  <div class="space-y-6 stagger-in">
    <!-- Page header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="font-display text-3xl text-[var(--color-fg)]">Categorias</h1>
        <p class="mt-1 text-[var(--color-fg-muted)]">Gerencie suas categorias de receitas, despesas e investimentos</p>
      </div>
      <Button @click="showAddForm = true">
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Nova Categoria
      </Button>
    </div>

    <!-- Categories List -->
    <Card title="Categorias" padding="none" v-if="categories.length > 0">
      <template #header-actions>
        <router-link to="/categories/new" class="link text-sm font-medium">Nova Categoria</router-link>
      </template>
      <div class="divide-y divide-[var(--color-border)]">
        <div
          v-for="category in categories"
          :key="category.id"
          class="flex items-center justify-between gap-4 px-6 py-4 hover:bg-[var(--color-bg-muted)] transition-colors cursor-pointer"
          @click="router.push(`/categories/${category.id}/edit`)"
        >
          <div class="flex items-center gap-4 min-w-0 flex-1">
            <div
              class="w-10 h-10 shrink-0 rounded-lg flex items-center justify-center text-xl"
              :style="{ backgroundColor: category.color + '20', color: category.color }"
            >
              <span>{{ category.icon }}</span>
            </div>
            <div class="min-w-0">
              <p class="font-medium text-[var(--color-fg)] truncate">{{ category.name }}</p>
              <p class="text-xs capitalize text-[var(--color-fg-muted)]">
                {{ categoryTypeLabel(category.type) }} · {{ category.isActive ? 'Ativa' : 'Inativa' }}
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <Button variant="ghost" size="sm" @click.stop="router.push(`/categories/${category.id}/edit`)">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span class="sr-only">Editar</span>
            </Button>
            <Button variant="ghost" size="sm" variant="danger" @click.stop="deleteCategory(category.id)">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span class="sr-only">Excluir</span>
            </Button>
          </div>
        </div>
      </div>
    </Card>

    <!-- Empty State -->
    <Card v-else padding="lg" class="text-center">
      <EmptyState
        icon="inbox"
        title="Nenhuma categoria cadastrada"
        description="Crie categorias para organizar suas receitas, despesas e transferências."
        :action="{ label: 'Criar Categoria', onClick: () => router.push('/categories/new') }"
      />
    </Card>

    <!-- Add Category Modal -->
    <Modal v-model="showAddForm" title="Nova Categoria" description="Preencha os dados para criar uma nova categoria.">
      <form @submit.prevent="onSubmit" class="space-y-5">
        <Input
          v-model="form.name"
          id="category-name"
          label="Nome da categoria"
          placeholder="Ex: Supermercado, Salário, Transporte"
          required
          autocomplete="off"
          :error="errors.name"
        />

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            v-model="form.type"
            id="category-type"
            label="Tipo"
            :options="categoryTypeOptions"
            placeholder="Selecione o tipo"
            required
            :error="errors.type"
          />

          <div>
            <label for="category-color" class="label">Cor</label>
            <Input
              id="category-color"
              v-model="form.color"
              type="color"
              class="h-10 w-full p-1 cursor-pointer"
              :error="errors.color"
            />
          </div>

          <Input
            v-model="form.icon"
            id="category-icon"
            label="Ícone (emoji)"
            type="text"
            placeholder="🍔"
            maxlength="4"
            :error="errors.icon"
          />
        </div>

        <div class="flex items-center">
          <input
            id="category-active"
            v-model="form.isActive"
            type="checkbox"
            class="h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-brand)] focus:ring-[var(--color-brand)] focus:ring-2"
          />
          <label for="category-active" class="ml-2 text-sm text-[var(--color-fg)]">Ativa</label>
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
          <Button variant="ghost" @click="showAddForm = false">Cancelar</Button>
          <Button type="submit" :loading="submitting">Criar Categoria</Button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { useRouter } from "vue-router";
import { useCategories, useCreateCategory, useDeleteCategory } from "../../composables/useApi";
import { Button, Card, Input, Select, EmptyState, Modal } from "../../components/ui";

const router = useRouter();
const categoriesQuery = useCategories();
const createCategoryMutation = useCreateCategory();
const deleteCategoryMutation = useDeleteCategory();

const categories = computed(() => categoriesQuery.data.value ?? []);
const showAddForm = ref(false);
const submitting = ref(false);
const deletingId = ref<string | null>(null);

const form = reactive({
  name: "",
  type: "EXPENSE",
  icon: "📁",
  color: "#6366F1",
  isActive: true,
});

const errors = reactive({
  name: "",
  type: "",
  color: "",
  icon: "",
});

const categoryTypeOptions = [
  { value: "INCOME", label: "Receita" },
  { value: "EXPENSE", label: "Despesa" },
  { value: "TRANSFER", label: "Transferência" },
  { value: "INVESTMENT", label: "Investimento" },
];

function categoryTypeLabel(type: string): string {
  const opt = categoryTypeOptions.find((o) => o.value === type);
  return opt?.label || type;
}

function validateForm(): boolean {
  let valid = true;
  errors.name = form.name.trim() ? "" : "Nome é obrigatório";
  errors.type = form.type ? "" : "Selecione um tipo";
  errors.color = form.color.trim() ? "" : "Cor é obrigatória";
  errors.icon = form.icon.trim() ? "" : "Ícone é obrigatório";
  valid = !errors.name && !errors.type && !errors.color && !errors.icon;
  return valid;
}

async function onSubmit() {
  if (!validateForm()) return;
  submitting.value = true;
  try {
    await createCategoryMutation.mutateAsync({
      name: form.name,
      type: form.type,
      icon: form.icon,
      color: form.color,
      isActive: form.isActive,
    });
    showAddForm.value = false;
    form.name = "";
    form.type = "EXPENSE";
    form.icon = "📁";
    form.color = "#6366F1";
    form.isActive = true;
  } catch (e) {
    console.error("Failed to add category:", e);
  } finally {
    submitting.value = false;
  }
}

async function deleteCategory(id: string) {
  if (!confirm("Tem certeza que deseja excluir esta categoria?")) return;
  deletingId.value = id;
  try {
    await deleteCategoryMutation.mutateAsync(id);
  } catch (e) {
    console.error("Failed to delete category:", e);
  } finally {
    deletingId.value = null;
  }
}
</script>