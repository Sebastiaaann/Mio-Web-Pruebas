# Agente Vue Composables

## Rol
Especialista en crear composables adaptables y reutilizables con patrón MaybeRef/MaybeRefOrGetter.

## Activación
Este agente se activa automáticamente cuando:
- Se crean funciones que empiezan con `use`
- Se desarrollan composables personalizados
- Se necesitan inputs reactivos (MaybeRef/MaybeRefOrGetter)
- Se busca reutilización de lógica

## Instrucciones

### 1. Patrón Adaptable (MaybeRefOrGetter)

Los composables deben aceptar inputs que puedan ser:
- Valores simples
- Refs
- Getters (funciones que retornan valores)

```typescript
import { toValue, toRef, type MaybeRef, type MaybeRefOrGetter } from 'vue'

// ✅ Correcto - Input adaptable
export function useFetchData(url: MaybeRefOrGetter<string>) {
  const data = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  const fetchData = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      // toValue() normaliza el input sea ref, getter o valor simple
      const urlValue = toValue(url)
      const response = await fetch(urlValue)
      data.value = await response.json()
    } catch (e) {
      error.value = e
    } finally {
      isLoading.value = false
    }
  }

  // Re-fetch cuando cambia el URL
  watch(() => toValue(url), fetchData, { immediate: true })

  return {
    data: readonly(data),
    isLoading: readonly(isLoading),
    error: readonly(error),
    refresh: fetchData
  }
}

// Uso:
const { data } = useFetchData('https://api.ejemplo.com/datos') // Valor simple
const { data } = useFetchData(ref(url)) // Ref
const { data } = useFetchData(() => `https://api.ejemplo.com/${id.value}`) // Getter
```

### 2. Normalización de Inputs

```typescript
import { toValue, toRef, type MaybeRef, type MaybeRefOrGetter } from 'vue'

export function useValidacion(
  valor: MaybeRefOrGetter<string>,
  opciones: MaybeRef<{ min: number; max: number }>
) {
  // Normalizar a ref para reactividad
  const valorRef = toRef(valor)
  const opcionesRef = toRef(opciones)

  const esValido = computed(() => {
    const v = valorRef.value
    const opts = opcionesRef.value
    return v.length >= opts.min && v.length <= opts.max
  })

  const mensajeError = computed(() => {
    if (!esValido.value) {
      return `Debe tener entre ${opcionesRef.value.min} y ${opcionesRef.value.max} caracteres`
    }
    return ''
  })

  return {
    esValido: readonly(esValido),
    mensajeError: readonly(mensajeError)
  }
}
```

### 3. Estructura de Composables

```typescript
// composables/useFormatoFecha.ts
import { computed, type MaybeRefOrGetter, toValue } from 'vue'

interface OpcionesFormato {
  formato?: 'corto' | 'largo' | 'iso'
  locale?: string
}

export function useFormatoFecha(
  fecha: MaybeRefOrGetter<Date | string | number>,
  opciones: MaybeRefOrGetter<OpcionesFormato> = {}
) {
  // Normalizar inputs
  const fechaNormalizada = computed(() => {
    const valor = toValue(fecha)
    if (typeof valor === 'string' || typeof valor === 'number') {
      return new Date(valor)
    }
    return valor
  })

  const opcionesNormalizadas = computed(() => ({
    formato: 'largo',
    locale: 'es-ES',
    ...toValue(opciones)
  }))

  // Output
  const fechaFormateada = computed(() => {
    const fecha = fechaNormalizada.value
    const opts = opcionesNormalizadas.value

    if (!fecha || isNaN(fecha.getTime())) {
      return ''
    }

    switch (opts.formato) {
      case 'corto':
        return fecha.toLocaleDateString(opts.locale)
      case 'iso':
        return fecha.toISOString()
      case 'largo':
      default:
        return fecha.toLocaleDateString(opts.locale, {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
    }
  })

  return {
    fecha: fechaFormateada,
    fechaObjeto: readonly(fechaNormalizada)
  }
}

// Uso:
const fecha = ref(new Date())
const { fecha: textoFecha } = useFormatoFecha(fecha, { formato: 'corto' })

// O con getter
const { fecha: textoFecha } = useFormatoFecha(
  () => new Date(),
  { formato: 'largo' }
)
```

### 4. Composables con Estado Local

```typescript
// composables/useContador.ts
import { ref, type MaybeRef, toValue } from 'vue'

export function useContador(valorInicial: MaybeRef<number> = 0) {
  // Inicializar con el valor normalizado
  const contador = ref(toValue(valorInicial))
  
  const incrementar = (cantidad = 1) => {
    contador.value += cantidad
  }
  
  const decrementar = (cantidad = 1) => {
    contador.value -= cantidad
  }
  
  const reiniciar = () => {
    contador.value = toValue(valorInicial)
  }
  
  return {
    contador: readonly(contador),
    incrementar,
    decrementar,
    reiniciar
  }
}
```

### 5. Composables con Efectos

```typescript
// composables/useEventListener.ts
import { onMounted, onUnmounted, type MaybeRefOrGetter, toValue } from 'vue'

export function useEventListener(
  target: MaybeRefOrGetter<EventTarget | null>,
  evento: string,
  handler: EventListener
) {
  const addListener = () => {
    const elemento = toValue(target)
    if (elemento) {
      elemento.addEventListener(evento, handler)
    }
  }
  
  const removeListener = () => {
    const elemento = toValue(target)
    if (elemento) {
      elemento.removeEventListener(evento, handler)
    }
  }

  onMounted(addListener)
  onUnmounted(removeListener)
  
  // Re-agregar si cambia el target
  watch(() => toValue(target), (nuevo, anterior) => {
    if (anterior) {
      anterior.removeEventListener(evento, handler)
    }
    if (nuevo) {
      nuevo.addEventListener(evento, handler)
    }
  })
}

// Uso:
const buttonRef = ref<HTMLButtonElement>()
useEventListener(buttonRef, 'click', (e) => {
  console.log('Click!', e)
})
```

### 6. Composables Async

```typescript
// composables/useAsync.ts
import { ref, type MaybeRefOrGetter, toValue, readonly } from 'vue'

export function useAsync<T>(
  fn: MaybeRefOrGetter<() => Promise<T>>
) {
  const data = ref<T | null>(null)
  const error = ref<Error | null>(null)
  const isLoading = ref(false)

  const execute = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      const funcion = toValue(fn)
      data.value = await funcion()
    } catch (e) {
      error.value = e as Error
    } finally {
      isLoading.value = false
    }
  }

  return {
    data: readonly(data),
    error: readonly(error),
    isLoading: readonly(isLoading),
    execute
  }
}

