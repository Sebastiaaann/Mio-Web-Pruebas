/**
 * Composable para gestionar servicios del paciente
 *
 * Proporciona funcionalidades para:
 * - Carga de servicios desde el store
 * - Filtrado de servicios por plan
 * - Resolución de iconos de servicios
 * - Gestión del estado de carga
 *
 * @example
 * ```ts
 * const {
 *   services,
 *   isLoading,
 *   filteredServices,
 *   getServiceIcon,
 *   loadServices
 * } = useServiceManager()
 *
 * // Cargar servicios
 * await loadServices()
 *
 * // Filtrar por plan
 * const planServices = filteredServices('mutual')
 * ```
 */

import { computed, readonly } from 'vue'
import { storeToRefs } from 'pinia'
import { useTiendaServicios } from '@/stores/tiendaServicios'
import type { Servicio, ServiceManagerState, ServiceManagerActions } from '@/types/service'
import type { ServicioNormalizado } from '@/types'
import type { Component } from 'vue'

// Importar iconos de Lucide
import {
  Video,
  Activity,
  Calendar,
  PlayCircle,
  Bot,
  Leaf,
  Youtube,
  Phone,
  Fingerprint,
  ClipboardCheck,
  Sparkles,
  Heart
} from 'lucide-vue-next'

/**
 * Mapa de iconos disponibles
 */
const iconMap: Record<string, Component> = {
  Video,
  Activity,
  Calendar,
  PlayCircle,
  Bot,
  Leaf,
  Youtube,
  Phone,
  Fingerprint,
  ClipboardCheck,
  Sparkles,
  Heart
}

/**
 * Composable para gestionar servicios
 * @returns Estado y acciones del gestor de servicios
 */
export function useServiceManager() {
  const serviciosStore = useTiendaServicios()

  // Extraer estado del store
  const { servicios, cargando: isLoading } = storeToRefs(serviciosStore)

  /**
   * Obtiene el componente de icono por nombre
   * @param iconName - Nombre del icono
   * @returns Componente de icono o Activity por defecto
   */
  const getServiceIcon = (iconName: string): Component => {
    return iconMap[iconName] || Activity
  }

  /**
   * Filtra servicios por tipo de plan
   * @param planType - Tipo de plan ('esencial' | 'mutual')
   * @returns Servicios filtrados
   */
  const filterServicesByPlan = (planType: string): Servicio[] => {
    return (servicios.value as ServicioNormalizado[]).filter((service) => {
      // Si tiene items (estructura compleja con variantes por plan)
      if (service.items && Array.isArray(service.items)) {
        return service.items.some(item =>
          item.nombre?.toLowerCase() === planType.toLowerCase()
            || item.titulo?.toLowerCase() === planType.toLowerCase()
            || item.tipo_mensaje?.toLowerCase() === planType.toLowerCase()
        )
      }

      // Estructura simple - incluir todos
      return true
    }) as unknown as Servicio[]
  }

  /**
   * Carga los servicios desde el store
   */
  const loadServices = async (): Promise<void> => {
    await serviciosStore.cargarServicios()
  }

  return {
    // Estado (readonly)
    services: readonly(servicios),
    isLoading: readonly(isLoading),

    // Acciones
    getServiceIcon,
    filterServicesByPlan,
    loadServices
  }
}

// Exportar tipos
export type { Servicio, ServiceManagerState, ServiceManagerActions } from '@/types/service'
