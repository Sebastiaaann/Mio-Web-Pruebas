import { logger } from '@/utils/logger';

const API_HOMA_URL = import.meta.env.VITE_API_HOMA_URL || "https://apihoma.homa.cl:7200";
const API_TIMEOUT = import.meta.env.VITE_API_TIMEOUT || 10000;

/**
 * Cliente API Centralizado
 * Maneja la inyección de tokens y control de errores para servicios HOMA.
 */
export const clienteApi = {
  /**
   * Obtiene el token de almacenamiento local sin dependencias circulares
   */
  _obtenerToken() {
    return localStorage.getItem("mio-token");
  },

  /**
   * Realiza una petición fetch inyectando el token de autenticación
   * @param {string} endpoint - Ruta relativa (ej: "/api/v1/patients/...")
   * @param {object} opciones - Opciones de fetch (method, body, headers...)
   */
  async request(endpoint, opciones = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
      const token = this._obtenerToken();
      
      const config = {
        ...opciones,
        headers: {
          "Content-Type": "application/json",
          ...opciones.headers,
        },
        signal: controller.signal // Permitir sobreescribir signal si se necesita
      };

      // Inyectar token si existe (HOMA usa X-API-KEY, no Authorization Bearer)
      if (token) {
        config.headers["X-API-KEY"] = token;
      }

      // Asegurar URL completa
      const url = endpoint.startsWith("http") ? endpoint : `${API_HOMA_URL}${endpoint}`;

      const response = await fetch(url, config);

      clearTimeout(timeoutId);

      // Manejo centralizado de errores 401 (Token Expirado)
      if (response.status === 401) {
        // Opcional: Disparar evento de logout global si se desea
        window.dispatchEvent(new CustomEvent('auth:session-expired'));
        throw new Error("Sesión expirada");
      }

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.error || `Error ${response.status}: ${response.statusText}`);
      }

      // Si no hay contenido (204 No Content), devolver null
      if (response.status === 204) return null;

      return await response.json();

    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === "AbortError") {
        logger.error(`Timeout en petición a ${endpoint}`);
        throw new Error("La solicitud tardó demasiado. Verifique su conexión.");
      }
      
      logger.error(`Error API en ${endpoint}:`, error);
      throw error;
    }
  },

  // Helpers sintácticos
  get(endpoint) {
    return this.request(endpoint, { method: "GET" });
  },

  post(endpoint, body) {
    return this.request(endpoint, { 
      method: "POST", 
      body: JSON.stringify(body) 
    });
  },

  put(endpoint, body) {
    return this.request(endpoint, { 
      method: "PUT", 
      body: JSON.stringify(body) 
    });
  },

  delete(endpoint) {
    return this.request(endpoint, { method: "DELETE" });
  }
};
