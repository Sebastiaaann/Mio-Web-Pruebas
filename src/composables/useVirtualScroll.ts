/**
 * Composable para virtual scrolling
 * 
 * Permite renderizar solo los elementos visibles en el viewport,
 * mejorando significativamente el performance con listas grandes.
 * 
 * @example
 * ```vue
 * <script setup>
 * const { containerProps, list, wrapperProps } = useVirtualScroll(
 *   items,
 *   { itemHeight: 50, overscan: 5 }
 * )
 * </script>
 * 
 * <template>
 *   <div v-bind="containerProps">
 *     <div v-bind="wrapperProps">
 *       <div v-for="item in list" :key="item.index">
 *         {{ item.data }}
 *       </div>
 *     </div>
 *   </div>
 * </template>
 * ```
 */

import { ref, computed, watch, type Ref, type ComputedRef } from 'vue'

/** Opciones de configuración para virtual scrolling */
export interface VirtualScrollOptions {
  /** Altura de cada elemento en píxeles */
  itemHeight: number
  /** Número de elementos adicionales a renderizar fuera del viewport (para scroll suave) */
  overscan?: number
  /** Altura del contenedor en píxeles */
  containerHeight?: number
}

/** Elemento virtual con datos e índice */
export interface VirtualItem<T> {
  /** Datos del elemento */
  data: T
  /** Índice original en el array */
  index: number
  /** Estilo CSS para posicionamiento */
  style: {
    height: string
    transform: string
  }
}

/** Retorno del composable */
export interface VirtualScrollReturn<T> {
  /** Props para el contenedor scrollable */
  containerProps: {
    style: {
      height: string
      overflow: 'auto' | 'scroll' | 'hidden'
      position: 'relative' | 'absolute' | 'fixed' | 'sticky'
    }
    onScroll: (e: Event) => void
  }
  /** Props para el wrapper de elementos */
  wrapperProps: {
    style: {
      height: string
      position: 'relative' | 'absolute' | 'fixed' | 'sticky'
    }
  }
  /** Lista de elementos virtuales a renderizar */
  list: ComputedRef<VirtualItem<T>[]>
  /** Índice del primer elemento visible */
  startIndex: ComputedRef<number>
  /** Índice del último elemento visible */
  endIndex: ComputedRef<number>
  /** Scroll al índice especificado */
  scrollToIndex: (index: number) => void
}

/**
 * Composable para virtual scrolling
 * 
 * @param items - Array de items a virtualizar
 * @param options - Opciones de configuración
 * @returns Props y lista virtualizada
 */
export function useVirtualScroll<T>(
  items: Ref<T[]> | ComputedRef<T[]>,
  options: VirtualScrollOptions
): VirtualScrollReturn<T> {
  const { itemHeight, overscan = 5, containerHeight = 400 } = options

  // Estado del scroll
  const scrollTop = ref(0)
  const containerRef = ref<HTMLElement | null>(null)

  // Calcular índices visibles
  const startIndex = computed(() => {
    const start = Math.floor(scrollTop.value / itemHeight)
    return Math.max(0, start - overscan)
  })

  const endIndex = computed(() => {
    const visibleCount = Math.ceil(containerHeight / itemHeight)
    const end = startIndex.value + visibleCount + overscan * 2
    return Math.min(items.value.length - 1, end)
  })

  // Altura total del contenido
  const totalHeight = computed(() => items.value.length * itemHeight)

  // Lista de elementos virtuales
  const list = computed<VirtualItem<T>[]>(() => {
    const result: VirtualItem<T>[] = []
    const start = startIndex.value
    const end = endIndex.value

    for (let i = start; i <= end && i < items.value.length; i++) {
      result.push({
        data: items.value[i],
        index: i,
        style: {
          height: `${itemHeight}px`,
          transform: `translateY(${i * itemHeight}px)`
        }
      })
    }

    return result
  })

  // Handler de scroll
  const onScroll = (e: Event) => {
    const target = e.target as HTMLElement
    scrollTop.value = target.scrollTop
  }

  // Props para el contenedor
  const containerProps = {
    style: {
      height: `${containerHeight}px`,
      overflow: 'auto' as const,
      position: 'relative' as const
    },
    onScroll
  }

  // Props para el wrapper
  const wrapperProps = {
    style: {
      height: `${totalHeight.value}px`,
      position: 'relative' as const
    }
  }

  // Actualizar wrapperProps cuando cambia totalHeight
  watch(totalHeight, (newHeight) => {
    wrapperProps.style.height = `${newHeight}px`
  })

  // Función para scroll a un índice específico
  const scrollToIndex = (index: number) => {
    if (containerRef.value) {
      containerRef.value.scrollTop = index * itemHeight
    }
  }

  return {
    containerProps,
    wrapperProps,
    list,
    startIndex,
    endIndex,
    scrollToIndex
  }
}

export default useVirtualScroll
