import { authService } from './authService';
import { logger } from '@/utils/logger';

const API_HOMA_URL = import.meta.env.VITE_API_HOMA_URL || "https://apihoma.homa.cl:7200";
const API_TIMEOUT = import.meta.env.VITE_API_TIMEOUT || 10000;

/**
 * Helper: Crear fetch con timeout automático (DRY principle)
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

/**
 * Helper: Construir headers comunes (DRY principle)
 * @private
 */
const construirHeadersComunes = () => ({
  "Content-Type": "application/json",
  "X-API-KEY": authService.obtenerToken()
});

export const pacienteService = {
  /**
   * Obtener perfil completo del paciente
   * @param {number|string} patientId 
   * @returns {Promise<{success: boolean, paciente?: object, error?: string}>}
   */
  async obtenerPerfil(patientId) {
    // Guard clause para validación temprana
    if (!patientId) {
      return { success: false, error: "ID de paciente no proporcionado" };
    }

    const { controller, timeoutId, fetch: peticion } = crearFetchConTimeout(
      `${API_HOMA_URL}/api/v1/patients/${patientId}`,
      {
        method: "GET",
        headers: construirHeadersComunes()
      }
    );

    try {
      const respuesta = await peticion;
      clearTimeout(timeoutId);

      // Guard clause para sesión expirada
      if (respuesta.status === 401) {
        return { success: false, error: "Sesión expirada" };
      }

      if (!respuesta.ok) {
        throw new Error(`Error ${respuesta.status}`);
      }

      const datos = await respuesta.json();
      const pacienteData = this._extraerDatosPaciente(datos);

      return { success: true, paciente: pacienteData };

    } catch (error) {
      logger.error("Error obteniendo perfil:", error);
      return { 
        success: false, 
        error: "No se pudo cargar el perfil del usuario. Por favor intente más tarde." 
      };
    }
  },

  /**
   * Extraer datos del paciente de estructura anidada (SRP)
   * @private
   */
  _extraerDatosPaciente(datos) {
    // Extracción robusta del perfil (API real devuelve data.data.patient[0])
    if (datos.data?.patient?.[0]) {
      return datos.data.patient[0];
    }
    
    if (datos.data && !Array.isArray(datos.data)) {
      return datos.data;
    }
    
    return datos;
  },

  /**
   * Obtener planes del paciente (Plan Actual)
   */
  async obtenerPlanes(patientId) {
    const { controller, timeoutId, fetch: peticion } = crearFetchConTimeout(
      `${API_HOMA_URL}/api/v1/patients/plans/${patientId}`,
      {
        method: "GET",
        headers: construirHeadersComunes()
      }
    );
    
    try {
      const respuesta = await peticion;
      clearTimeout(timeoutId);
      
      if (respuesta.ok) {
        const datos = await respuesta.json();
        
        // Manejar múltiples estructuras de respuesta
        // Estructura 1: { success: true, data: { plans: [...] } }
        if (datos.success && datos.data?.plans) {
          return {
            success: true,
            data: datos.data
          };
        }
        // Estructura 2: { plans: [...] }
        else if (datos.plans) {
          return {
            success: true,
            planes: datos.plans
          };
        }
        // Estructura 3: respuesta directa es array
        else if (Array.isArray(datos)) {
          return {
            success: true,
            planes: datos
          };
        }
        
        return { success: true, data: datos };
      }
      
      return { success: false, error: "Error al cargar planes" };
    } catch (error) {
      logger.error("Error obteniendo planes:", error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Obtener más planes disponibles (Marketplace)
   */
  async obtenerMasPlanes(patientId) {
    const { controller, timeoutId, fetch: peticion } = crearFetchConTimeout(
      `${API_HOMA_URL}/api/v1/patients/more_plans/${patientId}`,
      {
        method: "GET",
        headers: construirHeadersComunes()
      }
    );
    
    try {
      const respuesta = await peticion;
      clearTimeout(timeoutId);
      
      logger.info(`[obtenerMasPlanes] Status: ${respuesta.status}, URL: ${API_HOMA_URL}/api/v1/patients/more_plans/${patientId}`);
      
      // Verificar Content-Type antes de parsear
      const contentType = respuesta.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        logger.error(`[obtenerMasPlanes] Content-Type inválido: ${contentType}`);
        const textoRespuesta = await respuesta.text();
        logger.error(`[obtenerMasPlanes] Respuesta recibida: ${textoRespuesta.substring(0, 200)}`);
        return { 
          success: false, 
          error: `El endpoint devolvió ${contentType} en lugar de JSON` 
        };
      }
      
      if (respuesta.ok) {
        const datos = await respuesta.json();
        
        logger.info('[obtenerMasPlanes] Datos recibidos:', datos);
        
        // Manejar ambas estructuras de respuesta:
        // 1. Nueva: { success: true, data: { plans: [...] } }
        // 2. Antigua: { plans: [...] }
        if (datos.data && datos.data.plans) {
          return { 
            success: true, 
            data: datos.data
          };
        } else if (datos.plans) {
          return { 
            success: true, 
            plans: datos.plans 
          };
        }
        
        return { success: true, data: datos };
      }
      
      logger.error(`[obtenerMasPlanes] Error HTTP ${respuesta.status}`);
      return { success: false, error: `Error ${respuesta.status} al cargar más planes` };
    } catch (error) {
      logger.error("Error obteniendo más planes:", error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Obtener campañas de salud del paciente
   * @param {number|string} patientId 
   */
  async obtenerCampanas(patientId) {
    // Guard clause
    if (!patientId) {
      return { success: false, error: "ID de paciente no proporcionado" };
    }

    const { controller, timeoutId, fetch: peticion } = crearFetchConTimeout(
      `${API_HOMA_URL}/api/v1/patients/${patientId}/campaigns`,
      {
        method: "GET",
        headers: construirHeadersComunes()
      }
    );

    try {
      const respuesta = await peticion;
      clearTimeout(timeoutId);

      // Guard clause para error HTTP
      if (!respuesta.ok) {
        logger.error(`Error HTTP ${respuesta.status} al obtener campañas`);
        throw new Error(`Error ${respuesta.status}`);
      }

      // Validar content-type
      const esJSON = this._validarRespuestaJSON(respuesta);
      if (!esJSON) {
        const texto = await respuesta.text();
        logger.error(`Respuesta no-JSON: ${texto.substring(0, 200)}`);
        throw new Error('Respuesta del servidor no es JSON válido');
      }

      const datos = await respuesta.json();
      const campanas = this._extraerCampanas(datos);

      return { success: true, campanas };

    } catch (error) {
      logger.error("Error obteniendo campañas:", error);
      return { 
        success: false, 
        error: "No se pudieron cargar las campañas. Por favor intente más tarde." 
      };
    }
  },

  /**
   * Obtener material audiovisual del paciente
   * @param {number|string} patientId
   */
  async obtenerMaterialAudiovisual(patientId) {
    if (!patientId) {
      return { success: false, error: "ID de paciente no proporcionado" };
    }

    const { timeoutId, fetch: peticion } = crearFetchConTimeout(
      `${API_HOMA_URL}/api/v1/patients/material_audiovisual/${patientId}`,
      {
        method: "GET",
        headers: construirHeadersComunes()
      }
    );

    try {
      const respuesta = await peticion;
      clearTimeout(timeoutId);

      if (!respuesta.ok) {
        logger.error(`Error HTTP ${respuesta.status} al obtener material audiovisual`);
        throw new Error(`Error ${respuesta.status}`);
      }

      if (!this._validarRespuestaJSON(respuesta)) {
        const texto = await respuesta.text();
        logger.error(`Respuesta no-JSON: ${texto.substring(0, 200)}`);
        throw new Error('Respuesta del servidor no es JSON válido');
      }

      const datos = await respuesta.json();
      const items = this._extraerMaterialAudiovisual(datos);

      return { success: true, items };
    } catch (error) {
      logger.error("Error obteniendo material audiovisual:", error);
      return {
        success: false,
        error: "No se pudo cargar el material audiovisual. Por favor intente más tarde."
      };
    }
  },

  /**
   * Validar que la respuesta sea JSON (SRP)
   * @private
   */
  _validarRespuestaJSON(respuesta) {
    const contentType = respuesta.headers.get('content-type');
    return contentType && contentType.includes('application/json');
  },

  /**
   * Extraer campañas de estructura anidada (SRP)
   * Soporta múltiples formatos de API
   * @private
   */
  _extraerCampanas(datos) {
    // Priorizar estructuras comunes
    if (datos.data?.campaigns) {
      logger.info(`Campañas desde data.campaigns: ${datos.data.campaigns.length}`);
      return datos.data.campaigns;
    }
    
    if (datos.campaigns) {
      logger.info(`Campañas desde campaigns: ${datos.campaigns.length}`);
      return datos.campaigns;
    }
    
    if (Array.isArray(datos.data)) {
      logger.info(`Campañas desde data array: ${datos.data.length}`);
      return datos.data;
    }
    
    if (Array.isArray(datos)) {
      logger.info(`Campañas desde raíz: ${datos.length}`);
      return datos;
    }
    
    logger.warn('Estructura de campañas no reconocida');
    return [];
  },
  /**
   * Extraer material audiovisual de estructura anidada (SRP)
   * @private
   */
  _extraerMaterialAudiovisual(datos) {
    if (datos.data?.material_audiovisual) return datos.data.material_audiovisual;
    if (datos.data?.material) return datos.data.material;
    if (datos.data?.audiovisual) return datos.data.audiovisual;
    if (datos.data?.items) return datos.data.items;
    if (datos.material_audiovisual) return datos.material_audiovisual;
    if (datos.material) return datos.material;
    if (datos.audiovisual) return datos.audiovisual;
    if (datos.items) return datos.items;
    if (Array.isArray(datos.data)) return datos.data;
    if (Array.isArray(datos)) return datos;

    logger.warn('Estructura de material audiovisual no reconocida');
    return [];
  }
};
