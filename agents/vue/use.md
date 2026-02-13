# Agente Vue Use

## Rol
Especialista en VueUse: identificar y aplicar composables de VueUse para evitar reinventar funcionalidades comunes.

## Activación
Este agente se activa automáticamente cuando:
- Se necesitan funcionalidades comunes (localStorage, fetch, clipboard, etc.)
- Se mencionan términos como "composable", "useLocalStorage", "useFetch"
- Se detecta código repetitivo que puede reemplazarse con VueUse

## Instrucciones

### 1. State (Estado)

```typescript
// ✅ Usar VueUse en lugar de crear composables propios

// localStorage reactivo
import { useLocalStorage } from '@vueuse/core'

const tema = useLocalStorage('tema', 'claro')
const idioma = useLocalStorage('idioma', 'es')

// sessionStorage
import { useSessionStorage } from '@vueuse/core'
const datosFormulario = useSessionStorage('form-datos', {})

// Cookies
import { useCookies } from '@vueuse/integrations/useCookies'
const cookies = useCookies()
cookies.set('token', 'abc123')
```

### 2. Browser (Navegador)

```typescript
// Network status
import { useOnline } from '@vueuse/core'
const estaOnline = useOnline()

// Geolocation
import { useGeolocation } from '@vueuse/core'
const { coords, locatedAt, error } = useGeolocation()

// Clipboard
import { useClipboard } from '@vueuse/core'
const { text, copy, copied, isSupported } = useClipboard()
// Uso: copy('texto a copiar')

// Page visibility
import { useDocumentVisibility } from '@vueuse/core'
const visibility = useDocumentVisibility()

// Window size
import { useWindowSize } from '@vueuse/core'
const { width, height } = useWindowSize()

// Media queries
import { useMediaQuery } from '@vueuse/core'
const esMobile = useMediaQuery('(max-width: 768px)')
```

### 3. Sensors (Sensores)

```typescript
// Mouse position
import { useMouse } from '@vueuse/core'
const { x, y } = useMouse()

// Element hover
import { useElementHover } from '@vueuse/core'
const miRef = ref<HTMLElement>()
const estaHovered = useElementHover(miRef)

// Intersection Observer
import { useIntersectionObserver } from '@vueuse/core'
const target = ref<HTMLElement>()
const targetIsVisible = ref(false)

useIntersectionObserver(
  target,
  ([{ isIntersecting }]) => {
    targetIsVisible.value = isIntersecting
  },
  { threshold: 0.5 }
)
```

### 4. Animation (Animaciones)

```typescript
// Transitions
import { useTransition, TransitionPresets } from '@vueuse/core'

const numeroInicial = ref(0)
const numeroAnimado = useTransition(numeroInicial, {
  duration: 1000,
  transition: TransitionPresets.easeOutCubic
})

// Animate number on mount
onMounted(() => {
  numeroInicial.value = 100
})
```

### 5. Network (Red)

```typescript
// Fetch
import { useFetch } from '@vueuse/core'

const { data, error, isFetching, execute } = useFetch('https://api.ejemplo.com/datos')
  .get()
  .json()

// Re-fetch manual
const recargar = () => execute()

// WebSocket
import { useWebSocket } from '@vueuse/core'
const { status, data, send, close } = useWebSocket('wss://ws.ejemplo.com')

// EventSource (SSE)
import { useEventSource } from '@vueuse/core'
const { status, data, error, close } = useEventSource('https://api.ejemplo.com/events')
```

### 6. Utilities (Utilidades)

```typescript
// Debounce
import { useDebounceFn } from '@vueuse/core'
const buscarDebounced = useDebounceFn((query: string) => {
  // Lógica de búsqueda
}, 300)

// Throttle
import { useThrottleFn } from '@vueuse/core'
const scrollThrottled = useThrottleFn(() => {
  // Lógica de scroll
}, 100)

// Preferred color scheme (dark mode)
import { usePreferredDark } from '@vueuse/core'
const prefiereOscuro = usePreferredDark()

// Permission API
import { usePermission } from '@vueuse/core'
const permisoNotificaciones = usePermission('notifications')

// Permission state: 'prompt' | 'granted' | 'denied'
```

