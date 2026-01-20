// src/main.js
import "./assets/styles/principal.css"; // Tailwind CSS + shadcn variables

import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";

const app = createApp(App);

// Inicializamos los módulos
const pinia = createPinia();
app.use(pinia);

// Restaurar sesión antes de montar el router
import { useTiendaUsuario } from "@/stores/tiendaUsuario";
const userStore = useTiendaUsuario();
userStore.restaurarSesion();

app.use(router);

app.mount("#app");
