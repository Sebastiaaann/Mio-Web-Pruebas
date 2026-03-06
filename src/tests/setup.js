// src/tests/setup.js
// Configuración global para Vitest

import { vi } from 'vitest'
import { ref, watch } from 'vue'

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

function crearStorageMock(memoria) {
  return {
    get length() {
      return memoria.size
    },
    key: (index) => Array.from(memoria.keys())[index] ?? null,
    getItem: (key) => (memoria.has(key) ? memoria.get(key) : null),
    setItem: (key, value) => { memoria.set(key, String(value)) },
    removeItem: (key) => { memoria.delete(key) },
    clear: () => { memoria.clear() }
  }
}

// Mock de localStorage/sessionStorage en memoria
const memoriaLocalStorage = new Map()
const memoriaSessionStorage = new Map()
const localStorageMock = crearStorageMock(memoriaLocalStorage)
const sessionStorageMock = crearStorageMock(memoriaSessionStorage)

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  configurable: true
})
Object.defineProperty(global, 'sessionStorage', {
  value: sessionStorageMock,
  configurable: true
})

function parsearValorStorage(valor, fallback) {
  if (valor === null) return fallback
  if (valor === 'true') return true
  if (valor === 'false') return false

  try {
    return JSON.parse(valor)
  } catch {
    return valor
  }
}

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
  },
  useLocalStorage: (key, defaultValue) => {
    const estado = ref(parsearValorStorage(localStorage.getItem(key), defaultValue))

    watch(estado, (valor) => {
      if (valor === undefined || valor === null) {
        localStorage.removeItem(key)
        return
      }

      if (typeof valor === 'string') {
        localStorage.setItem(key, valor)
        return
      }

      localStorage.setItem(key, JSON.stringify(valor))
    }, { deep: true })

    return estado
  }
}))

// Configuración global para componentes
beforeEach(() => {
  vi.clearAllMocks()
  memoriaLocalStorage.clear()
  memoriaSessionStorage.clear()
})
