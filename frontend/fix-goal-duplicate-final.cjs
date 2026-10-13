const fs = require('fs');
const content = fs.readFileSync('src/pages/goals/GoalForm.vue', 'utf8');
// Remove the duplicate declarations at lines 180-181
const fixed = content.replace(
  'const { mutateAsync: createGoal } = useCreateGoal();\nconst { mutateAsync: updateGoal } = useUpdateGoal();\n\nconst saving = ref(false);',
  'const saving = ref(false);'
);
fs.writeFileSync('src/pages/goals/GoalForm.vue', fixed, { encoding: 'utf8' });
console.log('Fixed duplicate createGoal/updateGoal!');