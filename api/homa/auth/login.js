/**
 * Login BFF HOMA.
 * Recibe email + uid (Firebase ya autenticado en cliente) y emite cookie HttpOnly.
 */

import { crearLimitador } from '../../_lib/rateLimiter.js'
import { obtenerIp, respuestaJson, leerBody } from '../../_lib/http.js'
import { crearSesionDesdeAuth, anexarCookieSesion } from '../../_lib/sessionCrypto.js'

const API_HOMA_URL = process.env.API_HOMA_URL || 'https://apihoma.homa.cl:7200'
const limitador = crearLimitador({ maxPeticiones: 15, ventanaMs: 60_000 })

export default async function handler(req, res) {
  const ip = obtenerIp(req)
  const { permitido, restantes, mensaje } = limitador.verificar(`login:${ip}`)

  res.setHeader('X-RateLimit-Limit', '15')
  res.setHeader('X-RateLimit-Remaining', String(restantes))

  if (!permitido) return respuestaJson(res, 429, { error: mensaje })

  if (req.method !== 'POST') {
    return respuestaJson(res, 405, { error: 'Método no permitido' })
  }

  try {
    const body = await leerBody(req)
    const email = typeof body?.email === 'string' ? body.email.trim() : ''
    const uid = typeof body?.uid === 'string' ? body.uid.trim() : ''

    if (!email || !uid) {
      return respuestaJson(res, 400, { error: 'email y uid son requeridos' })
    }

    // Validar formato básico de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return respuestaJson(res, 400, { error: 'Formato de email inválido' })
    }

    // Validar longitud mínima de uid (Firebase UIDs típicamente 28 caracteres)
    if (uid.length < 20) {
      return respuestaJson(res, 400, { error: 'uid inválido' })
    }

    const response = await fetch(`${API_HOMA_URL}/api/v1/authorizations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, UID: uid })
    })

    const texto = await response.text()
    let datos = {}
    try {
      datos = texto ? JSON.parse(texto) : {}
    } catch {
      return respuestaJson(res, 502, { error: 'Respuesta inválida desde HOMA' })
    }

    if (!response.ok) {
      return respuestaJson(res, response.status, {
        success: false,
        error: datos?.error || datos?.message || 'Error de autorización'
      })
    }

    if (!datos?.token || !datos?.patient_id) {
      return respuestaJson(res, 401, {
        success: false,
        error: 'Respuesta de autorización incompleta'
      })
    }

    const sesion = crearSesionDesdeAuth(datos, uid)
    const ttl = anexarCookieSesion(res, sesion, datos.token)

    return respuestaJson(res, 200, {
      success: true,
      token: 'bff-session',
      patient_id: Number(datos.patient_id),
      health_plan_id: datos.health_plan_id ?? datos.plan_id ?? null,
      data: {
        health_plan_id: datos.data?.health_plan_id ?? datos.health_plan_id ?? null,
        plan_id: datos.data?.plan_id ?? datos.plan_id ?? null,
        current_plan: datos.data?.current_plan ?? null
      },
      ttl
    })
  } catch (error) {
    return respuestaJson(res, 500, {
      success: false,
      error: error?.message || 'Error interno'
    })
  }
}
