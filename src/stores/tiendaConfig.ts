import { defineStore } from 'pinia'
import { ref } from 'vue'

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

  // Configuracion por defecto (Homa)
  const defaultConfig: ConfiguracionCliente = {
    logo: null, // Se llenara con base64 o url
    colors: {
      text: '#333333',
      accent: '#996BEF',
      primary: '#7D58E9',
      text_alt: '#1A1A1A',
      secondary: '#7D58E9',
      background: '#FFFFFF',
      background_alt: '#F5F7FA'
    }
  }

  const currentConfig = ref<ConfiguracionCliente>({ ...defaultConfig })

  // Actions
  function setClientConfig(configRaw: ConfiguracionRaw | null | undefined): void {
    if (!configRaw) return

    clientName.value = configRaw.client_name || 'Cliente'
    clientBrand.value = configRaw.client_brand || 'brand'

    if (configRaw.config) {
      // Logo
      currentConfig.value.logo = configRaw.config.logo || null

      // Colors - Merge con defaults para seguridad
      currentConfig.value.colors = {
        ...defaultConfig.colors,
        ...configRaw.config.colors
      }

      applyTheme(currentConfig.value.colors)
    }
  }

  // Aplica las variables CSS al root del documento
  function applyTheme(colors: Record<string, string>): void {
    const root = document.documentElement

    Object.entries(colors).forEach(([key, value]) => {
      // Si la llave ya empieza con --, usarla tal cual. Si no, agregar --
      const cssVarName = key.startsWith('--') ? key : `--${key}`
      root.style.setProperty(cssVarName, value)
    })
  }

  // Presets para pruebas
  const presets: Record<string, ConfiguracionRaw> = {
    homa: {
      client_name: 'Homa',
      client_brand: 'homa',
      config: {
        logo: null,
        colors: {
          // Base
          primary: '#7D58E9',
          'primary-foreground': '#FFFFFF',
          secondary: '#7D58E9',
          accent: '#F5F3FF',

          // Sidebar (Violeta Homa)
          sidebar: '#FFFFFF',
          'sidebar-foreground': '#1f2937',
          'sidebar-primary': '#7D58E9',
          'sidebar-primary-foreground': '#FFFFFF',
          'sidebar-accent': '#F3F4F6',
          'sidebar-border': '#e5e7eb',

          // Backgrounds
          background: '#fdfbff',
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
          // Base (Verde Mutual)
          primary: '#C4D600',
          'primary-foreground': '#000000',
          secondary: '#00B6AE',
          accent: '#F7F9E6',

          // Sidebar (Dark/Verde Mutual)
          sidebar: '#C4D600',
          'sidebar-foreground': '#000000',
          'sidebar-primary': '#005C55',
          'sidebar-primary-foreground': '#FFFFFF',
          'sidebar-accent': '#B3C300',
          'sidebar-border': '#AAB800',

          // Backgrounds
          background: '#F9FAFB',
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
    planActivo.value = plan.toLowerCase()
    localStorage.setItem('mio-plan-activo', planActivo.value)
  }

  /**
   * Resetear store a estado inicial
   */
  function $reset(): void {
    clientName.value = 'Homa'
    clientBrand.value = 'homa'
    planActivo.value = 'esencial'
    currentConfig.value = { ...defaultConfig }
    localStorage.removeItem('mio-plan-activo')
  }

  return {
    clientName,
    clientBrand,
    currentConfig,
    planActivo,
    setClientConfig,
    loadPreset,
    setPlanActivo,
    $reset,
    presets
  }
})
