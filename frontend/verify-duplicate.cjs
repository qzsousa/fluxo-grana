const fs = require('fs');
const content = fs.readFileSync('src/pages/settings/WebhooksSettings.vue', 'utf8');
const lines = content.split('\n');
lines.forEach((line, i) => {
  if (line.includes('selectedWebhook')) {
    console.log('Line', i+1, ':', line.trim());
  }
});