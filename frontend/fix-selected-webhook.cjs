const fs = require('fs');
const content = fs.readFileSync('src/pages/settings/WebhooksSettings.vue', 'utf8');
// Remove the duplicate 'const selectedWebhook = ref(null);' at line 141
const fixed = content.replace(
  'const selectedWebhookId = ref(null);\nconst webhookLogs = ref([\n  { id: "1", event: "TRANSACTION_CREATED", payload: { amount: 50, description: "Coffee" }, response: { status: 200 }, status: 200, success: true, createdAt: "2024-01-15T10:30:00Z" },\n  { id: "2", event: "BUDGET_ALERT", payload: { budget: "Groceries", spent: 90 }, response: null, status: 0, success: false, createdAt: "2024-01-15T09:00:00Z" },\n]);\n\nconst selectedWebhook = ref(null);',
  'const selectedWebhookId = ref(null);\nconst webhookLogs = ref([\n  { id: "1", event: "TRANSACTION_CREATED", payload: { amount: 50, description: "Coffee" }, response: { status: 200 }, status: 200, success: true, createdAt: "2024-01-15T10:30:00Z" },\n  { id: "2", event: "BUDGET_ALERT", payload: { budget: "Groceries", spent: 90 }, response: null, status: 0, success: false, createdAt: "2024-01-15T09:00:00Z" },\n]);'
);

fs.writeFileSync('src/pages/settings/WebhooksSettings.vue', fixed);
console.log('Fixed duplicate selectedWebhook!');