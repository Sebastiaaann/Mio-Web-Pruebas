/**
 * Plugin de persistencia para Pinia
 * Guarda automáticamente el estado de los stores en localStorage
 * y lo restaura al iniciar la aplicación
 */

// Configuración de persistencia por store
const persistConfig = {
  // Stores que se persisten completamente
  full: ['config'],
  
  // Stores que se persisten parcialmente (especificar campos)
  partial: {
    usuario: ['planActivo', 'preferencias'],
    config: ['planActivo']
  },
  
  // Stores que NO se persisten (datos sensibles o temporales)
  exclude: ['health', 'citas', 'mensajes', 'servicios', 'campanas']
}

/**
 * Extrae las propiedades específicas de un objeto
 * @param {Object} obj - Objeto fuente
 * @param {Array} keys - Claves a extraer
 * @returns {Object}
 */
function pick(obj, keys) {
  const result = {}
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key]
    }
  })
  return result
}

/**
 * Plugin de persistencia para Pinia
 * Uso: app.use(createPinia().use(piniaPersistPlugin))
 */
export function piniaPersistPlugin({ store }) {
  const storeId = store.$id
  
  // Verificar si el store debe excluirse de la persistencia
  if (persistConfig.exclude.includes(storeId)) {
    return
  }
  
  // Clave única para localStorage
  const storageKey = `pinia-${storeId}`
  
  // Restaurar estado al iniciar
  try {
    const stored = localStorage.getItem(storageKey)
    if (stored) {
      const parsed = JSON.parse(stored)
      
      // Si es persistencia parcial, mergear con estado actual
      if (persistConfig.partial[storeId]) {
        store.$patch(parsed)
      } else {
        // Persistencia completa
        store.$state = parsed
      }
      
      console.log(`📦 Store '${storeId}' restaurado desde localStorage`)
    }
  } catch (error) {
    console.error(`Error al restaurar store '${storeId}':`, error)
  }
  
  // Suscribirse a cambios y persistir
  store.$subscribe((mutation, state) => {
    try {
      let dataToPersist = state
      
      // Si es persistencia parcial, solo guardar campos específicos
      if (persistConfig.partial[storeId]) {
        dataToPersist = pick(state, persistConfig.partial[storeId])
      }
      
      localStorage.setItem(storageKey, JSON.stringify(dataToPersist))
    } catch (error) {
      console.error(`Error al persistir store '${storeId}':`, error)
    }
  }, { detached: true })
}

/**
 * Limpia todos los stores persistidos
 * Útil para logout o reseteo completo
 */
export function clearPersistedStores() {
  const allStores = [...persistConfig.full, ...Object.keys(persistConfig.partial)]
  
  allStores.forEach(storeId => {
    localStorage.removeItem(`pinia-${storeId}`)
  })
  
  console.log('🧹 Stores persistidos limpiados')
}

/**
 * Hook para usar en logout que resetea y limpia stores
 * @param {Object} pinia - Instancia de Pinia
 */
export function resetAllStores(pinia) {
  // Obtener todos los stores registrados
  const stores = Object.values(pinia._s)
  
  // Resetear cada store
  stores.forEach(store => {
    if (typeof store.$reset === 'function') {
      store.$reset()
    }
  })
  
  // Limpiar persistencia
  clearPersistedStores()
  
  console.log('🔄 Todos los stores han sido reseteados')
}

export default piniaPersistPlugin
