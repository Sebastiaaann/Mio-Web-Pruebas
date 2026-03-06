import { describe, it, expect, beforeEach } from 'vitest'
import { useAlturaPaciente } from '@/composables/useAlturaPaciente'
import { CLAVE_ALTURA_CM } from '@/utils/storageCliente'

describe('useAlturaPaciente', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  it('guarda la altura en sessionStorage y no en localStorage', () => {
    const { alturaCm, setAlturaCm } = useAlturaPaciente()

    setAlturaCm(181.4)

    expect(alturaCm.value).toBe(181)
    expect(sessionStorage.getItem(CLAVE_ALTURA_CM)).toBe('181')
    expect(localStorage.getItem(CLAVE_ALTURA_CM)).toBeNull()
  })

  it('migra la altura legacy desde localStorage al inicializar', () => {
    localStorage.setItem(CLAVE_ALTURA_CM, '170')

    const { alturaCm, alturaMetros } = useAlturaPaciente()

    expect(alturaCm.value).toBe(170)
    expect(alturaMetros.value).toBe(1.7)
    expect(sessionStorage.getItem(CLAVE_ALTURA_CM)).toBe('170')
    expect(localStorage.getItem(CLAVE_ALTURA_CM)).toBeNull()
  })

  it('elimina la altura de ambos storages al limpiar', () => {
    const { limpiarAltura, setAlturaCm } = useAlturaPaciente()
    setAlturaCm(168)

    limpiarAltura()

    expect(sessionStorage.getItem(CLAVE_ALTURA_CM)).toBeNull()
    expect(localStorage.getItem(CLAVE_ALTURA_CM)).toBeNull()
  })
})
