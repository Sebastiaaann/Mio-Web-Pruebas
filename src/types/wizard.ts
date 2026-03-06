/**
 * Tipos para el Wizard Dinámico de Protocolos
 * Estos tipos describen la estructura de datos que llega desde la API HOMA
 * al cargar y ejecutar un protocolo como wizard de pasos.
 */

// Tipos válidos de paso del wizard (deben coincidir con observation_type.type de la API)
export type TipoPaso = 'question' | 'tensiometer' | 'weight' | 'glucometer' | 'text'

// ─── Condiciones de enlace ────────────────────────────────────────────────────

/** Condición individual dentro de un enlace entre componentes del diagrama */
export interface CondicionEnlace {
  field?: string
  operator?: string
  value?: unknown
  range?: string
  next_operator?: string
}

/** Grupo de condiciones proveniente de un enlace (un link en el diagrama) */
export interface GrupoCondicion {
  sourceId: string | number
  conditions: CondicionEnlace[]
}

// ─── Pasos del wizard ────────────────────────────────────────────────────────

/** Representa un paso del wizard, normalizado desde un componente del diagrama */
export interface PasoWizard {
  id: string | number
  type: TipoPaso
  header?: string
  body?: string
  question?: {
    question?: string
    options?: string[]
  }
  observationType?: {
    type?: string
    id?: number
  }
  conditions: GrupoCondicion[] | null
}

/** Una observación guardada al completar el wizard */
export interface ObservacionGuardada {
  stepId: string | number
  stepType: string
  stepData: {
    question?: unknown
    observationType?: unknown
  }
  response: unknown
}

// ─── Estructuras del diagrama (API) ─────────────────────────────────────────

/** Componente dentro del diagrama del protocolo (tal como llega de la API) */
export interface ComponenteDiagrama {
  id: string | number
  z_order?: number
  dynamic_data?: {
    observation_type?: {
      type?: string
      id?: number
    }
    header?: string
    body?: string
    question?: {
      question?: string
      options?: string[]
    }
  }
}

/** Enlace entre dos componentes del diagrama */
export interface EnlaceDiagrama {
  source_component_id: string | number
  target_component_id: string | number
  dynamic_data?: {
    conditions?: CondicionEnlace[]
  }
}

/** Diagrama completo del protocolo */
export interface DiagramaProtocolo {
  components?: ComponenteDiagrama[]
  links?: EnlaceDiagrama[]
}

/** Protocolo tal como llega de la API (para usar en el wizard) */
export interface ProtocoloWizard {
  id?: string | number
  name?: string
  diagram?: DiagramaProtocolo | string
}
