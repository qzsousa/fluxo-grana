const fs = require('fs');
const content = fs.readFileSync('src/pages/budgets/BudgetForm.vue', 'utf8');
// Remove the duplicate 'const saving = ref(false);' at line 185
const fixed = content.replace(
  'const categoryOptions = computed(() =>\n  (categoriesData.value || []).map(cat => ({ value: cat.id, label: `${cat.icon} ${cat.name}` }))\n);\n\nconst saving = ref(false);\n\nasync function onSubmit()',
  'const categoryOptions = computed(() =>\n  (categoriesData.value || []).map(cat => ({ value: cat.id, label: `${cat.icon} ${cat.name}` }))\n);\n\nasync function onSubmit()'
);

fs.writeFileSync('src/pages/budgets/BudgetForm.vue', fixed);
console.log('Fixed duplicate saving!');