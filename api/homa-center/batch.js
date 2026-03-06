/**
 * Endpoint de HOMA Center - Batch de observaciones.
 * Limite: 20 peticiones por IP cada 60 segundos.
 */

import { crearLimitador } from '../_lib/rateLimiter.js'
import { obtenerSesionDesdeRequest } from '../_lib/sessionCrypto.js'

// Limitador compartido para todas las invocaciones en el mismo proceso
const limitador = crearLimitador({ maxPeticiones: 20, ventanaMs: 60_000 })

const HOMA_CENTER_URL = 'https://homacenter.homa.cl:7999'

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

function obtenerTokenAuth(req) {
  // Prioridad: sesión segura por cookie HttpOnly (modo BFF)
  const sesion = obtenerSesionDesdeRequest(req)
  if (sesion?.token && typeof sesion.token === 'string') {
    return sesion.token
  }

  // Compatibilidad temporal: header legado X-API-KEY
  const token = req.headers['x-api-key']
  return typeof token === 'string' ? token : null
}

function respuestaJson(res, status, payload) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(payload))
}

/**
 * @param {import('@vercel/node').VercelRequest} req
 * @param {import('@vercel/node').VercelResponse} res
 */
export default async function handler(req, res) {
  // Verificar rate limit
  const ip = obtenerIp(req)
  const { permitido, restantes, mensaje } = limitador.verificar(ip)

  res.setHeader('X-RateLimit-Limit', '20')
  res.setHeader('X-RateLimit-Remaining', String(restantes))

  if (!permitido) {
    return respuestaJson(res, 429, { error: mensaje })
  }

  if (req.method !== 'POST') {
    return respuestaJson(res, 405, { error: 'Método no permitido' })
  }

  try {
    const token = obtenerTokenAuth(req)
    if (!token) {
      return respuestaJson(res, 401, { error: 'Token requerido' })
    }

    const body = req.body
    if (!body || typeof body !== 'object') {
      return respuestaJson(res, 400, { error: 'Body inválido' })
    }

    const response = await fetch(
      `${HOMA_CENTER_URL}/batch?skip_tray=false&evaluate_observations=true`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': token
        },
        body: JSON.stringify(body)
      }
    )

    const text = await response.text()

    if (!response.ok) {
      return respuestaJson(res, response.status, { error: text })
    }

    try {
      const json = JSON.parse(text)
      return respuestaJson(res, 200, json)
    } catch {
      return respuestaJson(res, 200, { raw: text })
    }
  } catch (error) {
    return respuestaJson(res, 500, { error: error?.message || 'Error interno' })
  }
}
