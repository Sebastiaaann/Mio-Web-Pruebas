// stores/tiendaServicios.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { serviciosService } from '@/services/serviciosService'
import { logger } from '@/utils/logger'
import type { ServicioNormalizado } from '@/types'

/**
 * Store de Servicios - Maneja los servicios dinámicos del Home
 */
export const useTiendaServicios = defineStore('servicios', () => {
  // State
  const servicios = ref<ServicioNormalizado[]>([])
  const cargando = ref(false)
  const error = ref<string | null>(null)
  const filtro = ref('')

  // Getters
  const serviciosFiltrados = computed(() => {
    if (!filtro.value) return servicios.value

    const busqueda = filtro.value.toLowerCase()
    return servicios.value.filter(servicio =>
      servicio.nombre.toLowerCase().includes(busqueda) ||
      servicio.descripcion.toLowerCase().includes(busqueda)
    )
  })

  const serviciosActivos = computed(() =>
    servicios.value.filter(s => s.activo)
  )

  const totalServicios = computed(() => servicios.value.length)

  const hayServicios = computed(() => servicios.value.length > 0)

  // Actions

  /**
   * Cargar servicios disponibles
   */
  async function cargarServicios(): Promise<void> {
    cargando.value = true
    error.value = null

    try {
      const resultado = await serviciosService.obtenerServicios()

      if (resultado.success) {
        // Manejar diferentes formatos de respuesta
        let listaServicios: ServicioNormalizado[] | Record<string, unknown> | null | undefined = resultado.servicios
        if (import.meta.env.DEV) {
          console.log('🔍 RAW Servicios response:', typeof listaServicios, Array.isArray(listaServicios))
        }

        // Si es un objeto, intentar extraer el array
        if (listaServicios && typeof listaServicios === 'object' && !Array.isArray(listaServicios)) {
          const raw = listaServicios as Record<string, unknown>
          listaServicios = (raw.data || raw.items || raw.services || []) as ServicioNormalizado[]
          if (import.meta.env.DEV) {
            console.log('📦 Formato de respuesta diferente, extrayendo:', listaServicios)
          }
        }

        // Asegurar que es un array
        if (!Array.isArray(listaServicios)) {
          console.warn('⚠️ La respuesta de servicios no es un array, usando fallback')
          listaServicios = []
        }

        // Ordenar si tiene la propiedad orden
        servicios.value = (listaServicios as ServicioNormalizado[]).sort(
          (a, b) => (a.orden || 0) - (b.orden || 0)
        )

        if (import.meta.env.DEV) {
          console.log('✅ Servicios cargados:', servicios.value.length)
        }
      } else {
        error.value = resultado.error || null
        logger.error('Error cargando servicios', new Error(resultado.error || 'Error desconocido'))
      }
    } catch (e) {
      error.value = (e as Error).message || 'Error al cargar servicios'
      logger.error('Error en cargarServicios', e)
    } finally {
      cargando.value = false
    }
  }

  /**
   * Obtener servicio por ID
   */
  async function obtenerServicio(id: number): Promise<ServicioNormalizado | null> {
    try {
      const resultado = await serviciosService.obtenerServicioPorId(id)

      if (resultado.success) {
        return resultado.servicio || null
      } else {
        logger.error('Error obteniendo servicio', new Error(resultado.error || 'Error desconocido'))
        return null
      }
    } catch (e) {
      logger.error('Error en obtenerServicio', e)
      return null
    }
  }

  /**
   * Establecer filtro de búsqueda
   */
  function establecerFiltro(texto: string): void {
    filtro.value = texto
  }

  /**
   * Limpiar filtro
   */
  function limpiarFiltro(): void {
    filtro.value = ''
  }

  /**
   * Limpiar error
   */
  function limpiarError(): void {
    error.value = null
  }

  /**
   * Recargar servicios
   */
  async function recargarServicios(): Promise<void> {
    await cargarServicios()
  }

  /**
   * Resetear store a estado inicial
   */
  function $reset(): void {
    servicios.value = []
    cargando.value = false
    error.value = null
    filtro.value = ''
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
    $reset,
    // Alias en inglés para compatibilidad con HomeView
    serviciosDisponibles: serviciosActivos,
    cantidadServicios: totalServicios,
    hasServicios: hayServicios,
    fetchServicios: cargarServicios,
    loading: cargando
  }
})

// Alias para compatibilidad con código existente
export const useServiciosStore = useTiendaServicios
