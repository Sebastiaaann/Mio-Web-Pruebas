import { authService } from './authService';
import { logger } from '@/utils/logger';

const API_HOMA_URL = import.meta.env.VITE_API_HOMA_URL || "https://apihoma.homa.cl:7200";
const API_TIMEOUT = import.meta.env.VITE_API_TIMEOUT || 10000;

export const pacienteService = {
  /**
   * Obtener perfil completo del paciente
   * @param {number|string} patientId 
   * @returns {Promise<{success: boolean, paciente?: object, error?: string}>}
   */
  async obtenerPerfil(patientId) {
    if (!patientId) {
        return { success: false, error: "ID de paciente no proporcionado" };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
      const response = await fetch(`${API_HOMA_URL}/api/v1/patients/${patientId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authService.obtenerToken()}`
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 401) {
            return { success: false, error: "Sesión expirada" };
        }
        throw new Error(`Error ${response.status}`);
      }

      const data = await response.json();

      return {
        success: true,
        paciente: data
      };

    } catch (error) {
      logger.error("Error obteniendo perfil:", error);
      return { 
        success: false, 
        error: "No se pudo cargar el perfil del usuario. Por favor intente más tarde." 
      };
    }
  }
};
