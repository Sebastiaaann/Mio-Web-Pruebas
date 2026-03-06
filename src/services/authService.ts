import { signInWithEmailAndPassword, signOut, type User as FirebaseUser } from 'firebase/auth'
import { auth } from '@/config/firebaseConfig'
import { logger } from '@/utils/logger'
import { FLAGS } from '@/utils/featureFlags'
import { limpiarStorageClienteEnLogout } from '@/utils/storageCliente'
import { validarEmail } from '@/utils/validadores'
import { clienteApi } from '@/utils/clienteApi'
import { pacienteService } from '@/services/pacienteService'
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
  token?: string
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
      if (FLAGS.USE_HOMA_BFF) {
        const response = await fetch('/api/homa/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            email: firebaseUser.email,
            uid: firebaseUser.uid
          })
        })

        const datos = await response.json() as HomaAuthResponse & { error?: string }
        if (!response.ok || !datos.success) {
          throw new Error(datos.error || 'Error en autorización HOMA (BFF)')
        }

        return {
          ...datos,
          token: datos.token || 'bff-session'
        }
      }

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
      if (FLAGS.USE_HOMA_BFF) {
        try {
          await fetch('/api/homa/auth/logout', {
            method: 'POST',
            credentials: 'include'
          })
        } catch (errorBff) {
          logger.warn('No se pudo cerrar sesión BFF', errorBff)
        }
      }

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
    sessionStorage.removeItem('mio-token')
    sessionStorage.removeItem('mio-session-meta')
    // Limpiamos la vieja key legacy de localStorage por si existe (migración)
    localStorage.removeItem('mio-user')
    localStorage.removeItem('mio-token')
    localStorage.removeItem('mio-session-meta')
    limpiarStorageClienteEnLogout()
  },

  /**
   * Obtener token guardado
   */
  obtenerToken(): string | null {
    // Migración on-the-fly: si el token está en localStorage (sesión antigua), moverlo a sessionStorage
    const tokenLegacy = localStorage.getItem('mio-token')
    if (tokenLegacy) {
      sessionStorage.setItem('mio-token', tokenLegacy)
      localStorage.removeItem('mio-token')
    }
    return sessionStorage.getItem('mio-token')
  },

  /**
   * Refrescar token JWT expirado
   * Llama a POST /api/v1/auth/refresh con el token actual
   * Si éxito: actualiza localStorage con el nuevo token
   * Si falla: retorna false (el caller debe forzar logout)
   */
  async refrescarToken(): Promise<{ success: boolean; token?: string }> {
    try {
      if (FLAGS.USE_HOMA_BFF) {
        const response = await fetch('/api/homa/auth/refresh', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        })

        if (!response.ok) {
          logger.warn('Token refresh BFF falló:', response.status)
          return { success: false }
        }

        const datos = await response.json() as { success?: boolean; token?: string }
        if (datos.success) {
          const tokenCompat = datos.token || 'bff-session'
          sessionStorage.setItem('mio-token', tokenCompat)
          return { success: true, token: tokenCompat }
        }

        return { success: false }
      }

      const tokenActual = this.obtenerToken()
      if (!tokenActual) {
        return { success: false }
      }

      // Llamar al endpoint de refresh con fetch directo
      // (no usar clienteApi para evitar loop infinito de retry)
      const response = await fetch(
        `${import.meta.env.VITE_API_HOMA_URL || 'https://apihoma.homa.cl:7200'}/api/v1/auth/refresh`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-KEY': tokenActual
          }
        }
      )

      if (!response.ok) {
        logger.warn('Token refresh falló:', response.status)
        return { success: false }
      }

      const datos = await response.json() as { success?: boolean; token?: string }

      if (datos.token) {
        // Actualizar token en sessionStorage (todas las lecturas posteriores lo usarán)
        sessionStorage.setItem('mio-token', datos.token)
        logger.info('Token refrescado exitosamente')
        return { success: true, token: datos.token }
      }

      return { success: false }
    } catch (error) {
      logger.error('Error refrescando token:', error)
      return { success: false }
    }
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
    sessionStorage.setItem('mio-token', token)

    // Solo persistimos patient_id — es el único dato necesario para el bootstrap.
    // uid, health_plan_id y lastLogin se eliminaron para reducir PII expuesta en storage.
    const sessionMeta: SessionMetaAuth = {
      patient_id: user.patient_id
    }

    sessionStorage.setItem('mio-session-meta', JSON.stringify(sessionMeta))
  },

  /**
   * Restaurar sesión (Solo metadatos)
   * El perfil completo se debe recargar desde la API
   */
  restaurarSesion(): { token: string; user: SessionLegacy; isLegacy?: boolean } | null {
    const token = this.obtenerToken() // ya maneja migración localStorage → sessionStorage
    const sessionMetaStr = sessionStorage.getItem('mio-session-meta')

    // Compatibilidad hacia atrás: migrar mio-session-meta desde localStorage si existe
    const sessionMetaLegacyStr = localStorage.getItem('mio-session-meta')
    if (sessionMetaLegacyStr && !sessionMetaStr) {
      sessionStorage.setItem('mio-session-meta', sessionMetaLegacyStr)
      localStorage.removeItem('mio-session-meta')
    }

    const metaStr = sessionStorage.getItem('mio-session-meta')

    // Compatibilidad hacia atrás (migración)
    const legacyUserStr = localStorage.getItem('mio-user')

    if (token) {
      if (metaStr) {
        try {
          return { token, user: JSON.parse(metaStr) as SessionLegacy }
        } catch {
          // sessionStorage corrupto — limpiar y continuar con fallback legacy
          sessionStorage.removeItem('mio-session-meta')
        }
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

  /**
   * Registrar nuevo usuario en HOMA API
   * Llama a POST /api/v1/patients con los datos del paciente
   * Nota: la contraseña NO se envía a HOMA (HOMA no gestiona passwords)
   */
  async registrar(
    email: string,
    _password: string,
    rut: string,
    nombre: string,
    apellido: string
  ): Promise<LoginResponse> {
    try {
      // Crear paciente en HOMA API
      const resultado = await pacienteService.crearPaciente({
        name: nombre,
        lastname: apellido,
        document: rut,
        email
      })

      if (!resultado.success) {
        return {
          success: false,
          error: resultado.error || 'No se pudo completar el registro. Intente nuevamente.'
        }
      }

      // Extraer patient_id de la respuesta (distintas estructuras posibles)
      const datos = resultado.data as Record<string, unknown> | undefined
      const patientId: number =
        (datos?.patient_id as number) ??
        (datos?.id as number) ??
        ((datos?.data as Record<string, unknown>)?.patient_id as number) ??
        ((datos?.data as Record<string, unknown>)?.id as number) ??
        0

      if (!patientId) {
        logger.warn('authService.registrar: no se pudo extraer patient_id de la respuesta', {
          claves: datos ? Object.keys(datos) : []
        })
      }

      // Construir usuario con token temporal (sin Firebase, sin contraseña en HOMA)
      const usuario: AuthUser = {
        uid: `reg_${patientId || Date.now()}`,
        patient_id: patientId,
        health_plan_id: null,
        email,
        fullName: `${nombre} ${apellido}`.trim()
      }

      // No guardar sesión ni emitir LOGIN_SUCCESS: el registro solo crea el paciente.
      // El usuario debe iniciar sesión explícitamente después del registro.

      logger.info('authService.registrar: paciente registrado', {
        patientId: patientId ? `[ID:${patientId.toString().slice(0, 3)}...]` : 'desconocido'
      })

      return {
        success: true,
        registered: true,
        user: usuario
      }
    } catch (error) {
      logger.error('authService.registrar: error inesperado', error)
      return {
        success: false,
        error: 'Ocurrió un error inesperado durante el registro. Intente nuevamente.'
      }
    }
  },

  estaAutenticado(): boolean {
    return !!this.obtenerToken()
  }
}
