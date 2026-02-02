/**
 * Tipos e interfaces para animaciones con motion-v
 * @module types/animation
 */

import type { Variants } from 'motion-v'

/**
 * Variantes de animación predefinidas
 */
export interface MotionVariants {
  /** Variante para contenedores con stagger */
  container: Variants
  /** Variante para items individuales */
  item: Variants
  /** Variante para overlays (fade in/out) */
  overlay: Variants
  /** Variante para paneles modales */
  panel: Variants
}

/**
 * Configuración de transición tipo spring
 */
export interface SpringConfig {
  type: 'spring'
  stiffness: number
  damping: number
}

/**
 * Configuración de transición tipo tween
 */
export interface TweenConfig {
  duration: number
}

/**
 * Opciones para crear variantes personalizadas
 */
export interface CreateItemVariantsOptions {
  /** Desplazamiento inicial en Y */
  y?: number
  /** Rigidez del spring */
  stiffness?: number
  /** Amortiguamiento del spring */
  damping?: number
}

/**
 * Tipo de modal disponible
 */
export type ModalType = 'settings' | 'notifications' | 'planInfo'

/**
 * Estado del gestor de modales
 */
export interface ModalManagerState {
  /** Modal actualmente activo */
  activeModal: ModalType | null
}

/**
 * Acciones del gestor de modales
 */
export interface ModalManagerActions {
  /** Verifica si un modal está abierto */
  isOpen: (modal: ModalType) => boolean
  /** Abre un modal específico */
  open: (modal: ModalType) => void
  /** Cierra el modal actual */
  close: () => void
  /** Cierra todos los modales */
  closeAll: () => void
  /** Abre el modal de configuración */
  openSettings: () => void
  /** Abre el modal de notificaciones */
  openNotifications: () => void
  /** Abre el modal de información de planes */
  openPlanInfo: () => void
}
