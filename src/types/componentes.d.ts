/**
 * Definiciones de tipos para componentes globales
 * @module types/componentes
 */

import type { DefineComponent } from 'vue'

/**
 * Props para el componente iconify-icon
 * @interface IconifyIconProps
 */
export interface IconifyIconProps {
  /** Nombre del icono (ej: 'lucide:heart') */
  icon: string
  /** Clases CSS adicionales */
  class?: string
  /** Ancho del icono */
  width?: string | number
  /** Alto del icono */
  height?: string | number
  /** Color del icono (opcional) */
  color?: string
  /** Rotación del icono en grados */
  rotate?: number
  /** Flip horizontal */
  'flip-h'?: boolean
  /** Flip vertical */
  'flip-v'?: boolean
}

declare module 'vue' {
  export interface GlobalComponents {
    'iconify-icon': DefineComponent<IconifyIconProps>
  }
}

export {}
