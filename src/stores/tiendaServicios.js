// stores/tiendaServicios.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { serviciosService } from '@/services/serviciosService';

/**
 * Store de Servicios - Maneja los servicios dinámicos del Home
 */
export const useTiendaServicios = defineStore('servicios', () => {
  // State
  const servicios = ref([]);
  const cargando = ref(false);
  const error = ref(null);
  const filtro = ref('');

  // Getters
  const serviciosFiltrados = computed(() => {
    if (!filtro.value) return servicios.value;
    
    const busqueda = filtro.value.toLowerCase();
    return servicios.value.filter(servicio => 
      servicio.nombre.toLowerCase().includes(busqueda) ||
      servicio.descripcion.toLowerCase().includes(busqueda)
    );
  });

  const serviciosActivos = computed(() => 
    servicios.value.filter(s => s.activo)
  );

  const totalServicios = computed(() => servicios.value.length);

  const hayServicios = computed(() => servicios.value.length > 0);

  // Actions

  /**
   * Cargar servicios disponibles
   */
  async function cargarServicios() {
    cargando.value = true;
    error.value = null;

    try {
      const resultado = await serviciosService.obtenerServicios();

      if (resultado.success) {
        // Manejar diferentes formatos de respuesta
        let listaServicios = resultado.servicios;
        
        // Si es un objeto, intentar extraer el array
        if (listaServicios && typeof listaServicios === 'object' && !Array.isArray(listaServicios)) {
          // Posibles claves donde podría estar el array
          listaServicios = listaServicios.data || listaServicios.items || listaServicios.services || [];
          console.log('📦 Formato de respuesta diferente, extrayendo:', listaServicios);
        }
        
        // Asegurar que es un array
        if (!Array.isArray(listaServicios)) {
          console.warn('⚠️ La respuesta de servicios no es un array, usando fallback');
          listaServicios = [];
        }
        
        // Ordenar si tiene la propiedad orden
        servicios.value = listaServicios.sort((a, b) => (a.orden || 0) - (b.orden || 0));

        if (import.meta.env.DEV) {
          console.log('✅ Servicios cargados:', servicios.value.length, servicios.value);
        }
      } else {
        error.value = resultado.error;
        console.error('❌ Error cargando servicios:', resultado.error);
      }
    } catch (e) {
      error.value = e.message || 'Error al cargar servicios';
      console.error('❌ Error en cargarServicios:', e);
    } finally {
      cargando.value = false;
    }
  }

  /**
   * Obtener servicio por ID
   * @param {number} id - ID del servicio
   */
  async function obtenerServicio(id) {
    try {
      const resultado = await serviciosService.obtenerServicioPorId(id);
      
      if (resultado.success) {
        return resultado.servicio;
      } else {
        console.error('❌ Error obteniendo servicio:', resultado.error);
        return null;
      }
    } catch (e) {
      console.error('❌ Error en obtenerServicio:', e);
      return null;
    }
  }

  /**
   * Establecer filtro de búsqueda
   * @param {string} texto - Texto a buscar
   */
  function establecerFiltro(texto) {
    filtro.value = texto;
  }

  /**
   * Limpiar filtro
   */
  function limpiarFiltro() {
    filtro.value = '';
  }

  /**
   * Limpiar error
   */
  function limpiarError() {
    error.value = null;
  }

  /**
   * Recargar servicios
   */
  async function recargarServicios() {
    await cargarServicios();
  }

  return {
    // State
    servicios,
    cargando,
    error,
    filtro,
    // Getters
    serviciosFiltrados,
    serviciosActivos,
    totalServicios,
    hayServicios,
    // Actions
    cargarServicios,
    obtenerServicio,
    establecerFiltro,
    limpiarFiltro,
    limpiarError,
    recargarServicios,
    // Alias en inglés para compatibilidad con HomeView
    serviciosDisponibles: serviciosActivos,
    cantidadServicios: totalServicios,
    hasServicios: hayServicios,
    fetchServicios: cargarServicios,
    loading: cargando
  };
});

// Alias para compatibilidad con código existente
export const useServiciosStore = useTiendaServicios;

