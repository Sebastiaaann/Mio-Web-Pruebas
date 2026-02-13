import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTiendaUsuario } from '../tiendaUsuario'
import { authService } from '@/services/authService'

// Mock del authService
vi.mock('@/services/authService', () => ({
  authService: {
    iniciarSesion: vi.fn(),
    cerrarSesion: vi.fn(),
    guardarSesion: vi.fn(),
    restaurarSesion: vi.fn()
  }
}))

describe('tiendaUsuario', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('Estado inicial', () => {
    it('debería tener estado inicial correcto', () => {
      const store = useTiendaUsuario()

      expect(store.usuario).toBeNull()
      expect(store.token).toBeNull()
      expect(store.cargando).toBe(false)
      expect(store.error).toBeNull()
    })

    it('debería indicar que no está autenticado inicialmente', () => {
      const store = useTiendaUsuario()

      expect(store.estaAutenticado).toBe(false)
    })
  })

  describe('Login', () => {
    it('debería iniciar sesión exitosamente', async () => {
      const store = useTiendaUsuario()
      const mockUser = {
        uid: '123',
        patient_id: 456,
        health_plan_id: null,
        email: 'test@test.com',
        name: 'Juan',
        lastname: 'Pérez',
        fullName: 'Juan Pérez'
      }

      vi.mocked(authService.iniciarSesion).mockResolvedValue({
        success: true,
        token: 'mock-token',
        user: mockUser
      })

      const resultado = await store.iniciarSesion('test@test.com', 'password123')

      expect(resultado.success).toBe(true)
      expect(store.usuario).toEqual(mockUser)
      expect(store.token).toBe('mock-token')
      expect(store.estaAutenticado).toBe(true)
      expect(authService.guardarSesion).toHaveBeenCalledWith('mock-token', expect.objectContaining({
        uid: '123',
        patient_id: 456
      }))
    })

    it('debería manejar error de login', async () => {
      const store = useTiendaUsuario()

      vi.mocked(authService.iniciarSesion).mockResolvedValue({
        success: false,
        error: 'Credenciales inválidas'
      })

      const resultado = await store.iniciarSesion('test@test.com', 'wrong-password')

      expect(resultado.success).toBe(false)
      expect(resultado.error).toBe('Credenciales inválidas')
      expect(store.error).toBe('Credenciales inválidas')
      expect(store.estaAutenticado).toBe(false)
    })

    it('debería manejar excepciones durante login', async () => {
      const store = useTiendaUsuario()

      vi.mocked(authService.iniciarSesion).mockRejectedValue(new Error('Error de red'))

      const resultado = await store.iniciarSesion('test@test.com', 'password123')

      expect(resultado.success).toBe(false)
      expect(store.error).toBe('Error de red')
      expect(store.cargando).toBe(false)
    })

    it('debería establecer cargando en true durante login', async () => {
      const store = useTiendaUsuario()

      vi.mocked(authService.iniciarSesion).mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          success: true,
          token: 'token',
          user: {
            uid: 'temp',
            patient_id: 0,
            health_plan_id: null,
            email: 'temp@test.com',
            fullName: 'Temp Usuario'
          }
        }), 100))
      )

      const promise = store.iniciarSesion('test@test.com', 'password123')
      expect(store.cargando).toBe(true)

      await promise
      expect(store.cargando).toBe(false)
    })
  })

  describe('Logout', () => {
    it('debería cerrar sesión correctamente', () => {
      const store = useTiendaUsuario()

      // Establecer estado de sesión
      store.usuario = { name: 'Juan' }
      store.token = 'token123'

      store.cerrarSesion()

      expect(store.usuario).toBeNull()
      expect(store.token).toBeNull()
      expect(authService.cerrarSesion).toHaveBeenCalled()
    })
  })

  describe('Restaurar sesión', () => {
    it('debería restaurar sesión desde localStorage', () => {
      const store = useTiendaUsuario()
      const mockSession = {
        token: 'stored-token',
        user: { uid: '123', patient_id: 456, health_plan_id: null, lastLogin: Date.now() }
      }

      vi.mocked(authService.restaurarSesion).mockReturnValue(mockSession)

      const resultado = store.restaurarSesion()

      expect(resultado).toBe(true)
      expect(store.token).toBe('stored-token')
      expect(store.usuario).toEqual(mockSession.user)
      expect(store.estaAutenticado).toBe(true)
    })

    it('debería retornar false si no hay sesión', () => {
      const store = useTiendaUsuario()

      vi.mocked(authService.restaurarSesion).mockReturnValue(null)

      const resultado = store.restaurarSesion()

      expect(resultado).toBe(false)
      expect(store.estaAutenticado).toBe(false)
    })
  })

  describe('Getters', () => {
    it('debería calcular nombreCompleto correctamente', () => {
      const store = useTiendaUsuario()

      store.usuario = {
        name: 'Juan',
        lastname: 'Pérez'
      }

      expect(store.nombreCompleto).toBe('Juan Pérez')
    })

    it('debería usar fullName si está disponible', () => {
      const store = useTiendaUsuario()

      store.usuario = {
        name: 'Juan',
        lastname: 'Pérez',
        fullName: 'Juan Carlos Pérez González'
      }

      expect(store.nombreCompleto).toBe('Juan Carlos Pérez González')
    })

    it('debería retornar string vacío si no hay usuario', () => {
      const store = useTiendaUsuario()

      expect(store.nombreCompleto).toBe('')
      expect(store.firstName).toBe('')
      expect(store.iniciales).toBe('')
    })

    it('debería calcular firstName correctamente', () => {
      const store = useTiendaUsuario()

      store.usuario = {
        name: 'Juan Carlos',
        lastname: 'Pérez'
      }

      expect(store.firstName).toBe('Juan Carlos')
    })

    it('debería extraer firstName de fullName', () => {
      const store = useTiendaUsuario()

      store.usuario = {
        fullName: 'María Elena González'
      }

      expect(store.firstName).toBe('María')
    })

    it('debería calcular iniciales correctamente', () => {
      const store = useTiendaUsuario()

      store.usuario = {
        name: 'Juan',
        lastname: 'Pérez'
      }

      expect(store.iniciales).toBe('JP')
    })

    it('debería manejar iniciales con nombre compuesto', () => {
      const store = useTiendaUsuario()

      store.usuario = {
        name: 'Juan Carlos',
        lastname: 'Pérez González'
      }

      expect(store.iniciales).toBe('JP')
    })
  })

  describe('$reset', () => {
    it('debería resetear el store a estado inicial', () => {
      const store = useTiendaUsuario()

      // Establecer estado
      store.usuario = { name: 'Juan' }
      store.token = 'token123'
      store.cargando = true
      store.error = 'Algún error'

      store.$reset()

      expect(store.usuario).toBeNull()
      expect(store.token).toBeNull()
      expect(store.cargando).toBe(false)
      expect(store.error).toBeNull()
    })
  })
})
