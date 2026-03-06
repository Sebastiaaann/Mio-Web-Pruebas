/**
 * Allowlist de endpoints HOMA permitidos desde el BFF.
 * Solo se permiten rutas usadas por MIO.
 */

export const ALLOWLIST = [
  // Auth
  { method: 'POST', pattern: '/api/v1/authorizations', ownership: false },
  { method: 'POST', pattern: '/api/v1/auth/refresh', ownership: false },

  // Pacientes
  { method: 'GET', pattern: '/api/v1/patients/:pid', ownership: true },
  { method: 'PUT', pattern: '/api/v1/patients/:pid', ownership: true },
  { method: 'GET', pattern: '/api/v1/patients/plans/:pid', ownership: true },
  { method: 'GET', pattern: '/api/v1/patients/more_plans/:pid', ownership: true },
  { method: 'GET', pattern: '/api/v1/patients/:pid/campaigns', ownership: true },
  { method: 'GET', pattern: '/api/v1/patients/material_audiovisual/:pid', ownership: true },
  { method: 'PUT', pattern: '/api/v1/patients/plans/:pid/:planId', ownership: true },
  { method: 'POST', pattern: '/api/v1/patients', ownership: false, requiresSession: false },
  { method: 'GET', pattern: '/api/v1/patients/:pid/services', ownership: true },

  // Campañas
  { method: 'GET', pattern: '/api/v1/campaigns/all', ownership: false },

  // Planes y protocolos
  { method: 'GET', pattern: '/api/v1/healthplans/:pid', ownership: true },
  { method: 'GET', pattern: '/api/v1/protocols/:hpId', ownership: false },
  { method: 'GET', pattern: '/api/v1/protocol/:protId', ownership: false },
  { method: 'GET', pattern: '/api/v1/protocol/observations/:pid/:protId', ownership: true },
  { method: 'GET', pattern: '/api/v1/protocol/last_info_control/:pid', ownership: true },
  { method: 'GET', pattern: '/api/v1/protocol/report/:pid/:protId', ownership: true },

  // Observaciones y servicios
  { method: 'GET', pattern: '/api/v1/batch/observation_types', ownership: false, cacheable: true },
  { method: 'POST', pattern: '/api/v1/observations', ownership: true },
  { method: 'POST', pattern: '/api/v1/services/setuseservice', ownership: true },
]

export function normalizarPath(path) {
  if (!path || typeof path !== 'string') return '/'
  const limpio = path.split('?')[0].replace(/\/+/g, '/')
  if (limpio.length > 1 && limpio.endsWith('/')) return limpio.slice(0, -1)
  return limpio
}

function construirRegex(pattern) {
  const keys = []
  const escaped = pattern
    .split('/')
    .map(segment => {
      if (segment.startsWith(':')) {
        keys.push(segment.slice(1))
        return '([^/]+)'
      }
      return segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    })
    .join('/')
  return {
    keys,
    regex: new RegExp(`^${escaped}$`)
  }
}

const ALLOWLIST_COMPILADA = ALLOWLIST.map(item => {
  const compiled = construirRegex(item.pattern)
  return {
    ...item,
    ...compiled
  }
})

export function encontrarEndpointPermitido(method, path) {
  const metodo = String(method || '').toUpperCase()
  const ruta = normalizarPath(path)

  for (const endpoint of ALLOWLIST_COMPILADA) {
    if (endpoint.method !== metodo) continue
    const match = ruta.match(endpoint.regex)
    if (!match) continue

    const params = {}
    endpoint.keys.forEach((key, index) => {
      params[key] = decodeURIComponent(match[index + 1] || '')
    })

    return {
      permitido: true,
      endpoint,
      params
    }
  }

  return {
    permitido: false,
    rutaExiste: false,
    metodosPermitidos: [],
    endpoint: null,
    params: {}
  }
}

function evaluarRuta(path) {
  const ruta = normalizarPath(path)
  const coincidencias = ALLOWLIST_COMPILADA.filter(item => item.regex.test(ruta))
  if (coincidencias.length === 0) {
    return { rutaExiste: false, metodosPermitidos: [] }
  }

  return {
    rutaExiste: true,
    metodosPermitidos: coincidencias.map(item => item.method)
  }
}

export function validarEndpoint(method, path) {
  const match = encontrarEndpointPermitido(method, path)
  if (match.permitido) return match

  const rutaInfo = evaluarRuta(path)
  return {
    ...match,
    rutaExiste: rutaInfo.rutaExiste,
    metodosPermitidos: rutaInfo.metodosPermitidos
  }
}
