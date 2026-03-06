// stores/tiendaUsuario.ts
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { authService } from '@/services/authService'
import { pacienteService } from '@/services/pacienteService'
import { useConfigStore } from '@/stores/tiendaConfig'
import { useTiendaServicios } from '@/stores/tiendaServicios'
import { useContenidoStore } from '@/stores/salud/tiendaContenido'
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
  /** true cuando el resultado es un registro nuevo (sin sesión activa) */
  registered?: boolean
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

  // Si hay un fullName explícito, tiene prioridad sobre name + lastname
  if (usuario.fullName) return String(usuario.fullName)

  const nombre = usuario.name || usuario.nombre || usuario.firstName || ''
  const apellido = usuario.lastname || usuario.apellido || usuario.lastName || ''

  if (nombre || apellido) {
    return `${nombre} ${apellido}`.trim()
  }

  return ''
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

        logger.info('✅ Sesión iniciada para usuario:', { patient_id: `[ID:${String(resultado.user.patient_id).slice(-3).padStart(6, '*')}]` })

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
      const serviciosStore = useTiendaServicios()
      const contenidoStore = useContenidoStore()
      
      const oldPlan = configStore.planActivo  // Guardar antes de cambiar
      
      const resp = await pacienteService.obtenerPerfil(patientId)
      if (resp?.success && resp.paciente) {
        const nombrePerfil = resp.paciente.name || resp.paciente.nombre || resp.paciente.firstName || ''
        const apellidoPerfil = resp.paciente.lastname || resp.paciente.apellido || resp.paciente.lastName || ''
        const fullNamePerfil = `${nombrePerfil} ${apellidoPerfil}`.trim()

        // Mezclamos lo que ya tenemos (token, uid) con los datos frescos del perfil
        usuario.value = {
          ...usuario.value,
          ...resp.paciente,
          ...(fullNamePerfil ? { fullName: fullNamePerfil } : {})
        }

        const planNombre = resp.paciente.plan_name
          || resp.paciente.plan_subtitle
          || (resp.paciente as { current_plan?: { name?: string } }).current_plan?.name

        if (planNombre) {
          const tipoPlan = obtenerTipoPlan(String(planNombre))
          const previousPlan = configStore.setPlanActivo(tipoPlan)
          
          // Detectar cambio de plan y refetch
          if (previousPlan !== tipoPlan) {
            logger.info('Plan cambió de', previousPlan, 'a', tipoPlan, '- Refrescando contenido...')
            await Promise.all([
              serviciosStore.cargarServicios(),
              contenidoStore.fetchVideos()
            ])
          }
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
  async function cerrarSesion(): Promise<void> {
    usuario.value = null
    token.value = null
    error.value = null

    try {
      await authService.cerrarSesion()
    } catch (e) {
      logger.warn('Error al cerrar sesión en servicio, limpieza local completada', e)
    }
    logger.info('Sesión cerrada')
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
   * Flujo: Firebase Auth → HOMA API (asociar paciente)
   * @param datos - { email, password, rut, nombre, apellido }
   */
  async function registrarUsuario(datos: { 
    email: string
    password: string
    rut: string
    nombre: string
    apellido: string
  }): Promise<ResultadoBasico> {
    if (!datos.email || !datos.password || !datos.rut) {
      return { success: false, error: 'Faltan datos requeridos para el registro.' }
    }

    cargando.value = true
    error.value = null

    try {
      logger.info('Iniciando registro de usuario:', { email: datos.email, rut: datos.rut })

      const resultado = await authService.registrar(
        datos.email,
        datos.password,
        datos.rut,
        datos.nombre,
        datos.apellido
      )

      if (resultado.success && resultado.registered && resultado.user) {
        // Registro exitoso: no hay token todavía. El usuario debe iniciar sesión.
        logger.info('✅ Usuario registrado:', { patient_id: resultado.user.patient_id })
        return { success: true, registered: true }
      }

      if (resultado.success && resultado.token && resultado.user) {
        // Guardar sesión
        token.value = resultado.token
        usuario.value = resultado.user as unknown as UsuarioBasico
        authService.guardarSesion(resultado.token, normalizarUsuarioAuth(resultado.user as UsuarioBasico))

        // Si tenemos patient_id, hidratar perfil
        if (resultado.user.patient_id) {
          void hidratarPerfil(resultado.user.patient_id)
        }

        logger.info('✅ Usuario registrado:', { patient_id: resultado.user.patient_id })
        return { success: true }
      }

      const mensajeError = resultado.error || 'Error al registrar usuario'
      error.value = mensajeError
      return { success: false, error: mensajeError }
    } catch (e) {
      const mensajeError = e instanceof Error ? e.message : 'Error al registrar usuario'
      error.value = mensajeError
      logger.error('❌ Error en registro:', e)
      return { success: false, error: mensajeError }
    } finally {
      cargando.value = false
    }
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
