import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface ConfiguracionCliente {
  logo: string | null
  colors: Record<string, string>
}

interface ConfiguracionRaw {
  client_name?: string
  client_brand?: string
  config?: {
    logo?: string | null
    colors?: Record<string, string>
  }
}

export const useConfigStore = defineStore('config', () => {
  // State
  const clientName = ref('Homa')
  const clientBrand = ref('homa')
  const planActivo = ref('esencial') // Plan activo del usuario (esencial, mutual, vital, etc.)

  // Cargar plan desde localStorage al iniciar
  const planGuardado = localStorage.getItem('mio-plan-activo')
  if (planGuardado) {
    planActivo.value = planGuardado
  }

  // Configuracion por defecto (Esencial - Indigo)
  const defaultConfig: ConfiguracionCliente = {
    logo: null,
    colors: {
      text: '#334155',
      accent: '#8B5CF6',
      primary: '#6366F1',
      text_alt: '#0F172A',
      secondary: '#6366F1',
      background: '#F8FAFC',
      background_alt: '#F1F5F9'
    }
  }

  const currentConfig = ref<ConfiguracionCliente>({ ...defaultConfig })
  const logoMutual = ref<string | null>(null)

  // Computed para obtener la clase de tema actual
  const themeClass = computed(() => {
    return `theme-${planActivo.value}`
  })

  // Actions
  function setClientConfig(configRaw: ConfiguracionRaw | null | undefined): void {
    if (!configRaw) return

    clientName.value = configRaw.client_name || 'Cliente'
    clientBrand.value = configRaw.client_brand || 'brand'

    if (configRaw.config) {
      // Logo
      currentConfig.value.logo = configRaw.config.logo || null

      if (planActivo.value === 'mutual') {
        logoMutual.value = configRaw.config.logo || null
      }

      // Colors - Merge con defaults para seguridad
      currentConfig.value.colors = {
        ...defaultConfig.colors,
        ...configRaw.config.colors
      }

      // Aplicar tema mediante clase CSS
      applyTheme(planActivo.value)
    }
  }

  function setLogoMutual(logo: string | null): void {
    logoMutual.value = logo
  }

  /**
   * Aplica el tema mediante clases CSS en el body
   * Esto activa las variables CSS definidas en principal.css
   */
  function applyTheme(plan: string): void {
    const body = document.body
    
    // Remover clases de tema anteriores
    body.classList.remove('theme-mutual', 'theme-esencial', 'theme-vital')
    
    // Agregar clase del tema actual
    const themeName = plan.toLowerCase()
    body.classList.add(`theme-${themeName}`)
    
    // Aplicar colores específicos como variables CSS para compatibilidad legacy
    const colors = currentConfig.value.colors
    const root = document.documentElement
    
    // Solo aplicar variables que no son de tema (logo, etc.)
    if (colors.primary) {
      root.style.setProperty('--client-primary', colors.primary)
    }
    if (colors.accent) {
      root.style.setProperty('--client-accent', colors.accent)
    }
  }

  // Presets para pruebas
  const presets: Record<string, ConfiguracionRaw> = {
    homa: {
      client_name: 'Homa',
      client_brand: 'homa',
      config: {
        logo: null,
        colors: {
          // Base - Índigo Esencial
          primary: '#6366F1',
          'primary-foreground': '#FFFFFF',
          secondary: '#8B5CF6',
          accent: '#E0E7FF',

          // Sidebar
          sidebar: '#FFFFFF',
          'sidebar-foreground': '#0F172A',
          'sidebar-primary': '#6366F1',
          'sidebar-primary-foreground': '#FFFFFF',
          'sidebar-accent': '#F1F5F9',
          'sidebar-border': '#E2E8F0',

          // Backgrounds
          background: '#F8FAFC',
          card: '#FFFFFF'
        }
      }
    },
    mutual: {
      client_name: 'Mutual',
      client_brand: 'Mutual',
      config: {
        logo: null,
        colors: {
          // Base - Verde Lima #C4D600
          primary: '#C4D600',
          'primary-foreground': '#FFFFFF',
          secondary: '#D4E000',
          accent: '#F0F5C8',

          // Sidebar
          sidebar: '#FFFFFF',
          'sidebar-foreground': '#0F172A',
          'sidebar-primary': '#C4D600',
          'sidebar-primary-foreground': '#FFFFFF',
          'sidebar-accent': '#F1F5F9',
          'sidebar-border': '#E2E8F0',

          // Backgrounds
          background: '#F8FAFC',
          card: '#FFFFFF'
        }
      }
    }
  }

  function loadPreset(name: string): void {
    const preset = presets[name.toLowerCase()]
    if (preset) {
      setClientConfig(preset)
    }
  }

  // Actualizar plan activo
  function setPlanActivo(plan: string): void {
    const planLower = plan.toLowerCase()
    planActivo.value = planLower
    localStorage.setItem('mio-plan-activo', planLower)
    
    // Aplicar tema mediante clase CSS
    applyTheme(planLower)
    
    // Aplicar colores del preset correspondiente
    loadPreset(planLower)

    if (planLower !== 'mutual') {
      logoMutual.value = null
    }
  }

  /**
   * Resetear store a estado inicial
   */
  function $reset(): void {
    clientName.value = 'Homa'
    clientBrand.value = 'homa'
    planActivo.value = 'esencial'
    currentConfig.value = { ...defaultConfig }
    logoMutual.value = null
    localStorage.removeItem('mio-plan-activo')
    
    // Remover clases de tema
    const body = document.body
    body.classList.remove('theme-mutual', 'theme-esencial', 'theme-vital')
  }

  // Inicializar tema al cargar
  function initTheme(): void {
    applyTheme(planActivo.value)
  }

  return {
    clientName,
    clientBrand,
    currentConfig,
    planActivo,
    logoMutual,
    themeClass,
    setClientConfig,
    setLogoMutual,
    loadPreset,
    setPlanActivo,
    applyTheme,
    initTheme,
    $reset,
    presets
  }
})
