// stores/tiendaUsuario.ts
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { authService } from '@/services/authService'
import { pacienteService } from '@/services/pacienteService'
import { useConfigStore } from '@/stores/tiendaConfig'
import { obtenerTipoPlan } from '@/composables/usePerfilHelpers'
import { logger } from '@/utils/logger'
import type { AuthUser } from '@/types'

interface UsuarioBasico {
  uid?: string
  patient_id?: string | number
  health_plan_id?: number | null
  email?: string
  name?: string
  nombre?: string
  firstName?: string
  lastname?: string
  apellido?: string
  lastName?: string
  fullName?: string
  [key: string]: unknown
}

interface ResultadoAuth {
  success: boolean
  token?: string
  user?: UsuarioBasico
  error?: string
}

interface SesionRestaurada {
  token: string
  user: UsuarioBasico
  isLegacy?: boolean
}

interface ResultadoBasico {
  success: boolean
  error?: string
}

/**
 * Helper: Obtener primer nombre del usuario
 * Soporta múltiples formatos de respuesta de API
 */
function getFirstName(usuario: UsuarioBasico | null): string {
  if (!usuario) return ''

  // Prioridad: name (API HOMA) > nombre (legacy) > firstName (alternativo)
  const nombre = usuario.name || usuario.nombre || usuario.firstName
  if (nombre) return nombre

  // Fallback: extraer de fullName
  if (usuario.fullName) {
    return String(usuario.fullName).split(' ')[0]
  }

  return ''
}

/**
 * Helper: Obtener nombre completo del usuario
 */
function getNombreCompleto(usuario: UsuarioBasico | null): string {
  if (!usuario) return ''

  if (usuario.fullName) return String(usuario.fullName)

  const nombre = usuario.name || usuario.nombre || usuario.firstName || ''
  const apellido = usuario.lastname || usuario.apellido || usuario.lastName || ''

  return `${nombre} ${apellido}`.trim()
}

/**
 * Helper: Obtener iniciales del usuario
 */
function getIniciales(usuario: UsuarioBasico | null): string {
  if (!usuario) return ''

  const nombre = usuario.name || usuario.nombre || usuario.firstName || ''
  const apellido = usuario.lastname || usuario.apellido || usuario.lastName || ''

  const n = nombre ? String(nombre)[0] : ''
  const a = apellido ? String(apellido)[0] : ''

  return (n + a).toUpperCase()
}

function normalizarUsuarioAuth(usuario: UsuarioBasico): AuthUser {
  const nombre = usuario.fullName || usuario.name || usuario.nombre || usuario.firstName
  const apellido = usuario.lastname || usuario.apellido || usuario.lastName || ''
  const fullName = nombre ? `${nombre} ${apellido}`.trim() : ''
  const patientId = typeof usuario.patient_id === 'number'
    ? usuario.patient_id
    : Number(usuario.patient_id || 0)

  return {
    uid: usuario.uid || '',
    patient_id: patientId,
    health_plan_id: usuario.health_plan_id ?? null,
    email: usuario.email || '',
    fullName
  }
}

/**
 * Store de Usuario - Maneja autenticación y sesión
 */
