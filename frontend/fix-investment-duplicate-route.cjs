const fs = require('fs');
const content = fs.readFileSync('src/pages/investments/InvestmentForm.vue', 'utf8');
// Remove the duplicate route/router declarations at the bottom
const fixed = content.replace(
  'const route = useRoute();\nconst router = useRouter();\nconst isEditing = computed(() => route.params.id !== undefined);\nconst investmentId = route.params.id as string;\nconst { data: investmentsData } = useInvestments();\n',
  ''
);
fs.writeFileSync('src/pages/investments/InvestmentForm.vue', fixed, { encoding: 'utf8' });
console.log('Fixed duplicate route/router!');