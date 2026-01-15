// src/main.js
import "./assets/styles/principal.css"; // Tailwind CSS + shadcn variables

import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";

const app = createApp(App);

// Inicializamos los módulos
app.use(createPinia());
app.use(router);

app.mount("#app");
