/**
 * Tipos e interfaces para la gestión de planes
 * @module types/plan
 */

/**
 * Tipos de planes disponibles
 */
export type PlanType = 'esencial' | 'mutual'

/**
 * Tema visual de un plan
 */
export interface PlanTheme {
  /** Color primario del plan */
  primary: string
  /** Color secundario */
  secondary: string
  /** Color de acento */
  accent: string
  /** Color de texto */
  text: string
  /** Color de fondo */
  background: string
  /** Color de fondo alternativo (opcional) */
  background_alt?: string
  /** Color de texto alternativo (opcional) */
  text_alt?: string
  /** URL del logo */
  logo: string
}

/**
 * Plan desde la API (estructura nueva)
 */
export interface PlanAPI {
  /** ID único del plan en el store */
  store_id: string
  /** ID alternativo */
  id?: string
  /** Título del plan (ej: "PLAN") */
  title: string
  /** Subtítulo (ej: "ESENCIAL VITAL") */
  subtitle: string
  /** Subtítulo secundario (ej: "Desde") */
  subtitle2: string
  /** Precio formateado (ej: "$13.490") */
  price: string
  /** Descripción detallada */
  description: string
  /** Color primario (opcional) */
  color?: string
  /** URL del logo (opcional) */
  logo?: string
  /** Configuración anidada con colores y logo */
  config?: {
    /** Configuración de colores */
    colors?: {
      primary: string
      secondary: string
      accent: string
      text: string
      background: string
    }
    /** URL del logo */
    logo?: string
  }
  /** Indicador de plan activo ("1" o "0") */
  active_plan?: '1' | '0'
  /** Nombre del plan desde API */
  name_plan?: string
}

/**
 * Metadatos del plan actual (mergeado de API y tema)
 */
export interface PlanMeta extends Partial<PlanAPI> {
  /** Nombre del plan formateado */
  nombre: string
  /** Color primario del plan */
  colorPrimario: string
  /** Objeto de colores completo */
  colors: PlanTheme | Record<string, string>
}

/**
 * Estado del gestor de planes
 */
export interface PlanManagerState {
  /** Tipo de plan seleccionado */
  selectedPlanType: PlanType
  /** Lista de planes disponibles para compra */
  availablePlans: PlanAPI[]
  /** Metadatos del plan actual */
  currentPlanMeta: PlanMeta | null
  /** Estado de carga */
  isLoading: boolean
  /** Indica si el usuario cambió manualmente el plan */
  planChangedManually: boolean
  /** Plan activo desde la API */
  planFromAPI: PlanAPI | null
}

/**
 * Acciones disponibles en el gestor de planes
 */
export interface PlanManagerActions {
  /** Establece el tipo de plan seleccionado */
  setPlanType: (type: PlanType) => void
  /** Carga los planes desde la API */
  loadPlans: (patientId: string) => Promise<void>
  /** Selecciona un plan para compra */
  selectPlanForPurchase: (plan: PlanAPI) => void
}

/**
 * Configuración de temas para cada tipo de plan
 */
export const PLAN_THEMES: Record<PlanType, PlanTheme> = {
  esencial: {
    primary: '#7D58E9',
    secondary: '#7D58E9',
    accent: '#996BEF',
    text: '#333333',
    background: '#FFFFFF',
    logo: '/assets/logo_mio_purple.png'
  },
  mutual: {
    primary: '#C4D600',
    secondary: '#00B6AE',
    accent: '#505050',
    text: '#505050',
    background: '#C4D600',
    text_alt: '#FFFFFF',
    logo: '/assets/logo_mutual.png'
  }
}
