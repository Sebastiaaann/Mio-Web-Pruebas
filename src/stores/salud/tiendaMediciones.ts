import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { clienteApi } from '@/utils/clienteApi'
import type {
  Medicion,
  EstadoMedicion,
  HistorialMediciones
} from '@/types/salud'

export const useMedicionesStore = defineStore('mediciones', () => {
  const ultimaMedicion = ref<Medicion | null>(null)
  const historialMediciones = ref<HistorialMediciones>({})
  const cargando = ref(false)
  const error = ref<string | null>(null)
  const datosInicializados = ref(false)

  const estadoSalud = computed<EstadoMedicion>(() => {
    return ultimaMedicion.value?.estado || 'na'
  })

  async function fetchUltimaMedicion(): Promise<void> {
    cargando.value = true
    error.value = null

    try {
      const sessionMeta = localStorage.getItem('mio-session-meta')
      if (!sessionMeta) {
        error.value = 'Sesión no disponible'
        return
      }

      const { patient_id } = JSON.parse(sessionMeta) as { patient_id?: string | number }
      if (!patient_id) {
        error.value = 'Paciente no disponible'
        return
      }

      const response = await clienteApi.get<Record<string, any>>(`/api/v1/protocol/last_info_control/${patient_id}`)
      const observacion = response?.data?.observation?.[0]
      const detalle = observacion?.observation?.[0]

      if (observacion && detalle) {
        const valorNumerico = typeof detalle.glucose === 'number'
          ? detalle.glucose
          : Number(detalle.glucose ?? detalle.value ?? '')

        ultimaMedicion.value = {
          id: String(observacion.protocol_id || observacion.id || 'ultima'),
          tipo: 'glucosa',
          nombre: observacion.name || 'Glicemia',
          valor: Number.isNaN(valorNumerico) ? '' : valorNumerico,
          unidad: 'mg/dL',
          fecha: observacion.last_control || new Date().toISOString(),
          estado: 'normal',
          observation_type_id: detalle.observation_type_id
        }
      }

      datosInicializados.value = true
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      cargando.value = false
    }
  }

  async function fetchHistorial(protocolId: string): Promise<void> {
    try {
      const sessionMeta = localStorage.getItem('mio-session-meta')
      if (!sessionMeta) {
        return
      }

      const { patient_id } = JSON.parse(sessionMeta) as { patient_id?: string | number }
      if (!patient_id) return

      const response = await clienteApi.get<Record<string, any>>(`/api/v1/protocol/observations/${patient_id}/${protocolId}`)
      const observations = response?.data?.observations || []

      historialMediciones.value[protocolId] = observations
        .filter((obs: any) => {
          // Solo incluir observaciones con datos médicos válidos
          const tienePresion = obs.systolic && obs.diastolic
          const tienePeso = obs.weight !== undefined && obs.weight !== null && obs.weight !== ''
          const tieneGlucosa = obs.glucose !== undefined && obs.glucose !== null && obs.glucose !== ''
          return tienePresion || tienePeso || tieneGlucosa
        })
        .map((obs: any) => {
          // 1. Presión arterial
          if (obs.systolic && obs.diastolic) {
            return {
              id: String(obs.id || `${protocolId}-${obs.created}`),
              tipo: 'presion',
              nombre: obs.name || 'Presión Arterial',
              valor: `${obs.systolic}/${obs.diastolic}`,
              unidad: 'mmHg',
              fecha: obs.created || new Date().toISOString(),
              estado: 'normal',
              observation_type_id: obs.observation_type_id
            }
          }

          // 2. Peso corporal
          if (obs.weight !== undefined && obs.weight !== null && obs.weight !== '') {
            const valorPeso = typeof obs.weight === 'number'
              ? obs.weight
              : Number(obs.weight)

            return {
              id: String(obs.id || `${protocolId}-${obs.created}`),
              tipo: 'peso',
              nombre: obs.name || 'Control de Peso',
              valor: Number.isNaN(valorPeso) ? '' : valorPeso,
              unidad: 'kg',
              fecha: obs.created || new Date().toISOString(),
              estado: 'normal',
              observation_type_id: obs.observation_type_id
            }
          }

          // 3. Glucosa
          if (obs.glucose !== undefined && obs.glucose !== null && obs.glucose !== '') {
            const valorGlucosa = typeof obs.glucose === 'number'
              ? obs.glucose
              : Number(obs.glucose)

            return {
              id: String(obs.id || `${protocolId}-${obs.created}`),
              tipo: 'glucosa',
              nombre: obs.name || 'Glicemia',
              valor: Number.isNaN(valorGlucosa) ? '' : valorGlucosa,
              unidad: 'mg/dL',
              fecha: obs.created || new Date().toISOString(),
              estado: 'normal',
              observation_type_id: obs.observation_type_id
            }
          }

          // Fallback (no debería llegar aquí debido al filter)
          return null
        })
        .filter((m: any) => m !== null) // Eliminar nulls del fallback

      datosInicializados.value = true
    } catch {
      // Mantener historial vacio si falla
    }
  }

  function addMedicion(controlId: string, medicion: Medicion): void {
    if (!historialMediciones.value[controlId]) {
      historialMediciones.value[controlId] = []
    }
    historialMediciones.value[controlId].unshift(medicion)
    ultimaMedicion.value = medicion
  }

  function actualizarMedicion(medicion: Medicion): void {
    const entries = Object.entries(historialMediciones.value)
    for (const [key, lista] of entries) {
      const index = lista.findIndex(item => item.id === medicion.id)
      if (index !== -1) {
        lista[index] = medicion
        historialMediciones.value[key] = [...lista]
        break
      }
    }
    ultimaMedicion.value = medicion
  }

  function initMockData(): void {
    datosInicializados.value = true
  }

  function forzarRecarga(): Promise<void> {
    return fetchUltimaMedicion()
  }

  function $reset(): void {
    ultimaMedicion.value = null
    historialMediciones.value = {}
    cargando.value = false
    error.value = null
    datosInicializados.value = false
  }

  return {
    ultimaMedicion,
    historialMediciones,
    estadoSalud,
    cargando,
    error,
    datosInicializados,
    fetchUltimaMedicion,
    fetchHistorial,
    addMedicion,
    actualizarMedicion,
    initMockData,
    forzarRecarga,
    $reset
  }
})

export const useTiendaMediciones = useMedicionesStore
