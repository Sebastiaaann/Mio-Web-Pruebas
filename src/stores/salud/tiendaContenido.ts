import { defineStore } from 'pinia'
import { ref } from 'vue'
import { clienteApi } from '@/utils/clienteApi'
import type { Video, Campana } from '@/types/salud'

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
      // TODO: Endpoint real de videos
      videosInicializados.value = true
    } catch (e) {
      errorVideos.value = (e as Error).message
    } finally {
      cargandoVideos.value = false
    }
  }

  async function fetchCampanas(): Promise<void> {
    cargandoCampanas.value = true
    errorCampanas.value = null
    try {
      // TODO: Endpoint real de campañas
      campanasInicializadas.value = true
    } catch (e) {
      errorCampanas.value = (e as Error).message
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
