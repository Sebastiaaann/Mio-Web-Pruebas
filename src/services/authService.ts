import { signInWithEmailAndPassword, signOut, type User as FirebaseUser } from 'firebase/auth'
import { auth } from '@/config/firebaseConfig'
import { logger } from '@/utils/logger'
import { validarEmail } from '@/utils/validadores'
import { clienteApi } from '@/utils/clienteApi'
import type { AuthUser, LoginResponse, SessionMetaAuth } from '@/types'

// MODO DESARROLLO: Cambiar a false para usar backend real
const USE_MOCK = false

// Constantes para mensajes de error (centralizados)
const MENSAJES_ERROR = {
  GENERICOS: 'Ocurrió un error inesperado al iniciar sesión.',
  EMAIL_INVALIDO: 'El formato del email no es válido.',
  CUENTA_DESHABILITADA: 'Su cuenta ha sido deshabilitada.',
  CREDENCIALES_INVALIDAS: 'Credenciales incorrectas.',
  TIMEOUT: 'La solicitud tomó demasiado tiempo. Intente nuevamente.'
} as const

// Event Bus simple usando Window (para desacolar sin librerías extra)
export const AUTH_EVENTS = {
  LOGIN_SUCCESS: 'auth:login-success',
  LOGOUT: 'auth:logout',
  SESSION_EXPIRED: 'auth:session-expired'
} as const

interface HomaAuthResponse {
  success: boolean
  token: string
  patient_id: number
  health_plan_id?: number
  plan_id?: number
  data?: {
    health_plan_id?: number
    plan_id?: number
    current_plan?: { id: number }
  }
  error?: string
}

interface FirebaseError extends Error {
  code?: string
  name: string
}

type SessionLegacy = SessionMetaAuth & Record<string, unknown>

