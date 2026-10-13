import { createApp } from "vue";
import { createPinia } from "pinia";
import router from "./router/index.js";
import { setupQueryClient } from "./plugins/query";
import App from "./App.vue";
import "./styles/main.css";

const app = createApp(App);

app.use(createPinia());
app.use(router);
setupQueryClient(app);

app.mount("#app");