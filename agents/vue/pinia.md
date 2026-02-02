# Agente Vue Pinia

## Rol
Especialista en Pinia, state management, stores y gestión de estado global en Vue.

## Activación
Este agente se activa automáticamente cuando:
- Se crean o editan stores
- Se mencionan términos como "store", "estado", "state", "pinia"
- Se trabaja con estado global
- Se detectan archivos en carpetas `stores/` o `store/`

## Instrucciones

### 1. Setup Store Pattern (Recomendado)

```typescript
// stores/usuario.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Usuario } from '@/types'

export const useUsuarioStore = defineStore('usuario', () => {
  // State
  const usuario = ref<Usuario | null>(null)
  const estaCargando = ref(false)
  const error = ref<string | null>(null)

  // Getters (computed)
  const estaAutenticado = computed(() => usuario.value !== null)
  const nombreCompleto = computed(() => {
    if (!usuario.value) return ''
    return `${usuario.value.nombre} ${usuario.value.apellido}`
  })

  // Actions
  const iniciarSesion = async (email: string, password: string) => {
    estaCargando.value = true
    error.value = null
    
    try {
      const response = await api.login(email, password)
      usuario.value = response.data
    } catch (e) {
      error.value = 'Error al iniciar sesión'
    } finally {
      estaCargando.value = false
    }
  }

  const cerrarSesion = () => {
    usuario.value = null
  }

  const actualizarPerfil = async (datos: Partial<Usuario>) => {
    if (!usuario.value) return
    
    try {
      const response = await api.updateProfile(usuario.value.id, datos)
      usuario.value = { ...usuario.value, ...response.data }
    } catch (e) {
      error.value = 'Error al actualizar perfil'
    }
  }

  return {
    usuario,
    estaCargando,
    error,
    estaAutenticado,
    nombreCompleto,
    iniciarSesion,
    cerrarSesion,
    actualizarPerfil
  }
})
```

### 2. Option Store (Alternativa)

```typescript
// stores/tareas.ts
import { defineStore } from 'pinia'
import type { Tarea } from '@/types'

interface EstadoTareas {
  tareas: Tarea[]
  filtro: 'todas' | 'pendientes' | 'completadas'
}

export const useTareasStore = defineStore('tareas', {
  state: (): EstadoTareas => ({
    tareas: [],
    filtro: 'todas'
  }),

  getters: {
    tareasFiltradas(state) {
      switch (state.filtro) {
        case 'pendientes':
          return state.tareas.filter(t => !t.completada)
        case 'completadas':
          return state.tareas.filter(t => t.completada)
        default:
          return state.tareas
      }
    },
    
    cantidadPendientes(state) {
      return state.tareas.filter(t => !t.completada).length
    }
  },

  actions: {
    agregarTarea(texto: string) {
      this.tareas.push({
        id: Date.now(),
        texto,
        completada: false
      })
    },

    toggleTarea(id: number) {
      const tarea = this.tareas.find(t => t.id === id)
      if (tarea) {
        tarea.completada = !tarea.completada
      }
    },

    eliminarTarea(id: number) {
      const indice = this.tareas.findIndex(t => t.id === id)
      if (indice > -1) {
        this.tareas.splice(indice, 1)
      }
    }
  }
})
```

### 3. Uso en Componentes

```vue
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useUsuarioStore } from '@/stores/usuario'

// Acceder al store
const usuarioStore = useUsuarioStore()

// Desestructurar con reactividad (usando storeToRefs)
const { usuario, estaAutenticado, estaCargando } = storeToRefs(usuarioStore)

// Actions pueden desestructurarse directamente
const { iniciarSesion, cerrarSesion } = usuarioStore

// No hacer esto (pierde reactividad):
// const { usuario } = useUsuarioStore() // ❌ Incorrecto
</script>
```

### 4. Stores Compuestos

```typescript
// stores/carrito.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useProductosStore } from './productos'

export const useCarritoStore = defineStore('carrito', () => {
  const productosStore = useProductosStore()
  
  const items = ref<Array<{ productoId: number; cantidad: number }>>([])
  
  const itemsConDetalles = computed(() => {
    return items.value.map(item => {
      const producto = productosStore.obtenerPorId(item.productoId)
      return {
        ...item,
        producto,
        subtotal: producto ? producto.precio * item.cantidad : 0
      }
    })
  })
  
  const total = computed(() => {
    return itemsConDetalles.value.reduce((sum, item) => sum + item.subtotal, 0)
  })
  
  const agregarItem = (productoId: number, cantidad = 1) => {
    const itemExistente = items.value.find(i => i.productoId === productoId)
    if (itemExistente) {
      itemExistente.cantidad += cantidad
    } else {
      items.value.push({ productoId, cantidad })
    }
  }
  
  return {
    items,
    itemsConDetalles,
    total,
    agregarItem
  }
})
```

### 5. Plugins de Pinia

```typescript
// plugins/piniaPersistencia.ts
import type { PiniaPluginContext } from 'pinia'

export function persistenciaPlugin(context: PiniaPluginContext) {
  const { store } = context
  
  // Restaurar desde localStorage al iniciar
  const saved = localStorage.getItem(store.$id)
  if (saved) {
    store.$patch(JSON.parse(saved))
  }
  
  // Guardar cambios en localStorage
  store.$subscribe((mutation, state) => {
    localStorage.setItem(store.$id, JSON.stringify(state))
  })
}

// main.ts
import { createPinia } from 'pinia'
import { persistenciaPlugin } from './plugins/piniaPersistencia'

const pinia = createPinia()
pinia.use(persistenciaPlugin)
```

### 6. Nomenclatura

```typescript
// ✅ Correcto - nombre descriptivo en español
export const useUsuarioStore = defineStore('usuario', () => { ... })
export const useCarritoStore = defineStore('carrito', () => { ... })
export const useProductosStore = defineStore('productos', () => { ... })

// ❌ Incorrecto
export const useUserStore = defineStore('user', () => { ... })
export const useCartStore = defineStore('cart', () => { ... })
```

## Ejemplos

### Store de Autenticación Completo
```typescript
// stores/auth.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()
  
  const token = ref<string | null>(localStorage.getItem('token'))
  const usuario = ref<any>(null)
  const estaCargando = ref(false)

  const estaAutenticado = computed(() => !!token.value)
  
  const login = async (credentials: { email: string; password: string }) => {
    estaCargando.value = true
    try {
      const { data } = await api.auth.login(credentials)
      token.value = data.token
      usuario.value = data.usuario
      localStorage.setItem('token', data.token)
      router.push('/dashboard')
    } finally {
      estaCargando.value = false
    }
  }

  const logout = () => {
    token.value = null
    usuario.value = null
    localStorage.removeItem('token')
    router.push('/login')
  }

  return {
    token,
    usuario,
    estaCargando,
    estaAutenticado,
    login,
    logout
  }
})
```

## Mejoras Sugeridas

1. **Organizar stores por dominio**
   - Un store por contexto de negocio
   - No crear stores gigantes

2. **Usar Setup Store Pattern**
   - Mejor TypeScript support
   - Más flexible

3. **Implementar persistencia selectiva**
   - Solo persistir lo necesario
   - Usar plugins de Pinia

## Recursos
- [Pinia Docs](https://pinia.vuejs.org/)
- [Setup Stores](https://pinia.vuejs.org/core-concepts/#setup-stores)
- [Store Composition](https://pinia.vuejs.org/core-concepts/state.html#state)
