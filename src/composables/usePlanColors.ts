import { computed } from 'vue'
import { useConfigStore } from '@/stores/tiendaConfig'

/**
 * Composable para obtener colores y estilos dinámicos según el plan activo
 * Utiliza variables CSS definidas en principal.css para el sistema de temas
 * 
 * @returns Objeto con colores, clases y estilos para componentes dinámicos
 */
export function usePlanColors() {
  const configStore = useConfigStore()

  /**
   * Clase de tema actual para aplicar a contenedores
   */
  const themeClass = computed(() => configStore.themeClass)

  /**
   * Plan activo actual
   */
  const planActivo = computed(() => configStore.planActivo)

  /**
   * Indica si el plan activo es Mutual
   */
  const esMutual = computed(() => configStore.planActivo === 'mutual')

  /**
   * Indica si el plan activo es Esencial
   */
  const esEsencial = computed(() => configStore.planActivo === 'esencial')

  /**
   * Color primario del tema actual (desde variables CSS)
   */
  const primaryColor = computed(() => {
    // Obtener el color computado del CSS
    if (typeof window !== 'undefined') {
      const root = document.documentElement
      const styles = getComputedStyle(root)
      return styles.getPropertyValue('--theme-primary').trim() || '#0EA5E9'
    }
    return '#0EA5E9'
  })

  /**
   * Color de acento del tema actual
   */
  const accentColor = computed(() => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement
      const styles = getComputedStyle(root)
      return styles.getPropertyValue('--theme-accent').trim() || '#06B6D4'
    }
    return '#06B6D4'
  })

  /**
   * Color primario con opacidad para fondos
   */
  const primaryLightColor = computed(() => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement
      const styles = getComputedStyle(root)
      return styles.getPropertyValue('--theme-primary-light').trim() || '#E0F2FE'
    }
    return '#E0F2FE'
  })

  /**
   * Estilos inline para iconos con fondo de tema
   */
  const iconContainerStyle = computed(() => ({
    backgroundColor: primaryLightColor.value,
    color: primaryColor.value
  }))

  /**
   * Estilos inline para botones primarios
   */
  const primaryButtonStyle = computed(() => ({
    backgroundColor: primaryColor.value,
    color: '#FFFFFF'
  }))

  /**
   * Clases CSS dinámicas para texto según el plan
   */
  const textColorClass = computed(() => ({
    'text-theme-primary': true
  }))

  /**
   * Clases para badges según el plan
   */
  const badgeClass = computed(() => 'badge-primary')

  /**
   * Configuración de colores para gráficos
   */
  const chartColors = computed(() => {
    if (esMutual.value) {
      return {
        primary: '#6366F1',
        secondary: '#8B5CF6',
        tertiary: '#A78BFA',
        quaternary: '#C4B5FD',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444'
      }
    }
    // Esencial (default)
    return {
      primary: '#0EA5E9',
      secondary: '#06B6D4',
      tertiary: '#38BDF8',
      quaternary: '#7DD3FC',
      success: '#10B981',
      warning: '#F59E0B',
      danger: '#EF4444'
    }
  })

  /**
   * Obtener color para un indicador de estado
   */
  function getStatusColor(status: 'success' | 'warning' | 'error' | 'info'): string {
    const colors = {
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: primaryColor.value
    }
    return colors[status] || colors.info
  }

  /**
   * Obtener clase de badge según estado
   */
  function getStatusBadgeClass(status: 'success' | 'warning' | 'error' | 'info' | 'neutral'): string {
    const classes = {
      success: 'badge-success',
      warning: 'badge-warning',
      error: 'badge-error',
      info: 'badge-primary',
      neutral: 'badge-secondary'
    }
    return classes[status] || classes.neutral
  }

  return {
    // Propiedades computadas
    themeClass,
    planActivo,
    esMutual,
    esEsencial,
    primaryColor,
    accentColor,
    primaryLightColor,
    
    // Estilos
    iconContainerStyle,
    primaryButtonStyle,
    textColorClass,
    badgeClass,
    
    // Configuraciones
    chartColors,
    
    // Funciones helpers
    getStatusColor,
    getStatusBadgeClass,
    
    // Acceso directo al store
    currentConfig: computed(() => configStore.currentConfig)
  }
}
