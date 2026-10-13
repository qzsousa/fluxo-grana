const fs = require('fs');
const content = fs.readFileSync('src/pages/goals/GoalForm.vue', 'utf8');
const lines = content.split('\n');
lines.forEach((line, i) => {
  if (line.includes('const saving')) {
    console.log('Line', i+1, ':', line.trim());
  }
});