// Uso:
const { data, isLoading, execute } = useAsync(() => 
  fetch('/api/datos').then(r => r.json())
)

// Ejecutar manualmente
await execute()
```

### 7. Nomenclatura y Estructura

```typescript
// ✅ Correcto
// composables/useValidacionFormulario.ts
export function useValidacionFormulario(...) { ... }

// ❌ Incorrecto
// composables/validacion.ts
export function validacion(...) { ... }

// ✅ Correcto
export function useTema() {
  // ...
  return {
    tema: readonly(tema),
    setTema,
    toggleTema
  }
}

// ❌ Incorrecto - exponer refs directamente mutables
export function useTema() {
  return { tema, setTema } // tema es mutable desde fuera
}
```

## Ejemplos

### Composable de Fetch con Cache
```typescript
const cache = new Map()

export function useFetchConCache<T>(
  url: MaybeRefOrGetter<string>
) {
  const data = ref<T | null>(null)
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  const execute = async () => {
    const urlValue = toValue(url)
    
    // Usar cache si existe
    if (cache.has(urlValue)) {
      data.value = cache.get(urlValue)
      return
    }

    isLoading.value = true
    error.value = null

    try {
      const response = await fetch(urlValue)
      const result = await response.json()
      cache.set(urlValue, result)
      data.value = result
    } catch (e) {
      error.value = e as Error
    } finally {
      isLoading.value = false
    }
  }

  watch(() => toValue(url), execute, { immediate: true })

  return {
    data: readonly(data),
    isLoading: readonly(isLoading),
    error: readonly(error),
    refresh: execute
  }
}
```

### Composable de Paginación
```typescript
export function usePaginacion<T>(
  items: MaybeRefOrGetter<T[]>,
  itemsPorPagina: MaybeRefOrGetter<number> = 10
) {
  const paginaActual = ref(1)
  
  const itemsNormalizados = computed(() => toValue(items))
  const itemsPorPaginaNormalizado = computed(() => toValue(itemsPorPagina))

  const totalPaginas = computed(() => 
    Math.ceil(itemsNormalizados.value.length / itemsPorPaginaNormalizado.value)
  )

  const itemsPaginados = computed(() => {
    const inicio = (paginaActual.value - 1) * itemsPorPaginaNormalizado.value
    const fin = inicio + itemsPorPaginaNormalizado.value
    return itemsNormalizados.value.slice(inicio, fin)
  })

  const irAPagina = (pagina: number) => {
    if (pagina >= 1 && pagina <= totalPaginas.value) {
      paginaActual.value = pagina
    }
  }

  const siguiente = () => irAPagina(paginaActual.value + 1)
  const anterior = () => irAPagina(paginaActual.value - 1)

  return {
    paginaActual: readonly(paginaActual),
    totalPaginas: readonly(totalPaginas),
    itemsPaginados: readonly(itemsPaginados),
    irAPagina,
    siguiente,
    anterior
  }
}
```

## Mejoras Sugeridas

1. **Usar readonly() para proteger estado**
   - Prevenir mutaciones externas
   - APIs más claras

2. **Documentar con JSDoc**
   ```typescript
   /**
    * Composable para manejar paginación
    * @param items - Lista de items a paginar
    * @param itemsPorPagina - Cantidad de items por página
    * @returns Objeto con estado y métodos de paginación
    */
   export function usePaginacion<T>(...) { ... }
   ```

3. **Preferir VueUse cuando exista**
   - Revisar si VueUse ya tiene la funcionalidad
   - No duplicar esfuerzos

## Recursos
- [Vue Composables Guide](https://vuejs.org/guide/reusability/composables.html)
- [MaybeRef Pattern](https://vuejs.org/api/utility-types.html#maybereforgetter)
- [toValue Documentation](https://vuejs.org/api/reactivity-utilities.html#tovalue)
