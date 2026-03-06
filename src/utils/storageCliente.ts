const PREFIJO_PINIA = 'pinia-'

export const CLAVE_PLAN_ACTIVO = 'mio-plan-activo'
export const CLAVE_ALTURA_CM = 'mio-altura-cm'

/** Claves legacy que deben migrarse a sessionStorage antes de borrarlas */
const CLAVES_LEGACY_MIGRAR = [
  'mio-token',
  'mio-session-meta'
] as const

/** Claves legacy que se borran directamente sin migrar */
const CLAVES_LEGACY_BORRAR = [
  'mio-cookies-aceptado',
  'mio-user'
] as const

type TipoStorage = 'local' | 'session'

function obtenerStorage(tipo: TipoStorage): Storage | null {
  if (typeof window === 'undefined') return null

  try {
    return tipo === 'local' ? window.localStorage : window.sessionStorage
  } catch {
    return null
  }
}

function limpiarClavesPorPrefijo(storage: Storage | null, prefijo: string): void {
  if (!storage) return

  const claves: string[] = []
  for (let index = 0; index < storage.length; index += 1) {
    const clave = storage.key(index)
    if (clave?.startsWith(prefijo)) {
      claves.push(clave)
    }
  }

  claves.forEach((clave) => storage.removeItem(clave))
}

function migrarClaveLocalASesion(clave: string): string | null {
  const session = obtenerStorage('session')
  const local = obtenerStorage('local')

  const valorSesion = session?.getItem(clave)
  if (valorSesion !== null && valorSesion !== undefined) {
    local?.removeItem(clave)
    return valorSesion
  }

  const valorLegacy = local?.getItem(clave)
  if (valorLegacy === null || valorLegacy === undefined) {
    return null
  }

  session?.setItem(clave, valorLegacy)
  local?.removeItem(clave)
  return valorLegacy
}

function leerClaveSesionConMigracion(clave: string): string | null {
  const session = obtenerStorage('session')
  const valorSesion = session?.getItem(clave)
  if (valorSesion !== null && valorSesion !== undefined) {
    return valorSesion
  }

  return migrarClaveLocalASesion(clave)
}

function guardarEnSesion(clave: string, valor: string): void {
  obtenerStorage('session')?.setItem(clave, valor)
  obtenerStorage('local')?.removeItem(clave)
}

function limpiarClavePersistida(clave: string): void {
  obtenerStorage('session')?.removeItem(clave)
  obtenerStorage('local')?.removeItem(clave)
}

export function normalizarStorageCliente(): void {
  const local = obtenerStorage('local')
  const session = obtenerStorage('session')

  limpiarClavesPorPrefijo(local, PREFIJO_PINIA)
  limpiarClavesPorPrefijo(session, PREFIJO_PINIA)

  // Primero migrar las claves de sesión de local → session (antes de borrar)
  CLAVES_LEGACY_MIGRAR.forEach((clave) => migrarClaveLocalASesion(clave))

  // Luego borrar las claves que no se migran
  CLAVES_LEGACY_BORRAR.forEach((clave) => local?.removeItem(clave))

  migrarClaveLocalASesion(CLAVE_PLAN_ACTIVO)
  migrarClaveLocalASesion(CLAVE_ALTURA_CM)
}

export function leerPlanActivoPersistido(): string | null {
  return leerClaveSesionConMigracion(CLAVE_PLAN_ACTIVO)
}

export function guardarPlanActivoPersistido(plan: string): void {
  guardarEnSesion(CLAVE_PLAN_ACTIVO, plan)
}

export function limpiarPlanActivoPersistido(): void {
  limpiarClavePersistida(CLAVE_PLAN_ACTIVO)
}

export function leerAlturaPacientePersistida(): number | null {
  const valor = leerClaveSesionConMigracion(CLAVE_ALTURA_CM)
  if (!valor) return null

  const numero = Number(valor)
  if (!Number.isFinite(numero) || numero <= 0) {
    limpiarClavePersistida(CLAVE_ALTURA_CM)
    return null
  }

  return numero
}

export function guardarAlturaPacientePersistida(alturaCm: number | null): void {
  if (!alturaCm) {
    limpiarClavePersistida(CLAVE_ALTURA_CM)
    return
  }

  guardarEnSesion(CLAVE_ALTURA_CM, String(Math.round(alturaCm)))
}

export function limpiarAlturaPacientePersistida(): void {
  limpiarClavePersistida(CLAVE_ALTURA_CM)
}

export function limpiarStorageClienteEnLogout(): void {
  limpiarPlanActivoPersistido()
  limpiarAlturaPacientePersistida()
  limpiarClavesPorPrefijo(obtenerStorage('local'), PREFIJO_PINIA)
  limpiarClavesPorPrefijo(obtenerStorage('session'), PREFIJO_PINIA)
  const local = obtenerStorage('local')
  CLAVES_LEGACY_MIGRAR.forEach((clave) => local?.removeItem(clave))
  CLAVES_LEGACY_BORRAR.forEach((clave) => local?.removeItem(clave))
}
