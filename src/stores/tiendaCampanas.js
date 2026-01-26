import { defineStore } from 'pinia';
import { pacienteService } from '@/services/pacienteService';
import { logger } from '@/utils/logger';

export const useTiendaCampanas = defineStore('tiendaCampanas', {
  state: () => ({
    campanas: [],
    cargando: false,
    error: null
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
          this.campanas = res.campanas.map((c, index) => ({
            id: c.id || c.campaign_id || index.toString(),
            name: c.name || c.titulo || 'Campaña de Salud',
            titulo: c.name || c.titulo || 'Campaña de Salud',
            description: c.description || c.descripcion || '',
            descripcion: c.description || c.descripcion || '',
            // El logo viene en base64 en el campo 'logo'
            image: c.logo || c.image_url || c.imagen || '',
            imagen: c.logo || c.image_url || c.imagen || '',
            logo: c.logo || '',
            // La URL puede estar en url_link o survey_url
            url: c.url_link || c.survey_url || c.url || '#',
            link: c.url_link || c.survey_url || c.link || '#',
            survey_url: c.survey_url || '',
            survey_id: c.survey_id || null,
            active: c.active !== undefined ? c.active : true,
            activa: c.active !== undefined ? c.active : true
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
    }
  }
});
