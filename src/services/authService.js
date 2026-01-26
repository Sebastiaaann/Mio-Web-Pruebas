import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "@/config/firebaseConfig";
import { logger } from "@/utils/logger";

const API_HOMA_URL = import.meta.env.VITE_API_HOMA_URL || "https://apihoma.homa.cl:7200";
const API_TIMEOUT = import.meta.env.VITE_API_TIMEOUT || 10000;

// MODO DESARROLLO: Cambiar a false para usar backend real
const USE_MOCK = false;

// Constantes para mensajes de error (centralizados)
const MENSAJES_ERROR = {
  GENERICOS: 'Ocurrió un error inesperado al iniciar sesión.',
  EMAIL_INVALIDO: 'El formato del email no es válido.',
  CUENTA_DESHABILITADA: 'Su cuenta ha sido deshabilitada.',
  CREDENCIALES_INVALIDAS: 'Credenciales incorrectas.',
  TIMEOUT: 'La solicitud tomó demasiado tiempo. Intente nuevamente.'
};

/**
 * Helper: Crear fetch con timeout (DRY)
 * @private
 */
const crearFetchConTimeout = (url, opciones = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
  
  return {
    controller,
    timeoutId,
    fetch: fetch(url, { ...opciones, signal: controller.signal })
  };
};

// Event Bus simple usando Window (para desacolar sin librerías extra)
export const AUTH_EVENTS = {
  LOGIN_SUCCESS: 'auth:login-success',
  LOGOUT: 'auth:logout',
  SESSION_EXPIRED: 'auth:session-expired'
};

