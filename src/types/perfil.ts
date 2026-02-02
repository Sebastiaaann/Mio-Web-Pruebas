/**
 * Tipos e interfaces para el módulo de Perfil
 * @module types/perfil
 */

import type { Component } from 'vue'

/**
 * Datos del perfil del usuario
 * @interface PerfilUsuario
 */
export interface PerfilUsuario {
  /** Identificador único del usuario */
  id: string
  /** Identificador del paciente (opcional) */
  patient_id?: string
  /** Nombre completo del usuario */
  nombreCompleto: string
  /** Correo electrónico del usuario */
  email: string
  /** URL del avatar del usuario */
  avatar?: string
  /** Iniciales del usuario (para avatar fallback) */
  iniciales?: string
  /** Fecha de creación de la cuenta */
  createdAt?: string | Date
  /** Plan actual del usuario */
  current_plan?: PlanActual
}

/**
 * Plan actual del usuario
 * @interface PlanActual
 */
export interface PlanActual {
  /** Nombre del plan */
  name?: string
  /** Color asociado al plan */
  color?: string
}

/**
 * Estadísticas de salud para el perfil
 * @interface EstadisticasSalud
 */
export interface EstadisticasSalud {
  /** Total de mediciones registradas */
  totalMediciones: number
  /** Total de controles completados */
  totalControles: number
  /** Total de videos vistos */
  totalVideos: number
  /** Total de campañas activas */
  totalCampanas: number
  /** Fecha de la última medición */
  ultimaMedicion?: string | Date
  /** Porcentaje de progreso (0-100) */
  progreso: number
  /** Controles próximos pendientes */
  controlesProximos?: ControlProximo[]
  /** Historial de mediciones por tipo */
  historialMediciones?: Record<string, Medicion[]>
}

/**
 * Control próximo pendiente
 * @interface ControlProximo
 */
export interface ControlProximo {
  /** Identificador del control */
  id: string
  /** Tipo de control */
  tipo: string
  /** Fecha programada */
  fecha: string | Date
  /** Estado del control */
  estado: 'pendiente' | 'completado' | 'vencido'
  /** Descripción adicional */
  descripcion?: string
}

/**
 * Medición individual
 * @interface Medicion
 */
export interface Medicion {
  /** Identificador de la medición */
  id: string
  /** Valor medido */
  valor: number | string
  /** Unidad de medida */
  unidad?: string
  /** Fecha de la medición */
  fecha: string | Date
  /** Tipo de medición */
  tipo: string
  /** Notas adicionales */
  notas?: string
}

/**
 * Preferencias de usuario
 * @interface PreferenciasUsuario
 */
export interface PreferenciasUsuario {
  /** Tema de la aplicación */
  tema: TemaAplicacion
  /** Notificaciones por email activadas */
  emailNotifications: boolean
  /** Notificaciones por SMS activadas */
  smsNotifications: boolean
  /** Notificaciones push activadas */
  pushNotifications: boolean
  /** Sonido de notificaciones activado */
  sonidoNotificaciones: boolean
  /** Idioma de la aplicación */
  idioma: string
}

/**
 * Tema de la aplicación
 * @typedef {('claro' | 'oscuro' | 'sistema')} TemaAplicacion
 */
export type TemaAplicacion = 'claro' | 'oscuro' | 'sistema'

/**
 * Estados de UI para modales y paneles
 * @interface EstadosUI
 */
export interface EstadosUI {
  /** Modal de configuración visible */
  showSettings: boolean
  /** Modal de notificaciones visible */
  showNotifications: boolean
  /** Modal de información del plan visible */
  showPlanInfo: boolean
}

/**
 * Estados de carga
 * @interface EstadosCarga
 */
export interface EstadosCarga {
  /** Cargando planes */
  isLoadingPlans: boolean
  /** Cargando servicios */
  isLoadingServices: boolean
  /** Cargando datos de usuario */
  isLoadingUser: boolean
  /** Cerrando sesión */
  isLoggingOut: boolean
}

/**
 * Configuración de tema de plan
 * @interface PlanTheme
 */
