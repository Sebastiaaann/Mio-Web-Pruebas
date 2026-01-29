import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref, nextTick } from 'vue'
import { useApi, useAsyncState, useApiExtractor, usePagination } from '../useApi'
import { clienteApi } from '@/utils/clienteApi'

// Mock del clienteApi
vi.mock('@/utils/clienteApi', () => ({
  clienteApi: {
    request: vi.fn()
  }
}))

describe('useApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useApi composable', () => {
    it('debería tener estado inicial correcto', () => {
      const { data, error, loading } = useApi('/api/test')

      expect(data.value).toBeNull()
      expect(error.value).toBeNull()
      expect(loading.value).toBe(false)
    })

    it('debería ejecutar petición GET exitosamente', async () => {
      const mockData = { id: 1, name: 'Test' }
      clienteApi.request.mockResolvedValue(mockData)

      const { data, loading, execute } = useApi('/api/users')
      const result = await execute()

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockData)
      expect(data.value).toEqual(mockData)
      expect(loading.value).toBe(false)
    })

    it('debería ejecutar petición POST con body', async () => {
      const mockResponse = { id: 1, created: true }
      clienteApi.request.mockResolvedValue(mockResponse)

      const { execute } = useApi('/api/users', { method: 'POST' })
      const body = { name: 'Juan', email: 'juan@test.com' }
      
      await execute(body)

      expect(clienteApi.request).toHaveBeenCalledWith('/api/users', {
        method: 'POST',
        headers: {},
        body: JSON.stringify(body)
      })
    })

    it('debería manejar errores de API', async () => {
      const errorMessage = 'Error de conexión'
      clienteApi.request.mockRejectedValue(new Error(errorMessage))

      const { error, execute } = useApi('/api/users')
      const result = await execute()

      expect(result.success).toBe(false)
      expect(result.error).toBe(errorMessage)
      expect(error.value).toBe(errorMessage)
    })

    it('debería establecer loading en true durante la petición', async () => {
      clienteApi.request.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({}), 100))
      )

      const { loading, execute } = useApi('/api/users')
      
      const promise = execute()
      expect(loading.value).toBe(true)
      
      await promise
      expect(loading.value).toBe(false)
    })

    it('debería soportar endpoints reactivos (ref)', async () => {
      const userId = ref(123)
      clienteApi.request.mockResolvedValue({ id: 123, name: 'Juan' })

      const { execute } = useApi(() => `/api/users/${userId.value}`)
      await execute()

      expect(clienteApi.request).toHaveBeenCalledWith('/api/users/123', expect.any(Object))
    })

    it('debería llamar onSuccess callback', async () => {
      const onSuccess = vi.fn()
      const mockData = { success: true }
      clienteApi.request.mockResolvedValue(mockData)

      const { execute } = useApi('/api/test', { onSuccess })
      await execute()

      expect(onSuccess).toHaveBeenCalledWith(mockData)
    })

    it('debería llamar onError callback', async () => {
      const onError = vi.fn()
      clienteApi.request.mockRejectedValue(new Error('Error'))

      const { execute } = useApi('/api/test', { onError })
      await execute()

      expect(onError).toHaveBeenCalled()
    })

    it('debería ejecutar inmediatamente si immediate=true', async () => {
      clienteApi.request.mockResolvedValue({})

      useApi('/api/users', { immediate: true })

      await nextTick()
      expect(clienteApi.request).toHaveBeenCalled()
    })

    it('debería refrescar datos con refresh()', async () => {
      clienteApi.request.mockResolvedValue({ updated: true })

      const { refresh } = useApi('/api/users')
      const result = await refresh()

      expect(result.success).toBe(true)
      expect(clienteApi.request).toHaveBeenCalledTimes(1)
    })
  })

  describe('useAsyncState', () => {
    it('debería tener estado inicial correcto', () => {
      const asyncFn = vi.fn()
      const { state, isLoading, isReady, error } = useAsyncState(asyncFn, null)

      expect(state.value).toBeNull()
      expect(isLoading.value).toBe(false)
      expect(isReady.value).toBe(false)
      expect(error.value).toBeNull()
    })

    it('debería ejecutar función asíncrona y actualizar estado', async () => {
      const mockData = { result: 'success' }
      const asyncFn = vi.fn().mockResolvedValue(mockData)

      const { state, isReady, execute } = useAsyncState(asyncFn, null)
      await execute()

      expect(state.value).toEqual(mockData)
      expect(isReady.value).toBe(true)
      expect(asyncFn).toHaveBeenCalled()
    })

    it('debería manejar errores', async () => {
      const errorMessage = 'Error async'
      const asyncFn = vi.fn().mockRejectedValue(new Error(errorMessage))

      const { error, isLoading, execute } = useAsyncState(asyncFn, null)
      
      try {
        await execute()
      } catch (e) {
        // Error esperado - el composable debería capturarlo
      }

      expect(error.value).toBe(errorMessage)
      expect(isLoading.value).toBe(false)
    })

    it('debería aplicar delay antes de ejecutar', async () => {
      const asyncFn = vi.fn().mockResolvedValue({})
      const startTime = Date.now()

      const { execute } = useAsyncState(asyncFn, null, { delay: 100 })
      await execute()
      const endTime = Date.now()

      expect(endTime - startTime).toBeGreaterThanOrEqual(100)
    })

    it('debería resetear estado si resetOnExecute=true', async () => {
      const asyncFn = vi.fn()
        .mockResolvedValueOnce({ version: 1 })
        .mockResolvedValueOnce({ version: 2 })

      const { state, execute } = useAsyncState(asyncFn, null, { resetOnExecute: true })
      
      await execute()
      expect(state.value).toEqual({ version: 1 })
      
      await execute()
      expect(state.value).toEqual({ version: 2 })
    })
  })

  describe('useApiExtractor', () => {
    it('debería extraer array de data directa', () => {
      const response = ref([{ id: 1 }, { id: 2 }])
      const extracted = useApiExtractor(response, ['data.items'])

      expect(extracted.value).toEqual([{ id: 1 }, { id: 2 }])
    })

    it('debería extraer array de path anidado', () => {
      const response = ref({
        data: {
          items: [{ id: 1 }, { id: 2 }]
        }
      })
      const extracted = useApiExtractor(response, ['data.items', 'items'])

      expect(extracted.value).toEqual([{ id: 1 }, { id: 2 }])
    })

    it('debería retornar array vacío si no encuentra datos', () => {
      const response = ref({ data: {} })
      const extracted = useApiExtractor(response, ['data.items', 'items'])

      expect(extracted.value).toEqual([])
    })

    it('debería retornar array vacío si response es null', () => {
      const response = ref(null)
      const extracted = useApiExtractor(response, ['data'])

      expect(extracted.value).toEqual([])
    })
  })

  describe('usePagination', () => {
    it('debería tener estado inicial correcto', () => {
      const fetchFn = vi.fn()
      const { items, page, totalPages, hasNext, hasPrev } = usePagination(fetchFn)

      expect(items.value).toEqual([])
      expect(page.value).toBe(1)
      expect(totalPages.value).toBe(0)
      expect(hasNext.value).toBe(false)
      expect(hasPrev.value).toBe(false)
    })

    it('debería cargar primera página', async () => {
      const mockData = {
        items: [{ id: 1 }, { id: 2 }],
        total: 10
      }
      const fetchFn = vi.fn().mockResolvedValue(mockData)

      const { items, total, fetch } = usePagination(fetchFn, { limit: 2 })
      await fetch()

      expect(items.value).toEqual(mockData.items)
      expect(total.value).toBe(10)
      expect(fetchFn).toHaveBeenCalledWith(1, 2)
    })

    it('debería navegar a siguiente página', async () => {
      const fetchFn = vi.fn()
        .mockResolvedValueOnce({ items: [{ id: 1 }], total: 5 })
        .mockResolvedValueOnce({ items: [{ id: 2 }], total: 5 })

      const { page, next, fetch } = usePagination(fetchFn, { limit: 1 })
      
      // Primero cargamos la página inicial
      await fetch()
      expect(page.value).toBe(1)
      
      // Luego navegamos a la siguiente
      await next()
      expect(page.value).toBe(2)
    })

    it('debería navegar a página anterior', async () => {
      const fetchFn = vi.fn().mockResolvedValue({ items: [], total: 10 })

      const { page, next, prev } = usePagination(fetchFn, { limit: 2 })
      
      await next() // página 2
      await prev() // página 1
      
      expect(page.value).toBe(1)
    })

    it('debería ir a página específica', async () => {
      const fetchFn = vi.fn().mockResolvedValue({ items: [], total: 30 })

      const { page, goTo, fetch } = usePagination(fetchFn, { limit: 10 })
      
      // Primero cargamos para calcular totalPages
      await fetch()
      expect(page.value).toBe(1)
      
      // Luego navegamos a página específica
      await goTo(3)
      expect(page.value).toBe(3)
    })

    it('no debería ir más allá de totalPages', async () => {
      const fetchFn = vi.fn().mockResolvedValue({ items: [], total: 10 })

      const { page, goTo } = usePagination(fetchFn, { limit: 10 })
      
      await goTo(999)
      expect(page.value).toBe(1) // No cambió
    })

    it('debería manejar errores de carga', async () => {
      const fetchFn = vi.fn().mockRejectedValue(new Error('Error de red'))

      const { error, fetch } = usePagination(fetchFn)
      await fetch()

      expect(error.value).toBe('Error de red')
    })

    it('debería refrescar datos', async () => {
      const fetchFn = vi.fn().mockResolvedValue({ items: [{ id: 1 }], total: 1 })

      const { refresh } = usePagination(fetchFn)
      await refresh()

      expect(fetchFn).toHaveBeenCalledTimes(1)
    })
  })
})