export const authService = {
  /**
   * Login de usuario con Firebase + HOMA API
   */
  async iniciarSesion(email: string, password: string): Promise<LoginResponse> {
    if (!validarEmail(email) || !password) {
      return { success: false, error: 'Email o contraseña inválidos.' }
    }
    if (USE_MOCK) {
      return this._loginMock(email, password)
    }

    try {
      // 1. Autenticación con Firebase
      const firebaseUser = await this._autenticarConFirebase(email, password)

      // 2. Autorización con API HOMA
      const datosHoma = await this._autorizarConHoma(firebaseUser)

      // 3. Estructurar usuario
      const usuario = this._construirObjetoUsuario(firebaseUser, datosHoma)

      // 4. Emitir evento de éxito
      this.emitirEvento(AUTH_EVENTS.LOGIN_SUCCESS, {
        patient_id: usuario.patient_id
      })

      return {
        success: true,
        token: datosHoma.token,
        user: usuario
      }
    } catch (error) {
      logger.error('Login Error', error)
      return {
        success: false,
        error: this._obtenerMensajeError(error as FirebaseError)
      }
    }
  },

  /**
   * Autenticar con Firebase (SRP)
   */
  async _autenticarConFirebase(email: string, password: string): Promise<FirebaseUser> {
    const credenciales = await signInWithEmailAndPassword(auth, email, password)
    logger.info('Firebase Auth Success. UID masked.')
    return credenciales.user
  },

  /**
   * Autorizar con API HOMA usando clienteApi centralizado
   */
  async _autorizarConHoma(firebaseUser: FirebaseUser): Promise<HomaAuthResponse> {
    try {
      const datos = await clienteApi.post<HomaAuthResponse>('/api/v1/authorizations', {
        email: firebaseUser.email,
        UID: firebaseUser.uid
      })

      if (!datos.success) {
        throw new Error(datos.error || 'Error en autorización HOMA')
      }

      return datos
    } catch (error) {
      const err = error as Error
      // Mapear errores del clienteApi a mensajes amigables
      if (err.message === 'Sesión expirada' || err.message?.includes('timeout')) {
        ;(err as FirebaseError).name = 'AbortError'
      }
      throw error
    }
  },

  /**
   * Construir objeto usuario (SRP)
   */
  _construirObjetoUsuario(firebaseUser: FirebaseUser, datosHoma: HomaAuthResponse): AuthUser {
    const healthPlanId = datosHoma?.health_plan_id
      || datosHoma?.plan_id
      || datosHoma?.data?.health_plan_id
      || datosHoma?.data?.plan_id
      || datosHoma?.data?.current_plan?.id

    return {
      uid: firebaseUser.uid,
      patient_id: datosHoma.patient_id,
      health_plan_id: healthPlanId || null,
      email: firebaseUser.email || '',
      fullName: firebaseUser.displayName || 'Usuario'
    }
  },

  /**
   * Obtener mensaje de error user-friendly (OWASP A09)
   */
  _obtenerMensajeError(error: FirebaseError): string {
    // Timeout
    if (error.name === 'AbortError') {
      return MENSAJES_ERROR.TIMEOUT
    }

    // Errores de Firebase
    const mapaErrores: Record<string, string> = {
      'auth/invalid-email': MENSAJES_ERROR.EMAIL_INVALIDO,
      'auth/user-disabled': MENSAJES_ERROR.CUENTA_DESHABILITADA,
      'auth/user-not-found': MENSAJES_ERROR.CREDENCIALES_INVALIDAS,
      'auth/wrong-password': MENSAJES_ERROR.CREDENCIALES_INVALIDAS,
      'auth/invalid-credential': MENSAJES_ERROR.CREDENCIALES_INVALIDAS
    }

    return mapaErrores[error.code || ''] || MENSAJES_ERROR.GENERICOS
  },

  /**
   * Mock para desarrollo (SRP)
   */
  _loginMock(email: string, password: string): Promise<LoginResponse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (password) {
          const mockUser: AuthUser = {
            uid: 'mock-uid-123',
            patient_id: 12345,
            health_plan_id: null,
            email,
            fullName: 'Usuario Demo'
          }

          this.emitirEvento(AUTH_EVENTS.LOGIN_SUCCESS, { uid: mockUser.uid })
          resolve({
            success: true,
            token: `mock-jwt-token-${Date.now()}`,
            user: mockUser
          })
        } else {
          resolve({ success: false, error: MENSAJES_ERROR.CREDENCIALES_INVALIDAS })
        }
      }, 800)
    })
  },

  /**
   * Cerrar sesión
   */
  async cerrarSesion(): Promise<{ success: boolean; error?: string }> {
    try {
      await signOut(auth)
      this.limpiarAlmacenamientoLocal()
      this.emitirEvento(AUTH_EVENTS.LOGOUT)
      return { success: true }
    } catch (error) {
      logger.error('Logout Error', error)
      // Fallback cleanup
      this.limpiarAlmacenamientoLocal()
      return { success: false, error: (error as Error).message }
    }
  },

  /**
   * Helper para emitir eventos DOM personalizados
   */
  emitirEvento(nombre: string, detail: Record<string, unknown> = {}): void {
    window.dispatchEvent(new CustomEvent(nombre, { detail }))
  },

  /**
   * Limpieza segura del storage
   */
  limpiarAlmacenamientoLocal(): void {
    localStorage.removeItem('mio-token')
    localStorage.removeItem('mio-session-meta') // Reemplaza a mio-user
    // Limpiamos la vieja key por si existe
    localStorage.removeItem('mio-user')
  },

  /**
   * Obtener token guardado
   */
  obtenerToken(): string | null {
    return localStorage.getItem('mio-token')
  },

  /**
   * Obtener usuario actual
   */
  obtenerUsuario(): SessionMetaAuth | null {
    // Intentar recuperar de localStorage si no hay estado en memoria (este servicio es stateless por ahora)
    const session = this.restaurarSesion()
    return session ? session.user : null
  },

  /**
   * Guardar sesión de forma segura (Minimizar PII)
   */
  guardarSesion(token: string, user: AuthUser): void {
    localStorage.setItem('mio-token', token)

    // Solo guardamos metadatos no sensibles o necesarios para el bootstrap
    // El resto de la info (nombre, email) debe vivir en memoria (Pinia)
    const sessionMeta: SessionMetaAuth = {
      uid: user.uid, // Necesario para identificar
      patient_id: user.patient_id, // Necesario para bootstrap de datos
      health_plan_id: user.health_plan_id || null,
      lastLogin: Date.now()
    }

    localStorage.setItem('mio-session-meta', JSON.stringify(sessionMeta))
  },

  /**
   * Restaurar sesión (Solo metadatos)
   * El perfil completo se debe recargar desde la API
   */
  restaurarSesion(): { token: string; user: SessionLegacy; isLegacy?: boolean } | null {
    const token = this.obtenerToken()
    const sessionMetaStr = localStorage.getItem('mio-session-meta')

    // Compatibilidad hacia atrás (migración)
    const legacyUserStr = localStorage.getItem('mio-user')

    if (token) {
      if (sessionMetaStr) {
        return { token, user: JSON.parse(sessionMetaStr) as SessionLegacy }
      }
      // Migración on-the-fly: si existe el viejo formato, lo usamos una vez y sugerimos al store que actualice
      if (legacyUserStr) {
        try {
          const legacyUser = JSON.parse(legacyUserStr) as SessionLegacy
          // Devolvemos lo que hay, pero el store debería encargarse de limpiarlo después
          return { token, user: legacyUser, isLegacy: true }
        } catch {
          return null
        }
      }
    }

    return null
  },

  estaAutenticado(): boolean {
    return !!this.obtenerToken()
  }
}
