/**
 * Composable para manejo centralizado de errores
 *
 * Proporciona funcionalidades para:
 * - Capturar y almacenar errores de forma reactiva
 * - Mostrar mensajes de error amigables al usuario
 * - Retry automático con backoff exponencial
 * - Logging de errores
 *
 * @example
 * ```ts
 * const { error, errorMessage, execute, clearError } = useErrorHandler()
 *
 * // Ejecutar función con manejo de errores
 * const result = await execute(async () => {
 *   return await fetchData()
 * }, {
 *   retry: 3,
 *   retryDelay: 1000
 * })
 * ```
 */

import { ref, computed, type Ref, type ComputedRef } from 'vue'

/** Opciones para la ejecución con manejo de errores */
export interface ErrorHandlerOptions {
  /** Número de reintentos en caso de error (default: 0) */
  retry?: number
  /** Delay entre reintentos en ms (default: 1000) */
  retryDelay?: number
  /** Multiplicador para backoff exponencial (default: 2) */
  backoffMultiplier?: number
  /** Mensaje de error personalizado */
  errorMessage?: string
  /** Si debe hacer console.error (default: true en dev) */
  logError?: boolean
}

/** Retorno del composable */
export interface ErrorHandlerReturn {
  /** Error actual */
  error: Ref<Error | null>
  /** Mensaje de error amigable para el usuario */
  errorMessage: ComputedRef<string>
  /** Si hay un error activo */
  hasError: ComputedRef<boolean>
  /** Si está ejecutando una operación */
  isLoading: Ref<boolean>
  /** Número de reintentos realizados */
  retryCount: Ref<number>
  /** Ejecutar función con manejo de errores */
  execute: <T>(fn: () => Promise<T>, options?: ErrorHandlerOptions) => Promise<T | null>
  /** Limpiar error actual */
  clearError: () => void
  /** Reintentar la última operación */
  retry: () => Promise<void>
}

/**
 * Composable para manejo centralizado de errores
 *
 * @returns Estado y funciones para manejo de errores
 */
export function useErrorHandler(): ErrorHandlerReturn {
  const error = ref<Error | null>(null)
  const isLoading = ref(false)
  const retryCount = ref(0)
  let lastFn: (() => Promise<any>) | null = null
  let lastOptions: ErrorHandlerOptions = {}

  /**
   * Obtiene un mensaje de error amigable para el usuario
   */
  const errorMessage = computed(() => {
    if (!error.value) return ''

    // Mensajes personalizados según el tipo de error
    const message = error.value.message.toLowerCase()

    if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
      return 'Error de conexión. Verifica tu conexión a internet e intenta nuevamente.'
    }

    if (message.includes('timeout')) {
      return 'La operación tardó demasiado. Por favor, intenta nuevamente.'
    }

    if (message.includes('unauthorized') || message.includes('401')) {
      return 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'
    }

    if (message.includes('forbidden') || message.includes('403')) {
      return 'No tienes permisos para realizar esta acción.'
    }

    if (message.includes('not found') || message.includes('404')) {
      return 'El recurso solicitado no fue encontrado.'
    }

    if (message.includes('validation') || message.includes('400')) {
      return 'Los datos proporcionados no son válidos. Por favor, verifica e intenta nuevamente.'
    }

    // Mensaje genérico
    return 'Ocurrió un error inesperado. Por favor, intenta nuevamente.'
  })

  const hasError = computed(() => error.value !== null)

  /**
   * Espera un tiempo determinado
   */
  const sleep = (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Ejecuta una función con manejo de errores y reintentos
   */
  const execute = async <T>(
    fn: () => Promise<T>,
    options: ErrorHandlerOptions = {}
  ): Promise<T | null> => {
    const {
      retry = 0,
      retryDelay = 1000,
      backoffMultiplier = 2,
      logError = import.meta.env.DEV
    } = options

    // Guardar para posible retry manual
    lastFn = fn
    lastOptions = options

    // Resetear estado
    error.value = null
    retryCount.value = 0
    isLoading.value = true

    let lastError: Error | null = null

    for (let attempt = 0; attempt <= retry; attempt++) {
      try {
        const result = await fn()
        isLoading.value = false
        return result
      } catch (e) {
        lastError = e instanceof Error ? e : new Error(String(e))
        retryCount.value = attempt

        if (logError) {
          console.error(`Error en intento ${attempt + 1}/${retry + 1}:`, e)
        }

        // Si no es el último intento, esperar antes de reintentar
        if (attempt < retry) {
          const delay = retryDelay * Math.pow(backoffMultiplier, attempt)
          await sleep(delay)
        }
      }
    }

    // Todos los intentos fallaron
    error.value = lastError
    isLoading.value = false
    return null
  }

  /**
   * Limpia el error actual
   */
  const clearError = () => {
    error.value = null
    retryCount.value = 0
  }

  /**
   * Reintenta la última operación
   */
  const retry = async () => {
    if (lastFn) {
      clearError()
      await execute(lastFn, lastOptions)
    }
  }

  return {
    error,
    errorMessage,
    hasError,
    isLoading,
    retryCount,
    execute,
    clearError,
    retry
  }
}

export default useErrorHandler
