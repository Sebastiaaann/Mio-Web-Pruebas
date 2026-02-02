/**
 * Composable para gestionar planes del usuario
 *
 * Proporciona funcionalidades para:
 * - Gestión del plan activo seleccionado
 * - Carga de planes desde la API
 * - Cambio entre planes (Esencial/Mutual)
 * - Persistencia de preferencias
 * - Sincronización con configStore
 *
 * @example
 * ```ts
 * const {
 *   selectedPlanType,
 *   availablePlans,
 *   currentPlanMeta,
 *   isLoading,
 *   currentTheme,
 *   setPlanType,
 *   loadPlans
 * } = usePlanManager()
 *
 * // Cambiar plan
 * setPlanType('mutual')
 *
 * // Cargar planes del paciente
 * await loadPlans('12345')
 * ```
 */

import { ref, computed, watch, readonly } from 'vue'
import { useStorage } from '@vueuse/core'
import { useConfigStore } from '@/stores/tiendaConfig'
import { pacienteService } from '@/services/pacienteService'
import type {
  PlanType,
  PlanTheme,
  PlanAPI,
  PlanMeta
} from '@/types/plan'
import { PLAN_THEMES } from '@/types/plan'

/**
 * Composable para gestionar planes del usuario
 * @returns Estado y acciones del gestor de planes
 */
