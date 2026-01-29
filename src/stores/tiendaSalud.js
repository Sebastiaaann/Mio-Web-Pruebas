// stores/tiendaSalud.js - Store de salud del usuario (Refactorizado)
import { defineStore } from 'pinia'
import { ref, shallowRef, computed } from 'vue'
import { logger } from '@/utils/logger'
import { clienteApi } from '@/utils/clienteApi'

const API_HOMA_URL = import.meta.env.VITE_API_HOMA_URL || "https://apihoma.homa.cl:7200"

/**
 * @typedef {Object} Medicion
 * @property {string} id
 * @property {string} tipo
 * @property {string|number} valor
 * @property {string} unidad
 * @property {string} fecha
 * @property {'normal'|'alerta'|'critico'|'na'} estado
 */

/**
 * @typedef {Object} Control
 * @property {string} id
 * @property {string} nombre
 * @property {string} descripcion
 * @property {string} icono
 * @property {string} color
 * @property {string|null} fechaProgramada
 * @property {'pendiente'|'completado'|'vencido'} estado
 */

/**
 * Helper: Extraer array de respuesta API con múltiples formatos posibles
 * @param {Object} data - Respuesta de la API
 * @param {Array<string>} paths - Rutas posibles donde puede estar el array
 * @returns {Array} Array extraído o array vacío
 */
function extraerArray(data, paths) {
  if (!data) return []
  if (Array.isArray(data)) return data
  
  for (const path of paths) {
    const parts = path.split('.')
    let current = data
    
    for (const part of parts) {
      if (current && typeof current === 'object') {
        current = current[part]
      } else {
        current = undefined
        break
      }
    }
    
    if (Array.isArray(current)) {
      return current
    }
  }
  
  return []
}

/**
 * Helper: Obtener metadata de sesión del localStorage
 * @returns {Object|null}
 */
function obtenerSessionMeta() {
  try {
    const sessionMeta = localStorage.getItem("mio-session-meta")
    return sessionMeta ? JSON.parse(sessionMeta) : null
  } catch (e) {
    logger.error('Error al parsear session meta:', e)
    return null
  }
}

/**
 * Helper: Realizar petición API con manejo de errores
 * @param {string} endpoint - Endpoint relativo
 * @returns {Promise<Object|null>}
 */
async function apiRequest(endpoint) {
  try {
    const sessionMeta = obtenerSessionMeta()
    if (!sessionMeta) {
      logger.warn('No hay sesión activa')
      return null
    }

    return await clienteApi.get(endpoint)
  } catch (error) {
    logger.error(`Error en API request (${endpoint}):`, error)
    return null
  }
}

