import { createRouter, createWebHistory } from "vue-router";
import InicioView from "../views/InicioView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Rutas con AppLayout
    {
      path: "/",
      name: "inicio",
      component: InicioView,
      meta: { requiresLayout: false, title: 'Inicio - HOMA' }
    },
    {
      path: "/mediciones",
      name: "mediciones",
      component: () => import("../views/MedicionesView.vue"),
      meta: { requiresLayout: true, title: 'Mediciones - HOMA' }
    },
    {
      path: "/recursos",
      name: "recursos",
      component: () => import("../views/RecursosView.vue"),
      meta: { requiresLayout: true, title: 'Recursos - HOMA' }
    },
    {
      path: "/perfil",
      name: "perfil",
      component: () => import("../views/PerfilView.vue"),
      meta: { requiresLayout: true, title: 'Perfil - HOMA' }
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
        title: 'Configuración - HOMA',
        description: 'Configure su perfil HOMA'
      }
    },

    // Dashboard (placeholder por ahora)
    {
      path: "/dashboard",
      name: "dashboard",
      component: () => import("../views/DashboardView.vue"),
      meta: {
        requiresLayout: true,
        title: 'Dashboard - HOMA',
        description: 'Panel principal de monitoreo'
      }
    }
  ],
});

// Navigation guard que actualiza el título de la página
router.beforeEach((to) => {
  document.title = to.meta.title || 'HOMA';
});

export default router;

