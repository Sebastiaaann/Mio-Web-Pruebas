import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useConfigStore = defineStore('config', () => {
  // State
  const clientName = ref('Homa')
  const clientBrand = ref('homa')
  
  // Configuración por defecto (Homa)
  const defaultConfig = {
    logo: null, // Se llenará con base64 o url
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

  const currentConfig = ref({ ...defaultConfig })

  // Actions
  function setClientConfig(configRaw) {
    if (!configRaw) return

    clientName.value = configRaw.client_name || 'Cliente'
    clientBrand.value = configRaw.client_brand || 'brand'
    
    if (configRaw.config) {
        // Logo
        currentConfig.value.logo = configRaw.config.logo
        
        // Colors - Merge con defaults para seguridad
        currentConfig.value.colors = { 
            ...defaultConfig.colors, 
            ...configRaw.config.colors 
        }

        applyTheme(currentConfig.value.colors)
    }
  }

  // Aplica las variables CSS al root del documento
  function applyTheme(colors) {
    const root = document.documentElement
    
    Object.entries(colors).forEach(([key, value]) => {
        // Si la llave ya empieza con --, usarla tal cual. Si no, agregar --
        const cssVarName = key.startsWith('--') ? key : `--${key}`
        root.style.setProperty(cssVarName, value)
    })
  }

  // Presets para pruebas
  const presets = {
    homa: {
        client_name: 'Homa',
        client_brand: 'homa',
        config: {
            logo: null, 
            colors: {
                // Base
                'primary': '#7D58E9',
                'primary-foreground': '#FFFFFF',
                'secondary': '#7D58E9',
                'accent': '#F5F3FF', 
                
                // Sidebar (Violeta Homa)
                'sidebar': '#FFFFFF', 
                'sidebar-foreground': '#1f2937', 
                'sidebar-primary': '#7D58E9',
                'sidebar-primary-foreground': '#FFFFFF',
                'sidebar-accent': '#F3F4F6',
                'sidebar-border': '#e5e7eb',
                
                // Backgrounds
                'background': '#fdfbff',
                'card': '#FFFFFF'
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
                'primary': '#C4D600', 
                'primary-foreground': '#000000',
                'secondary': '#00B6AE',
                'accent': '#F7F9E6',

                // Sidebar (Dark/Verde Mutual)
                'sidebar': '#C4D600',
                'sidebar-foreground': '#000000',
                'sidebar-primary': '#005C55', // Teal oscuro para contraste
                'sidebar-primary-foreground': '#FFFFFF',
                'sidebar-accent': '#B3C300',
                'sidebar-border': '#AAB800',

                // Backgrounds
                'background': '#F9FAFB',
                'card': '#FFFFFF'
            }
        }
    }
  }

  function loadPreset(name) {
      const preset = presets[name.toLowerCase()]
      if (preset) {
          setClientConfig(preset)
      }
  }

  return {
    clientName,
    clientBrand,
    currentConfig,
    setClientConfig,
    loadPreset,
    presets
  }
})
