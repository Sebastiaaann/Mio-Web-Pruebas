import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { clienteApi } from '@/utils/clienteApi'
import { getAvailableProtocols } from '@/services/healthPlanService'
import type { Control, EstadoControl, ProtocoloAPI, ServicioAPI } from '@/types/salud'
import type { ProtocolResponse, ServiciosPacienteResponse } from '@/types/api'

export const useControlesStore = defineStore('controles', () => {
  const controlesProximos = ref<Control[]>([])
  const cargando = ref(false)
  const error = ref<string | null>(null)
  const datosInicializados = ref(false)

  const controlesActivos = computed<Control[]>(() =>
    controlesProximos.value.filter(c => c.estado !== 'completado')
  )

  const tieneControlesPendientes = computed<boolean>(() =>
    controlesProximos.value.some(c => c.estado === 'pendiente')
  )

  async function fetchControles(): Promise<void> {
    cargando.value = true
    error.value = null

    try {
      const sessionMeta = localStorage.getItem('mio-session-meta')
      if (!sessionMeta) {
        error.value = 'Sesión no disponible'
        return
      }

      const { patient_id, health_plan_id } = JSON.parse(sessionMeta) as {
        patient_id?: string | number
        health_plan_id?: string | number
      }

      if (!patient_id) {
        error.value = 'Paciente no disponible'
        return
      }

      let protocolos: ProtocoloAPI[] = []

      if (health_plan_id) {
        // 1) Protocolos por plan
        const protocolosResponse = await clienteApi.get<ProtocolResponse>(`/api/v1/protocols/${health_plan_id}`)
        const respuestaProtocolos = protocolosResponse?.data?.protocol 
          || protocolosResponse?.data?.protocols 
          || []
        protocolos = Array.isArray(respuestaProtocolos) ? respuestaProtocolos : []
      } else {
        // Fallback: obtener protocolos disponibles a partir del paciente
        const protocolosResponse = await getAvailableProtocols(String(patient_id))
        protocolos = protocolosResponse?.data || []
      }

      if (Array.isArray(protocolos) && protocolos.length === 0) {
        initMockData()
        return
      }

      // 2) Servicios del paciente (opcional, para mapear opciones)
      let servicios: ServicioAPI[] = []
      if (patient_id) {
        const serviciosResponse = await clienteApi.get<ServiciosPacienteResponse>(`/api/v1/patients/${patient_id}/services`)
        servicios = serviciosResponse?.data?.services 
          || serviciosResponse?.servicios 
          || []
      }

      const controles: Control[] = (Array.isArray(protocolos) ? protocolos : []).map((protocol: ProtocoloAPI) => ({
        id: String(protocol.id ?? protocol.protocol_id ?? 'control'),
        nombre: protocol.name || protocol.nombre || 'Control',
        descripcion: protocol.description || 'Control médico',
        icono: 'pi pi-heart',
        color: '#3B82F6',
        fechaProgramada: null,
        estado: 'pendiente' as EstadoControl
      }))

      // Si no hay protocolos, fallback a servicios si existen
      if (controles.length === 0 && servicios.length > 0) {
        servicios.forEach((service: ServicioAPI) => {
          if (service.name === 'CONTROLES' && Array.isArray(service.options)) {
            service.options.forEach((opt: ProtocoloAPI) => {
              controles.push({
                id: String(opt.protocol_id ?? opt.id ?? 'control'),
                nombre: opt.protocol_name || opt.name || 'Control',
                descripcion: opt.description || 'Control médico',
                icono: 'pi pi-heart',
                color: '#3B82F6',
                fechaProgramada: null,
                estado: 'pendiente' as EstadoControl
              })
            })
          }
        })
      }

      controlesProximos.value = controles
      if (controlesProximos.value.length === 0) {
        initMockData()
      }
      datosInicializados.value = true
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      cargando.value = false
    }
  }

  function initMockData(): void {
    if (controlesProximos.value.length > 0) return

    controlesProximos.value = [
      {
        id: '1',
        nombre: 'Presión Arterial',
        descripcion: 'Control de presión sistólica y diastólica',
        icono: 'pi pi-heart',
        color: '#EF4444',
        fechaProgramada: null,
        estado: 'pendiente' as EstadoControl
      },
      {
        id: '2',
        nombre: 'Peso Básico',
        descripcion: 'Control de peso corporal',
        icono: 'pi pi-chart-line',
        color: '#3B82F6',
        fechaProgramada: null,
        estado: 'pendiente' as EstadoControl
      },
      {
        id: '3',
        nombre: 'Glicemia',
        descripcion: 'Medición de glucosa en sangre',
        icono: 'pi pi-bolt',
        color: '#10B981',
        fechaProgramada: null,
        estado: 'pendiente' as EstadoControl
      }
    ]

    datosInicializados.value = true
  }

  function forzarRecarga(): Promise<void> {
    return fetchControles()
  }

  function $reset(): void {
    controlesProximos.value = []
    cargando.value = false
    error.value = null
    datosInicializados.value = false
  }

  return {
    controlesProximos,
    controlesActivos,
    tieneControlesPendientes,
    cargando,
    error,
    datosInicializados,
    fetchControles,
    initMockData,
    forzarRecarga,
    $reset
  }
})

export const useTiendaControles = useControlesStore
