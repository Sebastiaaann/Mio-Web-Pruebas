/**
 * Logger Seguro para Mio-Web
 *
 * Propósito:
 * - Evitar que datos sensibles (PII, PHI) aparezcan en la consola del navegador en producción.
 * - Centralizar la lógica de logging.
 */

type LogArgs = unknown[]

const isDev = import.meta.env.DEV

export const logger = {
  /**
   * Log de información (Solo en Desarrollo)
   * Usar para: flujo general, datos de debug no sensibles.
   */
  info: (...args: LogArgs): void => {
    if (isDev) {
      console.log('ℹ️ [INFO]', ...args)
    }
  },

  /**
   * Log de advertencia (Solo en Desarrollo)
   * Usar para: deprecaciones, comportamientos inesperados no críticos.
   */
  warn: (...args: LogArgs): void => {
    if (isDev) {
      console.warn('⚠️ [WARN]', ...args)
    }
  },

  /**
   * Log de error (Producción y Desarrollo)
   * Usar para: excepciones, fallos de red.
   * IMPORTANTE: No pasar objetos completos de usuario o pacientes aquí.
   * Pasar solo mensajes de error o códigos.
   */
  error: (message: string, errorRaw: unknown = null): void => {
    // Siempre mostrar errores, pero sanitizados si es posible
    console.error('❌ [ERROR]', message)

    if (isDev && errorRaw) {
    // En dev mostramos el objeto completo para debug
      console.error(errorRaw)
    }
    // TODO: Aquí se podría conectar con Sentry/Datadog en el futuro
  },

  /**
   * Log de seguridad (Auditoría)
   * Usar para: intentos de login fallidos, acceso denegado.
   */
  security: (message: string, metadata: Record<string, unknown> = {}): void => {
    if (isDev) {
      console.log('🛡️ [SECURITY]', message, metadata)
    }
    // En producción esto podría ir a un endpoint de auditoría silencioso
  }
}
