/**
 * Composable para gestionar variantes de animación con motion-v
 *
 * Proporciona variantes predefinidas para animaciones comunes:
 * - Contenedores con stagger
 * - Items individuales
 * - Overlays (fade in/out)
 * - Paneles modales
 *
 * @example
 * ```vue
 * <template>
 *   <Motion
 *     is="section"
 *     :variants="containerVariants"
 *     initial="hidden"
 *     animate="visible"
 *   >
 *     <Motion v-for="item in items" :key="item.id" :variants="itemVariants">
 *       {{ item.name }}
 *     </Motion>
 *   </Motion>
 * </template>
 *
 * <script setup>
 * const { containerVariants, itemVariants } = useMotionVariants()
 * </script>
 * ```
 */

import type { Variants } from 'motion-v'
import type { CreateItemVariantsOptions } from '@/types/animation'

/**
 * Variantes de animación predefinidas
 */
export function useMotionVariants() {
  /**
   * Variante para contenedores con stagger
   * Aplica animación escalonada a los hijos
   */
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  }

  /**
   * Variante para items individuales
   * Efecto de entrada suave con spring
   */
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 10
      }
    }
  }

  /**
   * Variante para overlays (fade in/out)
   * Transición suave de opacidad
   */
  const overlayVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.2 }
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.15 }
    }
  }

  /**
   * Variante para paneles modales
   * Efecto de escala + traslación con spring
   */
  const panelVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 40,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 25
      }
    },
    exit: {
      opacity: 0,
      y: 20,
      scale: 0.98,
      transition: { duration: 0.15 }
    }
  }

  /**
   * Crea variantes personalizadas para items
   * @param options - Opciones de personalización
   * @returns Variantes personalizadas
   */
  const createItemVariants = (options: CreateItemVariantsOptions = {}): Variants => ({
    hidden: { opacity: 0, y: options.y ?? 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: options.stiffness ?? 100,
        damping: options.damping ?? 10
      }
    }
  })

  /**
   * Crea variantes para cards con hover
   * @returns Variantes con efecto hover
   */
  const createCardVariants = (): Variants => ({
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 10
      }
    },
    hover: {
      scale: 1.02,
      transition: { duration: 0.2 }
    }
  })

  /**
   * Variantes para listas con stagger más lento
   * Útil para listas largas
   */
  const listContainerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.05
      }
    }
  }

  /**
   * Variantes para elementos de lista
   * Entrada rápida y sutil
   */
  const listItemVariants: Variants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 150,
        damping: 15
      }
    }
  }

  /**
   * Variantes para botones con press
   * Efecto de escala al presionar
   */
  const buttonVariants: Variants = {
    initial: { scale: 1 },
    hover: {
      scale: 1.05,
      transition: { duration: 0.2 }
    },
    tap: {
      scale: 0.95,
      transition: { duration: 0.1 }
    }
  }

  /**
   * Variantes para fade simple
   * Solo opacidad, sin movimiento
   */
  const fadeVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.3 }
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.2 }
    }
  }

  /**
   * Variantes para slide desde abajo
   * Entrada desde bottom
   */
  const slideUpVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 80,
        damping: 12
      }
    },
    exit: {
      opacity: 0,
      y: 30,
      transition: { duration: 0.2 }
    }
  }

  /**
   * Variantes para slide desde la derecha
   * Entrada desde right
   */
  const slideRightVariants: Variants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 80,
        damping: 12
      }
    },
    exit: {
      opacity: 0,
      x: 30,
      transition: { duration: 0.2 }
    }
  }

  return {
    // Variantes predefinidas
    containerVariants,
    itemVariants,
    overlayVariants,
    panelVariants,
    listContainerVariants,
    listItemVariants,
    buttonVariants,
    fadeVariants,
    slideUpVariants,
    slideRightVariants,

    // Factories
    createItemVariants,
    createCardVariants
  }
}

// Exportar tipos
export type { Variants } from 'motion-v'
export type { CreateItemVariantsOptions } from '@/types/animation'
