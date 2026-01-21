---
name: vue-router
description: Use when working with Vue Router - routing setup, navigation guards, route params, lazy loading, meta fields, and navigation patterns in Vue 3 applications
license: MIT
---

# Vue Router Development

Reference for Vue Router 4 patterns in Vue 3 applications with JavaScript.

## Overview

Vue Router is the official router for Vue.js applications. This skill covers routing patterns, navigation guards, and best practices.

## When to Use

**Use this skill when:**

- Creating or editing routes in `router/index.js`
- Implementing navigation guards
- Working with route params/query
- Adding meta fields for layouts or auth
- Setting up lazy loading

## Quick Reference

| Pattern | Syntax |
| ------- | ------ |
| Create router | `createRouter({ history: createWebHistory(), routes })` |
| Route params | `:id` → `route.params.id` |
| Route query | `?search=x` → `route.query.search` |
| Lazy loading | `component: () => import('./views/MyView.vue')` |
| Navigation | `router.push('/path')` or `router.push({ name: 'routeName' })` |
| Guards | `router.beforeEach((to, from) => { })` |

## Route Configuration

### Basic Routes

```js
// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { 
        requiresLayout: false, 
        title: 'Home - Mio' 
      }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      // Lazy loading - mejor rendimiento
      component: () => import('../views/DashboardView.vue'),
      meta: { 
        requiresLayout: true, 
        requiresAuth: true,
        title: 'Dashboard - Mio' 
      }
    }
  ]
})

export default router
```

### Routes with Params

```js
{
  path: '/product/:id',
  name: 'product-detail',
  component: () => import('../views/ProductDetailView.vue'),
  props: true  // Pasa params como props al componente
}

// En el componente:
const { id } = defineProps(['id'])
```

### Nested Routes

```js
{
  path: '/settings',
  component: () => import('../views/SettingsLayout.vue'),
  children: [
    {
      path: '',  // /settings
      name: 'settings-general',
      component: () => import('../views/settings/GeneralView.vue')
    },
    {
      path: 'profile',  // /settings/profile
      name: 'settings-profile',
      component: () => import('../views/settings/ProfileView.vue')
    },
    {
      path: 'security',  // /settings/security
      name: 'settings-security',
      component: () => import('../views/settings/SecurityView.vue')
    }
  ]
}
```

## Navigation Guards

### Global Guards

```js
// Actualizar título de página
router.beforeEach((to) => {
  document.title = to.meta.title || 'Mio'
})

// Proteger rutas que requieren autenticación
router.beforeEach((to, from) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // Guardar ruta destino para redirect después del login
    return { 
      name: 'login', 
      query: { redirect: to.fullPath } 
    }
  }
})
```

### Route-Level Guards

```js
{
  path: '/admin',
  component: AdminView,
  beforeEnter: (to, from) => {
    const authStore = useAuthStore()
    if (!authStore.isAdmin) {
      return { name: 'unauthorized' }
    }
  }
}
```

## Navigation

### Programmatic Navigation

```js
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// Navegar a ruta
router.push('/dashboard')
router.push({ name: 'dashboard' })
router.push({ name: 'product', params: { id: 123 } })
router.push({ path: '/search', query: { q: 'keyword' } })

// Reemplazar (sin agregar al historial)
router.replace('/dashboard')

// Volver atrás
router.back()
router.go(-1)

// Acceder a params y query actuales
console.log(route.params.id)
console.log(route.query.search)
```

### Template Navigation

```vue
<template>
  <!-- RouterLink básico -->
  <RouterLink to="/">Home</RouterLink>
  
  <!-- Con nombre de ruta -->
  <RouterLink :to="{ name: 'dashboard' }">Dashboard</RouterLink>
  
  <!-- Con params -->
  <RouterLink :to="{ name: 'product', params: { id: product.id } }">
    {{ product.name }}
  </RouterLink>
  
  <!-- Estilo activo -->
  <RouterLink 
    to="/about" 
    active-class="text-primary font-bold"
  >
    About
  </RouterLink>
</template>
```

## Meta Fields

### Layout Management

```js
// En router/index.js
{
  path: '/dashboard',
  component: DashboardView,
  meta: { requiresLayout: true }
},
{
  path: '/login',
  component: LoginView,
  meta: { requiresLayout: false }
}
```

```vue
<!-- En App.vue -->
<template>
  <AppLayout v-if="route.meta.requiresLayout">
    <RouterView />
  </AppLayout>
  <RouterView v-else />
</template>

<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
</script>
```

### Authentication

```js
{
  path: '/admin',
  meta: { 
    requiresAuth: true,
    roles: ['admin', 'superadmin']
  }
}

// Guard
router.beforeEach((to) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'login' }
  }
  
  if (to.meta.roles && !to.meta.roles.includes(authStore.user?.role)) {
    return { name: 'unauthorized' }
  }
})
```

## Route Transitions

```vue
<template>
  <RouterView v-slot="{ Component }">
    <Transition name="fade" mode="out-in">
      <component :is="Component" />
    </Transition>
  </RouterView>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```

## Common Patterns

### Redirect After Login

```js
// En LoginView.vue
const route = useRoute()
const router = useRouter()

async function login() {
  await authStore.signIn(email, password)
  
  // Redirect a la ruta original o dashboard
  const redirect = route.query.redirect || '/dashboard'
  router.push(redirect)
}
```

### 404 Catch-All

```js
{
  path: '/:pathMatch(.*)*',
  name: 'not-found',
  component: () => import('../views/NotFoundView.vue')
}
```

## Common Mistakes

**No usar lazy loading:**

```js
// ❌ Wrong - importa todo al inicio
import DashboardView from '../views/DashboardView.vue'
{ path: '/dashboard', component: DashboardView }

// ✅ Correct - lazy loading
{ 
  path: '/dashboard', 
  component: () => import('../views/DashboardView.vue') 
}
```

**Olvidar usar `name` en rutas:**

```js
// ❌ Wrong - sin nombre, difícil de referenciar
{ path: '/user/:id', component: UserView }

// ✅ Correct - con nombre para navegación más limpia
{ 
  path: '/user/:id', 
  name: 'user-profile',
  component: UserView 
}
```
