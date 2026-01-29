import { defineStore } from 'pinia';
import { pacienteService } from '@/services/pacienteService';
import { logger } from '@/utils/logger';

export const useTiendaCampanas = defineStore('tiendaCampanas', {
  state: () => ({
    campanas: [],
    cargando: false,
    error: null,
    todasLasCampanas: [],
    cargandoTodas: false,
    errorTodas: null
  }),

  actions: {
    async cargarCampanas() {
      // Obtener patient_id de localStorage (mismo método que tiendaSalud.js)
      const sessionMeta = localStorage.getItem("mio-session-meta");
      const token = localStorage.getItem("mio-token");

      if (!sessionMeta || !token) {
        logger.warn('No hay sesión activa, no se pueden cargar campañas');
        return;
      }

      let patientId;
      try {
        const { patient_id } = JSON.parse(sessionMeta);
        patientId = patient_id;
      } catch (e) {
        logger.error('Error al parsear session-meta:', e);
        return;
      }

      if (!patientId) {
        logger.warn('No hay patient_id en session-meta');
        return;
      }

      this.cargando = true;
      this.error = null;

      try {
        const res = await pacienteService.obtenerCampanas(patientId);
        if (res.success && res.campanas) {
          // Mapear campañas con todos los campos disponibles
          // La API de HOMA devuelve: id, name, description, logo (base64), url_link, survey_url, active
          this.campanas = res.campanas.map((c, index) => ({
            id: c.id || c.campaign_id || `campana-${index}`,
            nombre: c.name || c.nombre || 'Campaña de Salud',
            name: c.name || c.nombre || 'Campaña de Salud',
            descripcion: c.description || c.descripcion || '',
            description: c.description || c.descripcion || '',
            // El logo viene en base64 en el campo 'logo' desde la API de HOMA
            // Verificar si ya tiene el prefijo data: para evitar duplicarlo
            imagenUrl: c.logo ? (c.logo.startsWith('data:') ? c.logo : `data:image/png;base64,${c.logo}`) : '',
            logo: c.logo || '',
            // La URL puede estar en url_link o survey_url
            url: c.url_link || c.survey_url || c.url || '#',
            urlLink: c.url_link || '',
            surveyUrl: c.survey_url || '',
            surveyId: c.survey_id || null,
            activa: c.active !== undefined ? c.active : true,
            active: c.active !== undefined ? c.active : true,
            // Campos adicionales que pueden venir de la API
            fechaInicio: c.start_date || c.fecha_inicio || null,
            fechaFin: c.end_date || c.fecha_fin || null,
            tipo: c.type || c.tipo || 'salud'
          }));
          logger.info(`✅ Campañas cargadas: ${this.campanas.length}`, this.campanas);
        } else {
          logger.warn('No se encontraron campañas o falló la carga:', res.error);
          this.error = res.error || 'No hay campañas disponibles';
          this.campanas = [];
        }
      } catch (err) {
        logger.error('Error en cargarCampanas store:', err);
        this.error = 'Error al cargar campañas';
        this.campanas = [];
      } finally {
        this.cargando = false;
      }
    },

    async cargarTodasLasCampanas() {
      this.cargandoTodas = true;
      this.errorTodas = null;

      try {
        const res = await pacienteService.obtenerTodasLasCampanas();
        if (res.success && res.campanas) {
          this.todasLasCampanas = res.campanas.map((c, index) => ({
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
          }));
          logger.info(`✅ Todas las campañas cargadas: ${this.todasLasCampanas.length}`);
        } else {
          logger.warn('No se encontraron campañas o falló la carga:', res.error);
          this.errorTodas = res.error || 'No hay campañas disponibles';
          this.todasLasCampanas = [];
        }
      } catch (err) {
        logger.error('Error en cargarTodasLasCampanas store:', err);
        this.errorTodas = 'Error al cargar campañas';
        this.todasLasCampanas = [];
      } finally {
        this.cargandoTodas = false;
      }
    },

    $reset() {
      this.campanas = [];
      this.cargando = false;
      this.error = null;
      this.todasLasCampanas = [];
      this.cargandoTodas = false;
      this.errorTodas = null;
    }
  }
});
