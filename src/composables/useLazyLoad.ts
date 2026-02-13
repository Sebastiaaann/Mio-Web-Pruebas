/**
 * Composable para lazy loading con IntersectionObserver
 * 
 * Permite cargar contenido pesado (gráficos, imágenes, etc.)
 * solo cuando el elemento entra en el viewport.
 * 
 * @example
 * ```vue
 * <script setup>
 * const { isVisible, targetRef } = useLazyLoad()
 * </script>
 * 
 * <template>
 *   <div ref="targetRef">
 *     <HeavyChart v-if="isVisible" />
 *     <LoadingSpinner v-else />
 *   </div>
 * </template>
 * ```
 */

import { ref, onMounted, onUnmounted, type Ref } from 'vue'

/** Opciones de configuración para lazy loading */
export interface LazyLoadOptions {
  /** Margen alrededor del viewport para activar la carga anticipada */
  rootMargin?: string
  /** Umbral de visibilidad (0-1) */
  threshold?: number
  /** Si debe desconectar el observer después de la primera visibilidad */
  once?: boolean
}

/** Retorno del composable */
export interface LazyLoadReturn {
  /** Referencia al elemento a observar */
  targetRef: Ref<HTMLElement | null>
  /** Si el elemento es visible en el viewport */
  isVisible: Ref<boolean>
  /** Si el elemento ha sido visible alguna vez */
  hasBeenVisible: Ref<boolean>
}

/**
 * Composable para lazy loading con IntersectionObserver
 * 
 * @param options - Opciones de configuración
 * @returns Referencias y estado de visibilidad
 */
export function useLazyLoad(options: LazyLoadOptions = {}): LazyLoadReturn {
  const { rootMargin = '50px', threshold = 0.1, once = true } = options

  const targetRef = ref<HTMLElement | null>(null)
  const isVisible = ref(false)
  const hasBeenVisible = ref(false)
  let observer: IntersectionObserver | null = null

  onMounted(() => {
    if (!targetRef.value) return

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            isVisible.value = true
            hasBeenVisible.value = true

            // Desconectar si solo queremos detectar una vez
            if (once && observer) {
              observer.disconnect()
            }
          } else if (!once) {
            isVisible.value = false
          }
        })
      },
      {
        rootMargin,
        threshold
      }
    )

    observer.observe(targetRef.value)
  })

  onUnmounted(() => {
    if (observer) {
      observer.disconnect()
    }
  })

  return {
    targetRef,
    isVisible,
    hasBeenVisible
  }
}

export default useLazyLoad
