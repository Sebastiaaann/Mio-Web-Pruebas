import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "@/config/firebaseConfig";
import { logger } from "@/utils/logger";

const API_HOMA_URL = import.meta.env.VITE_API_HOMA_URL || "https://apihoma.homa.cl:7200";
const API_TIMEOUT = import.meta.env.VITE_API_TIMEOUT || 10000;

// MODO DESARROLLO: Cambiar a false para usar backend real
const USE_MOCK = false;

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
      // MOCK: Simular llamada a API
      return new Promise((resolve) => {
        setTimeout(() => {
          if (password) {
            const mockUser = {
              id: "mock-uid-123",
              patient_id: 12345,
              email: email,
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
            resolve({ success: false, error: "Credenciales inválidas" });
          }
        }, 800);
      });
    }

    try {
      // 1. Autenticación con Firebase Client
      // Esto valida email/pass y nos da el UID
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      const uid = firebaseUser.uid;
      
      logger.info("Firebase Auth Success. UID masked.");

      // 2. Autorización con API HOMA
      // Enviamos email + UID para obtener el token de sesión y patient_id
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

      const response = await fetch(`${API_HOMA_URL}/api/v1/authorizations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          email: firebaseUser.email, 
          UID: uid 
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Error HOMA: ${response.status}`);
      }

      const homaData = await response.json();
      
      if (!homaData.success) {
        throw new Error(homaData.error || "Error en autorización HOMA");
      }

      // Estructuramos el usuario con datos combinados
      // NOTA: Este objeto es para uso en memoria, NO guardar completo en localStorage
      const user = {
        uid: uid,
        patient_id: homaData.patient_id,
        email: firebaseUser.email,
        fullName: firebaseUser.displayName || email.split('@')[0],
      };

      // Emitir evento de éxito (para analytics, logs, etc)
      this.emitirEvento(AUTH_EVENTS.LOGIN_SUCCESS, { 
        patient_id: user.patient_id 
      });

      return {
        success: true,
        token: homaData.token,
        user: user,
      };

    } catch (error) {
      logger.error("Login Error", error);
      
      // Mensaje genérico para el usuario (OWASP A09)
      let errorMessage = "Ocurrió un error inesperado al iniciar sesión.";
      
      if (error.code) {
        // Errores conocidos de Firebase
        switch (error.code) {
          case 'auth/invalid-email': errorMessage = 'El formato del email no es válido.'; break;
          case 'auth/user-disabled': errorMessage = 'Su cuenta ha sido deshabilitada.'; break;
          case 'auth/user-not-found': 
          case 'auth/wrong-password': 
          case 'auth/invalid-credential':
             errorMessage = 'Credenciales incorrectas.'; 
             break;
        }
      }

      return {
        success: false,
        error: errorMessage
      };
    }
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
   * Guardar sesión de forma segura (Minimizar PII)
   */
  guardarSesion(token, user) {
    localStorage.setItem("mio-token", token);
    
    // Solo guardamos metadatos no sensibles o necesarios para el bootstrap
    // El resto de la info (nombre, email) debe vivir en memoria (Pinia)
    const sessionMeta = {
      uid: user.uid, // Necesario para identificar
      patient_id: user.patient_id, // Necesario para bootstrap de datos
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
