import { ref, computed, shallowRef } from 'vue'
import { toValue, toRef } from '@vueuse/core'
import { clienteApi } from '@/utils/clienteApi'
import { logger } from '@/utils/logger'

/**
 * Composable para realizar peticiones API de forma reactiva
 * Soporta endpoints reactivos (ref, computed, getter)
 * 
 * @param {string|Ref<string>|ComputedRef<string>|Function} endpoint - URL o función que retorna URL
 * @param {Object} options - Opciones de configuración
 * @param {string} options.method - Método HTTP (GET, POST, PUT, DELETE)
 * @param {Object} options.headers - Headers adicionales
 * @param {boolean} options.immediate - Ejecutar inmediatamente (default: false)
 * @param {*} options.defaultValue - Valor por defecto para data
 * @param {Function} options.onError - Callback de error
 * @param {Function} options.onSuccess - Callback de éxito
 * @returns {Object} { data, error, loading, execute, refresh }
 * 
 * @example
 * // Uso básico
 * const { data, error, loading, execute } = useApi('/api/users')
 * await execute()
 * 
 * @example
 * // Con endpoint reactivo
 * const userId = ref(123)
 * const { data } = useApi(() => `/api/users/${userId.value}`, { immediate: true })
 * 
 * @example
 * // Con método POST
 * const { execute } = useApi('/api/users', { method: 'POST' })
 * await execute({ name: 'Juan' })
 */
export function useApi(endpoint, options = {}) {
  const {
    method = 'GET',
    headers = {},
    immediate = false,
    defaultValue = null,
    onError = null,
    onSuccess = null
  } = options

  // Usar shallowRef para datos grandes que no necesitan reactividad profunda
  const data = shallowRef(defaultValue)
  const error = ref(null)
  const loading = ref(false)

  // Resolver endpoint reactivo
  const resolvedEndpoint = computed(() => {
    const value = toValue(endpoint)
    return value.startsWith('http') ? value : value
  })

  /**
   * Ejecutar la petición API
   * @param {Object} body - Cuerpo de la petición (para POST/PUT)
   * @param {Object} overrideOptions - Opciones para sobrescribir
   */
  async function execute(body = null, overrideOptions = {}) {
    loading.value = true
    error.value = null

    try {
      const url = resolvedEndpoint.value
      
      const config = {
        method: overrideOptions.method || method,
        headers: {
          ...headers,
          ...overrideOptions.headers
        }
      }

      if (body) {
        config.body = JSON.stringify(body)
      }

      logger.info(`🌐 API Request: ${config.method} ${url}`)
      
      const response = await clienteApi.request(url, config)
      
      data.value = response
      
      if (onSuccess) {
        onSuccess(response)
      }
      
      return { success: true, data: response }
    } catch (err) {
      error.value = err.message || 'Error desconocido'
      logger.error(`❌ API Error (${resolvedEndpoint.value}):`, err)
      
      if (onError) {
        onError(err)
      }
      
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Refrescar datos (ejecutar nuevamente)
   */
  async function refresh() {
    return execute()
  }

  // Ejecutar inmediatamente si se solicita
  if (immediate) {
    execute()
  }

  return {
    data,
    error,
    loading,
    execute,
    refresh
  }
}

/**
 * Composable para manejar estado asíncrono con control de carga
 * Útil para operaciones que necesitan tracking de estado
 * 
 * @param {Function} asyncFn - Función asíncrona a ejecutar
 * @param {*} initialState - Estado inicial
 * @param {Object} options - Opciones
 * @param {number} options.delay - Delay antes de ejecutar (ms)
 * @param {boolean} options.resetOnExecute - Resetear estado al ejecutar
 * @param {Function} options.onError - Callback de error
 * 
 * @example
 * const { state, isLoading, error, execute } = useAsyncState(
 *   async (id) => await fetchUser(id),
 *   null
 * )
 * await execute(123)
 */
export function useAsyncState(asyncFn, initialState = null, options = {}) {
  const {
    delay = 0,
    resetOnExecute = false,
    onError = null
  } = options

  // shallowRef para objetos grandes
  const state = shallowRef(initialState)
  const isLoading = ref(false)
  const isReady = ref(false)
  const error = ref(null)

  async function execute(...args) {
    isLoading.value = true
    
    if (resetOnExecute) {
      state.value = initialState
      isReady.value = false
    }
    
    error.value = null

    try {
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay))
      }

      const result = await asyncFn(...args)
      state.value = result
      isReady.value = true
      
      return result
    } catch (err) {
      error.value = err.message || 'Error desconocido'
      logger.error('❌ AsyncState Error:', err)
      
      if (onError) {
        onError(err)
      }
      
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    state,
    isLoading,
    isReady,
    error,
    execute
  }
}

/**
 * Composable para extraer datos de respuestas API con múltiples formatos
 * Maneja las diferentes estructuras de respuesta del backend HOMA
 * 
 * @param {Ref|Object} response - Respuesta de la API
 * @param {Array<string>} paths - Rutas posibles donde puede estar el array
 * @returns {ComputedRef<Array>} Array extraído o array vacío
 * 
 * @example
 * const campanas = useApiExtractor(response, [
 *   'data.campaigns',
 *   'campaigns', 
 *   'data'
 * ])
 */
export function useApiExtractor(response, paths = []) {
  return computed(() => {
    const data = toValue(response)
    
    if (!data) return []
    
    // Si ya es un array, retornarlo
    if (Array.isArray(data)) return data
    
    // Buscar en las rutas especificadas
    for (const path of paths) {
      const parts = path.split('.')
      let current = data
      
      for (const part of parts) {
        if (current && typeof current === 'object') {
          current = current[part]
        } else {
          current = undefined
          break
        }
      }
      
      if (Array.isArray(current)) {
        return current
      }
    }
    
    return []
  })
}

/**
 * Composable para manejar paginación de APIs
 * 
 * @param {Function} fetchFn - Función que recibe (page, limit) y retorna datos
 * @param {Object} options - Opciones de paginación
 * @param {number} options.limit - Items por página
 * @param {number} options.initialPage - Página inicial
 * 
 * @example
 * const { items, page, totalPages, next, prev, goTo } = usePagination(
 *   async (page, limit) => await fetchUsers(page, limit),
 *   { limit: 10 }
 * )
 */
export function usePagination(fetchFn, options = {}) {
  const { limit = 10, initialPage = 1 } = options
  
  const items = shallowRef([])
  const page = ref(initialPage)
  const total = ref(0)
  const loading = ref(false)
  const error = ref(null)

  const totalPages = computed(() => Math.ceil(total.value / limit))
  const hasNext = computed(() => page.value < totalPages.value)
  const hasPrev = computed(() => page.value > 1)

  async function fetch() {
    loading.value = true
    error.value = null

    try {
      const result = await fetchFn(page.value, limit)
      items.value = result.items || []
      total.value = result.total || 0
    } catch (err) {
      error.value = err.message
      logger.error('Pagination Error:', err)
    } finally {
      loading.value = false
    }
  }

  async function next() {
    if (hasNext.value) {
      page.value++
      await fetch()
    }
  }

  async function prev() {
    if (hasPrev.value) {
      page.value--
      await fetch()
    }
  }

  async function goTo(newPage) {
    if (newPage >= 1 && newPage <= totalPages.value) {
      page.value = newPage
      await fetch()
    }
  }

  async function refresh() {
    await fetch()
  }

  return {
    items,
    page,
    total,
    totalPages,
    loading,
    error,
    hasNext,
    hasPrev,
    fetch,
    next,
    prev,
    goTo,
    refresh
  }
}
