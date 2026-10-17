import { createApp } from "vue";
import { createPinia } from "pinia";
import router from "./router/index.js";
import { setupQueryClient } from "./plugins/query";
import { usePreferences } from "./composables/usePreferences";
import App from "./App.vue";
import "./styles/main.css";

const app = createApp(App);

// Aplica acento, densidade e escala de texto no <html> antes do mount, para o
// primeiro paint já sair com o visual escolhido — sem "piscar" no tema padrão.
usePreferences();

app.use(createPinia());
app.use(router);
setupQueryClient(app);

app.mount("#app");
