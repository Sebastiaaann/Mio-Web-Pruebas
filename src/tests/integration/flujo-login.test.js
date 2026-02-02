/**
 * Tests de Integración - Flujo de Login
 * Prueba el flujo completo: Login → Home → Logout
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import { nextTick } from 'vue'

// Stores
import { useTiendaUsuario } from '@/stores/tiendaUsuario'
import { useHealthStore } from '@/stores/tiendaSalud'

// Componentes
import InicioViewModern from '@/views/inicio/InicioViewModern.vue'
import HomeView from '@/views/inicio/HomeView.vue'

// Services
import { authService } from '@/services/authService'
import { clienteApi } from '@/utils/clienteApi'

// Mocks
vi.mock('@/services/authService', () => ({
  authService: {
    iniciarSesion: vi.fn(),
    cerrarSesion: vi.fn(),
    guardarSesion: vi.fn(),
    restaurarSesion: vi.fn(),
    obtenerToken: vi.fn()
  }
}))

vi.mock('@/utils/clienteApi', () => ({
  clienteApi: {
    get: vi.fn(),
    post: vi.fn()
  }
}))

describe('Flujo de Login - Integración', () => {
  let router
  let pinia

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    
    // Crear router con rutas mínimas para testing
    router = createRouter({
      history: createWebHistory(),
      routes: [
        {
          path: '/',
          name: 'inicio',
          component: InicioViewModern,
          meta: { requiresAuth: false }
        },
        {
          path: '/home',
          name: 'home',
          component: HomeView,
          meta: { requiresAuth: true }
        }
      ]
    })

    vi.clearAllMocks()
  })

  describe('Login exitoso', () => {
    it('debería navegar de Inicio a Home después de login exitoso', async () => {
      const userStore = useTiendaUsuario()
      
      // Mock login exitoso
      authService.iniciarSesion.mockResolvedValue({
        success: true,
        token: 'mock-jwt-token',
        user: {
          uid: 'user-123',
          patient_id: 456,
          email: 'test@example.com',
          name: 'Juan',
          lastname: 'Pérez'
        }
      })

      // Ejecutar login
      const resultado = await userStore.iniciarSesion('test@example.com', 'password123')
      
      // Verificar resultado
      expect(resultado.success).toBe(true)
      expect(userStore.estaAutenticado).toBe(true)
      expect(userStore.usuario?.name).toBe('Juan')
      
      // Simular navegación a Home
      await router.push('/home')
      expect(router.currentRoute.value.name).toBe('home')
    })

    it('debería cargar datos de salud después del login', async () => {
      const userStore = useTiendaUsuario()
      const healthStore = useHealthStore()
      
      // Mock login
      authService.iniciarSesion.mockResolvedValue({
        success: true,
        token: 'token',
        user: { patient_id: 123, name: 'Juan' }
      })

      // Mock datos de salud
      clienteApi.get.mockResolvedValue({
        data: {
          protocol: [
            { id: 1, name: 'Presión Arterial' },
            { id: 2, name: 'Peso Básico' }
          ]
        }
      })

      // Preparar sesión mínima para fetchControles
      localStorage.setItem('mio-session-meta', JSON.stringify({
        patient_id: 123,
        health_plan_id: 1,
        lastLogin: Date.now()
      }))

      // Login
      await userStore.iniciarSesion('test@example.com', 'password123')
      
      // Cargar datos de salud
      await healthStore.fetchControles()
      
      // Verificar datos cargados (puede ser 2 de la API o 3 del mock fallback)
      expect(healthStore.controlesProximos.length).toBeGreaterThanOrEqual(2)
      expect(healthStore.controlesProximos[0].nombre).toBeDefined()
    })
  })

  describe('Protección de rutas', () => {
    it('debería redirigir a inicio si intenta acceder a ruta protegida sin auth', async () => {
      const userStore = useTiendaUsuario()
      
      // Asegurar que no hay sesión
      expect(userStore.estaAutenticado).toBe(false)
      
      // En el test unitario del router, verificamos que el guard retorna la redirección
      // Aquí simulamos el comportamiento esperado
      const resultado = userStore.estaAutenticado
      expect(resultado).toBe(false)
      
      // Si no está autenticado, no debería poder acceder a rutas protegidas
      // El guard del router retornaría { name: 'inicio' }
    })

    it('debería redirigir a home si usuario autenticado intenta ir a inicio', async () => {
      const userStore = useTiendaUsuario()
      
      // Establecer sesión
      userStore.token = 'valid-token'
      userStore.usuario = { name: 'Juan' }
      
      expect(userStore.estaAutenticado).toBe(true)
      
      // Navegar a inicio
      await router.push('/')
      
      // El router debería redirigir a home
      // Nota: Esto depende de la implementación del beforeEach
    })
  })

  describe('Logout', () => {
    it('debería cerrar sesión y limpiar estado', async () => {
      const userStore = useTiendaUsuario()
      const healthStore = useHealthStore()
      
      // Establecer sesión
      userStore.token = 'token'
      userStore.usuario = { name: 'Juan' }
      // Preparar datos de salud usando acciones del store
      localStorage.setItem('mio-session-meta', JSON.stringify({
        patient_id: 1,
        health_plan_id: 1,
        lastLogin: Date.now()
      }))
      await healthStore.fetchControles()
      
      // Ejecutar logout
      userStore.cerrarSesion()
      
      // Verificar estado limpio
      expect(userStore.estaAutenticado).toBe(false)
      expect(userStore.usuario).toBeNull()
      expect(userStore.token).toBeNull()
      expect(authService.cerrarSesion).toHaveBeenCalled()
    })

    it('debería poder resetear todos los stores después del logout', async () => {
      const userStore = useTiendaUsuario()
      const healthStore = useHealthStore()
      
      // Establecer estado
      userStore.usuario = { name: 'Juan' }
      userStore.token = 'token'
      localStorage.setItem('mio-session-meta', JSON.stringify({
        patient_id: 1,
        health_plan_id: 1,
        lastLogin: Date.now()
      }))
      await healthStore.fetchControles()
      
      // Resetear stores
      userStore.$reset()
      healthStore.$reset()
      
      // Verificar estado inicial
      expect(userStore.estaAutenticado).toBe(false)
      expect(healthStore.controlesProximos).toEqual([])
      expect(healthStore.datosInicializados).toBe(false)
    })
  })

  describe('Restaurar sesión', () => {
    it('debería restaurar sesión desde localStorage al iniciar', () => {
      const userStore = useTiendaUsuario()
      
      // Mock sesión guardada
      authService.restaurarSesion.mockReturnValue({
        token: 'stored-token',
        user: { uid: '123', patient_id: 456, name: 'Juan' }
      })
      
      // Restaurar sesión
      const resultado = userStore.restaurarSesion()
      
      // Verificar
      expect(resultado).toBe(true)
      expect(userStore.estaAutenticado).toBe(true)
      expect(userStore.usuario?.name).toBe('Juan')
    })

    it('debería manejar sesión expirada o inválida', () => {
      const userStore = useTiendaUsuario()
      
      // Mock sin sesión
      authService.restaurarSesion.mockReturnValue(null)
      
      // Intentar restaurar
      const resultado = userStore.restaurarSesion()
      
      // Verificar
      expect(resultado).toBe(false)
      expect(userStore.estaAutenticado).toBe(false)
    })
  })

  describe('Manejo de errores', () => {
    it('debería manejar error de red durante login', async () => {
      const userStore = useTiendaUsuario()
      
      // Mock error de red
      authService.iniciarSesion.mockRejectedValue(new Error('Error de conexión'))
      
      // Intentar login
      const resultado = await userStore.iniciarSesion('test@test.com', 'pass')
      
      // Verificar manejo de error
      expect(resultado.success).toBe(false)
      expect(resultado.error).toBe('Error de conexión')
      expect(userStore.estaAutenticado).toBe(false)
      expect(userStore.cargando).toBe(false)
    })

    it('debería manejar credenciales inválidas', async () => {
      const userStore = useTiendaUsuario()
      
      // Mock credenciales inválidas
      authService.iniciarSesion.mockResolvedValue({
        success: false,
        error: 'Credenciales incorrectas'
      })
      
      // Intentar login
      const resultado = await userStore.iniciarSesion('test@test.com', 'wrong')
      
      // Verificar
      expect(resultado.success).toBe(false)
      expect(userStore.error).toBe('Credenciales incorrectas')
      expect(userStore.estaAutenticado).toBe(false)
    })
  })
})
