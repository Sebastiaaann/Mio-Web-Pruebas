// stores/tiendaUsuario.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authService } from '@/services/authService';
import { pacienteService } from '@/services/pacienteService';
import { logger } from '@/utils/logger';

/**
 * Helper: Obtener primer nombre del usuario
 * Soporta múltiples formatos de respuesta de API
 * @param {Object} usuario - Objeto usuario
 * @returns {string} Primer nombre o string vacío
 */
function getFirstName(usuario) {
  if (!usuario) return '';
  
  // Prioridad: name (API HOMA) > nombre (legacy) > firstName (alternativo)
  const nombre = usuario.name || usuario.nombre || usuario.firstName;
  if (nombre) return nombre;
  
  // Fallback: extraer de fullName
  if (usuario.fullName) {
    return usuario.fullName.split(' ')[0];
  }
  
  return '';
}

/**
 * Helper: Obtener nombre completo del usuario
 * @param {Object} usuario - Objeto usuario
 * @returns {string} Nombre completo o string vacío
 */
function getNombreCompleto(usuario) {
  if (!usuario) return '';
  
  if (usuario.fullName) return usuario.fullName;
  
  const nombre = usuario.name || usuario.nombre || usuario.firstName || '';
  const apellido = usuario.lastname || usuario.apellido || usuario.lastName || '';
  
  return `${nombre} ${apellido}`.trim();
}

/**
 * Helper: Obtener iniciales del usuario
 * @param {Object} usuario - Objeto usuario
 * @returns {string} Iniciales en mayúsculas
 */
function getIniciales(usuario) {
  if (!usuario) return '';
  
  const nombre = usuario.name || usuario.nombre || usuario.firstName || '';
  const apellido = usuario.lastname || usuario.apellido || usuario.lastName || '';
  
  const n = nombre ? nombre[0] : '';
  const a = apellido ? apellido[0] : '';
  
  return (n + a).toUpperCase();
}

/**
 * Store de Usuario - Maneja autenticación y sesión
 */
export const useTiendaUsuario = defineStore('usuario', () => {
  // State
  const usuario = ref(null);
  const token = ref(null);
  const cargando = ref(false);
  const error = ref(null);

  // Getters
  const estaAutenticado = computed(() => !!token.value && !!usuario.value);
  
  const nombreCompleto = computed(() => getNombreCompleto(usuario.value));

  const iniciales = computed(() => getIniciales(usuario.value));

  // Getter para primer nombre (compatibilidad con HomeView)
  // Usa el helper getFirstName para lógica consistente
  const firstName = computed(() => getFirstName(usuario.value));

  // Actions

  /**
   * Iniciar sesión
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async function iniciarSesion(email, password) {
    cargando.value = true;
    error.value = null;

    try {
      const resultado = await authService.iniciarSesion(email, password);

      if (resultado.success) {
        token.value = resultado.token;
        usuario.value = resultado.user;
        
        // La persistencia segura ya la maneja authService.guardarSesion
        // nosotros solo pasamos los datos
        authService.guardarSesion(resultado.token, resultado.user);

        // Si tenemos patient_id, intentar hidratar el perfil completo en segundo plano
        if (resultado.user.patient_id) {
            hidratarPerfil(resultado.user.patient_id);
        }

        logger.info('✅ Sesión iniciada para usuario:', { patient_id: resultado.user.patient_id });

        return { success: true };
      } else {
        error.value = resultado.error;
        return { success: false, error: resultado.error };
      }
    } catch (e) {
      error.value = e.message || 'Error al iniciar sesión';
      logger.error('❌ Error en login:', e);
      return { success: false, error: error.value };
    } finally {
      cargando.value = false;
    }
  }

  /**
   * Hidratar perfil desde API (Safe Hydration)
   */
  async function hidratarPerfil(patientId) {
      try {
          const resp = await pacienteService.obtenerPerfil(patientId);
          if (resp.success && resp.paciente) {
              // Mezclamos lo que ya tenemos (token, uid) con los datos frescos del perfil
              usuario.value = { ...usuario.value, ...resp.paciente };
              logger.info('✅ Perfil hidratado con datos médicos');
          }
      } catch (e) {
          logger.warn('No se pudo hidratar el perfil completo', e);
      }
  }

  /**
   * Cerrar sesión
   */
  function cerrarSesion() {
    usuario.value = null;
    token.value = null;
    error.value = null;
    
    authService.cerrarSesion();
    logger.info('👋 Sesión cerrada');
  }

  /**
   * Restaurar sesión desde localStorage
   */
  function restaurarSesion() {
    const sesion = authService.restaurarSesion();
    
    if (sesion) {
      token.value = sesion.token;
      usuario.value = sesion.user;

      logger.info('🔄 Sesión básica restaurada');

      // Si es una sesión legacy o solo tiene metadatos, hidratar perfil
      if (sesion.isLegacy || sesion.user.patient_id) {
          // Actualizamos almacenamiento a formato seguro si era legacy
          if (sesion.isLegacy) {
              authService.guardarSesion(token.value, sesion.user);
          }
          
          // Hidratamos datos en segundo plano
          hidratarPerfil(sesion.user.patient_id);
      }

      return true;
    }

    return false;
  }

  /**
   * Registrar nuevo usuario
   * @param {object} datosUsuario - Datos del usuario
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async function registrarUsuario(datosUsuario) {
    // Implementación pendiente en authService para registro
    // Por ahora mantenemos estructura
    return { success: false, error: "Registro no implementado en backend actual" };
  }

  /**
   * Actualizar datos del usuario
   * @param {object} datosActualizados - Datos a actualizar
   */
  function actualizarUsuario(datosActualizados) {
    if (usuario.value) {
      usuario.value = { ...usuario.value, ...datosActualizados };
      
      // Actualizar persistencia llamando a authService
      authService.guardarSesion(token.value, usuario.value);
      
      logger.info('📝 Usuario actualizado localmente');
    }
  }

  /**
   * Limpiar error
   */
  function limpiarError() {
    error.value = null;
  }

  /**
   * Resetear store a estado inicial
   */
  function $reset() {
    usuario.value = null;
    token.value = null;
    cargando.value = false;
    error.value = null;
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
  };
});

// Alias para compatibilidad con código existente
export const useUserStore = useTiendaUsuario;