### 7. Watch (Observadores)

```typescript
// Watch with debounce
import { watchDebounced } from '@vueuse/core'

watchDebounced(
  valorDeBusqueda,
  (nuevo) => {
    buscar(nuevo)
  },
  { debounce: 500 }
)

// Watch with throttle
import { watchThrottled } from '@vueuse/core'

watchThrottled(
  posicionScroll,
  (nuevo) => {
    actualizarUI(nuevo)
  },
  { throttle: 100 }
)

// Watch Pausable
import { watchPausable } from '@vueuse/core'
const { stop, pause, resume } = watchPausable(valor, callback)
```

### 8. Integraciones

```typescript
// Axios
import { useAxios } from '@vueuse/integrations/useAxios'
const { data, isLoading, error, execute } = useAxios('/api/usuarios', axiosInstance)

// Sortable (drag and drop)
import { useSortable } from '@vueuse/integrations/useSortable'
const el = ref<HTMLElement>()
const { option } = useSortable(el, lista, {
  animation: 150
})

// Drauu (canvas drawing)
import { useDrauu } from '@vueuse/integrations/useDrauu'
const { drauu, canUndo, canRedo, undo, redo, clear } = useDrauu(canvasRef)
```

## Ejemplos

### Componente de Búsqueda con Debounce
```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useDebounceFn } from '@vueuse/core'

const query = ref('')
const resultados = ref([])

const buscar = useDebounceFn(async (q: string) => {
  if (!q.trim()) {
    resultados.value = []
    return
  }
  
  const { data } = await fetch(`/api/buscar?q=${q}`)
  resultados.value = await data
}, 300)

// Observar cambios en query
import { watch } from 'vue'
watch(query, (nuevo) => buscar(nuevo))
</script>

<template>
  <input v-model="query" placeholder="Buscar..." />
  <ul>
    <li v-for="item in resultados" :key="item.id">{{ item.nombre }}</li>
  </ul>
</template>
```

### Sistema de Tema (Dark Mode)
```vue
<script setup lang="ts">
import { useDark, useToggle } from '@vueuse/core'

const isDark = useDark({
  selector: 'html',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: ''
})

const toggleDark = useToggle(isDark)
</script>

<template>
  <button @click="toggleDark()">
    {{ isDark ? '🌙' : '☀️' }}
  </button>
</template>
```

### Infinite Scroll
```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useInfiniteScroll } from '@vueuse/core'

const items = ref([...])
const containerRef = ref<HTMLElement>()

useInfiniteScroll(
  containerRef,
  async () => {
    const nuevosItems = await cargarMasItems()
    items.value.push(...nuevosItems)
  },
  { distance: 100 }
)
</script>

<template>
  <div ref="containerRef" class="scroll-container">
    <div v-for="item in items" :key="item.id">{{ item.nombre }}</div>
  </div>
</template>
```

## Reglas de Oro

1. **Siempre verificar si VueUse tiene una solución**
   - Revisar [VueUse Functions](https://vueuse.org/functions.html)
   - No reinventar la rueda

2. **Preferir composables de VueUse sobre propios**
   - Battle-tested
   - Bien documentados
   - TypeScript support

3. **Usar integraciones cuando sea necesario**
   - `@vueuse/integrations` para librerías específicas
   - Configuración simplificada

## Mejoras Sugeridas

1. **Auditoría de código**
   - Identificar lógica que puede reemplazarse con VueUse
   - Refactorizar gradualmente

2. **Documentar uso de VueUse**
   - Agregar comentarios cuando se usen composables específicos
   - Facilitar onboarding

## Recursos
- [VueUse Functions](https://vueuse.org/functions.html)
- [VueUse GitHub](https://github.com/vueuse/vueuse)
- [Add-ons](https://vueuse.org/add-ons.html)
