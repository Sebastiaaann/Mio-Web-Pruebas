/**
 * Fuente de verdad pública para el comportamiento legal/cookies.
 * Este módulo no debe depender del navegador para poder reutilizarse
 * tanto desde el frontend como desde helpers del backend.
 */

export const NOMBRE_COOKIE_SESION = 'mio_session'
export const TTL_FALLBACK_SEGUNDOS_SESION = 24 * 60 * 60

export const DESCRIPCION_DURACION_COOKIE_CORTA =
  'Hasta el vencimiento del token de autenticación; si el token no informa expiración, el máximo es 24 horas.'

export const DESCRIPCION_DURACION_COOKIE_DETALLE =
  'La vigencia se calcula desde el token de autenticación. Si el token no informa expiración, el sistema usa un máximo de 24 horas.'

export const ALCANCE_COOKIE_SESION =
  'Solo el host que emitió la sesión y la ruta /.'

export const ATRIBUTOS_PUBLICOS_COOKIE_SESION = Object.freeze({
  httpOnly: true,
  sameSite: 'Strict',
  secureFueraDeDevelopment: true,
  path: '/',
  hostOnly: true,
})

export const DESCRIPCION_ATRIBUTOS_COOKIE_SESION =
  'HttpOnly, SameSite=Strict y Secure fuera de entornos de desarrollo.'

export const CLAVE_AVISO_COOKIES_VISTO = 'mio-aviso-cookies-visto'
export const CLAVE_AVISO_COOKIES_LEGACY = 'mio-cookies-aceptado'
export const DESCRIPCION_AVISO_LOCAL =
  'Preferencia local funcional para recordar que ya viste el aviso de cookies.'

export const FECHAS_ACTUALIZACION_LEGAL = Object.freeze({
  cookies: '6 de marzo de 2026',
  privacidad: '6 de marzo de 2026',
  terminos: '6 de marzo de 2026',
})
