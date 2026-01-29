import { clienteApi } from '@/utils/clienteApi';
import { logger } from '@/utils/logger';

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

    try {
      const datos = await clienteApi.get(`/api/v1/patients/${patientId}`);
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
    try {
      const datos = await clienteApi.get(`/api/v1/patients/plans/${patientId}`);
      
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
    } catch (error) {
      logger.error("Error obteniendo planes:", error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Obtener más planes disponibles (Marketplace)
   */
  async obtenerMasPlanes(patientId) {
    try {
      const datos = await clienteApi.get(`/api/v1/patients/more_plans/${patientId}`);
      
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
    } catch (error) {
      logger.error("Error obteniendo más planes:", error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Obtener servicios del paciente
   * @param {number|string} patientId 
   */
  async obtenerServicios(patientId) {
    if (!patientId) {
      return { success: false, error: "ID de paciente no proporcionado" };
    }

    try {
      const datos = await clienteApi.get(`/api/v1/patients/${patientId}/services`);
      
      // Manejar múltiples estructuras de respuesta
      if (datos.success && datos.data?.services) {
        return {
          success: true,
          data: datos.data
        };
      } else if (datos.services) {
        return {
          success: true,
          servicios: datos.services
        };
      } else if (Array.isArray(datos)) {
        return {
          success: true,
          servicios: datos
        };
      }
      
      return { success: true, data: datos };
    } catch (error) {
      logger.error("Error obteniendo servicios:", error);
      return { 
        success: false, 
        error: "No se pudieron cargar los servicios. Por favor intente más tarde." 
      };
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

    try {
      const datos = await clienteApi.get(`/api/v1/patients/${patientId}/campaigns`);
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

    try {
      const datos = await clienteApi.get(`/api/v1/patients/material_audiovisual/${patientId}`);
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
   * Actualizar perfil del paciente
   * @param {number|string} patientId
   * @param {object} datos - Datos a actualizar
   */
  async actualizarPerfil(patientId, datos) {
    if (!patientId) {
      return { success: false, error: "ID de paciente no proporcionado" };
    }

    try {
      const respuesta = await clienteApi.put(`/api/v1/patients/${patientId}`, datos);
      
      return { success: true, data: respuesta };
    } catch (error) {
      logger.error("Error actualizando perfil:", error);
      return {
        success: false,
        error: "No se pudo actualizar el perfil. Por favor intente más tarde."
      };
    }
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
  },

  /**
   * Obtener todas las campañas disponibles (endpoint /api/v1/campaigns/all)
   * @returns {Promise<{success: boolean, campanas?: array, error?: string}>}
   */
  async obtenerTodasLasCampanas() {
    try {
      const datos = await clienteApi.get('/api/v1/campaigns/all');
      const campanas = this._extraerCampanas(datos);

      return { success: true, campanas };

    } catch (error) {
      logger.error("Error obteniendo todas las campañas:", error);
      return { 
        success: false, 
        error: "No se pudieron cargar las campañas. Por favor intente más tarde." 
      };
    }
  }
};
