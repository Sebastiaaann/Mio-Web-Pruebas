import { defineStore } from 'pinia'
import { ref } from 'vue'
import { pacienteService } from '@/services/pacienteService'
import { logger } from '@/utils/logger'

interface CampanaNormalizada {
  id: string | number
  nombre: string
  name: string
  descripcion: string
  description: string
  imagenUrl: string
  logo: string
  url: string
  urlLink: string
  surveyUrl: string
  surveyId: string | number | null
  activa: boolean
  active: boolean
  fechaInicio: string | null
  fechaFin: string | null
  tipo: string
}

export const useTiendaCampanas = defineStore('tiendaCampanas', () => {
  // State
  const campanas = ref<CampanaNormalizada[]>([])
  const cargando = ref(false)
  const error = ref<string | null>(null)
  const todasLasCampanas = ref<CampanaNormalizada[]>([])
  const cargandoTodas = ref(false)
  const errorTodas = ref<string | null>(null)

  // Actions
  async function cargarCampanas(): Promise<void> {
    // Obtener patient_id de localStorage (mismo metodo que tiendaSalud.js)
    const sessionMeta = localStorage.getItem('mio-session-meta')
    const token = localStorage.getItem('mio-token')

    if (!sessionMeta || !token) {
      logger.warn('No hay sesión activa, no se pueden cargar campañas')
      return
    }

    let patientId: string | number | undefined
    try {
      const { patient_id } = JSON.parse(sessionMeta) as { patient_id?: string | number }
      patientId = patient_id
    } catch (e) {
      logger.error('Error al parsear session-meta:', e)
      return
    }

    if (!patientId) {
      logger.warn('No hay patient_id en session-meta')
      return
    }

    cargando.value = true
    error.value = null

    try {
      const res = await pacienteService.obtenerCampanas(patientId)
      if (res.success && res.campanas) {
        campanas.value = res.campanas.map((c: any, index: number) => ({
          id: c.id || c.campaign_id || `campana-${index}`,
          nombre: c.name || c.nombre || 'Campaña de Salud',
          name: c.name || c.nombre || 'Campaña de Salud',
          descripcion: c.description || c.descripcion || '',
          description: c.description || c.descripcion || '',
          imagenUrl: c.logo ? (c.logo.startsWith('data:') ? c.logo : `data:image/png;base64,${c.logo}`) : '',
          logo: c.logo || '',
          url: c.url_link || c.survey_url || c.url || '#',
          urlLink: c.url_link || '',
          surveyUrl: c.survey_url || '',
          surveyId: c.survey_id || null,
          activa: c.active !== undefined ? c.active : true,
          active: c.active !== undefined ? c.active : true,
          fechaInicio: c.start_date || c.fecha_inicio || null,
          fechaFin: c.end_date || c.fecha_fin || null,
          tipo: c.type || c.tipo || 'salud'
        }))
        logger.info(`✅ Campañas cargadas: ${campanas.value.length}`, campanas.value)
      } else {
        logger.warn('No se encontraron campañas o falló la carga:', res.error)
        error.value = res.error || 'No hay campañas disponibles'
        campanas.value = []
      }
    } catch (err) {
      logger.error('Error en cargarCampanas store:', err)
      error.value = 'Error al cargar campañas'
      campanas.value = []
    } finally {
      cargando.value = false
    }
  }

  async function cargarTodasLasCampanas(): Promise<void> {
    cargandoTodas.value = true
    errorTodas.value = null

    try {
      const res = await pacienteService.obtenerTodasLasCampanas()
      if (res.success && res.campanas) {
        todasLasCampanas.value = res.campanas.map((c: any, index: number) => ({
          id: c.id || c.campaign_id || `campana-${index}`,
          nombre: c.name || c.nombre || 'Campaña de Salud',
          name: c.name || c.nombre || 'Campaña de Salud',
          descripcion: c.description || c.descripcion || '',
          description: c.description || c.descripcion || '',
          imagenUrl: c.logo ? (c.logo.startsWith('data:') ? c.logo : `data:image/png;base64,${c.logo}`) : '',
          logo: c.logo || '',
          url: c.url_link || c.survey_url || c.url || '#',
          urlLink: c.url_link || '',
          surveyUrl: c.survey_url || '',
          surveyId: c.survey_id || null,
          activa: c.active !== undefined ? c.active : true,
          active: c.active !== undefined ? c.active : true,
          fechaInicio: c.start_date || c.fecha_inicio || null,
          fechaFin: c.end_date || c.fecha_fin || null,
          tipo: c.type || c.tipo || 'salud'
        }))
        logger.info(`✅ Todas las campañas cargadas: ${todasLasCampanas.value.length}`)
      } else {
        logger.warn('No se encontraron campañas o falló la carga:', res.error)
        errorTodas.value = res.error || 'No hay campañas disponibles'
        todasLasCampanas.value = []
      }
    } catch (err) {
      logger.error('Error en cargarTodasLasCampanas store:', err)
      errorTodas.value = 'Error al cargar campañas'
      todasLasCampanas.value = []
    } finally {
      cargandoTodas.value = false
    }
  }

  function $reset(): void {
    campanas.value = []
    cargando.value = false
    error.value = null
    todasLasCampanas.value = []
    cargandoTodas.value = false
    errorTodas.value = null
  }

  return {
    campanas,
    cargando,
    error,
    todasLasCampanas,
    cargandoTodas,
    errorTodas,
    cargarCampanas,
    cargarTodasLasCampanas,
    $reset
  }
})
