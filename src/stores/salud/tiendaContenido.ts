import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useTiendaUsuario } from '@/stores/tiendaUsuario'
import { useTiendaCampanas } from '@/stores/tiendaCampanas'
import { pacienteService } from '@/services/pacienteService'
import { logger } from '@/utils/logger'
import type { Video, Campana, CategoriaVideo } from '@/types/salud'

export const useContenidoStore = defineStore('contenido', () => {
  const videos = ref<Video[]>([])
  const campanas = ref<Campana[]>([])
  const cargandoVideos = ref(false)
  const cargandoCampanas = ref(false)
  const errorVideos = ref<string | null>(null)
  const errorCampanas = ref<string | null>(null)
  const videosInicializados = ref(false)
  const campanasInicializadas = ref(false)

  async function fetchVideos(): Promise<void> {
    cargandoVideos.value = true
    errorVideos.value = null
    try {
      const usuarioStore = useTiendaUsuario()
      const patientId = usuarioStore.usuario?.patient_id
      if (!patientId) {
        errorVideos.value = 'Paciente no disponible'
        return
      }

      const resultado = await pacienteService.obtenerMaterialAudiovisual(patientId)
      if (resultado.success && resultado.items) {
        videos.value = resultado.items.map((item, index) => ({
          id: String(item.id || `video-${index}`),
          titulo: item.titulo || item.title || 'Material audiovisual',
          descripcion: item.descripcion || item.description || '',
          thumbnailUrl: item.thumbnailUrl || '',
          videoUrl: item.videoUrl || item.url || '',
          duracion: (item as Record<string, unknown>).duracion as string
            || (item as Record<string, unknown>).duration as string
            || '',
          categoria: (item as Record<string, unknown>).categoria as CategoriaVideo | undefined
        }))
        logger.info(`Videos/material audiovisual cargados: ${videos.value.length}`)
      } else {
        logger.warn('No se encontró material audiovisual:', resultado.error)
        videos.value = []
      }
      videosInicializados.value = true
    } catch (e) {
      errorVideos.value = (e as Error).message
      logger.error('Error cargando videos:', (e as Error).message)
    } finally {
      cargandoVideos.value = false
    }
  }

  /**
   * Obtener campañas desde tiendaCampanas (fuente única)
   * Evita llamar al API duplicadamente — tiendaCampanas ya carga las campañas
   */
  async function fetchCampanas(): Promise<void> {
    cargandoCampanas.value = true
    errorCampanas.value = null
    try {
      const campanasStore = useTiendaCampanas()

      // Si tiendaCampanas aún no cargó, cargar primero
      if (campanasStore.campanas.length === 0 && !campanasStore.cargando) {
        await campanasStore.cargarCampanas()
      }

      // Mapear desde tiendaCampanas al formato de Campana de salud
      if (campanasStore.campanas.length > 0) {
        campanas.value = campanasStore.campanas.map((c) => ({
          id: String(c.id),
          nombre: c.nombre || c.name || 'Campaña de Salud',
          descripcion: c.descripcion || c.description || '',
          imagenUrl: c.imagenUrl || '',
          activa: c.activa !== undefined ? c.activa : true,
          url: c.url || c.urlLink || c.surveyUrl || null,
          fechaInicio: c.fechaInicio || null,
          fechaFin: c.fechaFin || null,
          logo: c.logo || null
        }))
        logger.info(`Campañas sincronizadas desde tiendaCampanas: ${campanas.value.length}`)
      } else if (campanasStore.error) {
        logger.warn('No se encontraron campañas:', campanasStore.error)
        errorCampanas.value = campanasStore.error
        campanas.value = []
      } else {
        campanas.value = []
      }
      campanasInicializadas.value = true
    } catch (e) {
      errorCampanas.value = (e as Error).message
      logger.error('Error sincronizando campañas:', (e as Error).message)
    } finally {
      cargandoCampanas.value = false
    }
  }

  async function fetchAllContent(): Promise<void> {
    await Promise.all([fetchVideos(), fetchCampanas()])
  }

  function initMockData(): void {
    videosInicializados.value = true
    campanasInicializadas.value = true
  }

  function forzarRecarga(): Promise<void> {
    return fetchAllContent()
  }

  function $reset(): void {
    videos.value = []
    campanas.value = []
    cargandoVideos.value = false
    cargandoCampanas.value = false
    errorVideos.value = null
    errorCampanas.value = null
    videosInicializados.value = false
    campanasInicializadas.value = false
  }

  return {
    videos,
    campanas,
    cargandoVideos,
    cargandoCampanas,
    errorVideos,
    errorCampanas,
    videosInicializados,
    campanasInicializadas,
    fetchVideos,
    fetchCampanas,
    fetchAllContent,
    initMockData,
    forzarRecarga,
    $reset
  }
})

export const useTiendaContenido = useContenidoStore
