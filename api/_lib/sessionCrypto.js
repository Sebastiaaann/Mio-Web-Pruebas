/**
 * Utilidades de sesión cifrada para cookie HttpOnly.
 * Cifrado: AES-256-GCM con clave derivada de COOKIE_SECRET.
 */

import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto'
import {
  NOMBRE_COOKIE_SESION,
  TTL_FALLBACK_SEGUNDOS_SESION
} from '../../src/config/legal.js'

export { NOMBRE_COOKIE_SESION }
export const TTL_FALLBACK_SEGUNDOS = TTL_FALLBACK_SEGUNDOS_SESION
export const TTL_REFRESH_SEGURIDAD_SEGUNDOS = 5 * 60

function base64UrlEncode(buffer) {
  return Buffer.from(buffer)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

function base64UrlDecode(texto) {
  let base64 = texto.replace(/-/g, '+').replace(/_/g, '/')
  while (base64.length % 4 !== 0) base64 += '='
  return Buffer.from(base64, 'base64')
}

function derivarClave(secret) {
  if (!secret || typeof secret !== 'string') {
    throw new Error('COOKIE_SECRET no está configurado')
  }
  return createHash('sha256').update(secret).digest()
}

export function cifrarSesion(payload, secret) {
  const iv = randomBytes(12)
  const key = derivarClave(secret)
  const cipher = createCipheriv('aes-256-gcm', key, iv)
  const plaintext = Buffer.from(JSON.stringify(payload), 'utf8')
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()])
  const tag = cipher.getAuthTag()

  return `${base64UrlEncode(iv)}.${base64UrlEncode(tag)}.${base64UrlEncode(encrypted)}`
}

export function descifrarSesion(valorCookie, secret) {
  if (!valorCookie || typeof valorCookie !== 'string') return null

  const partes = valorCookie.split('.')
  if (partes.length !== 3) return null

  try {
    const iv = base64UrlDecode(partes[0])
    const tag = base64UrlDecode(partes[1])
    const encrypted = base64UrlDecode(partes[2])
    const key = derivarClave(secret)

    const decipher = createDecipheriv('aes-256-gcm', key, iv)
    decipher.setAuthTag(tag)
    const plaintext = Buffer.concat([decipher.update(encrypted), decipher.final()])

    return JSON.parse(plaintext.toString('utf8'))
  } catch {
    return null
  }
}

export function parsearCookies(req) {
  const header = req?.headers?.cookie
  if (!header || typeof header !== 'string') return {}

  return header
    .split(';')
    .map(item => item.trim())
    .filter(Boolean)
    .reduce((acc, item) => {
      const idx = item.indexOf('=')
      if (idx === -1) return acc
      const key = item.slice(0, idx)
      const val = item.slice(idx + 1)
      try {
        acc[key] = decodeURIComponent(val)
      } catch {
        acc[key] = val
      }
      return acc
    }, {})
}

function decodificarPayloadJwt(token) {
  if (!token || typeof token !== 'string') return null
  const partes = token.split('.')
  if (partes.length < 2) return null
  try {
    const payload = base64UrlDecode(partes[1]).toString('utf8')
    return JSON.parse(payload)
  } catch {
    return null
  }
}

export function obtenerMaxAgeDesdeToken(token, fallbackSegundos = TTL_FALLBACK_SEGUNDOS) {
  const payload = decodificarPayloadJwt(token)
  const exp = Number(payload?.exp || 0)
  const ahora = Math.floor(Date.now() / 1000)

  if (!exp || exp <= ahora) return fallbackSegundos

  const ttl = exp - ahora
  return Math.max(1, ttl)
}

function construirCookieSesion(valorCifrado, maxAgeSegundos) {
  const secure = process.env.NODE_ENV !== 'development'
  const partes = [
    `${NOMBRE_COOKIE_SESION}=${encodeURIComponent(valorCifrado)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    `Max-Age=${maxAgeSegundos}`
  ]
  if (secure) partes.push('Secure')
  return partes.join('; ')
}

export function construirCookieVacia() {
  const secure = process.env.NODE_ENV !== 'development'
  const partes = [
    `${NOMBRE_COOKIE_SESION}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    'Max-Age=0'
  ]
  if (secure) partes.push('Secure')
  return partes.join('; ')
}

export function crearSesionDesdeAuth(datosAuth, uid) {
  return {
    token: datosAuth.token,
    patient_id: Number(datosAuth.patient_id || 0),
    health_plan_id: datosAuth.health_plan_id ?? datosAuth.plan_id ?? null,
    uid: uid || null,
    created_at: Date.now()
  }
}

export function obtenerSesionDesdeRequest(req) {
  const cookies = parsearCookies(req)
  const valor = cookies[NOMBRE_COOKIE_SESION]
  if (!valor) return null
  return descifrarSesion(valor, process.env.COOKIE_SECRET)
}

export function anexarCookieSesion(res, sesionPayload, tokenParaTtl) {
  const ttl = obtenerMaxAgeDesdeToken(tokenParaTtl)
  const cifrada = cifrarSesion(sesionPayload, process.env.COOKIE_SECRET)
  res.setHeader('Set-Cookie', construirCookieSesion(cifrada, ttl))
  return ttl
}

export function anexarCookieSesionCorta(res, sesionPayload) {
  const cifrada = cifrarSesion(sesionPayload, process.env.COOKIE_SECRET)
  res.setHeader('Set-Cookie', construirCookieSesion(cifrada, TTL_REFRESH_SEGURIDAD_SEGUNDOS))
}