export interface PlanTheme {
  /** Color primario del tema */
  primary: string
  /** Color secundario del tema */
  secondary?: string
  /** Color de acento */
  accent?: string
  /** Color de texto */
  text?: string
  /** Color de fondo */
  background?: string
  /** Color de texto alternativo */
  text_alt?: string
  /** URL del logo del plan */
  logo: string
}

/**
 * Tema de plan con todos los colores
 * @interface PlanThemeCompleto
 */
export interface PlanThemeCompleto extends PlanTheme {
  /** Colores adicionales del tema */
  colors: {
    primary: string
    secondary?: string
    accent?: string
    text?: string
    background?: string
    text_alt?: string
  }
}

/**
 * Plan de salud disponible
 * @interface PlanSalud
 */
export interface PlanSalud {
  /** Identificador único del plan */
  id: string
  /** Identificador de store */
  store_id: string
  /** Nombre del plan */
  nombre?: string
  /** Nombre del plan desde API */
  name_plan?: string
  /** Título del plan */
  title?: string
  /** Subtítulo del plan */
  subtitle?: string
  /** Segundo subtítulo */
  subtitle2?: string
  /** Precio del plan */
  price?: string
  /** Descripción del plan */
  description?: string
  /** Color del plan */
  color?: string
  /** Color primario del plan */
  colorPrimario?: string
  /** Logo del plan */
  logo?: string
  /** Configuración del plan */
  config?: PlanConfig
  /** Indica si es el plan activo */
  active_plan?: string
  /** Colores del tema */
  colors?: PlanTheme
  /** Items del plan (para estructuras complejas) */
  items?: PlanItem[]
}

/**
 * Configuración de un plan
 * @interface PlanConfig
 */
export interface PlanConfig {
  /** Logo del plan */
  logo?: string
  /** Colores del plan */
  colors?: {
    primary: string
    secondary?: string
    accent?: string
    text?: string
    background?: string
    text_alt?: string
  }
}

/**
 * Item de un plan (para estructuras complejas)
 * @interface PlanItem
 */
export interface PlanItem {
  /** Nombre del plan asociado */
  plan_name: string
  /** Otros campos del item */
  [key: string]: unknown
}

/**
 * Metadatos del plan actual
 * @interface PlanMeta
 */
export interface PlanMeta {
  /** Nombre del plan */
  nombre: string
  /** Logo del plan */
  logo?: string
  /** Color primario */
  colorPrimario?: string
  /** Colores del tema */
  colors?: PlanTheme
  /** Datos adicionales del plan */
  [key: string]: unknown
}

/**
 * Estado de selección de plan
 * @interface EstadoSeleccionPlan
 */
export interface EstadoSeleccionPlan {
  /** Tipo de plan seleccionado */
  selectedPlanType: 'esencial' | 'mutual'
  /** Lista de planes disponibles */
  availablePlans: PlanSalud[]
  /** Metadatos del plan actual */
  currentPlanMeta: PlanMeta | null
  /** Plan activo desde la API */
  planActivoAPI: PlanSalud | null
  /** Indica si el usuario cambió manualmente el plan */
  planCambiadoManualmente: boolean
}

/**
 * Notificación del sistema
 * @interface Notificacion
 */
export interface Notificacion {
  /** Identificador único */
  id: string
  /** Título de la notificación */
  titulo: string
  /** Mensaje de la notificación */
  mensaje: string
  /** Tipo de notificación */
  tipo: 'info' | 'success' | 'warning' | 'error'
  /** Fecha de la notificación */
  fecha: string | Date
  /** Icono asociado */
  icono?: string
  /** Indica si fue leída */
  leida: boolean
}

/**
 * Servicio disponible para el usuario
 * @interface Servicio
 */
export interface Servicio {
  /** Identificador del servicio */
  id: string
  /** Nombre del servicio */
  nombre: string
  /** Descripción del servicio */
  descripcion?: string
  /** Icono del servicio */
  icono?: string
  /** Items del servicio (para estructuras complejas) */
  items?: ServicioItem[]
  /** Plan asociado al servicio */
  plan?: string
}

/**
 * Item de un servicio
 * @interface ServicioItem
 */
export interface ServicioItem {
  /** Nombre del plan asociado */
  plan_name: string
  /** Otros campos del item */
  [key: string]: unknown
}

