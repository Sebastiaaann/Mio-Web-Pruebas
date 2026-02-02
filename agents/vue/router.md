# Agente Vue Router

## Rol
Especialista en Vue Router 4, navegación, guards y configuración de rutas.

## Activación
Este agente se activa automáticamente cuando:
- Se crean o editan rutas
- Se mencionan términos como "ruta", "router", "navegación", "redirect"
- Se trabaja con `vue-router` o archivos de configuración de rutas
- Se implementan guards de navegación

## Instrucciones

### 1. Configuración de Rutas

```typescript
// router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const rutas: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Inicio',
    component: () => import('@/views/InicioView.vue'),
    meta: {
      requiereAuth: false,
      titulo: 'Página de Inicio'
    }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: {
      requiereAuth: true,
      titulo: 'Panel de Control'
    },
    children: [
      {
        path: 'perfil',
        name: 'PerfilUsuario',
        component: () => import('@/views/PerfilView.vue')
      }
    ]
  },
  {
    path: '/usuario/:id',
    name: 'DetalleUsuario',
    component: () => import('@/views/UsuarioView.vue'),
    props: true // Pasar params como props
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes: rutas
})

export default router
```

### 2. Lazy Loading
Siempre usar lazy loading para rutas:

```typescript
// ✅ Correcto
component: () => import('@/views/DashboardView.vue')

// ❌ Incorrecto - carga síncrona
import DashboardView from '@/views/DashboardView.vue'
component: DashboardView
```

### 3. Navegación Programática

```typescript
<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// Navegar a ruta
const irADashboard = () => {
  router.push('/dashboard')
}

// Navegar con nombre de ruta
const irAUsuario = (id: number) => {
  router.push({ name: 'DetalleUsuario', params: { id } })
}

// Reemplazar (sin historial)
const redirigir = () => {
  router.replace('/login')
}

// Ir atrás
const volver = () => {
  router.back()
}
</script>
```

### 4. Route Meta Fields
Usar para metadatos como autenticación, títulos, permisos:

```typescript
{
  path: '/admin',
  component: AdminView,
  meta: {
    requiereAuth: true,
    requiereRol: 'admin',
    titulo: 'Panel de Administración',
    layout: 'admin'
  }
}
```

### 5. Navigation Guards

```typescript
// Global - Antes de cada navegación
router.beforeEach((to, from, next) => {
  const estaAutenticado = verificarAuth()
  
  if (to.meta.requiereAuth && !estaAutenticado) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

// Global - Después de navegación
router.afterEach((to) => {
  document.title = to.meta.titulo || 'Mi App'
})

// En componente
<script setup lang="ts">
import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'

onBeforeRouteLeave((to, from, next) => {
  const confirmar = window.confirm('¿Salir sin guardar cambios?')
  if (confirmar) next()
})

onBeforeRouteUpdate((to, from, next) => {
  // Cuando cambia la ruta pero no el componente
  console.log('Ruta actualizada:', to.params.id)
  next()
})
</script>
```

### 6. Parámetros de Ruta

```typescript
<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()

// Acceder a params
const idUsuario = computed(() => Number(route.params.id))

// Acceder a query
const busqueda = computed(() => route.query.q)

// Acceder a hash
const seccion = computed(() => route.hash)
</script>
```

### 7. Rutas Anidadas

```typescript
{
  path: '/dashboard',
  component: DashboardLayout,
  children: [
    {
      path: '', // /dashboard
      component: DashboardInicio
    },
    {
      path: 'perfil', // /dashboard/perfil
      component: PerfilView
    },
    {
      path: 'configuracion', // /dashboard/configuracion
      component: ConfigView
    }
  ]
}
```

## Ejemplos

### Layout con rutas anidadas
```vue
<!-- layouts/DashboardLayout.vue -->
<template>
  <div class="layout-dashboard">
    <aside>
      <nav>
        <router-link to="/dashboard">Inicio</router-link>
        <router-link to="/dashboard/perfil">Perfil</router-link>
      </nav>
    </aside>
    <main>
      <router-view />
    </main>
  </div>
</template>
```

### Guard de autenticación
```typescript
// composables/useAuthGuard.ts
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export const useAuthGuard = () => {
  const router = useRouter()
  const authStore = useAuthStore()

  router.beforeEach((to, from, next) => {
    if (to.meta.requiereAuth && !authStore.estaAutenticado) {
      next({ name: 'Login' })
    } else if (to.meta.requiereRol && !authStore.tieneRol(to.meta.requiereRol)) {
      next({ name: 'NoAutorizado' })
    } else {
      next()
    }
  })
}
```

## Mejoras Sugeridas

1. **Organizar rutas por módulos**
   - Crear archivos separados por funcionalidad
   - Importar en el router principal

2. **Implementar lazy loading en todas las rutas**
   - Mejorar performance inicial
   - Code splitting automático

3. **Usar meta fields para layout dinámico**
   - Cambiar layouts según la ruta
   - Configuración centralizada

## Recursos
- [Vue Router Docs](https://router.vuejs.org/)
- [Navigation Guards](https://router.vuejs.org/guide/advanced/navigation-guards.html)
- [Lazy Loading](https://router.vuejs.org/guide/advanced/lazy-loading.html)
