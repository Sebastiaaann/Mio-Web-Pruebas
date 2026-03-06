/**
 * Logout BFF HOMA.
 * Invalida cookie de sesión local.
 */

import { respuestaJson } from '../../_lib/http.js'
import { construirCookieVacia } from '../../_lib/sessionCrypto.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return respuestaJson(res, 405, { error: 'Método no permitido' })
  }

  res.setHeader('Set-Cookie', construirCookieVacia())
  return respuestaJson(res, 200, { success: true })
}
