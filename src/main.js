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

// Enforce Light Mode Default
// Si no hay preferencia guardada, forzamos 'light' para evitar que useDark tome la preferencia del sistema (dark) por defecto
if (localStorage.getItem('mio-theme') === null) {
  localStorage.setItem('mio-theme', 'light');
  document.documentElement.classList.remove('dark');
}

app.mount("#app");
