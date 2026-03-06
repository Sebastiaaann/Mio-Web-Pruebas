// src/router/index.ts
import { createRouter, createWebHistory, type RouteRecordRaw, type RouteLocationNormalized } from 'vue-router'
import { type Component } from 'vue'
import { useTiendaUsuario } from '@/stores/tiendaUsuario'
import { logger } from '@/utils/logger'

/**
 * Helper para lazy loading con manejo de errores
 */
type LazyComponent = () => Promise<{ default: Component }>

function lazyLoad(importFn: LazyComponent, nombreComponente = 'Componente'): LazyComponent {
  return () => importFn()
    .then(module => {
      if (import.meta.env.DEV) {
        logger.info(`${nombreComponente} cargado`)
      }
      return module
    })
    .catch(error => {
      logger.error(`Error cargando ${nombreComponente}:`, error)
      throw error
    })
}

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: lazyLoad(() => import('@/views/inicio/AccesoView.vue'), 'Acceso'),
    meta: { requiresAuth: false, title: 'Iniciar Sesión' }
  },
  {
    path: '/auth',
    name: 'auth',
    component: lazyLoad(() => import('@/views/inicio/AuthView.vue'), 'Autenticación'),
    meta: { requiresAuth: false, title: 'Acceder' }
  },
  {
    path: '/',
    name: 'inicio',
    component: lazyLoad(() => import('@/views/inicio/LandingMio.vue'), 'Inicio'),
    meta: { requiresAuth: false, title: 'Acceso' }
  },
  {
    path: '/home',
    name: 'home',
    component: lazyLoad(() => import('@/views/inicio/HomeView.vue'), 'Inicio'),
    meta: { requiresAuth: true, title: 'Mi Inicio' }
  },
  {
    path: '/dashboard',
    redirect: '/home'
  },
  {
    path: '/dashboard-preventive',
    name: 'dashboard-preventive',
    component: lazyLoad(() => import('@/views/dashboard/MiSaludView.vue'), 'Mi Salud'),
    meta: { requiresAuth: true, title: 'Mi Salud' }
  },
  {
    path: '/controles',
    name: 'controles',
    component: lazyLoad(() => import('@/views/controles/ControlesView.vue'), 'Controles'),
    meta: { requiresAuth: true, title: 'Controles' }
  },
  {
    path: '/beneficios',
    name: 'beneficios',
    component: lazyLoad(() => import('@/views/beneficios/BeneficiosView.vue'), 'Beneficios'),
    meta: { requiresAuth: true, title: 'Beneficios' }
  },
  {
    path: '/nueva-medicion/tipo',
    name: 'nueva-medicion-tipo',
    component: lazyLoad(() => import('@/views/controles/ControlesView.vue'), 'Nueva Medición'),
    meta: { requiresAuth: true, title: 'Nueva Medición' }
  },
  {
    path: '/nueva-medicion/wizard',
    name: 'nueva-medicion-wizard',
    component: lazyLoad(() => import('@/views/controles/WizardView.vue'), 'Wizard'),
    meta: { requiresAuth: true, immersive: true, title: 'Nueva Medición' }
  },
  // Rutas legacy - redirigen al wizard dinámico
  {
    path: '/nueva-medicion/estado',
    redirect: '/nueva-medicion/tipo'
  },
  {
    path: '/nueva-medicion/valores',
    redirect: '/nueva-medicion/tipo'
  },
  {
    path: '/nueva-medicion/confirmar',
    redirect: '/nueva-medicion/tipo'
  },
  {
    path: '/mensajes',
    name: 'mensajes',
    component: lazyLoad(() => import('@/views/mensajes/MensajesView.vue'), 'Mensajes'),
    meta: { requiresAuth: true, title: 'Mensajes' }
  },
  {
    path: '/mensajes/controles',
    name: 'mensajes-controles',
    component: lazyLoad(() => import('@/views/mensajes/MensajesControlesView.vue'), 'Mensajes Controles'),
    meta: { requiresAuth: true, title: 'Controles Pendientes' }
  },
  {
    path: '/recursos',
    name: 'recursos',
    component: lazyLoad(() => import('@/views/recursos/RecursosView.vue'), 'Recursos'),
    meta: { requiresAuth: true, title: 'Recursos' }
  },
  // Legacy: Redirige al wizard dinámico
  {
    path: '/control-presion',
    redirect: () => ({ path: '/nueva-medicion/tipo' })
  },
  {
    path: '/ayuda',
    name: 'ayuda',
    component: lazyLoad(() => import('@/views/ayuda/AyudaView.vue'), 'Ayuda'),
    meta: { requiresAuth: true, title: 'Centro de Ayuda' }
  },
  {
    path: '/perfil',
    name: 'perfil',
    component: lazyLoad(() => import('@/views/perfil/MiPerfilView.vue'), 'Perfil'),
    meta: { requiresAuth: true, title: 'Mi Perfil' }
  },
  {
    path: '/historial-controles',
    name: 'historial-controles',
    component: lazyLoad(() => import('@/views/dashboard/HistorialControlesView.vue'), 'Historial'),
    meta: { requiresAuth: true, title: 'Historial de Controles' }
  },
  {
    path: '/citas',
    name: 'citas',
    component: lazyLoad(() => import('@/views/citas/CitasView.vue'), 'Citas'),
    meta: { requiresAuth: true, requiresLayout: false, title: 'Mis Citas' }
  },
  {
    path: '/citas/teleconsulta',
    name: 'teleconsulta',
    component: lazyLoad(() => import('@/views/citas/TeleconsultaView.vue'), 'Teleconsulta'),
    meta: { requiresAuth: true, requiresLayout: false, title: 'Teleconsulta' }
  },
  {
    path: '/chat',
    name: 'chat',
    component: lazyLoad(() => import('@/views/chat/ChatView.vue'), 'Chat'),
    meta: { requiresAuth: true, title: 'Chat' }
  },
  {
    path: '/campanas-anteriores',
    name: 'campanas-anteriores',
    component: lazyLoad(() => import('@/views/campanas/CampanasAnterioresView.vue'), 'Campañas Anteriores'),
    meta: { requiresAuth: true, title: 'Campañas Anteriores' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    redirect: '/'
  },
  {
    path: '/en-construccion',
    name: 'en-construccion',
    component: lazyLoad(() => import('@/views/general/EnConstruccionView.vue'), 'En Construcción'),
    meta: { requiresAuth: true, title: 'En Construcción' }
  },
  // Redirects para features no implementadas
  {
    path: '/campanas',
    redirect: '/en-construccion'
  },
  {
    path: '/onboarding',
    name: 'onboarding',
    component: lazyLoad(() => import('@/views/onboarding/OnboardingView.vue'), 'Onboarding'),
    meta: { requiresAuth: true, immersive: true, title: 'Incorporación' }
  },
  {
    path: '/encuesta',
    redirect: '/controles'
  },
  // Rutas legales (sin autenticación, sin layout)
  {
    path: '/politica-cookies',
    name: 'politica-cookies',
    component: lazyLoad(() => import('@/views/legal/PoliticaCookiesView.vue'), 'Política de Cookies'),
    meta: { requiresAuth: false, requiresLayout: false, title: 'Política de Cookies' }
  },
  {
    path: '/privacidad',
    name: 'privacidad',
    component: lazyLoad(() => import('@/views/legal/PoliticaPrivacidadView.vue'), 'Política de Privacidad'),
    meta: { requiresAuth: false, requiresLayout: false, title: 'Política de Privacidad' }
  },
  {
    path: '/terminos',
    name: 'terminos',
    component: lazyLoad(() => import('@/views/legal/TerminosServicioView.vue'), 'Términos de Servicio'),
    meta: { requiresAuth: false, requiresLayout: false, title: 'Términos de Servicio' }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0 }
  },
  routes
})

