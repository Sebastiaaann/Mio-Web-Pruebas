/**
 * Proxy BFF para endpoints HOMA /api/v1/*.
 * Seguridad:
 * - Cookie HttpOnly obligatoria
 * - Allowlist por método/ruta
 * - Validación de ownership por patient_id
 * - Rate limiting y detección básica de enumeración
 */

import { crearLimitador } from '../_lib/rateLimiter.js'
import { obtenerIp, respuestaJson, leerBody, hashSimple } from '../_lib/http.js'
import { validarEndpoint } from '../_lib/allowlist.js'
import { validarOwnership, evaluarEnumeracion } from '../_lib/ownership.js'
import { obtenerSesionDesdeRequest } from '../_lib/sessionCrypto.js'

const API_HOMA_URL = process.env.API_HOMA_URL || 'https://apihoma.homa.cl:7200'
const limitadorEndpoint = crearLimitador({ maxPeticiones: 120, ventanaMs: 60_000 })
const limitadorGlobal = crearLimitador({ maxPeticiones: 300, ventanaMs: 60_000 })

const cacheTemporal = new Map()
const TTL_CACHE_MS = 60 * 60 * 1000

function construirRutaV1(req) {
  const segmentos = Array.isArray(req.query?.ruta)
    ? req.query.ruta
    : (typeof req.query?.ruta === 'string' ? [req.query.ruta] : [])

  if (segmentos.length === 0) return null

  const limpio = segmentos
    .map(part => String(part || '').trim())
    .filter(Boolean)
    .filter(part => part !== '.' && part !== '..')

  if (limpio.length === 0) return null

  return `/api/v1/${limpio.join('/')}`
}

function obtenerQueryString(req) {
  try {
    const parsed = new URL(req.url, 'http://localhost')
    return parsed.search || ''
  } catch {
    return ''
  }
}

function obtenerCache(path) {
  const item = cacheTemporal.get(path)
  if (!item) return null
  if (Date.now() > item.expiraEn) {
    cacheTemporal.delete(path)
    return null
  }
  return item
}

function guardarCache(path, status, headers, bodyText) {
  cacheTemporal.set(path, {
    status,
    headers,
    bodyText,
    expiraEn: Date.now() + TTL_CACHE_MS
  })
}

export default async function handler(req, res) {
  const inicio = Date.now()
  const ip = obtenerIp(req)
  const rutaV1 = construirRutaV1(req)

  if (!rutaV1) {
    return respuestaJson(res, 400, { error: 'Ruta inválida' })
  }

  const permitido = validarEndpoint(req.method, rutaV1)
  if (!permitido.permitido) {
    if (permitido.rutaExiste) {
      if (Array.isArray(permitido.metodosPermitidos) && permitido.metodosPermitidos.length > 0) {
        res.setHeader('Allow', permitido.metodosPermitidos.join(', '))
      }
      return respuestaJson(res, 405, { error: 'Método no permitido para este endpoint' })
    }
    return respuestaJson(res, 403, { error: 'Endpoint no permitido por política BFF' })
  }

  const sesion = obtenerSesionDesdeRequest(req)
  const requiereSesion = permitido.endpoint.requiresSession !== false
  if (requiereSesion && !sesion?.token) {
    return respuestaJson(res, 401, { error: 'Sesión requerida' })
  }

  const identityKey = `${ip}:${sesion?.uid || 'anonimo'}`
  
  // Rate limit global por identidad
  const { permitido: permitidoGlobal, restantes: restantesGlobal, mensaje: mensajeGlobal } = 
    limitadorGlobal.verificar(identityKey)
  
  if (!permitidoGlobal) {
    res.setHeader('X-RateLimit-Limit', '300')
    res.setHeader('X-RateLimit-Remaining', '0')
    return respuestaJson(res, 429, { error: mensajeGlobal })
  }
  
  // Rate limit por endpoint
  const { permitido: permitidoRate, restantes, mensaje } = limitadorEndpoint.verificar(
    `${identityKey}:${req.method}:${rutaV1}`
  )

  res.setHeader('X-RateLimit-Limit', '120')
  res.setHeader('X-RateLimit-Remaining', String(restantes))

  if (!permitidoRate) {
    return respuestaJson(res, 429, { error: mensaje })
  }

  const necesitaBody = ['POST', 'PUT', 'PATCH'].includes(String(req.method || '').toUpperCase())
  const body = necesitaBody ? await leerBody(req) : null
  if (necesitaBody && !body) {
    return respuestaJson(res, 400, { error: 'Body inválido' })
  }

  const ownership = validarOwnership({
    requiereOwnership: Boolean(permitido.endpoint.ownership),
    session: sesion,
    params: permitido.params,
    body: body || {}
  })

  const enumCheck = evaluarEnumeracion({
    identityKey,
    patientIdObjetivo: ownership.patientIdObjetivo,
    patientIdSesion: ownership.patientIdSesion,
    esValido: ownership.permitido
  })

  if (enumCheck.bloqueado) {
    return respuestaJson(res, 429, { error: enumCheck.motivo })
  }

  if (!ownership.permitido) {
    return respuestaJson(res, 403, { error: ownership.motivo || 'No autorizado' })
  }

  const queryString = obtenerQueryString(req)
  const urlDestino = `${API_HOMA_URL}${rutaV1}${queryString}`
  const method = String(req.method || 'GET').toUpperCase()
  const cacheKey = `${method}:${rutaV1}${queryString}`

  if (method === 'GET' && permitido.endpoint.cacheable) {
    const cacheHit = obtenerCache(cacheKey)
    if (cacheHit) {
      res.statusCode = cacheHit.status
      if (cacheHit.headers['content-type']) {
        res.setHeader('Content-Type', cacheHit.headers['content-type'])
      }
      res.end(cacheHit.bodyText)
      return
    }
  }

  try {
    const headers = {
      'Content-Type': 'application/json',
      ...(sesion?.token ? { 'X-API-KEY': sesion.token } : {})
    }

    const response = await fetch(urlDestino, {
      method,
      headers,
      body: needsBodyAndValidBody(method, body) ? JSON.stringify(body) : undefined
    })

    const responseText = await response.text()
    const contentType = response.headers.get('content-type') || 'application/json'

    if (method === 'GET' && permitido.endpoint.cacheable && response.ok) {
      guardarCache(cacheKey, response.status, { 'content-type': contentType }, responseText)
    }

    res.statusCode = response.status
    res.setHeader('Content-Type', contentType)
    res.end(responseText)

    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      endpoint: rutaV1,
      metodo: method,
      statusCode: response.status,
      durationMs: Date.now() - inicio,
      ipHash: hashSimple(ip),
      uidHash: hashSimple(sesion?.uid),
      patientIdHash: hashSimple(ownership.patientIdObjetivo)
    }))
  } catch (error) {
    return respuestaJson(res, 502, { error: error?.message || 'Error de comunicación con HOMA' })
  }
}

function needsBodyAndValidBody(method, body) {
  if (!['POST', 'PUT', 'PATCH'].includes(method)) return false
  return body && typeof body === 'object'
}