/**
 * Props para el componente ProfileCard
 * @interface ProfileCardProps
 */
export interface ProfileCardProps {
  /** Datos del usuario a mostrar */
  usuario?: PerfilUsuario
  /** Indica si está cargando */
  cargando?: boolean
}

/**
 * Props para el componente PreferencesCard
 * @interface PreferencesCardProps
 */
export interface PreferencesCardProps {
  /** Preferencias actuales */
  preferencias?: PreferenciasUsuario
  /** Indica si está cargando */
  cargando?: boolean
}

/**
 * Props para el componente SecurityCard
 * @interface SecurityCardProps
 */
export interface SecurityCardProps {
  /** Indica si el 2FA está activo */
  dosFactorActivo?: boolean
  /** Indica si está cargando */
  cargando?: boolean
}

/**
 * Props para el componente DataCard
 * @interface DataCardProps
 */
export interface DataCardProps {
  /** Indica si está cargando */
  cargando?: boolean
}

/**
 * Props para el componente ContactInfoCard
 * @interface ContactInfoCardProps
 */
export interface ContactInfoCardProps {
  /** Email del usuario */
  email?: string
  /** Teléfono del usuario */
  telefono?: string
  /** Indica si está cargando */
  cargando?: boolean
}

/**
 * Props para el componente QuickActionsCard
 * @interface QuickActionsCardProps
 */
export interface QuickActionsCardProps {
  /** Acciones disponibles */
  acciones?: AccionRapida[]
}

/**
 * Acción rápida
 * @interface AccionRapida
 */
export interface AccionRapida {
  /** Identificador de la acción */
  id: string
  /** Título de la acción */
  titulo: string
  /** Icono de la acción */
  icono: string | Component
  /** URL o ruta de la acción */
  href?: string
  /** Callback al hacer click */
  onClick?: () => void
}

/**
 * Variantes de animación para Motion
 * @interface AnimationVariants
 */
export interface AnimationVariants {
  /** Estado oculto */
  hidden: {
    opacity?: number
    y?: number
    scale?: number
    [key: string]: unknown
  }
  /** Estado visible */
  visible: {
    opacity?: number
    y?: number
    scale?: number
    transition?: {
      type?: string
      stiffness?: number
      damping?: number
      duration?: number
      staggerChildren?: number
      delayChildren?: number
      [key: string]: unknown
    }
    [key: string]: unknown
  }
  /** Estado de salida */
  exit?: {
    opacity?: number
    y?: number
    scale?: number
    transition?: {
      duration?: number
      [key: string]: unknown
    }
    [key: string]: unknown
  }
}

/**
 * Respuesta de la API de planes
 * @interface PlanesAPIResponse
 */
export interface PlanesAPIResponse {
  /** Indica si la operación fue exitosa */
  success: boolean
  /** Datos de la respuesta (nueva estructura) */
  data?: {
    planes?: PlanSalud[]
    plans?: PlanSalud[]
  }
  /** Planes (estructura antigua) */
  planes?: PlanSalud[]
  /** Planes (estructura antigua alternativa) */
  plans?: PlanSalud[]
  /** Mensaje de error si aplica */
  message?: string
}

/**
 * Mapa de iconos de servicios
 * @typedef {Record<string, Component>} IconMap
 */
export type IconMap = Record<string, Component>

/**
 * Tipo de plan disponible
 * @typedef {('esencial' | 'mutual')} TipoPlan
 */
export type TipoPlan = 'esencial' | 'mutual'

/**
 * Estado del perfil completo
 * @interface PerfilState
 */
export interface PerfilState {
  /** Datos del usuario */
  usuario: PerfilUsuario | null
  /** Estadísticas de salud */
  estadisticas: EstadisticasSalud
  /** Preferencias del usuario */
  preferencias: PreferenciasUsuario
  /** Estados de UI */
  ui: EstadosUI
  /** Estados de carga */
  carga: EstadosCarga
  /** Estado de selección de plan */
  plan: EstadoSeleccionPlan
  /** Servicios disponibles */
  servicios: Servicio[]
  /** Notificaciones */
  notificaciones: Notificacion[]
}