// Navigation guard para proteger rutas autenticadas
router.beforeEach((to: RouteLocationNormalized) => {
  const tiendaUsuario = useTiendaUsuario()

  if (to.meta.requiresAuth && !tiendaUsuario.estaAutenticado) {
    return { name: 'inicio' }
  }

  if (to.name === 'inicio' && tiendaUsuario.estaAutenticado) {
    return { name: 'home' }
  }

  return true
})

// Manejo global de errores de navegación
// Protección contra loop infinito de reloads: máximo 2 recargas por sesión
const CLAVE_RECARGAS = 'mio-router-recargas'
const MAX_RECARGAS = 2

router.onError((error, to) => {
  logger.error('Error de navegación:', error)

  if (error.message?.includes('Failed to fetch dynamically imported module')
    || error.message?.includes('Importing a module script failed')
    || error.message?.includes('error loading dynamically imported module')) {
    const recargas = parseInt(sessionStorage.getItem(CLAVE_RECARGAS) ?? '0', 10)
    if (recargas < MAX_RECARGAS) {
      sessionStorage.setItem(CLAVE_RECARGAS, String(recargas + 1))
      logger.warn(`Recargando página por error de carga de módulo (intento ${recargas + 1}/${MAX_RECARGAS})...`)
      window.location.reload()
    } else {
      logger.error('Máximo de recargas alcanzado, redirigiendo a inicio.')
      sessionStorage.removeItem(CLAVE_RECARGAS)
      router.push({ name: 'inicio' })
    }
    return
  }

  if (to.path !== '/') {
    router.push({ name: 'inicio' })
  }
})

// Guard para manejar cambios de título de página
router.afterEach((to) => {
  const tituloBase = 'Mio+'
  const tituloRuta = to.meta?.title || to.name
  document.title = tituloRuta ? `${tituloRuta} | ${tituloBase}` : tituloBase
})

export default router
