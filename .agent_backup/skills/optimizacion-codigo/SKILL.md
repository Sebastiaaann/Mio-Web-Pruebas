---
name: code-optimization
description: Use when optimizing JavaScript/Vue code performance - provides patterns for memory management, component optimization, async handling, bundle size reduction, and common anti-patterns to avoid
---

# Code Optimization Skill

Reference for JavaScript and Vue 3 code optimization patterns, performance best practices, and common anti-patterns to avoid.

## When to Use

**Use this skill when:**

- Reviewing code for performance issues
- Optimizing Vue components for re-renders
- Reducing bundle size
- Fixing memory leaks
- Improving async/await patterns
- Refactoring inefficient code

## Quick Reference

| Problem Area               | Load file                        |
| -------------------------- | -------------------------------- |
| Component re-renders       | references/vue-optimization.md   |
| Memory leaks               | references/memory-management.md  |
| Bundle size                | references/bundle-optimization.md|
| Async/API calls            | references/async-patterns.md     |
| General JS performance     | references/javascript-perf.md    |

## Core Optimization Principles

### 1. Vue Component Optimization

```vue
<script setup>
// ✅ GOOD: Composición reactiva eficiente
import { computed, shallowRef, triggerRef } from 'vue'

// Use shallowRef para objetos grandes que no necesitan reactividad profunda
const largeData = shallowRef([])

// Use computed para valores derivados (se cachean automáticamente)
const filteredData = computed(() => 
  largeData.value.filter(item => item.active)
)

// ❌ BAD: Crear funciones en el template
// <button @click="() => handleClick(item)">

// ✅ GOOD: Usar data attributes o métodos
// <button @click="handleClick" :data-id="item.id">
</script>
```

### 2. Evitar Re-renders Innecesarios

```vue
<script setup>
import { defineAsyncComponent, markRaw } from 'vue'

// ✅ Lazy loading de componentes pesados
const HeavyChart = defineAsyncComponent(() => 
  import('@/components/HeavyChart.vue')
)

// ✅ markRaw para objetos que no necesitan reactividad
const staticConfig = markRaw({
  options: { /* ... */ },
  plugins: [ /* ... */ ]
})

// ✅ Props estables - evitar crear objetos nuevos en cada render
// ❌ BAD: <Child :config="{ foo: 'bar' }" />
// ✅ GOOD: 
const childConfig = { foo: 'bar' }
// <Child :config="childConfig" />
</script>
```

### 3. Optimización de Listas

```vue
<template>
  <!-- ✅ SIEMPRE usar key único y estable -->
  <div v-for="item in items" :key="item.id">
    {{ item.name }}
  </div>
  
  <!-- ❌ EVITAR usar index como key si la lista cambia -->
  <!-- <div v-for="(item, index) in items" :key="index"> -->
  
  <!-- ✅ Virtualización para listas largas (>100 items) -->
  <!-- Usar vue-virtual-scroller o similar -->
</template>

<script setup>
import { computed } from 'vue'

// ✅ Filtrar/transformar en computed, no en template
const visibleItems = computed(() => 
  items.value.filter(i => i.visible).slice(0, 50)
)
</script>
```

### 4. Async/Await Patterns

```javascript
// ✅ GOOD: Ejecución paralela cuando sea posible
async function loadDashboard() {
  const [users, products, stats] = await Promise.all([
    fetchUsers(),
    fetchProducts(),
    fetchStats()
  ])
  return { users, products, stats }
}

// ❌ BAD: Ejecución secuencial innecesaria
async function loadDashboardSlow() {
  const users = await fetchUsers()      // espera...
  const products = await fetchProducts() // espera...
  const stats = await fetchStats()       // espera...
}

// ✅ GOOD: Cancelar requests pendientes
import { ref, onUnmounted } from 'vue'

const controller = new AbortController()

async function fetchData() {
  const response = await fetch(url, { 
    signal: controller.signal 
  })
}

onUnmounted(() => {
  controller.abort()
})
```

### 5. Memory Management

```javascript
// ✅ Limpiar event listeners
import { onMounted, onUnmounted } from 'vue'

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// ✅ Limpiar intervals/timeouts
const intervalId = ref(null)

onMounted(() => {
  intervalId.value = setInterval(updateData, 5000)
})

onUnmounted(() => {
  if (intervalId.value) {
    clearInterval(intervalId.value)
  }
})

// ✅ Limpiar subscriptions (Supabase, websockets, etc.)
const subscription = ref(null)

onMounted(() => {
  subscription.value = supabase
    .channel('updates')
    .on('postgres_changes', { /* ... */ }, handleChange)
    .subscribe()
})

onUnmounted(() => {
  subscription.value?.unsubscribe()
})
```

