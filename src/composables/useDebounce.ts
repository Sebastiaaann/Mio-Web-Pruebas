/**
 * Composable para debounce de valores reactivos
 * 
 * Retrasa la actualización de un valor hasta que deje de cambiar
 * durante un período especificado. Útil para inputs de búsqueda,
 * filtros, y cualquier operación que no deba ejecutarse en cada
 * cambio inmediato.
 * 
 * @example
 * ```vue
 * <script setup>
 * const searchQuery = ref('')
 * const debouncedSearch = useDebounce(searchQuery, 300)
 * 
 * // Usar debouncedSearch para búsquedas API
 * watch(debouncedSearch, (value) => {
 *   buscarEnAPI(value)
 * })
 * </script>
 * 
 * <template>
 *   <input v-model="searchQuery" />
 * </template>
 * ```
 */

import { ref, watch, type Ref } from 'vue'

/** Opciones de configuración para debounce */
export interface DebounceOptions {
  /** Tiempo de espera en milisegundos */
  delay?: number
  /** Si debe ejecutar la función inmediatamente en el primer cambio */
  immediate?: boolean
}

/**
 * Composable para debounce de valores reactivos
 * 
 * @param source - Valor reactivo a debouncear
 * @param delay - Tiempo de espera en ms (default: 300)
 * @returns Valor debounceado
 */
export function useDebounce<T>(
  source: Ref<T>,
  delay: number = 300
): Ref<T> {
  const debouncedValue = ref(source.value) as Ref<T>
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  watch(
    source,
    (newValue) => {
      // Limpiar timeout anterior
      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      // Establecer nuevo timeout
      timeoutId = setTimeout(() => {
        debouncedValue.value = newValue
      }, delay)
    },
    { immediate: false }
  )

  return debouncedValue
}

/**
 * Composable para debounce de funciones
 * 
 * @param fn - Función a debouncear
 * @param delay - Tiempo de espera en ms (default: 300)
 * @returns Función debounceada
 */
export function useDebounceFn<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return (...args: Parameters<T>) => {
    // Limpiar timeout anterior
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    // Establecer nuevo timeout
    timeoutId = setTimeout(() => {
      fn(...args)
    }, delay)
  }
}

export default useDebounce
