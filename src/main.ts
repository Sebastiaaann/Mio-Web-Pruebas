// src/main.ts
import './assets/styles/principal.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { piniaPersistPlugin } from './plugins/piniaPersist'

import App from './App.vue'
import router from './router'

const app = createApp(App)

// Inicializamos Pinia con plugin de persistencia
const pinia = createPinia()
pinia.use(piniaPersistPlugin)
app.use(pinia)

// Restaurar sesion antes de montar el router
import { useTiendaUsuario } from '@/stores/tiendaUsuario'
const userStore = useTiendaUsuario()
userStore.restaurarSesion()

app.use(router)

// Enforce Light Mode Default
// Si no hay preferencia guardada, forzamos 'light' para evitar que useDark tome la preferencia del sistema (dark) por defecto
if (localStorage.getItem('mio-theme') === null) {
  localStorage.setItem('mio-theme', 'light')
  document.documentElement.classList.remove('dark')
}

app.mount('#app')
