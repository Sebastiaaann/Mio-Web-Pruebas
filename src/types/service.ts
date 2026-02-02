/**
 * Tipos e interfaces para servicios
 * @module types/service
 */

/**
 * Item de servicio específico para un plan
 */
export interface ServicioItem {
  /** Nombre del plan al que pertenece */
  plan_name?: string
  /** Campos alternativos usados en respuestas API */
  nombre?: string
  titulo?: string
  tipo_mensaje?: string
  /** Otros campos específicos del item */
  [key: string]: unknown
}

/**
 * Servicio disponible para el paciente
 */
export interface Servicio {
  /** ID único del servicio */
  id: string | number
  /** Nombre del servicio (inglés) */
  name?: string
  /** Nombre del servicio (español) */
  nombre?: string
  /** Nombre del icono en Lucide */
  icon?: string
  /** Nombre del icono alternativo */
  icono?: string
  /** Items del servicio por plan (si aplica) */
  items?: ServicioItem[]
  /** Opciones alternas (API) */
  options?: ServicioItem[]
  /** Estado activo del servicio */
  activo?: boolean
  /** Estado habilitado */
  enabled?: boolean
  /** Descripción del servicio */
  descripcion?: string
}

/**
 * Estado del gestor de servicios
 */
export interface ServiceManagerState {
  /** Lista de servicios disponibles */
  services: Servicio[]
  /** Estado de carga */
  isLoading: boolean
}

/**
 * Acciones del gestor de servicios
 */
export interface ServiceManagerActions {
  /** Carga los servicios desde el store */
  loadServices: () => Promise<void>
  /** Obtiene el componente de icono por nombre */
  getServiceIcon: (iconName: string) => any
  /** Filtra servicios por tipo de plan */
  filterServicesByPlan: (services: Servicio[], planType: string) => Servicio[]
}
