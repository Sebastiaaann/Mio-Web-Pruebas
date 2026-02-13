// src/tests/setup.js
// Configuración global para Vitest

import { vi } from 'vitest'

// Mock del logger para evitar ruido en tests
vi.mock('@/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    security: vi.fn()
  }
}))

// Mock de fetch para evitar llamadas reales a HOMA
const URL_HOMA = 'https://apihoma.homa.cl:7200'
const originalFetch = globalThis.fetch ? globalThis.fetch.bind(globalThis) : null

if (originalFetch) {
  globalThis.fetch = (input, init) => {
    const url = typeof input === 'string' ? input : input?.url
    if (typeof url === 'string' && url.startsWith(URL_HOMA)) {
      const body = JSON.stringify({})
      return Promise.resolve(new Response(body, {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }))
    }

    return originalFetch(input, init)
  }
}

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
