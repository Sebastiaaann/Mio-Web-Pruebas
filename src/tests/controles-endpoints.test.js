import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useHealthStore } from '@/stores/tiendaSalud'

const crearRespuestaJson = (data) => new Response(JSON.stringify(data), {
  status: 200,
  headers: { 'content-type': 'application/json' }
})

const configurarSesion = ({ patientId = 75863, healthPlanId = 18 } = {}) => {
  const sessionMeta = JSON.stringify({
    patient_id: patientId,
    health_plan_id: healthPlanId,
    lastLogin: Date.now()
  })

  localStorage.setItem('mio-token', 'token-prueba')
  localStorage.setItem('mio-session-meta', sessionMeta)
}

describe('Endpoints de controles', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('usa /protocols/{healthplan_id} para cargar controles', async () => {
    configurarSesion()

    const fetchMock = vi.fn(async (url) => {
      const urlStr = String(url)
      if (urlStr.includes('/api/v1/protocols/18')) {
        return crearRespuestaJson({
          success: true,
          data: {
            protocol: [
              { id: 20, name: 'GLICEMIA: control breve.' }
            ]
          }
        })
      }

      if (urlStr.includes('/api/v1/patients/75863/services')) {
        return crearRespuestaJson({
          success: true,
          data: {
            services: [
              {
                name: 'CONTROLES',
                options: [
                  { protocol_id: 20, protocol_name: 'GLICEMIA: control breve.' }
                ]
              }
            ]
          }
        })
      }

      return crearRespuestaJson({ success: true, data: { protocol: [] } })
    })

    vi.stubGlobal('fetch', fetchMock)

    const store = useHealthStore()
    await store.fetchControles()

    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/api/v1/protocols/18'), expect.any(Object))
    expect(store.controlesProximos.length).toBeGreaterThan(0)
    expect(store.controlesProximos.some(control => control.nombre.includes('GLICEMIA'))).toBe(true)
  })

  it('mapea /protocol/last_info_control/{patient_id} como última medición', async () => {
    configurarSesion()

    vi.stubGlobal('fetch', vi.fn(async (url) => {
      const urlStr = String(url)

      if (urlStr.includes('/api/v1/protocol/last_info_control/75863')) {
        return crearRespuestaJson({
          success: true,
          data: {
            observation: [
              {
                name: 'GLICEMIA: control breve.',
                last_control: '2026-01-19T09:40:35.513Z',
                evaluation: 'none',
                observation: [
                  {
                    glucose: 50,
                    evaluation: 'none',
                    observation_type_id: 4
                  }
                ],
                protocol_id: 20
              }
            ]
          }
        })
      }

      return crearRespuestaJson({ success: true, data: {} })
    }))

    const store = useHealthStore()
    await store.fetchUltimaMedicion()

    expect(store.ultimaMedicion).toBeTruthy()
    expect(store.ultimaMedicion.valor).toBe(50)
    expect(store.ultimaMedicion.unidad).toBe('mg/dL')
  })

  it('mapea /protocol/observations/{patient_id}/{protocol_id} al historial', async () => {
    configurarSesion()

    vi.stubGlobal('fetch', vi.fn(async (url) => {
      const urlStr = String(url)

      if (urlStr.includes('/api/v1/protocol/observations/75863/20')) {
        return crearRespuestaJson({
          success: true,
          data: {
            observations: [
              {
                name: 'GLICEMIA: control breve.',
                created: '2026-01-19T09:40:35.513Z',
                evaluation: 'none',
                observation_type_id: 4,
                glucose: 50
              },
              {
                name: 'PRESIÓN ARTERIAL: control breve.',
                created: '2026-01-20T09:40:35.513Z',
                evaluation: 'normal',
                observation_type_id: 3,
                systolic: 120,
                diastolic: 80
              }
            ]
          }
        })
      }

      return crearRespuestaJson({ success: true, data: {} })
    }))

    const store = useHealthStore()
    await store.fetchHistorial('20')

    const historial = store.historialMediciones['20'] || []
    expect(historial.length).toBe(2)
    expect(historial[0].valor).toBe(50)
    expect(historial[0].unidad).toBe('mg/dL')
    expect(historial[1].valor).toBe('120/80')
    expect(historial[1].unidad).toBe('mmHg')
  })
})
