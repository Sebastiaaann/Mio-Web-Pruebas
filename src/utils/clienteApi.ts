import { logger } from '@/utils/logger'
import { FLAGS } from '@/utils/featureFlags'
import type { RequestConfig } from '@/types'

const API_HOMA_URL = import.meta.env.VITE_API_HOMA_URL || 'https://apihoma.homa.cl:7200'
const API_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT) || 10000

/**
 * Cliente API Centralizado
 * Maneja la inyección de tokens, control de errores y refresh automático de token.
 */
class ClienteApi {
  // Mutex para evitar múltiples refresh simultáneos
  private refreshEnProgreso: Promise<boolean> | null = null

  /**
   * Obtiene el token de almacenamiento de sesión sin dependencias circulares.
   * sessionStorage es más seguro que localStorage (no persiste entre pestañas/cierre del navegador).
   * Incluye migración on-the-fly desde localStorage para sesiones antiguas.
   */
  private obtenerToken(): string | null {
    // Migración on-the-fly: si el token está en localStorage (sesión antigua), moverlo a sessionStorage
    const tokenLegacy = localStorage.getItem('mio-token')
    if (tokenLegacy) {
      sessionStorage.setItem('mio-token', tokenLegacy)
      localStorage.removeItem('mio-token')
    }
    return sessionStorage.getItem('mio-token')
  }

  /**
   * Intenta refrescar el token JWT una sola vez
   * Usa un mutex para evitar race conditions cuando múltiples requests
   * reciben 401 simultáneamente
   */
  private async intentarRefreshToken(): Promise<boolean> {
    // Si ya hay un refresh en curso, esperar su resultado
    if (this.refreshEnProgreso) {
      return this.refreshEnProgreso
    }

    // Crear promise de refresh con mutex
    this.refreshEnProgreso = (async () => {
      try {
        // Import dinámico para evitar dependencias circulares
        const { authService } = await import('@/services/authService')
        const resultado = await authService.refrescarToken()
        return resultado.success
      } catch (error) {
        logger.error('Error en refresh de token:', error)
        return false
      } finally {
        // Liberar mutex
        this.refreshEnProgreso = null
      }
    })()

    return this.refreshEnProgreso
  }

  /**
   * Realiza una petición fetch inyectando el token de autenticación
   * En caso de 401, intenta refresh del token y reintenta UNA vez
   */
  async request<T = unknown>(endpoint: string, opciones: RequestConfig = {}): Promise<T> {
    const resultado = await this._ejecutarRequest<T>(endpoint, opciones)

    // Si recibimos 401, intentar refresh y reintentar
    if (resultado.status401) {
      const refreshExitoso = await this.intentarRefreshToken()

      if (refreshExitoso) {
        logger.info(`Token refrescado, reintentando: ${endpoint}`)
        const retry = await this._ejecutarRequest<T>(endpoint, opciones)

        if (retry.status401) {
          // El refresh no solucionó el problema, forzar logout
          window.dispatchEvent(new CustomEvent('auth:session-expired'))
          throw new Error('Sesión expirada')
        }

        if (retry.error) throw retry.error
        return retry.data as T
      }

      // Refresh falló, forzar logout
      window.dispatchEvent(new CustomEvent('auth:session-expired'))
      throw new Error('Sesión expirada')
    }

    if (resultado.error) throw resultado.error
    return resultado.data as T
  }

  /**
   * Aplica transformación de endpoint para modo BFF.
   * /api/v1/* -> /api/homa/*
   */
  private transformarEndpoint(endpoint: string): string {
    if (!FLAGS.USE_HOMA_BFF) return endpoint
    if (endpoint.startsWith('/api/v1/')) {
      return endpoint.replace('/api/v1/', '/api/homa/')
    }
    return endpoint
  }

  /**
   * Construye URL final según modo (legado o BFF).
   */
  private construirUrl(endpoint: string): string {
    const endpointTransformado = this.transformarEndpoint(endpoint)
    if (endpointTransformado.startsWith('http')) return endpointTransformado

    if (FLAGS.USE_HOMA_BFF) {
      return endpointTransformado
    }

    return `${API_HOMA_URL}${endpointTransformado}`
  }

  /**
   * Ejecuta la petición HTTP real
   * Retorna un objeto con el resultado para que el caller pueda decidir qué hacer
   */
  private async _ejecutarRequest<T>(
    endpoint: string,
    opciones: RequestConfig
  ): Promise<{ data?: T; error?: Error; status401?: boolean }> {
    const controller = new AbortController()
    const timeout = opciones.timeout ?? API_TIMEOUT
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const token = this.obtenerToken()

      const config: RequestInit = {
        ...opciones,
        headers: {
          'Content-Type': 'application/json',
          ...(opciones.headers as Record<string, string> | undefined),
        },
        signal: controller.signal,
        // En modo BFF usamos cookie HttpOnly same-origin.
        ...(FLAGS.USE_HOMA_BFF ? { credentials: 'include' as RequestCredentials } : {})
      }

      // Modo legado: inyectar X-API-KEY desde sessionStorage.
      if (!FLAGS.USE_HOMA_BFF && token) {
        ;(config.headers as Record<string, string>)['X-API-KEY'] = token
      }

      const url = this.construirUrl(endpoint)

      const response = await fetch(url, config)

      clearTimeout(timeoutId)

      // Señalizar 401 para que el caller intente refresh
      if (response.status === 401) {
        return { status401: true }
      }

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => ({}))) as { error?: string }
        return { error: new Error(errorBody.error || `Error ${response.status}: ${response.statusText}`) }
      }

      // Si no hay contenido (204 No Content), devolver null
      if (response.status === 204) return { data: null as T }

      return { data: (await response.json()) as T }
    } catch (error) {
      clearTimeout(timeoutId)

      if (error instanceof Error && error.name === 'AbortError') {
        logger.error(`Timeout en peticion a ${endpoint}`)
        return { error: new Error('La solicitud tardó demasiado. Verifique su conexión.') }
      }

      logger.error(`Error API en ${endpoint}:`, error)
      return { error: error as Error }
    }
  }

  // Helpers sintacticos
  get<T = unknown>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  post<T = unknown, D = unknown>(endpoint: string, body: D): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    })
  }

  put<T = unknown, D = unknown>(endpoint: string, body: D): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body)
    })
  }

  delete<T = unknown>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

export const clienteApi = new ClienteApi()
