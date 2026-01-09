// src/main.js
import "./assets/styles/principal.css"; // Importamos Tailwind
import "./assets/styles/primevue-theme.css"; // Tu archivo de tema PrimeVue

import { createApp } from "vue";
import { createPinia } from "pinia";
import PrimeVue from "primevue/config";
import Aura from "@primevue/themes/aura"; // Preset moderno

import App from "./App.vue";
import router from "./router";

const app = createApp(App);

// Inicializamos los módulos
app.use(createPinia());
app.use(router);

// Configuración de PrimeVue
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      prefix: "p",
      darkModeSelector: "system", // o '.my-app-dark'
      cssLayer: false,
    },
  },
});

app.mount("#app");
