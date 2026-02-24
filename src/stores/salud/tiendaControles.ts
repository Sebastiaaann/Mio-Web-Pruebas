import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getAvailableProtocols, getProtocolsByHealthPlan } from '@/services/healthPlanService'
import { serviciosService } from '@/services/serviciosService'
import { useTiendaUsuario } from '@/stores/tiendaUsuario'
import type { Control, EstadoControl, ProtocoloAPI } from '@/types/salud'

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
      const usuarioStore = useTiendaUsuario()
      const patient_id = usuarioStore.usuario?.patient_id
      const health_plan_id = usuarioStore.usuario?.health_plan_id

      if (!patient_id) {
        error.value = 'Paciente no disponible'
        return
      }

      let protocolos: ProtocoloAPI[] = []

      if (health_plan_id) {
        // 1) Protocolos por plan - usando servicio centralizado (healthPlanService)
        const protocolosResponse = await getProtocolsByHealthPlan(Number(health_plan_id))
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

      // 2) Servicios del paciente (opcional, para mapear opciones) - usando servicio centralizado
      let serviciosData: any[] = []
      if (patient_id) {
        const serviciosResponse = await serviciosService.obtenerServicios()
        if (serviciosResponse.success && serviciosResponse.servicios) {
          serviciosData = serviciosResponse.servicios
        }
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
      if (controles.length === 0 && serviciosData.length > 0) {
        serviciosData.forEach((service: any) => {
          if (service.nombre === 'CONTROLES' && Array.isArray(service.items)) {
            service.items.forEach((opt: any) => {
              controles.push({
                id: String(opt.protocol_id ?? opt.id ?? 'control'),
                nombre: opt.protocol_name || opt.nombre || opt.name || 'Control',
                descripcion: opt.descripcion || opt.description || 'Control médico',
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
