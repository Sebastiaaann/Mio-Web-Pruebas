/**
 * Proxy para guardar controles en HOMA Center
 * 
 * Endpoint interno:
 *   POST /api/homa-center/batch
 * 
 * Reenvía la solicitud a:
 *   https://homacenter.homa.cl:7999/batch?skip_tray=false&evaluate_observations=true
 */

const HOMA_CENTER_URL = 'https://homacenter.homa.cl:7999'

function obtenerTokenAuth(req) {
  const token = req.headers['x-api-key']
  return typeof token === 'string' ? token : null
}

function respuestaJson(res, status, payload) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(payload))
}

export default async function handler(req, res) {
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
