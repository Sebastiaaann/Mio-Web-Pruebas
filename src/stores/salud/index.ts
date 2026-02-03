/**
 * Store compuesta de Salud - Combina todos los stores de salud
 * @module stores/salud/index
 * 
 * NOTA: Se recomienda migrar gradualmente a usar los stores individuales:
 * - useControlesStore: Para controles y protocolos médicos
 * - useMedicionesStore: Para historial y últimas mediciones  
 * - useContenidoStore: Para videos educativos y campañas
 */

import { defineStore } from 'pinia'
import { computed } from 'vue'
import { logger } from '@/utils/logger'
import { useControlesStore } from './tiendaControles'
import { useMedicionesStore } from './tiendaMediciones'
import { useContenidoStore } from './tiendaContenido'
import type { Control, Medicion, Video, Campana, EstadoMedicion, HistorialMediciones } from '@/types/salud'

// Re-exports de stores individuales
export { useControlesStore, useTiendaControles } from './tiendaControles'
export { useMedicionesStore, useTiendaMediciones } from './tiendaMediciones'
export { useContenidoStore, useTiendaContenido } from './tiendaContenido'

/**
 * Store compuesta de Salud - Combina todos los stores de salud
 * Esta es la store legacy que mantiene compatibilidad con useHealthStore
 */
