const fs = require('fs');
const content = fs.readFileSync('src/pages/goals/GoalForm.vue', 'utf8');
// Remove the second 'const saving = ref(false);' after the accountOptions
const fixed = content.replace(
  'const accountOptions = computed(() =>\n  [{ value: "", label: "Select account" }, ...(accountsData.value || []).map(acc => ({ value: acc.id, label: `${acc.name} (${acc.currency})` }))]\n);\n\nconst saving = ref(false);\n\nasync function onSubmit()',
  'const accountOptions = computed(() =>\n  [{ value: "", label: "Select account" }, ...(accountsData.value || []).map(acc => ({ value: acc.id, label: `${acc.name} (${acc.currency})` }))]\n);\n\nasync function onSubmit()'
);
fs.writeFileSync('src/pages/goals/GoalForm.vue', fixed, { encoding: 'utf8' });
console.log('Fixed duplicate saving!');