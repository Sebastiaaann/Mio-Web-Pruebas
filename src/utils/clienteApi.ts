import { logger } from '@/utils/logger'
import type { RequestConfig } from '@/types'

const API_HOMA_URL = import.meta.env.VITE_API_HOMA_URL || 'https://apihoma.homa.cl:7200'
const API_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT) || 10000

/**
 * Cliente API Centralizado
 * Maneja la inyección de tokens y control de errores para servicios HOMA.
 */
class ClienteApi {
  /**
   * Obtiene el token de almacenamiento local sin dependencias circulares
   */
  private obtenerToken(): string | null {
    return localStorage.getItem('mio-token')
  }

  /**
   * Realiza una petición fetch inyectando el token de autenticación
   */
  async request<T = unknown>(endpoint: string, opciones: RequestConfig = {}): Promise<T> {
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
        signal: controller.signal
      }

      // Inyectar token si existe (HOMA usa X-API-KEY, no Authorization Bearer)
      if (token) {
        ;(config.headers as Record<string, string>)['X-API-KEY'] = token
      }

      // Asegurar URL completa
      const url = endpoint.startsWith('http') ? endpoint : `${API_HOMA_URL}${endpoint}`

      const response = await fetch(url, config)

      clearTimeout(timeoutId)

      // Manejo centralizado de errores 401 (Token Expirado)
      if (response.status === 401) {
        // Opcional: Disparar evento de logout global si se desea
        window.dispatchEvent(new CustomEvent('auth:session-expired'))
        throw new Error('Sesión expirada')
      }

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => ({}))) as { error?: string }
        throw new Error(errorBody.error || `Error ${response.status}: ${response.statusText}`)
      }

      // Si no hay contenido (204 No Content), devolver null
      if (response.status === 204) return null as T

      return (await response.json()) as T
    } catch (error) {
      clearTimeout(timeoutId)

      if (error instanceof Error && error.name === 'AbortError') {
        logger.error(`Timeout en peticion a ${endpoint}`)
        throw new Error('La solicitud tardó demasiado. Verifique su conexión.')
      }

      logger.error(`Error API en ${endpoint}:`, error)
      throw error
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
