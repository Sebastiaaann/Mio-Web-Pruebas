import { computed, ref, onMounted, watch } from 'vue'
import { useConfigStore } from '@/stores/tiendaConfig'

/**
 * Composable para acceder y manipular el tema actual de la aplicación
 * Proporciona acceso conveniente a las variables CSS de tema y utilidades
 * 
 * @example
 * const { theme, isMutual, isEsencial, colors, applyTheme } = useTheme()
 */
export function useTheme() {
  const configStore = useConfigStore()
  
  // Estado reactivo para forzar actualizaciones cuando cambia el tema
  const themeVersion = ref(0)
  
  /**
   * Nombre del tema actual
   */
  const theme = computed(() => configStore.planActivo)
  
  /**
   * Clase CSS del tema actual
   */
  const themeClass = computed(() => configStore.themeClass)
  
  /**
   * Verifica si el tema actual es Mutual
   */
  const isMutual = computed(() => configStore.planActivo === 'mutual')
  
  /**
   * Verifica si el tema actual es Esencial
   */
  const isEsencial = computed(() => configStore.planActivo === 'esencial')
  
  /**
   * Obtiene el valor de una variable CSS del tema
   * Lee desde document.body porque las variables de tema están
   * definidas en body.theme-mutual y body.theme-esencial
   */
  function getCssVariable(variableName: string): string {
    if (typeof window === 'undefined') return ''
    
    const body = document.body
    const styles = getComputedStyle(body)
    return styles.getPropertyValue(variableName).trim()
  }
  
  /**
   * Colores del tema actual (reactivos)
   */
  const colors = computed(() => {
    // Forzar re-computación cuando cambia la versión del tema
    themeVersion.value
    
    return {
      primary: getCssVariable('--theme-primary') || '#0EA5E9',
      primaryHover: getCssVariable('--theme-primary-hover') || '#0284C7',
      primaryLight: getCssVariable('--theme-primary-light') || '#E0F2FE',
      accent: getCssVariable('--theme-accent') || '#06B6D4',
      text: getCssVariable('--theme-text') || '#0F172A',
      textSecondary: getCssVariable('--theme-text-secondary') || '#64748B'
    }
  })
  
  /**
   * Estilos inline comunes para componentes
   */
  const styles = computed(() => ({
    // Contenedor de icono con fondo del tema
    iconContainer: {
      backgroundColor: colors.value.primaryLight,
      color: colors.value.primary
    },
    
    // Botón primario
    primaryButton: {
      backgroundColor: colors.value.primary,
      color: '#FFFFFF'
    },
    
    // Botón outline
    outlineButton: {
      borderColor: colors.value.primary,
      color: colors.value.primary
    },
    
    // Badge del tema
    badge: {
      backgroundColor: colors.value.primaryLight,
      color: colors.value.primary
    },
    
    // Línea de acento
    accentLine: {
      backgroundColor: colors.value.primary
    },
    
    // Gráficos
    chartPrimary: colors.value.primary,
    chartSecondary: colors.value.accent
  }))
  
  /**
   * Aplica un tema específico
   */
  function applyTheme(plan: 'mutual' | 'esencial' | string): void {
    configStore.setPlanActivo(plan)
    themeVersion.value++
  }
  
  /**
   * Alterna entre temas (útil para testing)
   */
  function toggleTheme(): void {
    const newTheme = isMutual.value ? 'esencial' : 'mutual'
    applyTheme(newTheme)
  }
  
  /**
   * Obtiene configuración de colores para gráficos
   */
  function getChartColors() {
    if (isMutual.value) {
      return {
        primary: '#C4D600',
        secondary: '#D4E000',
        tertiary: '#E0E800',
        quaternary: '#E8F0A8',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        background: ['#C4D600', '#D4E000', '#E0E800', '#E8F0A8', '#6366F1']
      }
    }
    
    return {
      primary: '#6366F1',
      secondary: '#8B5CF6',
      tertiary: '#A78BFA',
      quaternary: '#C4B5FD',
      success: '#10B981',
      warning: '#F59E0B',
      danger: '#EF4444',
      background: ['#6366F1', '#8B5CF6', '#A78BFA', '#C4B5FD', '#C4D600']
    }
  }
  
  /**
   * Obtiene clase de estado según el tema
   */
  function getStatusClass(status: 'success' | 'warning' | 'error' | 'info' | 'neutral'): string {
    const classes: Record<string, string> = {
      success: 'text-emerald-600 bg-emerald-50',
      warning: 'text-amber-600 bg-amber-50',
      error: 'text-red-600 bg-red-50',
      info: `text-[${colors.value.primary}] bg-[${colors.value.primaryLight}]`,
      neutral: 'text-slate-600 bg-slate-100'
    }
    return classes[status] || classes.neutral
  }
  
  // Watch para detectar cambios en el plan y actualizar versión
  watch(() => configStore.planActivo, () => {
    themeVersion.value++
  })
  
  // Inicializar tema al montar
  onMounted(() => {
    configStore.initTheme()
  })
  
  return {
    // Estado
    theme,
    themeClass,
    isMutual,
    isEsencial,
    colors,
    styles,
    
    // Funciones
    applyTheme,
    toggleTheme,
    getCssVariable,
    getChartColors,
    getStatusClass,
    
    // Store completo (si se necesita acceso directo)
    configStore
  }
}
