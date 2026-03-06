/**
 * Flags de funcionalidades y seguridad.
 *
 * NOTA:
 * Las variables VITE_* se resuelven en build-time.
 */

function esFlagActiva(valor: string | undefined, valorPorDefecto = false): boolean {
  if (valor === undefined) return valorPorDefecto
  return valor === 'true'
}

function esFlagNoDesactivada(valor: string | undefined): boolean {
  return valor !== 'false'
}

export const FLAGS = {
  /**
   * Activa el modo BFF para tráfico HOMA.
   * false: comportamiento legado (directo a API HOMA).
   * true: proxy a /api/homa/* con cookie HttpOnly.
   *
   * ⚠️ BLOQUEADO — NO activar en producción.
   * Los endpoints en api/homa/auth/*.js no validan el ID token de Firebase
   * server-side. Hasta que esa validación esté implementada y auditada,
   * VITE_USE_HOMA_BFF debe permanecer en `false` (valor por defecto).
   */
  USE_HOMA_BFF: esFlagActiva(import.meta.env.VITE_USE_HOMA_BFF, false),

  /**
   * Flags de contención funcional.
   */
  MEDICIONES_ACTIVAS: esFlagNoDesactivada(import.meta.env.VITE_FLAG_MEDICIONES),
  PLANES_ACTIVOS: esFlagNoDesactivada(import.meta.env.VITE_FLAG_PLANES),
  CONTROLES_ACTIVOS: esFlagNoDesactivada(import.meta.env.VITE_FLAG_CONTROLES),
} as const

