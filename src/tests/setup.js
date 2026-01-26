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

// Configuración global para componentes
beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
})