export const useHealthStore = defineStore('health', () => {
  // Composición de stores
  const controlesStore = useControlesStore()
  const medicionesStore = useMedicionesStore()
  const contenidoStore = useContenidoStore()

  // Estado expuesto de controles
  const controlesProximos = computed<Control[]>(() => controlesStore.controlesProximos)
  const controlesActivos = computed<Control[]>(() => controlesStore.controlesActivos)
  const tieneControlesPendientes = computed<boolean>(() => controlesStore.tieneControlesPendientes)
  const loading = computed<boolean>(() => controlesStore.cargando || medicionesStore.cargando)
  const error = computed<string | null>(() => controlesStore.error || medicionesStore.error)

  // Estado expuesto de mediciones
  const ultimaMedicion = computed<Medicion | null>(() => medicionesStore.ultimaMedicion)
  const historialMediciones = computed<HistorialMediciones>(() => medicionesStore.historialMediciones)
  const estadoSalud = computed<EstadoMedicion>(() => medicionesStore.estadoSalud)

  // Estado expuesto de contenido
  const videos = computed<Video[]>(() => contenidoStore.videos)
  const campanhas = computed<Campana[]>(() => contenidoStore.campanas)
  const campanas = computed<Campana[]>(() => contenidoStore.campanas) // Alias para compatibilidad

  // Control de carga
  const datosInicializados = computed<boolean>(() => 
    controlesStore.datosInicializados && 
    medicionesStore.datosInicializados &&
    contenidoStore.videosInicializados &&
    contenidoStore.campanasInicializadas
  )

  /**
   * Cargar todos los datos de salud
   * @returns Promise void
   */
  async function fetchAllHealthData(): Promise<void> {
    await Promise.all([
      controlesStore.fetchControles(),
      medicionesStore.fetchUltimaMedicion(),
      contenidoStore.fetchAllContent()
    ])

    // Cargar historial para cada control disponible
    if (controlesStore.controlesProximos.length > 0) {
      const historyPromises = controlesStore.controlesProximos.map((c: Control) => 
        medicionesStore.fetchHistorial(c.id)
      )
      await Promise.all(historyPromises)
    }

    logger.info('Todos los datos de salud cargados exitosamente')
  }

  /**
   * Cargar controles próximos
   * @returns Promise void
   */
  async function fetchControles(): Promise<void> {
    return controlesStore.fetchControles()
  }

  /**
   * Cargar última medición
   * @returns Promise void
   */
  async function fetchUltimaMedicion(): Promise<void> {
    return medicionesStore.fetchUltimaMedicion()
  }

  /**
   * Cargar videos educativos
   * @returns Promise void
   */
  async function fetchVideos(): Promise<void> {
    return contenidoStore.fetchVideos()
  }

  /**
   * Cargar campañas de salud
   * @returns Promise void
   */
  async function fetchCampanas(): Promise<void> {
    return contenidoStore.fetchCampanas()
  }

  /**
   * Cargar historial de un protocolo específico
   * @param protocolId - ID del protocolo
   * @returns Promise void
   */
  async function fetchHistorial(protocolId: string): Promise<void> {
    return medicionesStore.fetchHistorial(protocolId)
  }

  /**
   * Agregar nueva medición
   * @param controlId - ID del control
   * @param medicion - Datos de la medición
   * @returns void
   */
  function addMedicion(controlId: string, medicion: Medicion): void {
    return medicionesStore.addMedicion(controlId, medicion)
  }

  /**
   * Agregar nuevo control/medicion a la API
   * @param control - Datos del control a agregar
   * @returns Promise con el resultado
   */
  async function agregarControl(control: Control & { patient_id?: string | number; protocol_id?: number; value?: any; notes?: string }): Promise<{ success: boolean; error?: string }> {
    try {
      const { clienteApi } = await import('@/utils/clienteApi')
      
      // Preparar datos para la API
      const payload = {
        patient_id: control.patient_id,
        protocol_id: control.protocol_id,
        value: control.value,
        notes: control.notes,
        fecha: control.fechaProgramada || new Date().toISOString()
      }

      // Llamar a la API para guardar la medición
      const response = await clienteApi.post('/api/v1/observations', payload) as Record<string, any>
      
      if (response?.data) {
        // Recargar mediciones para actualizar la vista
        await medicionesStore.fetchUltimaMedicion()
        return { success: true }
      }
      
      return { success: false, error: 'Error al guardar la medición' }
    } catch (error) {
      console.error('Error agregando control:', error)
      return { 
        success: false, 
        error: (error as Error).message || 'Error al guardar la medición' 
      }
    }
  }

  /**
   * Actualizar medición
   * @param medicion - Nueva medición
   * @returns void
   */
  function actualizarMedicion(medicion: Medicion): void {
    return medicionesStore.actualizarMedicion(medicion)
  }

  /**
   * Inicializar datos mock
   * @returns void
   */
  function initMockData(): void {
    // Inicializar controles mock si no hay datos
    if (controlesStore.controlesProximos.length === 0) {
      controlesStore.controlesProximos = getMockControlesLegacy()
    }
    medicionesStore.initMockData()
    contenidoStore.initMockData()
  }

  /**
   * Forzar recarga de todos los datos
   * @returns Promise void
   */
  function forzarRecarga(): Promise<void> {
    controlesStore.forzarRecarga()
    medicionesStore.forzarRecarga()
    contenidoStore.forzarRecarga()
    return fetchAllHealthData()
  }

  /**
   * Resetear store a estado inicial
   * @returns void
   */
  function $reset(): void {
    controlesStore.$reset()
    medicionesStore.$reset()
    contenidoStore.$reset()
  }

  /**
   * Helper legacy para mock data
   * @returns Array de controles mock
   */
  function getMockControlesLegacy(): Control[] {
    return [
      {
        id: '1',
        nombre: 'Presión Arterial',
        descripcion: 'Control de presión sistólica y diastólica',
        icono: 'pi pi-heart',
        color: '#EF4444',
        fechaProgramada: null,
        estado: 'pendiente'
      },
      {
        id: '2',
        nombre: 'Peso Básico',
        descripcion: 'Control de peso corporal',
        icono: 'pi pi-chart-line',
        color: '#3B82F6',
        fechaProgramada: null,
        estado: 'pendiente'
      },
      {
        id: '3',
        nombre: 'Glicemia',
        descripcion: 'Medición de glucosa en sangre',
        icono: 'pi pi-bolt',
        color: '#10B981',
        fechaProgramada: null,
        estado: 'pendiente'
      }
    ]
  }

  return {
    // State
    controlesProximos,
    ultimaMedicion,
    historialMediciones,
    videos,
    campanhas,
    campanas,
    loading,
    error,
    datosInicializados,
    // Getters
    controlesActivos,
    tieneControlesPendientes,
    estadoSalud,
    // Actions
    fetchAllHealthData,
    fetchControles,
    fetchUltimaMedicion,
    fetchVideos,
    fetchCampanas,
    fetchHistorial,
    addMedicion,
    agregarControl,
    actualizarMedicion,
    initMockData,
    forzarRecarga,
    $reset
  }
})

// Alias para compatibilidad con código existente en español
export const useTiendaSalud = useHealthStore
