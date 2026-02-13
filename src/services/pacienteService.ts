import { clienteApi } from '@/utils/clienteApi'
import { logger } from '@/utils/logger'
import type { Paciente } from '@/types'

export interface ResultadoPaciente {
  success: boolean
  paciente?: Paciente
  error?: string
}

export interface ResultadoGenerico {
  success: boolean
  data?: unknown
  error?: string
  planes?: unknown[]
  servicios?: unknown[]
  campanas?: CampanaApiRaw[]
  items?: MaterialAudiovisualRaw[]
}

export interface CampanaApiRaw {
  id?: string | number
  campaign_id?: string | number
  name?: string
  nombre?: string
  description?: string
  descripcion?: string
  logo?: string
  url_link?: string
  survey_url?: string
  url?: string
  survey_id?: string | number
  active?: boolean
  start_date?: string
  end_date?: string
  fecha_inicio?: string
  fecha_fin?: string
  type?: string
  tipo?: string
  [key: string]: unknown
}

export interface MaterialAudiovisualRaw {
  id?: string | number
  titulo?: string
  title?: string
  descripcion?: string
  description?: string
  url?: string
  videoUrl?: string
  thumbnailUrl?: string
  categoria?: string
  [key: string]: unknown
}

type RespuestaCampanas = { data?: { campaigns?: CampanaApiRaw[] } } & Record<string, unknown>
type RespuestaMaterial = { data?: Record<string, unknown> } & Record<string, unknown>

