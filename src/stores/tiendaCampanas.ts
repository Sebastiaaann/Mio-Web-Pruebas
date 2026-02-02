import { defineStore } from 'pinia'
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

export const useTiendaCampanas = defineStore('tiendaCampanas', {
  state: () => ({
    campanas: [] as CampanaNormalizada[],
    cargando: false,
    error: null as string | null,
    todasLasCampanas: [] as CampanaNormalizada[],
    cargandoTodas: false,
    errorTodas: null as string | null
  }),

  actions: {
    async cargarCampanas(): Promise<void> {
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

      this.cargando = true
      this.error = null

      try {
        const res = await pacienteService.obtenerCampanas(patientId)
        if (res.success && res.campanas) {
          this.campanas = res.campanas.map((c: any, index: number) => ({
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
          logger.info(`✅ Campañas cargadas: ${this.campanas.length}`, this.campanas)
        } else {
          logger.warn('No se encontraron campañas o falló la carga:', res.error)
          this.error = res.error || 'No hay campañas disponibles'
          this.campanas = []
        }
      } catch (err) {
        logger.error('Error en cargarCampanas store:', err)
        this.error = 'Error al cargar campañas'
        this.campanas = []
      } finally {
        this.cargando = false
      }
    },

    async cargarTodasLasCampanas(): Promise<void> {
      this.cargandoTodas = true
      this.errorTodas = null

      try {
        const res = await pacienteService.obtenerTodasLasCampanas()
        if (res.success && res.campanas) {
          this.todasLasCampanas = res.campanas.map((c: any, index: number) => ({
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
          logger.info(`✅ Todas las campañas cargadas: ${this.todasLasCampanas.length}`)
        } else {
          logger.warn('No se encontraron campañas o falló la carga:', res.error)
          this.errorTodas = res.error || 'No hay campañas disponibles'
          this.todasLasCampanas = []
        }
      } catch (err) {
        logger.error('Error en cargarTodasLasCampanas store:', err)
        this.errorTodas = 'Error al cargar campañas'
        this.todasLasCampanas = []
      } finally {
        this.cargandoTodas = false
      }
    },

    $reset(): void {
      this.campanas = []
      this.cargando = false
      this.error = null
      this.todasLasCampanas = []
      this.cargandoTodas = false
      this.errorTodas = null
    }
  }
})
