/**
 * Servicio de Servicios Dinámicos
 * Maneja los servicios disponibles para el usuario en el Home
 * Refactorizado para usar clienteApi centralizado
 */

import { authService } from './authService'
import { clienteApi } from '@/utils/clienteApi'
import { logger } from '@/utils/logger'
import type { 
  ServicioApiRaw, 
  ServicioNormalizado, 
  ServiciosPacienteResponse 
} from '@/types/api'

// MODO DESARROLLO: Cambiar a false para usar backend real
const USE_MOCK = false

// Mock data para fallback
const MOCK_SERVICIOS: ServicioNormalizado[] = [
  {
    id: 1,
    nombre: 'Dashboard',
    descripcion: 'Panel principal de salud',
    icono: 'pi pi-chart-line',
    color: '#8B5CF6',
    ruta: '/dashboard',
    activo: true,
    orden: 1,
    items: []
  }
]

export const serviciosService = {
  /**
   * Obtener servicios disponibles para el usuario
   */
  async obtenerServicios(): Promise<{ success: boolean; servicios?: ServicioNormalizado[]; error?: string }> {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            servicios: MOCK_SERVICIOS
          })
        }, 600)
      })
    }

    try {
      const user = authService.obtenerUsuario()
      if (!user || !user.patient_id) {
        throw new Error('No hay información de paciente disponible')
      }

      // Usar clienteApi centralizado para la petición
      const response = await clienteApi.get<ServiciosPacienteResponse>(
        `/api/v1/patients/${user.patient_id}/services`
      )

      // Extracción robusta del array de servicios
      let servicesArray: ServicioApiRaw[] = []
      
      if (Array.isArray(response)) {
        servicesArray = response as ServicioApiRaw[]
      } else if (response.data) {
        if (Array.isArray(response.data.services)) {
          servicesArray = response.data.services
        } else if (Array.isArray(response.data.servicios)) {
          servicesArray = response.data.servicios
        } else if (Array.isArray(response.data)) {
          servicesArray = response.data as ServicioApiRaw[]
        }
      } else if (Array.isArray(response.servicios)) {
        servicesArray = response.servicios
      }

      // Normalización de datos (Mapping English API -> Spanish App Model)
      const serviciosNormalizados: ServicioNormalizado[] = servicesArray.map((s) => {
        return {
          ...s,
          id: s.id,
          nombre: s.name || s.nombre || s.title || 'Servicio sin nombre',
          descripcion: s.description || s.descripcion || '',
          orden: s.home_position ? Number.parseInt(String(s.home_position), 10) : (s.orden || 99),
          activo: s.active !== undefined ? s.active : true,
          items: (s.options || s.items || []).map((opt) => ({
            ...opt,
            nombre: opt.plan_name || opt.name || opt.nombre,
            titulo: opt.title || opt.titulo,
            descripcion: opt.description || opt.descripcion || opt.plan_description,
            tipo_mensaje: opt.type_message || opt.tipo_mensaje
          }))
        }
      })

      return {
        success: true,
        servicios: serviciosNormalizados
      }
    } catch (error) {
      logger.error('Error fetching services', error)
      return { success: false, error: (error as Error).message || 'Error de conexión' }
    }
  },

  /**
   * Obtener un servicio específico por ID
   * TODO: Revisar si la API tiene endpoint individual o filtramos de la lista
   */
  async obtenerServicioPorId(id: number): Promise<{ success: boolean; servicio?: ServicioNormalizado; error?: string }> {
    const resultado = await this.obtenerServicios()
    if (resultado.success && resultado.servicios) {
      const servicio = resultado.servicios.find((s) => s.id === id)
      if (servicio) return { success: true, servicio }
    }
    return { success: false, error: 'Servicio no encontrado' }
  }
}