### 6. Import Optimization

```javascript
// ✅ GOOD: Named imports (tree-shakeable)
import { debounce, throttle } from 'lodash-es'

// ❌ BAD: Default import (incluye toda la librería)
import _ from 'lodash'

// ✅ GOOD: Dynamic imports para código condicional
const loadEditor = async () => {
  const { Editor } = await import('@/components/Editor.vue')
  return Editor
}

// ✅ GOOD: Lazy routes
{
  path: '/admin',
  component: () => import('@/views/AdminView.vue')
}
```

### 7. Computed vs Methods vs Watch

```javascript
import { computed, watch, ref } from 'vue'

// ✅ USE COMPUTED: para valores derivados (cacheados)
const fullName = computed(() => `${firstName.value} ${lastName.value}`)

// ✅ USE METHODS: para acciones o cuando necesitas parámetros
function formatPrice(price, currency) {
  return new Intl.NumberFormat('es', { style: 'currency', currency }).format(price)
}

// ✅ USE WATCH: para efectos secundarios (API calls, logging)
watch(searchQuery, async (newQuery) => {
  if (newQuery.length > 2) {
    results.value = await searchAPI(newQuery)
  }
}, { debounce: 300 }) // usa watchDebounced de VueUse

// ❌ AVOID: Watch para valores derivados (usa computed)
// ❌ AVOID: Computeds con efectos secundarios
```

### 8. Debounce y Throttle

```javascript
import { useDebounceFn, useThrottleFn } from '@vueuse/core'

// ✅ Debounce para input de búsqueda
const debouncedSearch = useDebounceFn((query) => {
  performSearch(query)
}, 300)

// ✅ Throttle para scroll/resize handlers
const throttledScroll = useThrottleFn(() => {
  updateScrollPosition()
}, 100)

// ✅ Alternativa sin VueUse
function debounce(fn, delay) {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}
```

## Anti-Patterns to Avoid

### ❌ Reactivity Anti-Patterns

```javascript
// ❌ Mutar refs sin .value
const count = ref(0)
count++ // No funciona!

// ❌ Destructurar props reactivos (pierde reactividad)
const { name } = props // ❌
const name = toRef(props, 'name') // ✅

// ❌ Asignar objetos directamente a refs
data.value = response // Puede perder reactividad si es proxy
data.value = { ...response } // ✅ Crea nuevo objeto
```

### ❌ Performance Anti-Patterns

```javascript
// ❌ Crear funciones inline en v-for
<div v-for="item in items" @click="() => handleClick(item.id)">

// ✅ Usar event delegation o data attributes
<div v-for="item in items" @click="handleClick" :data-id="item.id">

// ❌ Múltiples watchers para lo mismo
watch(a, () => update())
watch(b, () => update())
watch(c, () => update())

// ✅ Watch múltiple
watch([a, b, c], () => update())

// ❌ API calls en computed
const data = computed(async () => await fetchData()) // ❌ No funciona!

// ✅ Usar refs + watch o composables
```

## Checklist de Optimización

Use esta checklist al revisar código:

- [ ] **Keys**: ¿Las listas usan keys únicos y estables?
- [ ] **Computed**: ¿Los valores derivados usan computed?
- [ ] **Cleanup**: ¿Se limpian listeners/subscriptions en onUnmounted?
- [ ] **Lazy Load**: ¿Los componentes pesados usan lazy loading?
- [ ] **Parallel**: ¿Los API calls independientes usan Promise.all?
- [ ] **Debounce**: ¿Los inputs de búsqueda están debounced?
- [ ] **Bundle**: ¿Se usan named imports para tree-shaking?
- [ ] **Props**: ¿Se evita crear objetos inline en props?
- [ ] **ShallowRef**: ¿Los datos grandes usan shallowRef?
- [ ] **Virtual**: ¿Las listas largas usan virtualización?

## Tools for Optimization

### Vue DevTools
- Performance tab para detectar re-renders
- Component inspector para ver props/state

### Bundle Analysis
```bash
# Vite
npx vite-bundle-visualizer

# Webpack
npm run build -- --analyze
```

### Lighthouse
- Performance scoring
- Core Web Vitals
- Recommendations
