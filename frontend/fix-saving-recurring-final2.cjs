const fs = require('fs');
const content = fs.readFileSync('src/pages/recurring/RecurringForm.vue', 'utf8');
// Remove the duplicate 'const saving = ref(false);' after the categoryOptions
const fixed = content.replace(
  'const categoryOptions = computed(() =>\n  [{ value: "", label: "Select category" }, ...(categoriesData.value || []).map(cat => ({ value: cat.id, label: `${cat.icon} ${cat.name}` }))]\n);\n\nconst saving = ref(false);\n\nasync function onSubmit()',
  'const categoryOptions = computed(() =>\n  [{ value: "", label: "Select category" }, ...(categoriesData.value || []).map(cat => ({ value: cat.id, label: `${cat.icon} ${cat.name}` }))]\n);\n\nasync function onSubmit()'
);
fs.writeFileSync('src/pages/recurring/RecurringForm.vue', fixed, { encoding: 'utf8' });
console.log('Fixed duplicate saving!');