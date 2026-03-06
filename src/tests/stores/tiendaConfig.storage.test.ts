import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useConfigStore } from '@/stores/tiendaConfig'
import { CLAVE_PLAN_ACTIVO } from '@/utils/storageCliente'

describe('useConfigStore storage', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    setActivePinia(createPinia())
    document.body.className = ''
  })

  it('migra el plan activo legacy desde localStorage al crear el store', () => {
    localStorage.setItem(CLAVE_PLAN_ACTIVO, 'mutual')

    const store = useConfigStore()

    expect(store.planActivo).toBe('mutual')
    expect(sessionStorage.getItem(CLAVE_PLAN_ACTIVO)).toBe('mutual')
    expect(localStorage.getItem(CLAVE_PLAN_ACTIVO)).toBeNull()
  })

  it('persiste el plan activo en sessionStorage al cambiarlo', () => {
    const store = useConfigStore()

    store.setPlanActivo('vital')

    expect(store.planActivo).toBe('vital')
    expect(sessionStorage.getItem(CLAVE_PLAN_ACTIVO)).toBe('vital')
    expect(localStorage.getItem(CLAVE_PLAN_ACTIVO)).toBeNull()
  })

  it('limpia el plan activo persistido al resetear el store', () => {
    const store = useConfigStore()
    store.setPlanActivo('mutual')

    store.$reset()

    expect(store.planActivo).toBe('esencial')
    expect(sessionStorage.getItem(CLAVE_PLAN_ACTIVO)).toBeNull()
    expect(localStorage.getItem(CLAVE_PLAN_ACTIVO)).toBeNull()
  })
})
