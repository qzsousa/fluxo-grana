const fs = require('fs');
const content = fs.readFileSync('src/pages/family/FamilyInvite.vue', 'utf8');
const fixed = content.replace('<script setup lang="ts>', '<script setup lang="ts">');
fs.writeFileSync('src/pages/family/FamilyInvite.vue', fixed);
console.log('Fixed!');