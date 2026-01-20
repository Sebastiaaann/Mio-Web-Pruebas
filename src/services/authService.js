/**
 * Servicio de Autenticación
 * TODO: Actualizar endpoints cuando Cristobal confirme
 */

const API_URL = import.meta.env.VITE_API_URL || "https://workflows.homa.cl";
const API_TIMEOUT = import.meta.env.VITE_API_TIMEOUT || 10000;

// MODO DESARROLLO: Cambiar a false cuando tengas el backend real
const USE_MOCK = true;

export const authService = {
  /**
   * Login de usuario
   * @param {string} rut - RUT del usuario
   * @param {string} password - Contraseña
   * @returns {Promise<{success: boolean, token?: string, user?: object, error?: string}>}
   */
  async login(rut, password) {
    if (USE_MOCK) {
      // MOCK: Simular llamada a API
      return new Promise((resolve) => {
        setTimeout(() => {
          // Validación simple para desarrollo
          if (password === "demo123") {
            resolve({
              success: true,
              token: "mock-jwt-token-" + Date.now(),
              user: {
                id: 1,
                nombre: "Usuario",
                apellido: "Demo",
                rut: rut,
                email: "demo@mio.cl",
                rol: "user",
                avatar: null,
              },
            });
          } else {
            resolve({
              success: false,
              error: "Credenciales inválidas",
            });
          }
        }, 800); // Simular latencia de red
      });
    }

    // PRODUCCIÓN: Llamada real a API
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
      // TODO: Confirmar endpoint exacto con Cristobal
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rut, password }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error:
            errorData.message ||
            `Error ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      return {
        success: true,
        token: data.token,
        user: data.user,
      };
    } catch (error) {
      if (error.name === "AbortError") {
        return {
          success: false,
          error: "Tiempo de espera agotado",
        };
      }
      return {
        success: false,
        error: error.message || "Error de conexión",
      };
    }
  },

  /**
   * Registro de nuevo usuario
   * @param {object} userData - Datos del usuario
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async register(userData) {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            message: "Usuario registrado exitosamente",
          });
        }, 1000);
      });
    }

    // TODO: Implementar cuando Cristobal confirme endpoint
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.message || "Error en el registro",
        };
      }

      return {
        success: true,
        message: "Usuario registrado exitosamente",
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Error de conexión",
      };
    }
  },

  /**
   * Logout de usuario
   */
  logout() {
    localStorage.removeItem("mio-token");
    localStorage.removeItem("mio-user");
  },

  /**
   * Obtener token guardado
   */
  getToken() {
    return localStorage.getItem("mio-token");
  },

  /**
   * Verificar si está autenticado
   */
  isAuthenticated() {
    return !!this.getToken();
  },

  /**
   * Guardar sesión
   */
  saveSession(token, user) {
    localStorage.setItem("mio-token", token);
    localStorage.setItem("mio-user", JSON.stringify(user));
  },

  /**
   * Obtener usuario guardado
   */
  getUser() {
    const userStr = localStorage.getItem("mio-user");
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Restaurar sesión desde localStorage
   */
  restoreSession() {
    const token = this.getToken();
    const user = this.getUser();

    if (token && user) {
      return { token, user };
    }

    return null;
  },
};
