/**
 * Servicio de Servicios Dinámicos
 * Maneja los servicios disponibles para el usuario en el Home
 * TODO: Actualizar endpoints cuando Cristobal confirme
 */

const API_URL = import.meta.env.VITE_API_URL || "https://workflows.homa.cl";
const API_TIMEOUT = import.meta.env.VITE_API_TIMEOUT || 10000;

// MODO DESARROLLO: Cambiar a false cuando tengas el backend real
const USE_MOCK = true;

// Mock data - Servicios de ejemplo
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
  {
    id: 2,
    nombre: "Dashboard Preventivo",
    descripcion: "Monitoreo preventivo de salud",
    icono: "pi pi-shield",
    color: "#10B981",
    ruta: "/dashboard-preventive",
    activo: true,
    orden: 2
  },
  {
    id: 3,
    nombre: "Dashboard Bento",
    descripcion: "Vista de tarjetas organizadas",
    icono: "pi pi-th-large",
    color: "#F59E0B",
    ruta: "/dashboard-bento",
    activo: true,
    orden: 3
  },
  {
    id: 4,
    nombre: "Controles",
    descripcion: "Gestión de controles médicos",
    icono: "pi pi-calendar-plus",
    color: "#EF4444",
    ruta: "/controles",
    activo: true,
    orden: 4
  },
  {
    id: 5,
    nombre: "Mediciones",
    descripcion: "Registro de mediciones",
    icono: "pi pi-heart",
    color: "#EC4899",
    ruta: "/mediciones",
    activo: true,
    orden: 5
  },
  {
    id: 6,
    nombre: "Mensajes",
    descripcion: "Centro de mensajes",
    icono: "pi pi-envelope",
    color: "#3B82F6",
    ruta: "/mensajes",
    activo: true,
    orden: 6
  },
  {
    id: 7,
    nombre: "Recursos",
    descripcion: "Material educativo",
    icono: "pi pi-book",
    color: "#14B8A6",
    ruta: "/recursos",
    activo: true,
    orden: 7
  },
  {
    id: 8,
    nombre: "Ayuda",
    descripcion: "Centro de ayuda",
    icono: "pi pi-question-circle",
    color: "#6366F1",
    ruta: "/ayuda",
    activo: true,
    orden: 8
  }
];

export const serviciosService = {
  /**
   * Obtener servicios disponibles para el usuario
   * @returns {Promise<{success: boolean, servicios?: array, error?: string}>}
   */
  async obtenerServicios() {
    if (USE_MOCK) {
      // MOCK: Simular llamada a API
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            servicios: MOCK_SERVICIOS.filter(s => s.activo)
          });
        }, 600); // Simular latencia de red
      });
    }

    // PRODUCCIÓN: Llamada real a API
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
      // TODO: Confirmar endpoint exacto con Cristobal
      const response = await fetch(`${API_URL}/servicios`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("mio-token")}`
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.message || `Error ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      return {
        success: true,
        servicios: data.servicios || data,
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
   * Obtener un servicio específico por ID
   * @param {number} id - ID del servicio
   * @returns {Promise<{success: boolean, servicio?: object, error?: string}>}
   */
  async obtenerServicioPorId(id) {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const servicio = MOCK_SERVICIOS.find(s => s.id === id);
          if (servicio) {
            resolve({ success: true, servicio });
          } else {
            resolve({ success: false, error: "Servicio no encontrado" });
          }
        }, 300);
      });
    }

    // TODO: Implementar cuando Cristobal confirme endpoint
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
      const response = await fetch(`${API_URL}/servicios/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("mio-token")}`
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.message || "Servicio no encontrado",
        };
      }

      const data = await response.json();
      return {
        success: true,
        servicio: data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Error de conexión",
      };
    }
  }
};
