# Composables Vue

Funciones reutilizables que encapsulan lógica con estado usando Composition API.

## Reglas Fundamentales

1. **VueUse primero** - revisar [vueuse.org](https://vueuse.org) antes de escribir custom
2. **No async composables** - pierden contexto de lifecycle cuando se await en otros composables
3. **Solo a nivel top** - nunca llamar en event handlers, condicionales o loops
4. **readonly() exports** - proteger estado interno de mutación externa
5. **useState() para SSR** - usar `useState()` de Nuxt, no refs globales (si aplica)

## Referencia Rápida

| Patrón | Ejemplo |
|--------|---------|
| Naming | `useAuth`, `useContador`, `useDebounce` |
| Estado | `const contador = ref(0)` |
| Computed | `const doble = computed(() => contador.value * 2)` |
| Lifecycle | `onMounted(() => ...)`, `onUnmounted(() => ...)` |
| Retorno | `return { contador, incrementar }` |

## Estructura

```javascript
// composables/useContador.js
import { readonly, ref } from 'vue';

export function useContador(valorInicial = 0) {
  const contador = ref(valorInicial);

  function incrementar() { contador.value++; }
  function decrementar() { contador.value--; }
  function reiniciar() { contador.value = valorInicial; }

  return {
    contador: readonly(contador), // readonly si no debe mutarse
    incrementar,
    decrementar,
    reiniciar,
  };
}
```

## Nomenclatura

**Siempre prefijo `use`:** `useAuth`, `useLocalStorage`, `useDebounce`

**Archivo = función:** `useAuth.js` exporta `useAuth`

**Nombres en español:** `useContador`, `useAutenticacion`, `useDatosUsuario`

## Mejores Prácticas

**Hacer:**

- Retornar objeto con propiedades nombradas (amigable para destructuring)
- Aceptar objeto de opciones para configuración
- Usar `readonly()` para estado que no debe mutar
- Manejar cleanup (`onUnmounted`, `onScopeDispose`)
- Agregar JSDoc para funciones complejas

**No hacer:**

- Crear composables async a nivel top
- Mutar estado externo
- Olvidar cleanup de listeners/timers

## Lifecycle

Los hooks se ejecutan en contexto del componente:

```javascript
export function useEventListener(target, evento, handler) {
  onMounted(() => target.addEventListener(evento, handler));
  onUnmounted(() => target.removeEventListener(evento, handler));
}
```

## Patrón Async

```javascript
export function useDatosAsync(fetcher) {
  const datos = ref(null);
  const error = ref(null);
  const cargando = ref(false);

  async function ejecutar() {
    cargando.value = true;
    error.value = null;
    try {
      datos.value = await fetcher();
    } catch (e) {
      error.value = e;
      console.error('Error en useDatosAsync:', e);
    } finally {
      cargando.value = false;
    }
  }

  ejecutar();
  return { datos, error, cargando, recargar: ejecutar };
}
```

**Data fetching:** Preferir Pinia stores para queries sobre composables custom.

## Integración con VueUse

**Revisar VueUse PRIMERO** - la mayoría de patrones ya están implementados: [vueuse.org/functions.html](https://vueuse.org/functions.html)

**Categorías disponibles:**

- DOM: `useEventListener`, `useIntersectionObserver`
- State: `useLocalStorage`, `useSessionStorage`
- Sensors: `useMouse`, `useScroll`, `useNetwork`
- Animation: `useTransition`, `useInterval`
- Utilities: `useDebounce`, `useThrottle`, `useFetch`

Solo crear custom cuando VueUse no cubra el caso de uso.

## Patrones Avanzados

### Composable Singleton

Compartir estado entre todos los componentes que usen el mismo composable:

```javascript
import { createSharedComposable } from '@vueuse/core';

function useControlesMapa() {
  const instanciaMapa = ref(null);
  const volarA = (coords) => instanciaMapa.value?.flyTo(coords);
  return { instanciaMapa, volarA };
}

export const useMapaCompartido = createSharedComposable(useControlesMapa);
```

### Fetch Cancelable con AbortController

```javascript
export function useBusqueda() {
  const query = ref('');
  const resultados = ref([]);
  let abortController = null;

  watch(query, async (nuevaQuery) => {
    // Cancelar búsqueda anterior
    abortController?.abort();
    abortController = new AbortController();

    try {
      const respuesta = await fetch(`/api/buscar?q=${nuevaQuery}`, {
        signal: abortController.signal,
      });
      resultados.value = await respuesta.json();
    } catch (e) {
      if (e.name !== 'AbortError') {
        console.error('Error en búsqueda:', e);
      }
    }
  });

  return { query, resultados };
}
```

### State Machine por Pasos

```javascript
export function useFlujoEnvio() {
  const paso = ref('ingreso'); // 'ingreso' | 'confirmar' | 'exito'
  const monto = ref('');

  const siguiente = () => {
    if (paso.value === 'ingreso') paso.value = 'confirmar';
    else if (paso.value === 'confirmar') paso.value = 'exito';
  };

  const reiniciar = () => {
    paso.value = 'ingreso';
    monto.value = '';
  };

  return { paso, monto, siguiente, reiniciar };
}
```

### Guards Solo-Cliente

```javascript
export function useUbicacionUsuario() {
  const ubicacion = ref(null);
  const error = ref(null);

  // Solo ejecutar en cliente (navegador)
  if (typeof window !== 'undefined' && navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => ubicacion.value = pos,
      (err) => error.value = err
    );
  }

  return { ubicacion, error };
}
```

### Auto-Save con Debounce

```javascript
import { useDebounceFn } from '@vueuse/core';

export function useAutoGuardar(contenido) {
  const tieneCambios = ref(false);
  const guardando = ref(false);

  const guardar = useDebounceFn(async () => {
    if (!tieneCambios.value) return;
    
    guardando.value = true;
    try {
      await fetch('/api/guardar', { 
        method: 'POST', 
        body: JSON.stringify({ contenido: contenido.value }) 
      });
      tieneCambios.value = false;
    } catch (error) {
      console.error('Error al guardar:', error);
    } finally {
      guardando.value = false;
    }
  }, 1000);

  watch(contenido, () => {
    tieneCambios.value = true;
    guardar();
  });

  return { tieneCambios, guardando };
}
```

## Ejemplo Completo: useDatosUsuario

```javascript
// composables/useDatosUsuario.js
import { ref, readonly, onMounted, computed } from 'vue';

/**
 * Composable para cargar y gestionar datos de usuario
 * @param {string|number} usuarioId - ID del usuario a cargar
 * @returns {Object} Estado y métodos del usuario
 */
export function useDatosUsuario(usuarioId) {
  // Estado
  const datos = ref(null);
  const cargando = ref(false);
  const error = ref(null);

  // Computed
  const nombreCompleto = computed(() => {
    if (!datos.value) return '';
    return `${datos.value.nombre} ${datos.value.apellido}`;
  });

  const estaActivo = computed(() => datos.value?.activo ?? false);

  // Métodos
  async function cargar() {
    cargando.value = true;
    error.value = null;
    
    try {
      const respuesta = await fetch(`/api/usuarios/${usuarioId}`);
      
      if (!respuesta.ok) {
        throw new Error(`HTTP error! status: ${respuesta.status}`);
      }
      
      datos.value = await respuesta.json();
    } catch (err) {
      error.value = err;
      console.error('Error cargando usuario:', err);
    } finally {
      cargando.value = false;
    }
  }

  async function actualizar(datosNuevos) {
    cargando.value = true;
    error.value = null;
    
    try {
      const respuesta = await fetch(`/api/usuarios/${usuarioId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosNuevos),
      });
      
      if (!respuesta.ok) {
        throw new Error(`HTTP error! status: ${respuesta.status}`);
      }
      
      datos.value = await respuesta.json();
    } catch (err) {
      error.value = err;
      console.error('Error actualizando usuario:', err);
    } finally {
      cargando.value = false;
    }
  }

  function reiniciar() {
    datos.value = null;
    error.value = null;
    cargando.value = false;
  }

  // Auto-cargar al montar
  onMounted(() => {
    if (usuarioId) cargar();
  });

  // Retornar API pública
  return {
    // Estado (readonly para proteger)
    datos: readonly(datos),
    cargando: readonly(cargando),
    error: readonly(error),
    
    // Computed
    nombreCompleto,
    estaActivo,
    
    // Métodos
    cargar,
    actualizar,
    reiniciar,
  };
}
```

**Uso en componente:**

```vue
<script setup>
import { useDatosUsuario } from '@/composables/useDatosUsuario';