export const useHealthStore = defineStore('health', () => {
  // State
  /** @type {import('vue').Ref<Medicion|null>} */
  const ultimaMedicion = ref(null)

  /** @type {import('vue').Ref<Control[]>} */
  const controlesProximos = ref([])

  /** @type {import('vue').Ref<Array>} */
  const campanhas = ref([])

  /** @type {import('vue').Ref<Array>} */
  const videos = ref([])

  const loading = ref(false)
  const error = ref(null)
  
  // Control de carga para evitar llamadas duplicadas
  const datosInicializados = ref(false)
  const promesaCargaEnCurso = ref(null)

  // shallowRef para datos grandes que no necesitan reactividad profunda
  /** @type {import('vue').ShallowRef<Record<string, Medicion[]>>} */
  const historialMediciones = shallowRef({})

  // Getters
  const controlesActivos = computed(() =>
    controlesProximos.value.filter(c => c.estado === 'pendiente')
  )

  const tieneControlesPendientes = computed(() =>
    controlesActivos.value.length > 0
  )

  const estadoSalud = computed(() =>
    ultimaMedicion.value?.estado || 'na'
  )

  // Actions

  /**
   * Agregar nueva medición al historial
   * @param {string} controlId 
   * @param {Medicion} medicion 
   */
  function addMedicion(controlId, medicion) {
    if (!historialMediciones.value[controlId]) {
      historialMediciones.value[controlId] = []
    }
    
    historialMediciones.value[controlId].unshift(medicion)
    ultimaMedicion.value = medicion
    
    logger.info('Medición agregada:', controlId, medicion)
  }

  /**
   * Cargar controles próximos desde la API
   */
  async function fetchControles() {
    loading.value = true
    error.value = null

    try {
      const sessionMeta = obtenerSessionMeta()
      
      if (!sessionMeta) {
        logger.warn('Usando datos mock para controles - no hay sesión')
        controlesProximos.value = getMockControles()
        return
      }

      const { patient_id, health_plan_id } = sessionMeta

      // Intentar obtener desde health_plan_id primero
      if (health_plan_id) {
        const data = await apiRequest(`/api/v1/protocols/${health_plan_id}`)
        
        if (data) {
          const protocolos = extraerArray(data, ['data.protocol', 'protocol'])
          
          if (protocolos.length > 0) {
            controlesProximos.value = protocolos.map((protocol) => {
              const nombre = protocol.name || protocol.nombre || 'Control'
              return {
                id: protocol.id?.toString() || protocol.protocol_id?.toString(),
                nombre: nombre,
                descripcion: getProtocolDescription(nombre),
                icono: getProtocolIcon(nombre),
                color: getProtocolColor(nombre),
                fechaProgramada: null,
                estado: 'pendiente'
              }
            })
            
            logger.info(`Controles cargados desde protocolos: ${controlesProximos.value.length}`)
            return
          }
        }
      }

      // Fallback: obtener desde servicios del paciente
      const data = await apiRequest(`/api/v1/patients/${patient_id}/services`)
      
      if (data) {
        const services = extraerArray(data, ['data.services', 'services', 'data'])
        
        const controlesService = services.find(s => 
          s.name === 'CONTROLES' || s.name === 'CONTROL' || s.service_id === 1
        )
        
        if (controlesService?.options?.length > 0) {
          controlesProximos.value = controlesService.options.map((protocol, index) => {
            const nombre = protocol.name || protocol.protocol_name || protocol.title || protocol.nombre || 'Control'
            
            return {
              id: protocol.protocol_id?.toString() || protocol.id?.toString() || (index + 1).toString(),
              nombre: nombre,
              descripcion: getProtocolDescription(nombre),
              icono: getProtocolIcon(nombre),
              color: getProtocolColor(nombre),
              fechaProgramada: protocol.due_date || protocol.fecha_programada || null,
              estado: 'pendiente'
            }
          })
          
          logger.info(`Controles cargados desde API: ${controlesProximos.value.length}`)
          return
        }
      }
      
      // Fallback a datos mock
      logger.warn('Usando datos mock para controles')
      controlesProximos.value = getMockControles()
      
    } catch (e) {
      logger.error('Error al cargar controles:', e)
      error.value = e.message
      controlesProximos.value = getMockControles()
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtener última medición (Last Info Control)
   */
  async function fetchUltimaMedicion() {
    try {
      const sessionMeta = obtenerSessionMeta()
      
      if (!sessionMeta?.patient_id) return

      const data = await apiRequest(`/api/v1/protocol/last_info_control/${sessionMeta.patient_id}`)
      
      if (data && data.success !== false) {
        const observacion = data?.data?.observation?.[0]
        const detalle = observacion?.observation?.[0]

        if (observacion) {
          ultimaMedicion.value = {
            id: observacion.protocol_id?.toString() || 'last',
            tipo: observacion.name || 'Control',
            valor: detalle?.glucose || detalle?.value || 'N/A',
            unidad: detalle?.observation_type_id === 4 ? 'mg/dL' : '',
            fecha: observacion.last_control || new Date().toISOString(),
            estado: detalle?.evaluation || observacion.evaluation || 'normal'
          }
          logger.info('Última medición cargada:', ultimaMedicion.value)
        }
      }
    } catch (e) {
      logger.error('Error al cargar última medición:', e)
    }
  }

  /**
   * Cargar videos educativos
   */
  async function fetchVideos() {
    try {
      const sessionMeta = obtenerSessionMeta()
      
      if (!sessionMeta?.patient_id) return

      const data = await apiRequest(`/api/v1/patients/material_audiovisual/${sessionMeta.patient_id}`)
      
      if (!data) return

      const list = extraerArray(data, [
        'data.material',
        'audiovisual',
        'data'
      ])
      
      videos.value = list.map((v, i) => ({
        id: v.id || v.audiovisual_id || i.toString(),
        titulo: v.title || v.titulo || 'Video Educativo',
        descripcion: v.description || v.main_text || '',
        thumbnailUrl: v.thumbnail_url || v.url_thumbnail || '/assets/video-thumb-1.jpg',
        videoUrl: v.url || v.video_url || '#',
        duracion: v.duration || '0:00'
      }))
      
      logger.info(`Videos cargados: ${videos.value.length}`)
    } catch (e) {
      logger.error('Error al cargar videos:', e)
    }
  }

  /**
   * Cargar campañas de salud
   */
  async function fetchCampanhas() {
    try {
      const sessionMeta = obtenerSessionMeta()
      
      if (!sessionMeta?.patient_id) return

      const data = await apiRequest(`/api/v1/patients/${sessionMeta.patient_id}/campaigns`)
      
      if (!data) return

      const list = extraerArray(data, [
        'data.campaigns',
        'campaigns',
        'data'
      ])
      
      campanhas.value = list.map((c, i) => ({
        id: c.id || c.campaign_id || i.toString(),
        nombre: c.name || c.title || 'Campaña',
        descripcion: c.description || '',
        imagenUrl: c.image_url || '/assets/campanha-default.jpg',
        activa: c.active !== false
      }))
      
      logger.info(`Campañas cargadas: ${campanhas.value.length}`)
    } catch (e) {
      logger.error('Error al cargar campañas:', e)
    }
  }

  /**
   * Cargar historial de un protocolo específico
   */
  async function fetchHistorial(protocolId) {
    if (!protocolId) return

    try {
      const sessionMeta = obtenerSessionMeta()
      
      if (!sessionMeta?.patient_id) return

      const data = await apiRequest(`/api/v1/protocol/observations/${sessionMeta.patient_id}/${protocolId}`)
      
      if (!data) return

      const observations = extraerArray(data, [
        'data.observations',
        'observations',
        'data'
      ])
      
      // Filtrar solo observaciones con valores numéricos (no preguntas)
      const medicionesValidas = observations
        .filter(obs => {
          // Solo incluir observaciones que tengan valores numéricos válidos
          // Verificar que no sea null, undefined ni string vacío
          const tieneGlucosa = obs.glucose !== null && obs.glucose !== undefined && obs.glucose !== ''
          const tienePresion = obs.systolic !== null && obs.systolic !== undefined && obs.systolic !== ''
          const tienePeso = obs.weight !== null && obs.weight !== undefined && obs.weight !== ''
          const tieneBPM = obs.bpm !== null && obs.bpm !== undefined && obs.bpm !== ''
          const tieneTemperatura = obs.temperature !== null && obs.temperature !== undefined && obs.temperature !== ''
          
          return tieneGlucosa || tienePresion || tienePeso || tieneBPM || tieneTemperatura
        })
        .map(obs => {
          let valor = 'N/A'
          let unidad = ''
          let tipoMedicion = 'general'
          
          // Determinar el valor y unidad según el tipo de observación
          // Priorizar el campo 'type' de la API si está disponible
          const tipoObservacion = obs.type || obs.observation_type
          
          if (obs.glucose !== null && obs.glucose !== undefined && obs.glucose !== '') {
            valor = obs.glucose.toString()
            unidad = 'mg/dL'
            tipoMedicion = 'glucosa'
          } else if (obs.systolic !== null && obs.systolic !== undefined && obs.systolic !== '' && 
                     obs.diastolic !== null && obs.diastolic !== undefined && obs.diastolic !== '') {
            valor = `${obs.systolic}/${obs.diastolic}`
            unidad = 'mmHg'
            tipoMedicion = 'presion'
          } else if (obs.weight !== null && obs.weight !== undefined && obs.weight !== '') {
            valor = obs.weight.toString()
            unidad = 'kg'
            tipoMedicion = 'peso'
          } else if (obs.bpm !== null && obs.bpm !== undefined && obs.bpm !== '') {
            valor = obs.bpm.toString()
            unidad = 'bpm'
            tipoMedicion = 'frecuencia'
          } else if (obs.temperature !== null && obs.temperature !== undefined && obs.temperature !== '') {
            valor = obs.temperature.toString()
            unidad = '°C'
            tipoMedicion = 'temperatura'
          }
          
          // Si el tipo se determinó por el campo 'type' de la API, usar ese
          if (tipoObservacion === 'weight') {
            tipoMedicion = 'peso'
          } else if (tipoObservacion === 'glucometer' || tipoObservacion === 'glucose') {
            tipoMedicion = 'glucosa'
          } else if (tipoObservacion === 'blood_pressure') {
            tipoMedicion = 'presion'
          }

          // Determinar estado basado en la evaluación o status
          let estado = 'normal'
          if (obs.evaluation && obs.evaluation !== 'none') {
            estado = obs.evaluation
          } else if (obs.status) {
            // El status puede ser un objeto (ej: {glucose: "normal"}) o string
            if (typeof obs.status === 'object') {
              const statusValues = Object.values(obs.status)
              if (statusValues.includes('alerta') || statusValues.includes('alert')) {
                estado = 'alerta'
              } else if (statusValues.includes('critico') || statusValues.includes('critical')) {
                estado = 'critico'
              }
            } else {
              estado = obs.status
            }
          }

          return {
            id: obs.id || obs.observation_id || '0',
            tipo: tipoMedicion,
            nombre: obs.name || 'Medición',
            valor,
            unidad,
            fecha: obs.created || obs.date || obs.created_at || new Date().toISOString(),
            estado,
            observation_type_id: obs.observation_type_id
          }
        })
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha)) // Ordenar por fecha descendente
      
      historialMediciones.value = {
        ...historialMediciones.value,
        [protocolId]: medicionesValidas
      }
      
      logger.info(`Historial cargado para protocolo ${protocolId}: ${medicionesValidas.length} mediciones válidas de ${observations.length} observaciones`)
    } catch (e) {
      logger.error(`Error al cargar historial del protocolo ${protocolId}:`, e)
    }
  }

  /**
   * Cargar todos los datos de salud
   */
  async function fetchAllHealthData() {
    if (promesaCargaEnCurso.value) {
      logger.info('Carga ya en curso, esperando promesa existente...')
      return promesaCargaEnCurso.value
    }
    
    if (datosInicializados.value) {
      logger.info('Datos ya inicializados, omitiendo carga')
      return Promise.resolve()
    }
    
    promesaCargaEnCurso.value = (async () => {
      try {
        await Promise.all([
          fetchControles(),
          fetchVideos(),
          fetchCampanhas(),
          fetchUltimaMedicion()
        ])
        
        if (controlesProximos.value.length > 0) {
          const historyPromises = controlesProximos.value.map(c => fetchHistorial(c.id))
          await Promise.all(historyPromises)
        }
        
        datosInicializados.value = true
        logger.info('Datos de salud cargados exitosamente')
      } finally {
        promesaCargaEnCurso.value = null
      }
    })()
    
    return promesaCargaEnCurso.value
  }

  /**
   * Inicializar con datos mock
   */
  function initMockData() {
    if (promesaCargaEnCurso.value) {
      logger.info('initMockData: Carga ya en curso')
      return promesaCargaEnCurso.value
    }
    
    if (!historialMediciones.value || Object.keys(historialMediciones.value).length === 0) {
      logger.info('initMockData: Inicializando historial mock')
      historialMediciones.value = {
        '1': [
          { fecha: '2026-01-15', valor: '120/80', unidad: 'mmHg', estado: 'normal' },
          { fecha: '2026-01-08', valor: '122/82', unidad: 'mmHg', estado: 'normal' },
          { fecha: '2026-01-01', valor: '130/85', unidad: 'mmHg', estado: 'alerta' }
        ],
        '2': [
          { fecha: '2026-01-18', valor: '72.5', unidad: 'kg', estado: 'normal' },
          { fecha: '2026-01-10', valor: '73.0', unidad: 'kg', estado: 'normal' },
          { fecha: '2025-12-28', valor: '73.8', unidad: 'kg', estado: 'normal' }
        ],
        '3': [
          { fecha: '2025-12-20', valor: '95', unidad: 'mg/dL', estado: 'normal' }
        ]
      }

      ultimaMedicion.value = {
        id: '0',
        tipo: 'general',
        valor: 'N/A',
        unidad: '',
        fecha: new Date().toISOString(),
        estado: 'na'
      }
    }
    
    if (datosInicializados.value && controlesProximos.value.length > 0) {
      logger.info('initMockData: Datos de controles ya cargados')
      return Promise.resolve()
    }

    return fetchAllHealthData()
  }

  function actualizarMedicion(medicion) {
    ultimaMedicion.value = medicion
  }
  
  /**
   * Forzar recarga de datos
   */
  function forzarRecarga() {
    datosInicializados.value = false
    promesaCargaEnCurso.value = null
    return fetchAllHealthData()
  }

  /**
   * Resetear store a estado inicial
   */
  function $reset() {
    ultimaMedicion.value = null
    controlesProximos.value = []
    campanhas.value = []
    videos.value = []
    loading.value = false
    error.value = null
    datosInicializados.value = false
    promesaCargaEnCurso.value = null
    historialMediciones.value = {}
  }

  // Helpers para mapeo de protocolos
  function getProtocolDescription(name) {
    const normalizedName = name?.toUpperCase() || ''
    if (normalizedName.includes('PRESIÓN') || normalizedName.includes('ARTERIAL')) {
      return 'Control de presión sistólica y diastólica'
    }
    if (normalizedName.includes('PESO')) {
      return 'Control de peso corporal'
    }
    if (normalizedName.includes('GLICEMIA') || normalizedName.includes('GLUCOSA')) {
      return 'Medición de glucosa en sangre'
    }
    return `Control de ${name}`
  }
  
  function getProtocolIcon(name) {
    const normalizedName = name?.toUpperCase() || ''
    if (normalizedName.includes('PRESIÓN') || normalizedName.includes('ARTERIAL')) {
      return 'pi pi-heart'
    }
    if (normalizedName.includes('PESO')) {
      return 'pi pi-chart-line'
    }
    if (normalizedName.includes('GLICEMIA') || normalizedName.includes('GLUCOSA')) {
      return 'pi pi-bolt'
    }
    return 'pi pi-circle'
  }
  
  function getProtocolColor(name) {
    const normalizedName = name?.toUpperCase() || ''
    if (normalizedName.includes('PRESIÓN') || normalizedName.includes('ARTERIAL')) {
      return '#EF4444'
    }
    if (normalizedName.includes('PESO')) {
      return '#3B82F6'
    }
    if (normalizedName.includes('GLICEMIA') || normalizedName.includes('GLUCOSA')) {
      return '#10B981'
    }
    return '#8B5CF6'
  }
  
  function getMockControles() {
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
    ultimaMedicion,
    controlesProximos,
    campanhas,
    videos,
    loading,
    error,
    historialMediciones,
    datosInicializados,
    // Getters
    controlesActivos,
    tieneControlesPendientes,
    estadoSalud,
    // Actions
    fetchControles,
    fetchVideos,
    fetchCampanhas,
    fetchUltimaMedicion,
    fetchHistorial,
    actualizarMedicion,
    addMedicion,
    fetchAllHealthData,
    initMockData,
    forzarRecarga,
    $reset
  }
})

// Alias para compatibilidad con código existente
export const useTiendaSalud = useHealthStore
