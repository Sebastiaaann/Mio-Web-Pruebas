// stores/tiendaUsuario.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authService } from '@/services/authService';
import { pacienteService } from '@/services/pacienteService';
import { logger } from '@/utils/logger';

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
  
  const nombreCompleto = computed(() => {
    if (!usuario.value) return '';
    // Intentar obtener del objeto usuario (API Homa usa name/lastname, estandarizamos a esto)
    const nombre = usuario.value.name || usuario.value.nombre || usuario.value.firstName || '';
    const apellido = usuario.value.lastname || usuario.value.apellido || usuario.value.lastName || '';
    
    // Si tiene fullName directo (Legacy/Firebase)
    if (usuario.value.fullName) return usuario.value.fullName;
    
    return `${nombre} ${apellido}`.trim();
  });

  const iniciales = computed(() => {
    if (!usuario.value) return '';
    const nombre = usuario.value.name || usuario.value.nombre || usuario.value.firstName || '';
    const apellido = usuario.value.lastname || usuario.value.apellido || usuario.value.lastName || '';
    
    const n = nombre ? nombre[0] : '';
    const a = apellido ? apellido[0] : '';
    
    return (n + a).toUpperCase();
  });

  // Getter para primer nombre (compatibilidad con HomeView)
  const firstName = computed(() => {
    if (!usuario.value) return '';
    // Prioridad a 'name' que viene de la API
    if (usuario.value.name) return usuario.value.name;
    if (usuario.value.nombre || usuario.value.firstName) return usuario.value.nombre || usuario.value.firstName;
    
    // Fallback: extraer de fullName
    if (usuario.value.fullName) {
        return usuario.value.fullName.split(' ')[0];
    }
    return '';
  });

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

