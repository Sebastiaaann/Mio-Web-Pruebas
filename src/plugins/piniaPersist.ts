/**
 * Plugin de persistencia para Pinia
 * Guarda automaticamente el estado de los stores en localStorage
 * y lo restaura al iniciar la aplicacion
 */

import type { PiniaPluginContext, Store, StateTree } from 'pinia'

interface PersistConfig {
  full: string[]
  partial: Record<string, string[]>
  exclude: string[]
}

// Configuracion de persistencia por store
const persistConfig: PersistConfig = {
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
 * Extrae las propiedades especificas de un objeto
 */
function pick<T extends Record<string, unknown>>(obj: T, keys: string[]): Partial<T> {
  const result: Partial<T> = {}
  keys.forEach(key => {
    if (key in obj) {
      result[key as keyof T] = obj[key as keyof T]
    }
  })
  return result
}

/**
 * Plugin de persistencia para Pinia
 * Uso: app.use(createPinia().use(piniaPersistPlugin))
 */
export function piniaPersistPlugin({ store }: PiniaPluginContext): void {
  const storeId = store.$id

  // Verificar si el store debe excluirse de la persistencia
  if (persistConfig.exclude.includes(storeId)) {
    return
  }

  // Clave unica para localStorage
  const storageKey = `pinia-${storeId}`

  // Restaurar estado al iniciar
  try {
    const stored = localStorage.getItem(storageKey)
    if (stored) {
      const parsed = JSON.parse(stored) as StateTree

      // Si es persistencia parcial, mergear con estado actual
      if (persistConfig.partial[storeId]) {
        store.$patch(parsed)
      } else {
        // Persistencia completa
        store.$state = parsed
      }

      if (import.meta.env.DEV) {
        console.log(`📦 Store '${storeId}' restaurado desde localStorage`)
      }
    }
  } catch (error) {
    console.error(`Error al restaurar store '${storeId}':`, error)
  }

  // Suscribirse a cambios y persistir
  store.$subscribe((_, state) => {
    try {
      let dataToPersist: StateTree = state

      // Si es persistencia parcial, solo guardar campos especificos
      if (persistConfig.partial[storeId]) {
        dataToPersist = pick(state, persistConfig.partial[storeId]) as StateTree
      }

      localStorage.setItem(storageKey, JSON.stringify(dataToPersist))
    } catch (error) {
      console.error(`Error al persistir store '${storeId}':`, error)
    }
  }, { detached: true })
}

/**
 * Limpia todos los stores persistidos
 * Util para logout o reseteo completo
 */
export function clearPersistedStores(): void {
  const allStores = [...persistConfig.full, ...Object.keys(persistConfig.partial)]

  allStores.forEach(storeId => {
    localStorage.removeItem(`pinia-${storeId}`)
  })

  if (import.meta.env.DEV) {
    console.log('🧹 Stores persistidos limpiados')
  }
}

/**
 * Hook para usar en logout que resetea y limpia stores
 */
export function resetAllStores(pinia: { _s: Map<string, Store> }): void {
  // Obtener todos los stores registrados
  const stores = Array.from(pinia._s.values())

  // Resetear cada store
  stores.forEach(store => {
    if (typeof store.$reset === 'function') {
      store.$reset()
    }
  })

  // Limpiar persistencia
  clearPersistedStores()

  if (import.meta.env.DEV) {
    console.log('🔄 Todos los stores han sido reseteados')
  }
}

export default piniaPersistPlugin
