const fs = require('fs');
const content = fs.readFileSync('src/pages/goals/GoalForm.vue', 'utf8');
// Remove the duplicate 'const saving = ref(false);' after the updateGoal/createGoal declarations
const fixed = content.replace(
  'const { mutateAsync: createGoal } = useCreateGoal();\nconst { mutateAsync: updateGoal } = useUpdateGoal();\n\nconst saving = ref(false);\n\nasync function onSubmit()',
  'const saving = ref(false);\n\nasync function onSubmit()'
);
fs.writeFileSync('src/pages/goals/GoalForm.vue', fixed, { encoding: 'utf8' });
console.log('Fixed duplicate saving!');