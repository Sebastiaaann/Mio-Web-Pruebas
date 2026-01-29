import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useHealthStore } from '../tiendaSalud'
import { clienteApi } from '@/utils/clienteApi'

// Mock del clienteApi
vi.mock('@/utils/clienteApi', () => ({
  clienteApi: {
    get: vi.fn()
  }
}))

// Mock de localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn()
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('tiendaSalud', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  describe('Estado inicial', () => {
    it('debería tener estado inicial correcto', () => {
      const store = useHealthStore()
      
      expect(store.ultimaMedicion).toBeNull()
      expect(store.controlesProximos).toEqual([])
      expect(store.campanhas).toEqual([])
      expect(store.videos).toEqual([])
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
      expect(store.datosInicializados).toBe(false)
    })

    it('debería tener getters computados correctos', () => {
      const store = useHealthStore()
      
      expect(store.controlesActivos).toEqual([])
      expect(store.tieneControlesPendientes).toBe(false)
      expect(store.estadoSalud).toBe('na')
    })
  })

  describe('fetchControles', () => {
    it('debería cargar controles desde health_plan_id', async () => {
      const store = useHealthStore()
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        patient_id: 123,
        health_plan_id: 456
      }))
      
      clienteApi.get.mockResolvedValue({
        data: {
          protocol: [
            { id: 1, name: 'Presión Arterial' },
            { id: 2, name: 'Peso Básico' }
          ]
        }
      })

      await store.fetchControles()

      expect(store.controlesProximos).toHaveLength(2)
      expect(store.controlesProximos[0].nombre).toBe('Presión Arterial')
      expect(store.controlesProximos[0].estado).toBe('pendiente')
    })

    it('debería cargar controles desde servicios del paciente si no hay health_plan_id', async () => {
      const store = useHealthStore()
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        patient_id: 123
      }))
      
      clienteApi.get.mockResolvedValue({
        data: {
          services: [
            {
              name: 'CONTROLES',
              options: [
                { protocol_id: 1, name: 'Glicemia' }
              ]
            }
          ]
        }
      })

      await store.fetchControles()

      expect(store.controlesProximos).toHaveLength(1)
      expect(store.controlesProximos[0].nombre).toBe('Glicemia')
    })

    it('debería usar datos mock si no hay sesión', async () => {
      const store = useHealthStore()
      
      localStorageMock.getItem.mockReturnValue(null)

      await store.fetchControles()

      expect(store.controlesProximos.length).toBeGreaterThan(0)
      expect(store.controlesProximos[0].id).toBeDefined()
    })

    it('debería manejar errores de API', async () => {
      const store = useHealthStore()
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        patient_id: 123,
        health_plan_id: 456
      }))
      
      clienteApi.get.mockRejectedValue(new Error('Error de red'))

      await store.fetchControles()

      expect(store.error).toBeDefined()
      expect(store.controlesProximos.length).toBeGreaterThan(0) // Fallback a mock
    })
  })

  describe('fetchHistorial', () => {
    it('debería cargar historial de mediciones', async () => {
      const store = useHealthStore()
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        patient_id: 123
      }))
      
      clienteApi.get.mockResolvedValue({
        data: {
          observations: [
            {
              id: 1,
              value: 120,
              unit: 'mmHg',
              created: '2026-01-15T10:00:00Z',
              evaluation: 'normal'
            }
          ]
        }
      })

      await store.fetchHistorial(1)

      expect(store.historialMediciones[1]).toHaveLength(1)
      expect(store.historialMediciones[1][0].valor).toBe(120)
      expect(store.historialMediciones[1][0].estado).toBe('normal')
    })

    it('debería manejar presión arterial con sistólica/diastólica', async () => {
      const store = useHealthStore()
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        patient_id: 123
      }))
      
      clienteApi.get.mockResolvedValue({
        data: {
          observations: [
            {
              id: 1,
              systolic: 120,
              diastolic: 80,
              unit: 'mmHg',
              created: '2026-01-15T10:00:00Z',
              evaluation: 'normal'
            }
          ]
        }
      })

      await store.fetchHistorial(1)

      expect(store.historialMediciones[1][0].valor).toBe('120/80')
    })
  })

  describe('addMedicion', () => {
    it('debería agregar nueva medición al historial', () => {
      const store = useHealthStore()
      
      const medicion = {
        id: 'med-1',
        tipo: 'Presión',
        valor: '120/80',
        unidad: 'mmHg',
        fecha: '2026-01-15',
        estado: 'normal'
      }

      store.addMedicion(1, medicion)

      expect(store.historialMediciones[1]).toHaveLength(1)
      expect(store.historialMediciones[1][0]).toEqual(medicion)
      expect(store.ultimaMedicion).toEqual(medicion)
    })

    it('debería agregar múltiples mediciones al mismo control', () => {
      const store = useHealthStore()
      
      store.addMedicion(1, { id: 'med-1', valor: 120 })
      store.addMedicion(1, { id: 'med-2', valor: 125 })

      expect(store.historialMediciones[1]).toHaveLength(2)
      expect(store.historialMediciones[1][0].valor).toBe(125) // Más reciente primero
    })
  })

  describe('fetchAllHealthData', () => {
    it('debería cargar todos los datos de salud', async () => {
      const store = useHealthStore()
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        patient_id: 123,
        health_plan_id: 456
      }))
      
      clienteApi.get.mockResolvedValue({ data: { protocol: [] } })

      await store.fetchAllHealthData()

      expect(store.datosInicializados).toBe(true)
    })

    it('no debería cargar datos si ya están inicializados', async () => {
      const store = useHealthStore()
      store.datosInicializados = true
      
      const spy = vi.spyOn(clienteApi, 'get')
      
      await store.fetchAllHealthData()

      expect(spy).not.toHaveBeenCalled()
    })
  })

  describe('initMockData', () => {
    it('debería inicializar datos mock', async () => {
      const store = useHealthStore()
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        patient_id: 123
      }))
      
      clienteApi.get.mockResolvedValue({ data: { protocol: [] } })

      await store.initMockData()

      expect(Object.keys(store.historialMediciones).length).toBeGreaterThan(0)
      expect(store.ultimaMedicion).toBeDefined()
    })
  })

  describe('forzarRecarga', () => {
    it('debería resetear flags y recargar datos', async () => {
      const store = useHealthStore()
      store.datosInicializados = true
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        patient_id: 123,
        health_plan_id: 456
      }))
      
      clienteApi.get.mockResolvedValue({ data: { protocol: [] } })

      await store.forzarRecarga()

      expect(store.datosInicializados).toBe(true) // Se recarga y marca como inicializado
    })
  })

  describe('$reset', () => {
    it('debería resetear el store a estado inicial', () => {
      const store = useHealthStore()
      
      // Establecer estado
      store.ultimaMedicion = { id: 1 }
      store.controlesProximos = [{ id: 1 }]
      store.campanhas = [{ id: 1 }]
      store.videos = [{ id: 1 }]
      store.loading = true
      store.error = 'Error'
      store.datosInicializados = true
      store.historialMediciones = { 1: [{ id: 1 }] }
      
      store.$reset()

      expect(store.ultimaMedicion).toBeNull()
      expect(store.controlesProximos).toEqual([])
      expect(store.campanhas).toEqual([])
      expect(store.videos).toEqual([])
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
      expect(store.datosInicializados).toBe(false)
      expect(store.historialMediciones).toEqual({})
    })
  })
})
