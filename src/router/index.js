import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Rutas con AppLayout
    {
      path: "/",
      name: "inicio",
      component: () => import("../views/InicioViewModern.vue"),
      meta: { requiresLayout: false, title: 'Inicio - Mio' }
    },
    {
      path: "/mediciones",
      name: "mediciones",
      component: () => import("../views/MedicionesView.vue"),
      meta: { requiresLayout: true, title: 'Mediciones - Mio' }
    },
    {
      path: "/recursos",
      name: "recursos",
      component: () => import("../views/RecursosView.vue"),
      meta: { requiresLayout: true, title: 'Recursos - Mio' }
    },
    {
      path: "/perfil",
      name: "perfil",
      component: () => import("../views/PerfilView.vue"),
      meta: { requiresLayout: true, title: 'Perfil - Mio' }
    }

    // FASE 2 - Rutas de Onboarding y Dashboard
    ,
    // Ruta de Onboarding (sin layout principal)
    {
      path: "/onboarding",
      name: "onboarding",
      component: () => import("../views/onboarding/OnboardingView.vue"),
      meta: {
        requiresLayout: false,
        title: 'Configuración - Mio',
        description: 'Configure su perfil Mio'
      }
    },

    // Dashboard (placeholder por ahora)
    {
      path: "/dashboard",
      name: "dashboard",
      component: () => import("../views/DashboardView.vue"),
      meta: {
        requiresLayout: true,
        title: 'Dashboard - Mio',
        description: 'Panel principal de monitoreo'
      }
    },
    {
      path: "/dashboard-bento",
      name: "dashboard-bento",
      component: () => import("../views/DashboardBentoView.vue"),
      meta: {
        requiresLayout: true,
        title: 'Dashboard Bento - Mio',
        description: 'Nueva vista de panel'
      }
    },
    {
      path: "/dashboard-preventive",
      name: "dashboard-preventive",
      component: () => import("../views/DashboardPreventiveView.vue"),
      meta: {
        requiresLayout: true,
        title: 'Preventivo - Mio',
        description: 'Panel de monitoreo preventivo'
      }
    },

    // Nuevas rutas de navegación
    {
      path: "/mensajes",
      name: "mensajes",
      component: () => import("../views/MensajesView.vue"),
      meta: {
        requiresLayout: true,
        title: 'Mensajes - Mio',
        description: 'Bandeja de mensajes'
      }
    },
    {
      path: "/controles",
      name: "controles",
      component: () => import("../views/ControlesView.vue"),
      meta: {
        requiresLayout: true,
        title: 'Controles - Mio',
        description: 'Gestión de controles de salud'
      }
    },
    {
      path: "/ayuda",
      name: "ayuda",
      component: () => import("../views/AyudaView.vue"),
      meta: {
        requiresLayout: true,
        title: 'Ayuda - Mio',
        description: 'Centro de ayuda y soporte'
      }
    }
  ],
});

// Navigation guard que actualiza el título de la página
router.beforeEach((to) => {
  document.title = to.meta.title || 'Mio';
});

export default router;

