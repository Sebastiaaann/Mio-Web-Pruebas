import { describe, it, expect, beforeEach } from 'vitest'
import {
  CLAVE_ALTURA_CM,
  CLAVE_PLAN_ACTIVO,
  guardarPlanActivoPersistido,
  limpiarStorageClienteEnLogout,
  normalizarStorageCliente
} from '@/utils/storageCliente'

describe('storageCliente', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  it('normaliza storage legacy y migra plan/altura a sessionStorage', () => {
    localStorage.setItem('pinia-usuario', '{"token":"abc"}')
    localStorage.setItem('pinia-mediciones', '{"ultima":120}')
    localStorage.setItem('mio-cookies-aceptado', 'true')
    localStorage.setItem('mio-token', 'legacy-token')
    localStorage.setItem(CLAVE_PLAN_ACTIVO, 'mutual')
    localStorage.setItem(CLAVE_ALTURA_CM, '172')
    localStorage.setItem('mio-theme', 'light')

    normalizarStorageCliente()

    expect(localStorage.getItem('pinia-usuario')).toBeNull()
    expect(localStorage.getItem('pinia-mediciones')).toBeNull()
    expect(localStorage.getItem('mio-cookies-aceptado')).toBeNull()
    expect(localStorage.getItem('mio-token')).toBeNull()
    expect(localStorage.getItem(CLAVE_PLAN_ACTIVO)).toBeNull()
    expect(localStorage.getItem(CLAVE_ALTURA_CM)).toBeNull()
    expect(localStorage.getItem('mio-theme')).toBe('light')

    expect(sessionStorage.getItem(CLAVE_PLAN_ACTIVO)).toBe('mutual')
    expect(sessionStorage.getItem(CLAVE_ALTURA_CM)).toBe('172')
  })

  it('respeta el valor de sessionStorage si ya existe y elimina el duplicado legacy', () => {
    sessionStorage.setItem(CLAVE_PLAN_ACTIVO, 'esencial')
    localStorage.setItem(CLAVE_PLAN_ACTIVO, 'mutual')

    normalizarStorageCliente()

    expect(sessionStorage.getItem(CLAVE_PLAN_ACTIVO)).toBe('esencial')
    expect(localStorage.getItem(CLAVE_PLAN_ACTIVO)).toBeNull()
  })

  it('limpia solo los datos de sesión del cliente al cerrar sesión', () => {
    guardarPlanActivoPersistido('mutual')
    sessionStorage.setItem(CLAVE_ALTURA_CM, '165')
    localStorage.setItem('mio-theme', 'dark')
    localStorage.setItem('mio-preferencias-notificaciones', '{"email":true}')
    localStorage.setItem('pinia-controles', '{"x":1}')

    limpiarStorageClienteEnLogout()

    expect(sessionStorage.getItem(CLAVE_PLAN_ACTIVO)).toBeNull()
    expect(sessionStorage.getItem(CLAVE_ALTURA_CM)).toBeNull()
    expect(localStorage.getItem('pinia-controles')).toBeNull()
    expect(localStorage.getItem('mio-theme')).toBe('dark')
    expect(localStorage.getItem('mio-preferencias-notificaciones')).toBe('{"email":true}')
  })
})
