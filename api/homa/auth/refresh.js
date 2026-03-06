/**
 * Refresh BFF HOMA.
 * Usa cookie de sesión para refrescar token HOMA y reescribe cookie segura.
 */

import { crearLimitador } from '../../_lib/rateLimiter.js'
import { obtenerIp, respuestaJson } from '../../_lib/http.js'
import {
  obtenerSesionDesdeRequest,
  anexarCookieSesion,
  anexarCookieSesionCorta,
  construirCookieVacia
} from '../../_lib/sessionCrypto.js'

const API_HOMA_URL = process.env.API_HOMA_URL || 'https://apihoma.homa.cl:7200'
const limitador = crearLimitador({ maxPeticiones: 30, ventanaMs: 60_000 })

export default async function handler(req, res) {
  const ip = obtenerIp(req)
  const { permitido, restantes, mensaje } = limitador.verificar(`refresh:${ip}`)

  res.setHeader('X-RateLimit-Limit', '30')
  res.setHeader('X-RateLimit-Remaining', String(restantes))

  if (!permitido) return respuestaJson(res, 429, { error: mensaje })

  if (req.method !== 'POST') {
    return respuestaJson(res, 405, { error: 'Método no permitido' })
  }

  try {
    const sesion = obtenerSesionDesdeRequest(req)
    if (!sesion?.token) {
      res.setHeader('Set-Cookie', construirCookieVacia())
      return respuestaJson(res, 401, { success: false, error: 'Sesión inválida' })
    }

    const response = await fetch(`${API_HOMA_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': sesion.token
      }
    })

    const texto = await response.text()
    let datos = {}
    try {
      datos = texto ? JSON.parse(texto) : {}
    } catch {
      res.setHeader('Set-Cookie', construirCookieVacia())
      return respuestaJson(res, 502, { success: false, error: 'Respuesta inválida desde HOMA' })
    }

    if (!response.ok) {
      res.setHeader('Set-Cookie', construirCookieVacia())
      return respuestaJson(res, response.status, {
        success: false,
        error: datos?.error || datos?.message || 'No se pudo refrescar la sesión'
      })
    }

    if (datos?.token) {
      const sesionActualizada = {
        ...sesion,
        token: datos.token
      }
      const ttl = anexarCookieSesion(res, sesionActualizada, datos.token)
      return respuestaJson(res, 200, {
        success: true,
        token: 'bff-session',
        ttl
      })
    }

    // Modo conservador: mantener sesión por tiempo corto y forzar revalidación futura.
    anexarCookieSesionCorta(res, sesion)
    return respuestaJson(res, 200, {
      success: true,
      token: 'bff-session',
      ttl: 300
    })
  } catch (error) {
    return respuestaJson(res, 500, {
      success: false,
      error: error?.message || 'Error interno'
    })
  }
}
