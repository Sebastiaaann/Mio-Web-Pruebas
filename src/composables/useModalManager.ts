/**
 * Composable para gestionar modales
 *
 * Proporciona funcionalidades para:
 * - Control de estado de modales
 * - Apertura/cierre de modales específicos
 * - Prevención de múltiples modales abiertos
 * - Funciones de conveniencia para cada tipo de modal
 *
 * @example
 * ```vue
 * <template>
 *   <button @click="openSettings">Abrir Configuración</button>
 *
 *   <AnimatePresence>
 *     <Motion v-if="isOpen('settings')" :variants="overlayVariants">
 *       <!-- Contenido del modal -->
 *     </Motion>
 *   </AnimatePresence>
 * </template>
 *
 * <script setup>
 * const { isOpen, openSettings, closeAll } = useModalManager()
 * const { overlayVariants } = useMotionVariants()
 * </script>
 * ```
 */

import { ref, readonly } from 'vue'
import type { ModalType, ModalManagerState, ModalManagerActions } from '@/types/animation'

/**
 * Estado reactivo del gestor de modales
 */
const activeModal = ref<ModalType | null>(null)

/**
 * Composable para gestionar modales
 * @returns Estado y acciones del gestor de modales
 */
export function useModalManager() {
  /**
   * Verifica si un modal específico está abierto
   * @param modal - Tipo de modal a verificar
   * @returns true si el modal está abierto
   */
  const isOpen = (modal: ModalType): boolean => {
    return activeModal.value === modal
  }

  /**
   * Abre un modal específico
   * Cierra cualquier otro modal que esté abierto
   * @param modal - Tipo de modal a abrir
   */
  const open = (modal: ModalType): void => {
    activeModal.value = modal
  }

  /**
   * Cierra el modal actualmente abierto
   */
  const close = (): void => {
    activeModal.value = null
  }

  /**
   * Cierra todos los modales
   * Alias de close() para claridad semántica
   */
  const closeAll = (): void => {
    activeModal.value = null
  }

  /**
   * Abre el modal de configuración
   */
  const openSettings = (): void => {
    open('settings')
  }

  /**
   * Abre el modal de notificaciones
   */
  const openNotifications = (): void => {
    open('notifications')
  }

  /**
   * Abre el modal de información de planes
   */
  const openPlanInfo = (): void => {
    open('planInfo')
  }

  /**
   * Alterna el estado de un modal
   * Si está abierto lo cierra, si está cerrado lo abre
   * @param modal - Tipo de modal a alternar
   */
  const toggle = (modal: ModalType): void => {
    if (isOpen(modal)) {
      close()
    } else {
      open(modal)
    }
  }

  return {
    // Estado (readonly)
    activeModal: readonly(activeModal),

    // Acciones
    isOpen,
    open,
    close,
    closeAll,
    openSettings,
    openNotifications,
    openPlanInfo,
    toggle
  }
}

// Exportar tipos
export type { ModalType } from '@/types/animation'
