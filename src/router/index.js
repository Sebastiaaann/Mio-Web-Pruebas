// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import { useTiendaUsuario } from "@/stores/tiendaUsuario";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "inicio",
      component: () => import("@/views/InicioViewModern.vue"),
      meta: { requiresAuth: false },
    },
    {
      path: "/home",
      name: "home",
      component: () => import("@/views/HomeView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/dashboard",
      name: "dashboard",
      component: () => import("@/views/DashboardView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/dashboard-preventive",
      name: "dashboard-preventive",
      component: () => import("@/views/PreventivoCarouselView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/dashboard-bento",
      name: "dashboard-bento",
      component: () => import("@/views/DashboardBentoView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/controles",
      name: "controles",
      component: () => import("@/views/ControlesView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/mediciones",
      name: "mediciones",
      component: () => import("@/views/MedicionesView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/mensajes",
      name: "mensajes",
      component: () => import("@/views/MensajesView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/recursos",
      name: "recursos",
      component: () => import("@/views/RecursosView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/control-presion",
      name: "control-presion",
      component: () => import("@/views/BloodPressureWizardView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/ayuda",
      name: "ayuda",
      component: () => import("@/views/AyudaView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/perfil",
      name: "perfil",
      component: () => import("@/views/PerfilView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/citas",
      name: "citas",
      component: () => import("@/views/CitasView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      redirect: "/",
    },
    {
      path: "/en-construccion",
      name: "en-construccion",
      component: () => import("@/views/EnConstruccionView.vue"),
      meta: { requiresAuth: true },
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
    // Rutas demo - solo en desarrollo
    ...(import.meta.env.DEV ? [
      {
        path: "/demo-layout",
        name: "demo-layout",
        component: () => import("@/components/demo/SharedLayoutDemo.vue"),
      },
      {
        path: "/demo-svg",
        name: "demo-svg",
        component: () => import("@/components/demo/SvgDrawingDemo.vue"),
      },
      {
        path: "/demo-gestures",
        name: "demo-gestures",
        component: () => import("@/components/demo/GesturesDemo.vue"),
      },
      {
        path: "/demo-gradients",
        name: "demo-gradients",
        component: () => import("@/components/demo/GradientsDemo.vue"),
      },
      {
        path: "/demo-signin",
        name: "demo-signin",
        component: () => import("@/components/demo/SignInDialogDemo.vue"),
      },
      {
        path: "/demo-optical",
        name: "demo-optical",
        component: () => import("@/components/demo/OpticalDemo.vue"),
      },
      {
        path: "/demo-input",
        name: "demo-input",
        component: () => import("@/components/demo/InputDemo.vue"),
      },
      {
        path: "/demo-collection",
        name: "demo-collection",
        component: () => import("@/components/demo/CollectionPreviewDemo.vue"),
      },
      {
        path: "/demo-stack",
        name: "demo-stack",
        component: () => import("@/components/demo/InfiniteStackDemo.vue"),
      },
    ] : []),
  ],
});

// Navigation guard para proteger rutas autenticadas
router.beforeEach((to, from, next) => {
  const tiendaUsuario = useTiendaUsuario();

  if (to.meta.requiresAuth && !tiendaUsuario.estaAutenticado) {
    // Redirigir a inicio si no está autenticado
    next({ name: "inicio" });
  } else if (to.name === "inicio" && tiendaUsuario.estaAutenticado) {
    // Redirigir a home si ya está autenticado e intenta ir a inicio
    next({ name: "home" });
  } else {
    next();
  }
});

export default router;
