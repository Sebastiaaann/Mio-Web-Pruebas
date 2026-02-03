import { computed } from 'vue'
import { useConfigStore } from '@/stores/tiendaConfig'

/**
 * Composable para obtener colores dinámicos según el plan activo
 * @returns Objeto con colores para títulos, subtítulos y otros elementos
 */
export function usePlanColors() {
  const configStore = useConfigStore()

  /**
   * Color del texto para títulos principales
   */
  const titleColor = computed(() => {
    const colors = configStore.currentConfig?.colors
    if (!colors) return '#1A1A1A'
    
    // Usar text_alt si está disponible, si no usar primary
    return colors.text_alt || colors.primary || '#1A1A1A'
  })

  /**
   * Color del texto para subtítulos y texto secundario
   */
  const subtitleColor = computed(() => {
    const colors = configStore.currentConfig?.colors
    if (!colors) return '#505050'
    
    // Usar text si está disponible, si no usar un color gris por defecto
    return colors.text || '#505050'
  })

  /**
   * Color primario del plan (para acentos, botones, etc.)
   */
  const primaryColor = computed(() => {
    const colors = configStore.currentConfig?.colors
    return colors?.primary || '#7D58E9'
  })

  /**
   * Color de acento
   */
  const accentColor = computed(() => {
    const colors = configStore.currentConfig?.colors
    return colors?.accent || '#996BEF'
  })

  /**
   * Estilos inline para títulos
   */
  const titleStyle = computed(() => ({
    color: titleColor.value
  }))

  /**
   * Estilos inline para subtítulos
   */
  const subtitleStyle = computed(() => ({
    color: subtitleColor.value
  }))

  /**
   * Clases CSS dinámicas para títulos
   */
  const titleClass = computed(() => {
    const plan = configStore.planActivo
    return {
      'text-mutual': plan === 'mutual',
      'text-esencial': plan === 'esencial',
      'text-vital': plan === 'vital'
    }
  })

  return {
    titleColor,
    subtitleColor,
    primaryColor,
    accentColor,
    titleStyle,
    subtitleStyle,
    titleClass,
    planActivo: computed(() => configStore.planActivo),
    currentColors: computed(() => configStore.currentConfig?.colors)
  }
}