export const authService = {
  /**
   * Login de usuario con Firebase + HOMA API
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña
   * @returns {Promise<{success: boolean, token?: string, user?: object, error?: string}>}
   */
  async iniciarSesion(email, password) {
    if (USE_MOCK) {
      return this._loginMock(email, password);
    }

    try {
      // 1. Autenticación con Firebase
      const firebaseUser = await this._autenticarConFirebase(email, password);
      
      // 2. Autorización con API HOMA
      const datosHoma = await this._autorizarConHoma(firebaseUser);
      
      // 3. Estructurar usuario
      const usuario = this._construirObjetoUsuario(firebaseUser, datosHoma);

      // 4. Emitir evento de éxito
      this.emitirEvento(AUTH_EVENTS.LOGIN_SUCCESS, { 
        patient_id: usuario.patient_id 
      });

      return {
        success: true,
        token: datosHoma.token,
        user: usuario,
      };

    } catch (error) {
      logger.error("Login Error", error);
      return {
        success: false,
        error: this._obtenerMensajeError(error)
      };
    }
  },

  /**
   * Autenticar con Firebase (SRP)
   * @private
   */
  async _autenticarConFirebase(email, password) {
    const credenciales = await signInWithEmailAndPassword(auth, email, password);
    logger.info("Firebase Auth Success. UID masked.");
    return credenciales.user;
  },

  /**
   * Autorizar con API HOMA (SRP)
   * @private
   */
  async _autorizarConHoma(firebaseUser) {
    const { controller, timeoutId, fetch: peticion } = crearFetchConTimeout(
      `${API_HOMA_URL}/api/v1/authorizations`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: firebaseUser.email, 
          UID: firebaseUser.uid 
        })
      }
    );

    try {
      const respuesta = await peticion;
      clearTimeout(timeoutId);

      if (!respuesta.ok) {
        throw new Error(`Error HOMA: ${respuesta.status}`);
      }

      const datos = await respuesta.json();
      
      if (!datos.success) {
        throw new Error(datos.error || "Error en autorización HOMA");
      }

      return datos;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  },

  /**
   * Construir objeto usuario (SRP)
   * @private
   */
  _construirObjetoUsuario(firebaseUser, datosHoma) {
    const healthPlanId = datosHoma?.health_plan_id
      || datosHoma?.plan_id
      || datosHoma?.data?.health_plan_id
      || datosHoma?.data?.plan_id
      || datosHoma?.data?.current_plan?.id

    return {
      uid: firebaseUser.uid,
      patient_id: datosHoma.patient_id,
      health_plan_id: healthPlanId || null,
      email: firebaseUser.email,
      fullName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
    };
  },

  /**
   * Obtener mensaje de error user-friendly (OWASP A09)
   * @private
   */
  _obtenerMensajeError(error) {
    // Timeout
    if (error.name === 'AbortError') {
      return MENSAJES_ERROR.TIMEOUT;
    }

    // Errores de Firebase
    const mapaErrores = {
      'auth/invalid-email': MENSAJES_ERROR.EMAIL_INVALIDO,
      'auth/user-disabled': MENSAJES_ERROR.CUENTA_DESHABILITADA,
      'auth/user-not-found': MENSAJES_ERROR.CREDENCIALES_INVALIDAS,
      'auth/wrong-password': MENSAJES_ERROR.CREDENCIALES_INVALIDAS,
      'auth/invalid-credential': MENSAJES_ERROR.CREDENCIALES_INVALIDAS,
    };

    return mapaErrores[error.code] || MENSAJES_ERROR.GENERICOS;
  },

  /**
   * Mock para desarrollo (SRP)
   * @private
   */
  _loginMock(email, password) {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (password) {
          const mockUser = {
            id: "mock-uid-123",
            patient_id: 12345,
            email,
            firstName: "Usuario",
            lastName: "Demo",
            fullName: "Usuario Demo"
          };
          
          this.emitirEvento(AUTH_EVENTS.LOGIN_SUCCESS, { uid: mockUser.id });
          resolve({
            success: true,
            token: "mock-jwt-token-" + Date.now(),
            user: mockUser,
          });
        } else {
          resolve({ success: false, error: MENSAJES_ERROR.CREDENCIALES_INVALIDAS });
        }
      }, 800);
    });
  },

  /**
   * Cerrar sesión
   */
  async cerrarSesion() {
    try {
      await signOut(auth);
      this.limpiarAlmacenamientoLocal();
      this.emitirEvento(AUTH_EVENTS.LOGOUT);
      return { success: true };
    } catch (error) {
      logger.error("Logout Error", error);
      // Fallback cleanup
      this.limpiarAlmacenamientoLocal();
      return { success: false, error: error.message };
    }
  },

  /**
   * Helper para emitir eventos DOM personalizados
   */
  emitirEvento(nombre, detail = {}) {
    window.dispatchEvent(new CustomEvent(nombre, { detail }));
  },

  /**
   * Limpieza segura del storage
   */
  limpiarAlmacenamientoLocal() {
    localStorage.removeItem("mio-token");
    localStorage.removeItem("mio-session-meta"); // Reemplaza a mio-user
    // Limpiamos la vieja key por si existe
    localStorage.removeItem("mio-user");
  },

  /**
   * Obtener token guardado
   */
  obtenerToken() {
    return localStorage.getItem("mio-token");
  },

  /**
   * Obtener usuario actual
   * @returns {object|null}
   */
  obtenerUsuario() {
    // Intentar recuperar de localStorage si no hay estado en memoria (este servicio es stateless por ahora)
    const session = this.restaurarSesion();
    return session ? session.user : null;
  },

  /**
   * Guardar sesión de forma segura (Minimizar PII)
   */
  guardarSesion(token, user) {
    localStorage.setItem("mio-token", token);
    
    // Solo guardamos metadatos no sensibles o necesarios para el bootstrap
    // El resto de la info (nombre, email) debe vivir en memoria (Pinia)
    const sessionMeta = {
      uid: user.uid, // Necesario para identificar
      patient_id: user.patient_id, // Necesario para bootstrap de datos
      health_plan_id: user.health_plan_id || user.healthplan_id || user.plan_id || null,
      lastLogin: Date.now()
    };
    
    localStorage.setItem("mio-session-meta", JSON.stringify(sessionMeta));
  },

  /**
   * Restaurar sesión (Solo metadatos)
   * El perfil completo se debe recargar desde la API
   */
  restaurarSesion() {
    const token = this.obtenerToken();
    const sessionMetaStr = localStorage.getItem("mio-session-meta");
    
    // Compatibilidad hacia atrás (migración)
    const legacyUserStr = localStorage.getItem("mio-user");

    if (token) {
      if (sessionMetaStr) {
        return { token, user: JSON.parse(sessionMetaStr) };
      }
      // Migración on-the-fly: si existe el viejo formato, lo usamos una vez y sugerimos al store que actualice
      if (legacyUserStr) {
        try {
          const legacyUser = JSON.parse(legacyUserStr);
          // Devolvemos lo que hay, pero el store debería encargarse de limpiarlo después
          return { token, user: legacyUser, isLegacy: true };
        } catch (e) {
          return null;
        }
      }
    }

    return null;
  },
  
  estaAutenticado() {
    return !!this.obtenerToken();
  }
};
