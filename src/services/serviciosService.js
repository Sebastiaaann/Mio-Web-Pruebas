/**
 * Servicio de Servicios Dinámicos
 * Maneja los servicios disponibles para el usuario en el Home
 * TODO: Actualizar endpoints cuando Cristobal confirme
 */

import { authService } from './authService';

const API_HOMA_URL = import.meta.env.VITE_API_HOMA_URL || "https://apihoma.homa.cl:7200";
const API_TIMEOUT = import.meta.env.VITE_API_TIMEOUT || 10000;

// MODO DESARROLLO: Cambiar a false para usar backend real
const USE_MOCK = false;

// Mock data para fallback
const MOCK_SERVICIOS = [
  {
    id: 1,
    nombre: "Dashboard",
    descripcion: "Panel principal de salud",
    icono: "pi pi-chart-line",
    color: "#8B5CF6",
    ruta: "/dashboard",
    activo: true,
    orden: 1
  },
  // ... resto de mocks se mantienen igual si quieres, o se simplifica
];

export const serviciosService = {
  /**
   * Obtener servicios disponibles para el usuario
   * @returns {Promise<{success: boolean, servicios?: array, error?: string}>}
   */
  async obtenerServicios() {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            servicios: MOCK_SERVICIOS
          });
        }, 600);
      });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
      const user = authService.obtenerUsuario();
      if (!user || !user.patient_id) {
        throw new Error("No hay información de paciente disponible");
      }

      // Endpoint real: GET /api/v1/patients/{patient_id}/services
      const response = await fetch(`${API_HOMA_URL}/api/v1/patients/${user.patient_id}/services`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // El token de autorización se obtuvo en el login de HOMA
          "X-API-KEY": authService.obtenerToken()
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Extracción robusta del array de servicios
      let servicesArray = [];
      if (Array.isArray(data)) {
          servicesArray = data;
      } else if (Array.isArray(data.services)) {
          servicesArray = data.services;
      } else if (Array.isArray(data.servicios)) {
          servicesArray = data.servicios;
      } else if (data.data) {
          if (Array.isArray(data.data)) {
              servicesArray = data.data;
          } else if (Array.isArray(data.data.services)) {
              servicesArray = data.data.services;
          } else if (Array.isArray(data.data.servicios)) {
               servicesArray = data.data.servicios;
          }
      }
      
      // Normalización de datos (Mapping English API -> Spanish App Model)
      const serviciosNormalizados = servicesArray.map(s => {
        // Mapeo seguro de propiedades
        return {
            ...s, // Mantener propiedades originales
            // Mapeo a español que espera el frontend
            id: s.id,
            nombre: s.name || s.nombre || s.title || 'Servicio sin nombre',
            descripcion: s.description || s.descripcion || '',
            // Manejo de posición/orden
            orden: s.home_position ? parseInt(s.home_position, 10) : (s.orden || 99),
            // Activo por defecto si no viene
            activo: s.active !== undefined ? s.active : true,
            // Normalizar items/opciones si existen
            items: (s.options || s.items || []).map(opt => ({
                ...opt,
                nombre: opt.plan_name || opt.name || opt.nombre,
                titulo: opt.title || opt.titulo,
                descripcion: opt.description || opt.descripcion || opt.plan_description,
                tipo_mensaje: opt.type_message || opt.tipo_mensaje
            }))
        };
      });

      console.log('✅ Servicios extraídos y normalizados:', serviciosNormalizados.length);

      return {
        success: true,
        servicios: serviciosNormalizados,
      };

    } catch (error) {
      console.error("Error fetching services:", error);
      if (error.name === "AbortError") {
        return { success: false, error: "Tiempo de espera agotado" };
      }
      return { success: false, error: error.message || "Error de conexión" };
    }
  },

  /**
   * Obtener un servicio específico por ID
   * TODO: Revisar si la API tiene endpoint individual o filtramos de la lista
   */
  async obtenerServicioPorId(id) {
    // Por ahora filtramos de la lista completa para no hacer otra llamada si no es necesario
    // O implementamos llamada real si existe endpoint
    const resultado = await this.obtenerServicios();
    if (resultado.success && resultado.servicios) {
      const servicio = resultado.servicios.find(s => s.id === id || s.service_id === id);
      if (servicio) return { success: true, servicio };
    }
    return { success: false, error: "Servicio no encontrado" };
  }
};
