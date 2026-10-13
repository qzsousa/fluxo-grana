const fs = require('fs');
const content = fs.readFileSync('src/pages/recurring/RecurringForm.vue', 'utf8');
// Remove the duplicate 'const saving = ref(false);' after the updateRecurring/createRecurring declarations
const fixed = content.replace(
  'const { mutateAsync: createRecurring } = useCreateRecurring();\nconst { mutateAsync: updateRecurring } = useUpdateRecurring();\n\nconst saving = ref(false);\n\nasync function onSubmit()',
  'const saving = ref(false);\n\nasync function onSubmit()'
);
fs.writeFileSync('src/pages/recurring/RecurringForm.vue', fixed, { encoding: 'utf8' });
console.log('Fixed duplicate saving!');