const { usuarioId } = defineProps(['usuarioId']);

const { 
  datos, 
  cargando, 
  error, 
  nombreCompleto, 
  actualizar 
} = useDatosUsuario(usuarioId);

async function guardarCambios(nuevosDatos) {
  await actualizar(nuevosDatos);
}
</script>

<template>
  <div v-if="cargando">Cargando...</div>
  <div v-else-if="error">Error: {{ error.message }}</div>
  <div v-else-if="datos">
    <h1>{{ nombreCompleto }}</h1>
    <!-- ... resto del componente -->
  </div>
</template>
```

## Errores Comunes

**No usar `readonly()` para estado interno:**

```javascript
// ❌ Incorrecto - expone ref mutable
return { contador };

// ✅ Correcto - previene mutación externa
return { contador: readonly(contador) };
```

**Olvidar cleanup:**

```javascript
// ❌ Incorrecto - listener nunca se remueve
onMounted(() => target.addEventListener('click', handler));

// ✅ Correcto - cleanup al desmontar
onMounted(() => target.addEventListener('click', handler));
onUnmounted(() => target.removeEventListener('click', handler));
```

**Composable async a nivel top:**

```javascript
// ❌ Incorrecto - pierde contexto lifecycle
export async function useDatos() {
  const datos = await fetch('/api/datos');
  return { datos };
}

// ✅ Correcto - async dentro de funciones
export function useDatos() {
  const datos = ref(null);
  
  async function cargar() {
    datos.value = await fetch('/api/datos');
  }
  
  onMounted(cargar);
  return { datos, cargar };
}
```

## Integración con Pinia

Para estado global, preferir Pinia stores sobre composables singleton:

```javascript
// stores/usuarioStore.js
import { defineStore } from 'pinia';

export const useUsuarioStore = defineStore('usuario', () => {
  const usuario = ref(null);
  const cargando = ref(false);

  async function cargar(id) {
    cargando.value = true;
    try {
      const respuesta = await fetch(`/api/usuarios/${id}`);
      usuario.value = await respuesta.json();
    } finally {
      cargando.value = false;
    }
  }

  return { usuario, cargando, cargar };
});
```

**Cuándo usar qué:**
- **Composable:** Lógica reutilizable a nivel de componente
- **Pinia Store:** Estado global compartido entre múltiples componentes
