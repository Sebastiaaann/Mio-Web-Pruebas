// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import { useTiendaUsuario } from "@/stores/tiendaUsuario";

/**
 * Helper para lazy loading con manejo de errores
 * @param {Function} importFn - Función de importación dinámica
 * @param {string} nombreComponente - Nombre para logs
 * @returns {Function} Componente lazy
 */
function lazyLoad(importFn, nombreComponente = 'Componente') {
  return () => importFn()
    .then(module => {
      console.log(`✅ ${nombreComponente} cargado`);
      return module;
    })
    .catch(error => {
      console.error(`❌ Error cargando ${nombreComponente}:`, error);
      throw error;
    });
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    // Si hay una posición guardada (ej. al usar el botón de navegación del navegador)
    if (savedPosition) {
      return savedPosition
    }
    // En cualquier otra navegación, ir al inicio de la página (sin smooth para evitar lag)
    return { top: 0 }
  },
  routes: [
    {
      path: "/",
      name: "inicio",
      component: lazyLoad(() => import("@/views/inicio/InicioViewModern.vue"), "Inicio"),
      meta: { requiresAuth: false, title: "Inicio" },
    },
    {
      path: "/home",
      name: "home",
      component: lazyLoad(() => import("@/views/inicio/HomeView.vue"), "Home"),
      meta: { requiresAuth: true, title: "Mi Home" },
    },
    {
      path: "/dashboard",
      name: "dashboard",
      component: lazyLoad(() => import("@/views/dashboard/DashboardView.vue"), "Dashboard"),
      meta: { requiresAuth: true, title: "Dashboard" },
    },
    {
      path: "/dashboard-preventive",
      name: "dashboard-preventive",
      component: lazyLoad(() => import("@/views/dashboard/MiSaludView.vue"), "Mi Salud"),
      meta: { requiresAuth: true, title: "Mi Salud" },
    },
    {
      path: "/controles",
      name: "controles",
      component: lazyLoad(() => import("@/views/controles/ControlesView.vue"), "Controles"),
      meta: { requiresAuth: true, title: "Controles" },
    },
    {
      path: "/nueva-medicion/tipo",
      name: "nueva-medicion-tipo",
      component: lazyLoad(() => import("@/views/controles/ControlesView.vue"), "Nueva Medición"),
      meta: { requiresAuth: true, title: "Nueva Medición" },
    },
    {
      path: "/nueva-medicion/wizard",
      name: "nueva-medicion-wizard",
      component: lazyLoad(() => import("@/views/controles/WizardView.vue"), "Wizard"),
      meta: { requiresAuth: true, immersive: true, title: "Nueva Medición" },
    },
    // Rutas legacy - redirigen al wizard dinámico
    {
      path: "/nueva-medicion/estado",
      redirect: "/nueva-medicion/tipo",
    },
    {
      path: "/nueva-medicion/valores",
      redirect: "/nueva-medicion/tipo",
    },
    {
      path: "/nueva-medicion/confirmar",
      redirect: "/nueva-medicion/tipo",
    },
    {
      path: "/mensajes",
      name: "mensajes",
      component: lazyLoad(() => import("@/views/mensajes/MensajesView.vue"), "Mensajes"),
      meta: { requiresAuth: true, title: "Mensajes" },
    },
    {
      path: "/recursos",
      name: "recursos",
      component: lazyLoad(() => import("@/views/recursos/RecursosView.vue"), "Recursos"),
      meta: { requiresAuth: true, title: "Recursos" },
    },
    // Legacy: Redirige al wizard dinámico
    {
      path: "/control-presion",
      redirect: () => {
        return { path: '/nueva-medicion/tipo' }
      },
    },
    {
      path: "/ayuda",
      name: "ayuda",
      component: lazyLoad(() => import("@/views/ayuda/AyudaView.vue"), "Ayuda"),
      meta: { requiresAuth: true, title: "Centro de Ayuda" },
    },
    {
      path: "/perfil",
      name: "perfil",
      component: lazyLoad(() => import("@/views/perfil/MiPerfilView.vue"), "Perfil"),
      meta: { requiresAuth: true, title: "Mi Perfil" },
    },
    {
      path: "/historial-controles",
      name: "historial-controles",
      component: lazyLoad(() => import("@/views/dashboard/HistorialControlesView.vue"), "Historial"),
      meta: { requiresAuth: true, title: "Historial de Controles" },
    },
    {
      path: "/citas",
      name: "citas",
      component: lazyLoad(() => import("@/views/citas/CitasView.vue"), "Citas"),
      meta: { requiresAuth: true, requiresLayout: false, title: "Mis Citas" },
    },
    {
      path: "/chat",
      name: "chat",
      component: lazyLoad(() => import("@/views/chat/ChatView.vue"), "Chat"),
      meta: { requiresAuth: true, title: "Chat" },
    },
    {
      path: "/campanas-anteriores",
      name: "campanas-anteriores",
      component: lazyLoad(() => import("@/views/campanas/CampanasAnterioresView.vue"), "Campañas Anteriores"),
      meta: { requiresAuth: true, title: "Campañas Anteriores" },
    },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      redirect: "/",
    },
    {
      path: "/en-construccion",
      name: "en-construccion",
      component: lazyLoad(() => import("@/views/general/EnConstruccionView.vue"), "En Construcción"),
      meta: { requiresAuth: true, title: "En Construcción" },
    },
    // Redirects para features no implementadas
    {
      path: "/campanas",
      redirect: "/en-construccion"
    },
    {
      path: "/onboarding",
      redirect: "/en-construccion"
    },
    {
      path: "/encuesta",
      redirect: "/controles" // Encuesta está en Controles
    },
  ],
});

// Navigation guard para proteger rutas autenticadas
// Patrón Vue Router 4: retornar la ruta directamente en lugar de usar next()
router.beforeEach((to, from) => {
  const tiendaUsuario = useTiendaUsuario();

  // Redirigir a inicio si no está autenticado
  if (to.meta.requiresAuth && !tiendaUsuario.estaAutenticado) {
    return { name: "inicio" };
  }

  // Redirigir a home si ya está autenticado e intenta ir a inicio
  if (to.name === "inicio" && tiendaUsuario.estaAutenticado) {
    return { name: "home" };
  }

  // Permitir navegación (no retornar nada o retornar true)
  return true;
});

// Manejo global de errores de navegación
router.onError((error, to, from) => {
  console.error('❌ Error de navegación:', error);
  
  // Si falla el lazy loading (chunk no encontrado), recargar la página
  if (error.message?.includes('Failed to fetch dynamically imported module') ||
      error.message?.includes('Importing a module script failed') ||
      error.message?.includes('error loading dynamically imported module')) {
    console.warn('🔄 Recargando página por error de carga de módulo...');
    window.location.reload();
    return;
  }
  
  // Otros errores: redirigir a página de error o inicio
  if (to.path !== '/') {
    router.push({ name: 'inicio' });
  }
});

// Guard para manejar cambios de título de página
router.afterEach((to) => {
  // Actualizar título de la página
  const tituloBase = 'Mio+';
  const tituloRuta = to.meta?.title || to.name;
  document.title = tituloRuta ? `${tituloRuta} | ${tituloBase}` : tituloBase;
});

export default router;
