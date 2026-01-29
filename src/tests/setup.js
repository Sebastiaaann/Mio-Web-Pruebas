// src/tests/setup.js
// Configuración global para Vitest

import { vi } from 'vitest'

// Mock de servicios de autenticación
vi.mock('@/services/authService', () => ({
  authService: {
    login: vi.fn(),
    logout: vi.fn(),
    restoreSession: vi.fn(),
    saveSession: vi.fn(),
    register: vi.fn()
  }
}))

// Mock de localStorage en memoria
const memoriaStorage = new Map()
const localStorageMock = {
  getItem: (key) => (memoriaStorage.has(key) ? memoriaStorage.get(key) : null),
  setItem: (key, value) => { memoriaStorage.set(key, String(value)) },
  removeItem: (key) => { memoriaStorage.delete(key) },
  clear: () => { memoriaStorage.clear() }
}
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  configurable: true
})

// Mock de @vueuse/core para tests
vi.mock('@vueuse/core', () => ({
  toValue: (val) => {
    // Implementación simple de toValue
    if (val && typeof val === 'object' && 'value' in val) {
      return val.value
    }
    if (typeof val === 'function') {
      return val()
    }
    return val
  },
  toRef: (val) => {
    // Implementación simple de toRef
    if (val && typeof val === 'object' && 'value' in val) {
      return val
    }
    return { value: val }
  }
}))

// Configuración global para componentes
beforeEach(() => {
  vi.clearAllMocks()
  memoriaStorage.clear()
})