export function usePlanManager() {
  const configStore = useConfigStore()

  // Estado reactivo
  const selectedPlanType = ref<PlanType>('mutual')
  const availablePlans = ref<PlanAPI[]>([])
  const currentPlanMeta = ref<PlanMeta | null>(null)
  const isLoading = ref(false)
  const planChangedManually = ref(false)
  const planFromAPI = ref<PlanAPI | null>(null)

  // Usar useStorage para persistencia reactiva
  const storedPlanPreference = useStorage<PlanType>('mio-plan-activo', 'mutual')

  // Inicializar desde localStorage si existe preferencia guardada
  if (storedPlanPreference.value && storedPlanPreference.value !== selectedPlanType.value) {
    selectedPlanType.value = storedPlanPreference.value
    planChangedManually.value = true
  }

  /**
   * Tema actual basado en el plan seleccionado
   */
  const currentTheme = computed<PlanTheme>(() => {
    return PLAN_THEMES[selectedPlanType.value] || PLAN_THEMES.mutual
  })

  /**
   * Determina el tipo de plan a partir del nombre
   * @param name - Nombre del plan
   * @returns Tipo de plan ('esencial' | 'mutual')
   */
  const determinePlanType = (name: string): PlanType => {
    const lower = name.toLowerCase()
    if (lower.includes('mutual')) return 'mutual'
    if (lower.includes('esencial') || lower.includes('vital')) return 'esencial'
    return 'mutual'
  }

  /**
   * Actualiza los metadatos del plan actual
   * @param type - Tipo de plan
   * @param apiPlan - Plan desde la API (opcional)
   */
  const updatePlanMeta = (type: PlanType, apiPlan?: PlanAPI): void => {
    const theme = PLAN_THEMES[type]

    // Buscar plan en availablePlans
    let foundPlan = availablePlans.value.find((p: PlanAPI) => {
      const pNombre = (p.subtitle || p.name_plan || '').toLowerCase()
      return pNombre.includes(type.toLowerCase())
    })

    // Fallback a planFromAPI
    if (!foundPlan && planFromAPI.value) {
      const apiPlanNombre = (planFromAPI.value.name_plan || '').toLowerCase()
      if (apiPlanNombre.includes(type.toLowerCase())) {
        foundPlan = planFromAPI.value
      }
    }

    // Usar plan pasado como parámetro o encontrado
    const planToMerge = apiPlan || foundPlan

    if (planToMerge) {
      // Mergear logo (priorizar API, luego tema local)
      let mergedLogo = planToMerge.logo || planToMerge.config?.logo || theme.logo
      if (type.toLowerCase() === 'mutual' && theme.logo) {
        mergedLogo = theme.logo // Forzar logo local para Mutual
      }

      currentPlanMeta.value = {
        ...planToMerge,
        nombre: planToMerge.subtitle || planToMerge.name_plan || (type.charAt(0).toUpperCase() + type.slice(1)),
        logo: mergedLogo,
        colorPrimario: planToMerge.config?.colors?.primary || theme.primary,
        colors: planToMerge.config?.colors || theme
      }
    } else {
      // Fallback a datos del tema
      currentPlanMeta.value = {
        nombre: type.charAt(0).toUpperCase() + type.slice(1),
        logo: theme.logo,
        colorPrimario: theme.primary,
        colors: theme
      }
    }
  }

  /**
   * Watch para sincronizar cambios de plan
   */
  watch(
    () => selectedPlanType.value,
    (newType: PlanType, oldType: PlanType | undefined) => {
      if (!newType) return

      // Detectar cambio manual
      if (oldType && newType !== oldType) {
        planChangedManually.value = true
        configStore.setPlanActivo(newType)
        storedPlanPreference.value = newType
        console.info('💾 Preferencia de plan guardada:', newType)
      }

      // Actualizar metadatos del plan
      updatePlanMeta(newType)
    },
    { immediate: true }
  )

  /**
   * Establece el tipo de plan seleccionado
   * @param type - Tipo de plan ('esencial' | 'mutual')
   */
  const setPlanType = (type: PlanType): void => {
    if (type !== selectedPlanType.value) {
      selectedPlanType.value = type
    }
  }

  /**
   * Carga los planes del paciente desde la API
   * @param patientId - ID del paciente
   */
  const loadPlans = async (patientId: string): Promise<void> => {
    isLoading.value = true

    try {
      // 1. Obtener planes del paciente
      const plansResponse = await pacienteService.obtenerPlanes(patientId)

      const planesPaciente = (plansResponse as any).data?.plans || (plansResponse as any).planes

      if (plansResponse.success && Array.isArray(planesPaciente)) {
        // Buscar plan activo
        const activePlan = planesPaciente.find(
          (p: PlanAPI) => p.active_plan === '1'
        )

        if (activePlan) {
          planFromAPI.value = activePlan

          // Determinar tipo de plan desde API
          const tipoPlanAPI = determinePlanType(activePlan.name_plan)

          // Solo establecer si no hay cambio manual previo
          if (!planChangedManually.value) {
            selectedPlanType.value = tipoPlanAPI
            configStore.setPlanActivo(tipoPlanAPI)
            storedPlanPreference.value = tipoPlanAPI
          }

          // Establecer metadatos iniciales
          updatePlanMeta(selectedPlanType.value, activePlan)
        }
      }

      // 2. Obtener planes disponibles para compra
      const morePlansResponse = await pacienteService.obtenerMasPlanes(patientId)

      const planesDisponibles = (morePlansResponse as any).data?.plans || (morePlansResponse as any).plans

      if (morePlansResponse.success && Array.isArray(planesDisponibles)) {
        availablePlans.value = planesDisponibles
        // Re-actualizar metadatos con planes disponibles
        updatePlanMeta(selectedPlanType.value)
      }
    } catch (error) {
      console.error('Error al cargar planes:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Selecciona un plan para compra
   * @param plan - Plan seleccionado
   */
  const selectPlanForPurchase = (plan: PlanAPI): void => {
    console.info('Plan seleccionado:', {
      nombre: plan.subtitle,
      precio: plan.price,
      store_id: plan.store_id
    })

    // TODO: Implementar navegación a checkout
    // Por ahora solo mostramos alerta
    alert(`Has seleccionado el plan ${plan.subtitle}\n\nEn breve podrás adquirir este plan directamente desde la app.`)

    // Futuro: router.push({ name: 'checkout', params: { planId: plan.store_id } })
  }

  // Retornar estado (readonly) y acciones
  return {
    // Estado (readonly para evitar mutaciones externas directas)
    selectedPlanType: readonly(selectedPlanType),
    availablePlans: readonly(availablePlans),
    currentPlanMeta: readonly(currentPlanMeta),
    isLoading: readonly(isLoading),
    planChangedManually: readonly(planChangedManually),
    planFromAPI: readonly(planFromAPI),

    // Computed
    currentTheme,

    // Acciones
    setPlanType,
    loadPlans,
    selectPlanForPurchase,
    determinePlanType,
    updatePlanMeta
  }
}

// Exportar tipos para uso externo
export type {
  PlanType,
  PlanTheme,
  PlanAPI,
  PlanMeta
} from '@/types/plan'

// Exportar constantes
export { PLAN_THEMES }