export const useTiendaUsuario = defineStore('usuario', () => {
  // State
  const usuario = ref<UsuarioBasico | null>(null)
  const token = ref<string | null>(null)
  const cargando = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const estaAutenticado = computed(() => !!token.value && !!usuario.value)
  const nombreCompleto = computed(() => getNombreCompleto(usuario.value))
  const iniciales = computed(() => getIniciales(usuario.value))

  // Getter para primer nombre (compatibilidad con HomeView)
  const firstName = computed(() => getFirstName(usuario.value))

  // Actions

  /**
   * Iniciar sesión
   */
  async function iniciarSesion(email: string, password: string): Promise<ResultadoBasico> {
    cargando.value = true
    error.value = null

    try {
      const resultado = await authService.iniciarSesion(email, password) as ResultadoAuth

      if (resultado.success && resultado.user && resultado.token) {
        token.value = resultado.token
        usuario.value = resultado.user

        // La persistencia segura ya la maneja authService.guardarSesion
        authService.guardarSesion(resultado.token, normalizarUsuarioAuth(resultado.user))

        // Si tenemos patient_id, intentar hidratar el perfil completo en segundo plano
        if (resultado.user.patient_id) {
          void hidratarPerfil(resultado.user.patient_id)
        }

        logger.info('✅ Sesión iniciada para usuario:', { patient_id: resultado.user.patient_id })

        return { success: true }
      }

      const mensajeError = resultado.error || 'Error al iniciar sesión'
      error.value = mensajeError
      return { success: false, error: mensajeError }
    } catch (e) {
      const mensajeError = e instanceof Error ? e.message : 'Error al iniciar sesión'
      error.value = mensajeError
      logger.error('❌ Error en login:', e)
      return { success: false, error: mensajeError }
    } finally {
      cargando.value = false
    }
  }

  /**
   * Hidratar perfil desde API (Safe Hydration)
   */
  async function hidratarPerfil(patientId: string | number): Promise<void> {
    try {
      const configStore = useConfigStore()
      const resp = await pacienteService.obtenerPerfil(patientId)
      if (resp?.success && resp.paciente) {
        // Mezclamos lo que ya tenemos (token, uid) con los datos frescos del perfil
        usuario.value = { ...usuario.value, ...resp.paciente }

        const planNombre = resp.paciente.plan_name
          || resp.paciente.plan_subtitle
          || (resp.paciente as { current_plan?: { name?: string } }).current_plan?.name

        if (planNombre) {
          const tipoPlan = obtenerTipoPlan(String(planNombre))
          configStore.setPlanActivo(tipoPlan)
        }

        logger.info('✅ Perfil hidratado con datos médicos')
      }
    } catch (e) {
      logger.warn('No se pudo hidratar el perfil completo', e)
    }
  }

  /**
   * Cerrar sesión
   */
  function cerrarSesion(): void {
    usuario.value = null
    token.value = null
    error.value = null

    authService.cerrarSesion()
    logger.info('👋 Sesión cerrada')
  }

  /**
   * Restaurar sesión desde localStorage
   */
  function restaurarSesion(): boolean {
    const sesion = authService.restaurarSesion() as SesionRestaurada | null

    if (sesion) {
      token.value = sesion.token
      usuario.value = sesion.user

      logger.info('🔄 Sesión básica restaurada')

      // Si es una sesión legacy o solo tiene metadatos, hidratar perfil
        if (sesion.isLegacy || sesion.user.patient_id) {
        // Actualizamos almacenamiento a formato seguro si era legacy
        if (sesion.isLegacy && token.value) {
          authService.guardarSesion(token.value, normalizarUsuarioAuth(sesion.user))
        }

        // Hidratamos datos en segundo plano
        if (sesion.user.patient_id) {
          void hidratarPerfil(sesion.user.patient_id)
        }
      }

      return true
    }

    return false
  }

  /**
   * Registrar nuevo usuario
   */
  async function registrarUsuario(): Promise<ResultadoBasico> {
    return { success: false, error: 'Registro no implementado en backend actual' }
  }

  /**
   * Actualizar datos del usuario
   */
  function actualizarUsuario(datosActualizados: Record<string, unknown>): void {
    if (usuario.value) {
      usuario.value = { ...usuario.value, ...datosActualizados }

      // Actualizar persistencia llamando a authService
      if (token.value) {
        authService.guardarSesion(token.value, normalizarUsuarioAuth(usuario.value))
      }

      logger.info('📝 Usuario actualizado localmente')
    }
  }

  /**
   * Limpiar error
   */
  function limpiarError(): void {
    error.value = null
  }

  /**
   * Resetear store a estado inicial
   */
  function $reset(): void {
    usuario.value = null
    token.value = null
    cargando.value = false
    error.value = null
  }

  return {
    // State
    usuario,
    token,
    cargando,
    error,
    // Getters
    estaAutenticado,
    nombreCompleto,
    iniciales,
    firstName,
    // Actions
    iniciarSesion,
    cerrarSesion,
    restaurarSesion,
    registrarUsuario,
    actualizarUsuario,
    limpiarError,
    $reset,
    // Alias en inglés para compatibilidad
    login: iniciarSesion,
    register: registrarUsuario,
    logout: cerrarSesion,
    restoreSession: restaurarSesion,
    isAuthenticated: estaAutenticado,
    loading: cargando
  }
})

// Alias para compatibilidad con código existente
export const useUserStore = useTiendaUsuario
