// stores/tiendaUsuario.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authService } from '@/services/authService';

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
    return `${usuario.value.nombre} ${usuario.value.apellido}`.trim();
  });

  const iniciales = computed(() => {
    if (!usuario.value) return '';
    const nombre = usuario.value.nombre?.[0] || '';
    const apellido = usuario.value.apellido?.[0] || '';
    return (nombre + apellido).toUpperCase();
  });

  // Getter para primer nombre (compatibilidad con HomeView)
  const firstName = computed(() => {
    if (!usuario.value) return '';
    return usuario.value.nombre || '';
  });

  // Actions

  /**
   * Iniciar sesión
   * @param {string} rut - RUT del usuario
   * @param {string} password - Contraseña
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async function iniciarSesion(rut, password) {
    cargando.value = true;
    error.value = null;

    try {
      const resultado = await authService.login(rut, password);

      if (resultado.success) {
        token.value = resultado.token;
        usuario.value = resultado.user;
        
        // Guardar sesión en localStorage
        authService.saveSession(resultado.token, resultado.user);

        if (import.meta.env.DEV) {
          console.log('✅ Sesión iniciada:', usuario.value);
        }

        return { success: true };
      } else {
        error.value = resultado.error;
        return { success: false, error: resultado.error };
      }
    } catch (e) {
      error.value = e.message || 'Error al iniciar sesión';
      console.error('❌ Error en login:', e);
      return { success: false, error: error.value };
    } finally {
      cargando.value = false;
    }
  }

  /**
   * Cerrar sesión
   */
  function cerrarSesion() {
    usuario.value = null;
    token.value = null;
    error.value = null;
    
    authService.logout();

    if (import.meta.env.DEV) {
      console.log('👋 Sesión cerrada');
    }
  }

  /**
   * Restaurar sesión desde localStorage
   */
  function restaurarSesion() {
    const sesion = authService.restoreSession();
    
    if (sesion) {
      token.value = sesion.token;
      usuario.value = sesion.user;

      if (import.meta.env.DEV) {
        console.log('🔄 Sesión restaurada:', usuario.value);
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
    cargando.value = true;
    error.value = null;

    try {
      const resultado = await authService.register(datosUsuario);

      if (resultado.success) {
        if (import.meta.env.DEV) {
          console.log('✅ Usuario registrado');
        }
        return { success: true };
      } else {
        error.value = resultado.error;
        return { success: false, error: resultado.error };
      }
    } catch (e) {
      error.value = e.message || 'Error al registrar usuario';
      console.error('❌ Error en registro:', e);
      return { success: false, error: error.value };
    } finally {
      cargando.value = false;
    }
  }

  /**
   * Actualizar datos del usuario
   * @param {object} datosActualizados - Datos a actualizar
   */
  function actualizarUsuario(datosActualizados) {
    if (usuario.value) {
      usuario.value = { ...usuario.value, ...datosActualizados };
      
      // Actualizar en localStorage
      authService.saveSession(token.value, usuario.value);

      if (import.meta.env.DEV) {
        console.log('📝 Usuario actualizado:', usuario.value);
      }
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

