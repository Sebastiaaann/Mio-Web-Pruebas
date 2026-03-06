/**
 * Endpoint de chat con IA.
 * Limite: 10 peticiones por IP cada 60 segundos.
 */

import { crearLimitador } from './_lib/rateLimiter.js'
import { obtenerIp } from './_lib/http.js'

// Limitador compartido para todas las invocaciones en el mismo proceso
const limitador = crearLimitador({ maxPeticiones: 10, ventanaMs: 60_000 })

/**
 * @param {import('@vercel/node').VercelRequest} req
 * @param {import('@vercel/node').VercelResponse} res
 */
export default async function handler(req, res) {
  // Verificar rate limit
  const ip = obtenerIp(req)
  const { permitido, restantes, mensaje } = limitador.verificar(ip)

  res.setHeader('X-RateLimit-Limit', '10')
  res.setHeader('X-RateLimit-Remaining', String(restantes))

  if (!permitido) {
    return res.status(429).json({ error: mensaje })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  // TODO: lógica del chat con IA aquí
  return res.status(200).json({ mensaje: 'OK' })
}
