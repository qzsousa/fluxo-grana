const fs = require('fs');
const content = fs.readFileSync('src/pages/investments/InvestmentForm.vue', 'utf8');
// Remove the duplicate 'const saving = ref(false);' after the currencyOptions
const fixed = content.replace(
  'const currencyOptions = [\n  { value: "BRL", label: "BRL - Brazilian Real" },\n  { value: "USD", label: "USD - US Dollar" },\n  { value: "EUR", label: "EUR - Euro" },\n  { value: "GBP", label: "GBP - British Pound" },\n];\n\nconst saving = ref(false);\n\nasync function onSubmit()',
  'const currencyOptions = [\n  { value: "BRL", label: "BRL - Brazilian Real" },\n  { value: "USD", label: "USD - US Dollar" },\n  { value: "EUR", label: "EUR - Euro" },\n  { value: "GBP", label: "GBP - British Pound" },\n];\n\nasync function onSubmit()'
);
fs.writeFileSync('src/pages/investments/InvestmentForm.vue', fixed, { encoding: 'utf8' });
console.log('Fixed duplicate saving!');