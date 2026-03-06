/**
 * Rate limiter en memoria para Vercel Serverless Functions.
 * Utiliza una ventana deslizante simple (sliding window) por IP.
 *
 * Uso:
 *   const limiter = crearLimitador({ maxPeticiones: 10, ventanaMs: 60_000 })
 *   const resultado = limiter.verificar(ip)
 *   if (!resultado.permitido) return res.status(429).json({ error: resultado.mensaje })
 */

/**
 * @typedef {{ permitido: boolean, restantes: number, mensaje?: string }} ResultadoLimit
 */

/**
 * Crea un limitador de tasa con ventana deslizante.
 *
 * @param {{ maxPeticiones: number, ventanaMs: number }} opciones
 * @returns {{ verificar: (ip: string) => ResultadoLimit }}
 */
export function crearLimitador({ maxPeticiones, ventanaMs }) {
  /** @type {Map<string, number[]>} Mapa de IP → timestamps de peticiones */
  const registro = new Map()

  /**
   * Verifica si la IP puede hacer otra petición.
   * @param {string} ip
   * @returns {ResultadoLimit}
   */
  function verificar(ip) {
    const ahora = Date.now()
    const umbral = ahora - ventanaMs

    // Obtener o inicializar el historial de timestamps de esta IP
    const timestamps = (registro.get(ip) || []).filter(t => t > umbral)

    if (timestamps.length >= maxPeticiones) {
      const restantes = 0
      const resetEn = Math.ceil((timestamps[0] + ventanaMs - ahora) / 1000)
      return {
        permitido: false,
        restantes,
        mensaje: `Límite de peticiones alcanzado. Intente nuevamente en ${resetEn} segundos.`
      }
    }

    // Registrar la petición actual
    timestamps.push(ahora)
    registro.set(ip, timestamps)

    return {
      permitido: true,
      restantes: maxPeticiones - timestamps.length
    }
  }

  return { verificar }
}
