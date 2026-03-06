import { describe, it, expect, beforeAll } from 'vitest'
import homaProxyHandler from '../../../api/homa/[...ruta].js'
import { cifrarSesion } from '../../../api/_lib/sessionCrypto.js'

function crearRespuestaMock() {
  return {
    statusCode: 200,
    headers: {},
    body: '',
    setHeader(key, value) {
      this.headers[key.toLowerCase()] = value
    },
    end(payload) {
      this.body = payload || ''
    }
  }
}

function crearRequestMock({
  method = 'GET',
  ruta = [],
  cookie = '',
  ip = '127.0.0.1',
  body = undefined,
  queryString = ''
} = {}) {
  return {
    method,
    query: { ruta },
    headers: {
      ...(cookie ? { cookie } : {}),
      'x-forwarded-for': ip
    },
    body,
    url: `/api/homa/${Array.isArray(ruta) ? ruta.join('/') : ruta}${queryString}`
  }
}

function crearCookieSesion(payload) {
  const token = cifrarSesion(payload, process.env.COOKIE_SECRET)
  return `mio_session=${encodeURIComponent(token)}`
}

describe('Seguridad BFF HOMA proxy', () => {
  beforeAll(() => {
    process.env.COOKIE_SECRET = 'clave-de-prueba-super-segura-1234567890'
  })

  it('debe retornar 401 sin cookie de sesión', async () => {
    const req = crearRequestMock({
      method: 'GET',
      ruta: ['patients', '123']
    })
    const res = crearRespuestaMock()

    await homaProxyHandler(req, res)

    expect(res.statusCode).toBe(401)
    expect(JSON.parse(res.body).error).toContain('Sesión')
  })

  it('debe retornar 403 para rutas fuera de allowlist', async () => {
    const req = crearRequestMock({
      method: 'GET',
      ruta: ['endpoint', 'desconocido']
    })
    const res = crearRespuestaMock()

    await homaProxyHandler(req, res)

    expect(res.statusCode).toBe(403)
  })

  it('debe retornar 405 si el método no está permitido para una ruta válida', async () => {
    const cookie = crearCookieSesion({
      token: 'token-prueba',
      patient_id: 123,
      uid: 'u-metodo'
    })
    const req = crearRequestMock({
      method: 'POST',
      ruta: ['patients', '123'],
      cookie,
      ip: '10.10.10.10'
    })
    const res = crearRespuestaMock()

    await homaProxyHandler(req, res)

    expect(res.statusCode).toBe(405)
  })

  it('debe retornar 403 si patient_id no coincide con sesión', async () => {
    const cookie = crearCookieSesion({
      token: 'token-prueba',
      patient_id: 123,
      uid: 'u-ownership'
    })
    const req = crearRequestMock({
      method: 'GET',
      ruta: ['patients', '999'],
      cookie,
      ip: '10.10.10.11'
    })
    const res = crearRespuestaMock()

    await homaProxyHandler(req, res)

    expect(res.statusCode).toBe(403)
  })

  it('debe bloquear con 429 ante patrón de enumeración de patient_id', async () => {
    const cookie = crearCookieSesion({
      token: 'token-prueba',
      patient_id: 500,
      uid: 'u-enumeracion'
    })

    const respuestas = []
    for (const pid of ['101', '102', '103', '104']) {
      const req = crearRequestMock({
        method: 'GET',
        ruta: ['patients', pid],
        cookie,
        ip: '10.10.10.12'
      })
      const res = crearRespuestaMock()
      await homaProxyHandler(req, res)
      respuestas.push(res.statusCode)
    }

    expect(respuestas.slice(0, 3)).toEqual([403, 403, 403])
    expect(respuestas[3]).toBe(429)
  })
})
