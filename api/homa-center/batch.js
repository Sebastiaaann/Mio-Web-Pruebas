/**
 * Endpoint de HOMA Center - Batch de observaciones.
 * Limite: 20 peticiones por IP cada 60 segundos.
 */

const { crearLimitador } = require('../_lib/rateLimiter')

// Limitador compartido para todas las invocaciones en el mismo proceso
const limitador = crearLimitador({ maxPeticiones: 20, ventanaMs: 60_000 })

/**
 * Obtiene la IP real del cliente, considerando proxies.
 * @param {import('@vercel/node').VercelRequest} req
 * @returns {string}
 */
function obtenerIp(req) {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string') return forwarded.split(',')[0].trim()
  return req.socket?.remoteAddress || 'desconocida'
}

/**
 * @param {import('@vercel/node').VercelRequest} req
 * @param {import('@vercel/node').VercelResponse} res
 */
module.exports = async function handler(req, res) {
  // Verificar rate limit
  const ip = obtenerIp(req)
  const { permitido, restantes, mensaje } = limitador.verificar(ip)

  res.setHeader('X-RateLimit-Limit', '20')
  res.setHeader('X-RateLimit-Remaining', String(restantes))

  if (!permitido) {
    return res.status(429).json({ error: mensaje })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  // TODO: lógica del batch de observaciones HOMA Center aquí
  return res.status(200).json({ mensaje: 'OK' })
}
