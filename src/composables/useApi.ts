import { computed, ref, shallowRef, toValue } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import { clienteApi } from '@/utils/clienteApi'
import { logger } from '@/utils/logger'

type EndpointReactive = string | Ref<string> | ComputedRef<string> | (() => string)

interface UseApiOptions<TData = unknown> {
  method?: string
  headers?: Record<string, string>
  immediate?: boolean
  defaultValue?: TData | null
  onError?: (error: Error) => void
  onSuccess?: (data: TData) => void
}

interface UseApiResultado<TData> {
  data: Ref<TData | null>
  error: Ref<string | null>
  loading: Ref<boolean>
  execute: (body?: unknown, overrideOptions?: Partial<UseApiOptions<TData>> & { method?: string; headers?: Record<string, string> }) => Promise<{ success: boolean; data?: TData; error?: string }>
  refresh: () => Promise<{ success: boolean; data?: TData; error?: string }>
}

interface UseAsyncStateOptions {
  delay?: number
  resetOnExecute?: boolean
  onError?: (error: Error) => void
}

interface UseAsyncStateResultado<TState> {
  state: Ref<TState | null>
  isLoading: Ref<boolean>
  isReady: Ref<boolean>
  error: Ref<string | null>
  execute: (...args: unknown[]) => Promise<TState>
}

interface UsePaginationOptions {
  limit?: number
  initialPage?: number
}

interface PaginationResultado<TItem> {
  items: Ref<TItem[]>
  page: Ref<number>
  total: Ref<number>
  totalPages: ComputedRef<number>
  loading: Ref<boolean>
  error: Ref<string | null>
  hasNext: ComputedRef<boolean>
  hasPrev: ComputedRef<boolean>
  fetch: () => Promise<void>
  next: () => Promise<void>
  prev: () => Promise<void>
  goTo: (newPage: number) => Promise<void>
  refresh: () => Promise<void>
}

/**
 * Composable para realizar peticiones API de forma reactiva
 * Soporta endpoints reactivos (ref, computed, getter)
 */
export function useApi<TData = unknown>(endpoint: EndpointReactive, options: UseApiOptions<TData> = {}): UseApiResultado<TData> {
  const {
    method = 'GET',
    headers = {},
    immediate = false,
    defaultValue = null,
    onError = null,
    onSuccess = null
  } = options

  // Usar shallowRef para datos grandes que no necesitan reactividad profunda
  const data = shallowRef<TData | null>(defaultValue)
  const error = ref<string | null>(null)
  const loading = ref(false)

  // Resolver endpoint reactivo
  const resolvedEndpoint = computed(() => {
    const value = toValue(endpoint)
    return value.startsWith('http') ? value : value
  })

  /**
   * Ejecutar la petición API
   */
  async function execute(body: unknown = null, overrideOptions: Partial<UseApiOptions<TData>> & { method?: string; headers?: Record<string, string> } = {}) {
    loading.value = true
    error.value = null

    try {
      const url = resolvedEndpoint.value

      const config: { method: string; headers: Record<string, string>; body?: string } = {
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

      const response = await clienteApi.request<TData>(url, config)
      data.value = response

      if (onSuccess) {
        onSuccess(response)
      }

      return { success: true, data: response }
    } catch (err) {
      const mensajeError = err instanceof Error ? err.message : 'Error desconocido'
      error.value = mensajeError
      logger.error(`❌ API Error (${resolvedEndpoint.value}):`, err)

      if (onError && err instanceof Error) {
        onError(err)
      }

      return { success: false, error: mensajeError }
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
 */
export function useAsyncState<TState>(asyncFn: (...args: unknown[]) => Promise<TState>, initialState: TState | null = null, options: UseAsyncStateOptions = {}): UseAsyncStateResultado<TState> {
  const {
    delay = 0,
    resetOnExecute = false,
    onError = null
  } = options

  // shallowRef para objetos grandes
  const state = shallowRef<TState | null>(initialState)
  const isLoading = ref(false)
  const isReady = ref(false)
  const error = ref<string | null>(null)

  async function execute(...args: unknown[]): Promise<TState> {
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
      const mensajeError = err instanceof Error ? err.message : 'Error desconocido'
      error.value = mensajeError
      logger.error('❌ AsyncState Error:', err)

      if (onError && err instanceof Error) {
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
 */
export function useApiExtractor<TItem = unknown>(response: Ref<unknown> | unknown, paths: string[] = []): ComputedRef<TItem[]> {
  return computed(() => {
    const data = toValue(response)

    if (!data) return []

    // Si ya es un array, retornarlo
    if (Array.isArray(data)) return data as TItem[]

    // Buscar en las rutas especificadas
    for (const path of paths) {
      const parts = path.split('.')
      let current: unknown = data

      for (const part of parts) {
        if (current && typeof current === 'object') {
          current = (current as Record<string, unknown>)[part]
        } else {
          current = undefined
          break
        }
      }

      if (Array.isArray(current)) {
        return current as TItem[]
      }
    }

    return []
  })
}

/**
 * Composable para manejar paginación de APIs
 */
export function usePagination<TItem = unknown>(fetchFn: (page: number, limit: number) => Promise<{ items?: TItem[]; total?: number }>, options: UsePaginationOptions = {}): PaginationResultado<TItem> {
  const { limit = 10, initialPage = 1 } = options

  const items = shallowRef<TItem[]>([])
  const page = ref(initialPage)
  const total = ref(0)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const totalPages = computed(() => Math.ceil(total.value / limit))
  const hasNext = computed(() => page.value < totalPages.value)
  const hasPrev = computed(() => page.value > 1)

  async function fetch(): Promise<void> {
    loading.value = true
    error.value = null

    try {
      const result = await fetchFn(page.value, limit)
      items.value = result.items || []
      total.value = result.total || 0
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error desconocido'
      logger.error('Pagination Error:', err)
    } finally {
      loading.value = false
    }
  }

  async function next(): Promise<void> {
    if (hasNext.value) {
      page.value++
      await fetch()
    }
  }

  async function prev(): Promise<void> {
    if (hasPrev.value) {
      page.value--
      await fetch()
    }
  }

  async function goTo(newPage: number): Promise<void> {
    if (newPage >= 1 && newPage <= totalPages.value) {
      page.value = newPage
      await fetch()
    }
  }

  async function refresh(): Promise<void> {
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
