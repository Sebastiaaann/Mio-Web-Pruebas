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

// Mock de localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
Object.defineProperty(global, 'localStorage', { value: localStorageMock })

// Configuración global para componentes
beforeEach(() => {
  vi.clearAllMocks()
})