export const pacienteService = {
  /**
   * Obtener perfil completo del paciente
   */
  async obtenerPerfil(patientId: number | string): Promise<ResultadoPaciente> {
    // Guard clause para validación temprana
    if (!patientId) {
      return { success: false, error: 'ID de paciente no proporcionado' }
    }

    try {
      const datos = await clienteApi.get(`/api/v1/patients/${patientId}`)
      const pacienteData = this._extraerDatosPaciente(datos)

      return { success: true, paciente: pacienteData }
    } catch (error) {
      logger.error('Error obteniendo perfil:', error)
      return {
        success: false,
        error: 'No se pudo cargar el perfil del usuario. Por favor intente más tarde.'
      }
    }
  },

  /**
   * Extraer datos del paciente de estructura anidada (SRP)
   */
  _extraerDatosPaciente(datos: any): Paciente {
    // Extracción robusta del perfil (API real devuelve data.data.patient[0])
    if (datos?.data?.patient?.[0]) {
      return datos.data.patient[0] as Paciente
    }

    if (datos?.data && !Array.isArray(datos.data)) {
      return datos.data as Paciente
    }

    return datos as Paciente
  },

  /**
   * Obtener planes del paciente (Plan Actual)
   */
  async obtenerPlanes(patientId: number | string): Promise<ResultadoGenerico> {
    try {
      const datos = await clienteApi.get<Record<string, unknown>>(`/api/v1/patients/plans/${patientId}`)

      // Manejar múltiples estructuras de respuesta
      // Estructura 1: { success: true, data: { plans: [...] } }
      if ((datos as any)?.success && (datos as any)?.data?.plans) {
        return {
          success: true,
          data: (datos as any).data
        }
      }
      // Estructura 2: { plans: [...] }
      if ((datos as any)?.plans) {
        return {
          success: true,
          planes: (datos as any).plans
        }
      }
      // Estructura 3: respuesta directa es array
      if (Array.isArray(datos)) {
        return {
          success: true,
          planes: datos
        }
      }

      return { success: true, data: datos }
    } catch (error) {
      logger.error('Error obteniendo planes:', error)
      return { success: false, error: (error as Error).message }
    }
  },

  /**
   * Obtener más planes disponibles (Marketplace)
   */
  async obtenerMasPlanes(patientId: number | string): Promise<ResultadoGenerico> {
    try {
      const datos = await clienteApi.get<Record<string, unknown>>(`/api/v1/patients/more_plans/${patientId}`)

      logger.info('[obtenerMasPlanes] Datos recibidos:', datos)

      // Manejar ambas estructuras de respuesta:
      // 1. Nueva: { success: true, data: { plans: [...] } }
      // 2. Antigua: { plans: [...] }
      if ((datos as any)?.data?.plans) {
        return {
          success: true,
          data: (datos as any).data
        }
      } else if ((datos as any)?.plans) {
        return {
          success: true,
          plans: (datos as any).plans
        } as ResultadoGenerico
      }

      return { success: true, data: datos }
    } catch (error) {
      logger.error('Error obteniendo más planes:', error)
      return { success: false, error: (error as Error).message }
    }
  },

  /**
   * Obtener servicios del paciente
   */
  async obtenerServicios(patientId: number | string): Promise<ResultadoGenerico> {
    if (!patientId) {
      return { success: false, error: 'ID de paciente no proporcionado' }
    }

    try {
      const datos = await clienteApi.get<Record<string, unknown>>(`/api/v1/patients/${patientId}/services`)

      // Manejar múltiples estructuras de respuesta
      if ((datos as any)?.success && (datos as any)?.data?.services) {
        return {
          success: true,
          data: (datos as any).data
        }
      } else if ((datos as any)?.services) {
        return {
          success: true,
          servicios: (datos as any).services
        } as ResultadoGenerico
      } else if (Array.isArray(datos)) {
        return {
          success: true,
          servicios: datos
        } as ResultadoGenerico
      }

      return { success: true, data: datos }
    } catch (error) {
      logger.error('Error obteniendo servicios:', error)
      return {
        success: false,
        error: 'No se pudieron cargar los servicios. Por favor intente más tarde.'
      }
    }
  },

  /**
   * Obtener campañas de salud del paciente
   */
  async obtenerCampanas(patientId: number | string): Promise<ResultadoGenerico> {
    // Guard clause
    if (!patientId) {
      return { success: false, error: 'ID de paciente no proporcionado' }
    }

    try {
      const datos = await clienteApi.get<Record<string, unknown>>(`/api/v1/patients/${patientId}/campaigns`)
      const campanas = this._extraerCampanas(datos)

      return { success: true, campanas }
    } catch (error) {
      logger.error('Error obteniendo campañas:', error)
      return {
        success: false,
        error: 'No se pudieron cargar las campañas. Por favor intente más tarde.'
      }
    }
  },

  /**
   * Obtener material audiovisual del paciente
   */
  async obtenerMaterialAudiovisual(patientId: number | string): Promise<ResultadoGenerico> {
    if (!patientId) {
      return { success: false, error: 'ID de paciente no proporcionado' }
    }

    try {
      const datos = await clienteApi.get<Record<string, unknown>>(`/api/v1/patients/material_audiovisual/${patientId}`)
      const items = this._extraerMaterialAudiovisual(datos)

      return { success: true, items }
    } catch (error) {
      logger.error('Error obteniendo material audiovisual:', error)
      return {
        success: false,
        error: 'No se pudo cargar el material audiovisual. Por favor intente más tarde.'
      }
    }
  },

  /**
   * Actualizar perfil del paciente
   */
  async actualizarPerfil(patientId: number | string, datos: Record<string, unknown>): Promise<ResultadoGenerico> {
    if (!patientId) {
      return { success: false, error: 'ID de paciente no proporcionado' }
    }

    try {
      const respuesta = await clienteApi.put(`/api/v1/patients/${patientId}`, datos)

      return { success: true, data: respuesta }
    } catch (error) {
      logger.error('Error actualizando perfil:', error)
      return {
        success: false,
        error: 'No se pudo actualizar el perfil. Por favor intente más tarde.'
      }
    }
  },

  /**
   * Extraer campañas de estructura anidada (SRP)
   */
  _extraerCampanas(datos: RespuestaCampanas | unknown): CampanaApiRaw[] {
    const respuesta = datos as RespuestaCampanas

    // Priorizar estructuras comunes
    if (respuesta?.data?.campaigns) {
      logger.info(`Campañas desde data.campaigns: ${respuesta.data.campaigns.length}`)
      return respuesta.data.campaigns
    }

    if ((respuesta as any)?.campaigns) {
      const campaigns = (respuesta as any).campaigns as CampanaApiRaw[]
      logger.info(`Campañas desde campaigns: ${campaigns.length}`)
      return campaigns
    }

    if (Array.isArray((respuesta as any)?.data)) {
      const dataArray = (respuesta as any).data as CampanaApiRaw[]
      logger.info(`Campañas desde data array: ${dataArray.length}`)
      return dataArray
    }

    if (Array.isArray(respuesta)) {
      logger.info(`Campañas desde raíz: ${(respuesta as CampanaApiRaw[]).length}`)
      return respuesta as CampanaApiRaw[]
    }

    logger.warn('Estructura de campañas no reconocida')
    return []
  },

  /**
   * Extraer material audiovisual de estructura anidada (SRP)
   */
  _extraerMaterialAudiovisual(datos: RespuestaMaterial | unknown): MaterialAudiovisualRaw[] {
    const respuesta = datos as RespuestaMaterial

    if (respuesta?.data?.material_audiovisual) return respuesta.data.material_audiovisual as MaterialAudiovisualRaw[]
    if (respuesta?.data?.material) return respuesta.data.material as MaterialAudiovisualRaw[]
    if (respuesta?.data?.audiovisual) return respuesta.data.audiovisual as MaterialAudiovisualRaw[]
    if (respuesta?.data?.items) return respuesta.data.items as MaterialAudiovisualRaw[]
    if ((respuesta as any)?.material_audiovisual) return (respuesta as any).material_audiovisual as MaterialAudiovisualRaw[]
    if ((respuesta as any)?.material) return (respuesta as any).material as MaterialAudiovisualRaw[]
    if ((respuesta as any)?.audiovisual) return (respuesta as any).audiovisual as MaterialAudiovisualRaw[]
    if ((respuesta as any)?.items) return (respuesta as any).items as MaterialAudiovisualRaw[]
    if (Array.isArray((respuesta as any)?.data)) return (respuesta as any).data as MaterialAudiovisualRaw[]
    if (Array.isArray(respuesta)) return respuesta as MaterialAudiovisualRaw[]

    logger.warn('Estructura de material audiovisual no reconocida')
    return []
  },

  /**
   * Obtener todas las campañas disponibles (endpoint /api/v1/campaigns/all)
   */
  async obtenerTodasLasCampanas(): Promise<ResultadoGenerico> {
    try {
      const datos = await clienteApi.get<Record<string, unknown>>('/api/v1/campaigns/all')
      const campanas = this._extraerCampanas(datos)

      return { success: true, campanas }
    } catch (error) {
      logger.error('Error obteniendo todas las campañas:', error)
      return {
        success: false,
        error: 'No se pudieron cargar las campañas. Por favor intente más tarde.'
      }
    }
  }
}
