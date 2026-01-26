// stores/tiendaSalud.js - Store de salud del usuario
import { defineStore } from 'pinia'
import { ref, shallowRef, computed } from 'vue'
import { logger } from '@/utils/logger'

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
 * @typedef {Object} Video
 * @property {string} id
 * @property {string} titulo
 * @property {string} descripcion
 * @property {string} thumbnailUrl
 * @property {string} videoUrl
 * @property {string} duracion
 */

/**
 * @typedef {Object} Campanha
 * @property {string} id
 * @property {string} nombre
 * @property {string} descripcion
 * @property {string} imagenUrl
 * @property {boolean} activa
 */

export const useHealthStore = defineStore('health', () => {
    // State
    /** @type {import('vue').Ref<Medicion|null>} */
    const ultimaMedicion = ref(null)

    /** @type {import('vue').Ref<Control[]>} */
    const controlesProximos = ref([])

    /** @type {import('vue').Ref<Campanha[]>} */
    const campanhas = ref([])

    /** @type {import('vue').Ref<Video[]>} */
    const videos = ref([])

    const loading = ref(false)
    const error = ref(null)

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

    const getHistorial = (controlId) => computed(() => 
        historialMediciones.value[controlId] || []
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
        
        // Add to history
        historialMediciones.value[controlId].unshift(medicion)
        
        // Update latest if it's new
        ultimaMedicion.value = medicion
        
        logger.info('Medición agregada:', controlId, medicion)
    }

    /**
     * Cargar controles próximos desde la API
     * Busca el servicio CONTROLES y extrae los protocolos
     */
    async function fetchControles() {
        loading.value = true
        error.value = null

        try {
            // Intentar obtener desde API
            const sessionMeta = localStorage.getItem("mio-session-meta")
            const token = localStorage.getItem("mio-token")
            
            if (sessionMeta && token) {
                const { patient_id, health_plan_id } = JSON.parse(sessionMeta)

                if (health_plan_id) {
                    const response = await fetch(
                        `${API_HOMA_URL}/api/v1/protocols/${health_plan_id}`,
                        { headers: { 'X-API-KEY': token } }
                    )

                    if (response.ok) {
                        const data = await response.json()
                        const protocolos = data?.data?.protocol || data?.protocol || []

                        if (Array.isArray(protocolos) && protocolos.length > 0) {
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

                const response = await fetch(
                    `${API_HOMA_URL}/api/v1/patients/${patient_id}/services`,
                    { headers: { 'X-API-KEY': token } }
                )
                
                if (response.ok) {
                    const data = await response.json()
                    const services = data?.data?.services || data?.services || []
                    
                    // Buscar servicio CONTROLES
                    const controlesService = services.find(s => 
                        s.name === 'CONTROLES' || s.name === 'CONTROL' || s.service_id === 1
                    )
                    
                    if (controlesService?.options?.length > 0) {
                        // Debug: Log estructura de protocolos
                        logger.info('Protocolos raw:', JSON.stringify(controlesService.options, null, 2))
                        
                        // Mapear protocolos a formato de controles
                        controlesProximos.value = controlesService.options.map((protocol, index) => {
                            // Extraer nombre - puede venir en diferentes campos
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
                        
                        logger.info(`Controles cargados desde API: ${controlesProximos.value.length}`, controlesProximos.value.map(c => c.nombre))
                        return
                    }
                }
            }
            
            // Fallback a datos mock si la API falla
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
             // Intentar obtener desde API
            const sessionMeta = localStorage.getItem("mio-session-meta")
            const token = localStorage.getItem("mio-token")
            
            if (sessionMeta && token) {
                const { patient_id } = JSON.parse(sessionMeta)
                
                // Endpoint: /api/v1/protocol/last_info_control/{patient_id}
                const response = await fetch(
                    `${API_HOMA_URL}/api/v1/protocol/last_info_control/${patient_id}`,
                    { headers: { 'X-API-KEY': token } }
                )
                
                // Validar respuesta OK
                if (!response.ok) {
                    logger.error(`Error HTTP ${response.status} al cargar última medición`)
                    return
                }

                // Validar content-type JSON
                const contentType = response.headers.get('content-type')
                if (!contentType || !contentType.includes('application/json')) {
                    logger.error(`Respuesta no-JSON (content-type: ${contentType})`)
                    const text = await response.text()
                    logger.error('Contenido recibido:', text.substring(0, 200))
                    return
                }

                let data
                try {
                    data = await response.json()
                } catch (parseError) {
                    logger.error('Error al parsear JSON de última medición:', parseError)
                    return
                }
                
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
         }
     } catch (e) {
         logger.error('Error al cargar última medición:', e)
     }
 }
    
    // Helpers para mapeo de protocolos - usa coincidencia parcial para nombres de API
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
            return '#EF4444' // Rojo
        }
        if (normalizedName.includes('PESO')) {
            return '#3B82F6' // Azul
        }
        if (normalizedName.includes('GLICEMIA') || normalizedName.includes('GLUCOSA')) {
            return '#10B981' // Verde
        }
        return '#8B5CF6' // Violeta
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

    // ... (existing fetchVideos and fetchCampanhas)
    async function fetchVideos() {
        try {
             const sessionMeta = localStorage.getItem("mio-session-meta")
             const token = localStorage.getItem("mio-token")
             
             if (sessionMeta && token) {
                 const { patient_id } = JSON.parse(sessionMeta)
                 const response = await fetch(
                     `${API_HOMA_URL}/api/v1/patients/material_audiovisual/${patient_id}`,
                     { headers: { 'X-API-KEY': token } }
                 )
                 
                 // Validar respuesta OK
                 if (!response.ok) {
                     logger.error(`Error HTTP ${response.status} al cargar videos`)
                     return
                 }

                 // Validar content-type JSON
                 const contentType = response.headers.get('content-type')
                 if (!contentType || !contentType.includes('application/json')) {
                     logger.error(`Respuesta no-JSON (content-type: ${contentType})`)
                     const text = await response.text()
                     logger.error('Contenido recibido:', text.substring(0, 200))
                     return
                 }

                 let data
                 try {
                     data = await response.json()
                 } catch (parseError) {
                     logger.error('Error al parsear JSON de videos:', parseError)
                     return
                 }

                 // Extracción defensiva de array
                 let list = []
                 if (data.data && data.data.material && Array.isArray(data.data.material)) {
                     list = data.data.material
                 } else if (data.audiovisual && Array.isArray(data.audiovisual)) {
                     list = data.audiovisual
                 } else if (data.data && Array.isArray(data.data)) {
                     list = data.data
                 } else if (Array.isArray(data)) {
                     list = data
                 } else {
                     logger.warn('Estructura de videos no reconocida:', JSON.stringify(data).substring(0, 200))
                     return
                 }
                 
                 videos.value = list.map((v, i) => ({
                     id: v.id || v.audiovisual_id || i.toString(),
                     titulo: v.title || v.titulo || 'Video Educativo',
                     descripcion: v.description || v.main_text || '',
                     thumbnailUrl: v.thumbnail_url || v.url_thumbnail || '/assets/video-thumb-1.jpg',
                     videoUrl: v.url || v.video_url || '#',
                     duracion: v.duration || '0:00'
                 }))
                 logger.info(`Videos cargados: ${videos.value.length}`)
             }
        } catch (e) {
             logger.error('Error al cargar videos:', e)
        }
    }

    async function fetchCampanhas() {
        try {
             const sessionMeta = localStorage.getItem("mio-session-meta")
             const token = localStorage.getItem("mio-token")
             
             if (sessionMeta && token) {
                 const { patient_id } = JSON.parse(sessionMeta)
                 const response = await fetch(
                     `${API_HOMA_URL}/api/v1/patients/${patient_id}/campaigns`,
                     { headers: { 'X-API-KEY': token } }
                 )
                 
                 // Validar respuesta OK
                 if (!response.ok) {
                     logger.error(`Error HTTP ${response.status} al cargar campañas`)
                     return
                 }

                 // Validar content-type JSON
                 const contentType = response.headers.get('content-type')
                 if (!contentType || !contentType.includes('application/json')) {
                     logger.error(`Respuesta no-JSON (content-type: ${contentType})`)
                     const text = await response.text()
                     logger.error('Contenido recibido:', text.substring(0, 200))
                     return
                 }

                 let data
                 try {
                     data = await response.json()
                 } catch (parseError) {
                     logger.error('Error al parsear JSON de campañas:', parseError)
                     return
                 }

                 // Extracción defensiva: soportar múltiples estructuras
                 // 1. { success: true, data: { campaigns: [...] } }
                 // 2. { campaigns: [...] }
                 // 3. { data: [...] } donde data es array
                 // 4. { success: true, data: [...] }
                 let list = []
                 
                 if (data.data && data.data.campaigns && Array.isArray(data.data.campaigns)) {
                     list = data.data.campaigns
                     logger.info(`Campañas desde data.data.campaigns: ${list.length}`)
                 } else if (data.campaigns && Array.isArray(data.campaigns)) {
                     list = data.campaigns
                     logger.info(`Campañas desde data.campaigns: ${list.length}`)
                 } else if (data.data && Array.isArray(data.data)) {
                     list = data.data
                     logger.info(`Campañas desde data.data: ${list.length}`)
                 } else if (Array.isArray(data)) {
                     list = data
                     logger.info(`Campañas desde raíz: ${list.length}`)
                 } else {
                     logger.warn('Estructura de campañas no reconocida:', JSON.stringify(data).substring(0, 200))
                     return
                 }
                 
                 campanhas.value = list.map((c, i) => ({
                     id: c.id || c.campaign_id || i.toString(),
                     nombre: c.name || c.title || 'Campaña',
                     descripcion: c.description || '',
                     imagenUrl: c.image_url || '/assets/campanha-default.jpg',
                     activa: c.active !== false
                 }))
                 logger.info(`Campañas cargadas: ${campanhas.value.length}`)
             }
        } catch (e) {
             logger.error('Error al cargar campañas:', e)
        }
    }

    /**
     * Cargar todos los datos de salud
     */
    async function fetchHistorial(protocolId) {
        if (!protocolId) return

        try {
             const sessionMeta = localStorage.getItem("mio-session-meta")
             const token = localStorage.getItem("mio-token")
             
             if (sessionMeta && token) {
                 const { patient_id } = JSON.parse(sessionMeta)
                 const response = await fetch(
                     `${API_HOMA_URL}/api/v1/protocol/observations/${patient_id}/${protocolId}`,
                     { headers: { 'X-API-KEY': token } }
                 )
                 
                 // Validar respuesta OK
                 if (!response.ok) {
                     logger.error(`Error HTTP ${response.status} al cargar historial del protocolo ${protocolId}`)
                     return
                 }

                 // Validar content-type JSON
                 const contentType = response.headers.get('content-type')
                 if (!contentType || !contentType.includes('application/json')) {
                     logger.error(`Respuesta no-JSON (content-type: ${contentType})`)
                     const text = await response.text()
                     logger.error('Contenido recibido:', text.substring(0, 200))
                     return
                 }

                 let data
                 try {
                     data = await response.json()
                 } catch (parseError) {
                     logger.error(`Error al parsear JSON de historial protocolo ${protocolId}:`, parseError)
                     return
                 }

                 // Extracción defensiva de observations
                 let observations = []
                 if (data.data && data.data.observations && Array.isArray(data.data.observations)) {
                     observations = data.data.observations
                 } else if (data.observations && Array.isArray(data.observations)) {
                     observations = data.observations
                 } else if (data.data && Array.isArray(data.data)) {
                     observations = data.data
                 } else if (Array.isArray(data)) {
                     observations = data
                 } else {
                     logger.warn(`Estructura de historial no reconocida para protocolo ${protocolId}:`, JSON.stringify(data).substring(0, 200))
                     return
                 }
                 
                 // Map to local Medicion format and store
                 historialMediciones.value = {
                     ...historialMediciones.value,
                     [protocolId]: observations.map(obs => {
                         let valor = obs.value || obs.glucose || obs.systolic || obs.weight || obs.bpm || 'N/A'
                         if (obs.systolic && obs.diastolic) {
                             valor = `${obs.systolic}/${obs.diastolic}`
                         }

                         let unidad = obs.unit || ''
                         if (!unidad && obs.observation_type_id === 4) unidad = 'mg/dL'
                         if (!unidad && obs.observation_type_id === 3) unidad = 'mmHg'
                         if (!unidad && obs.observation_type_id === 7) unidad = 'bpm'

                         return {
                             id: obs.id || obs.observation_id || '0',
                             tipo: obs.name || 'Medición',
                             valor,
                             unidad,
                             fecha: obs.created || obs.date || obs.created_at || new Date().toISOString(),
                             estado: obs.evaluation || obs.status || 'normal'
                         }
                     })
                 }
                 logger.info(`Historial cargado para protocolo ${protocolId}: ${observations.length}`)
             }
        } catch (e) {
             logger.error(`Error al cargar historial del protocolo ${protocolId}:`, e)
        }
    }

    /**
     * Cargar todos los datos de salud
     */
    async function fetchAllHealthData() {
        await Promise.all([
            fetchControles(),
            fetchVideos(),
            fetchCampanhas(),
            fetchUltimaMedicion()
        ])
        
        // Load history for active controls found
        if (controlesProximos.value.length > 0) {
            const historyPromises = controlesProximos.value.map(c => fetchHistorial(c.id))
            await Promise.all(historyPromises)
        }
    }

    /**
     * Inicializar con datos mock
     */
    function initMockData() {
        // Init histories
        historialMediciones.value = {
            '1': [ // Presión
                { fecha: '2026-01-15', valor: '120/80', unidad: 'mmHg', estado: 'normal' },
                { fecha: '2026-01-08', valor: '122/82', unidad: 'mmHg', estado: 'normal' },
                { fecha: '2026-01-01', valor: '130/85', unidad: 'mmHg', estado: 'alerta' }
            ],
            '2': [ // Peso
                { fecha: '2026-01-18', valor: '72.5', unidad: 'kg', estado: 'normal' },
                { fecha: '2026-01-10', valor: '73.0', unidad: 'kg', estado: 'normal' },
                { fecha: '2025-12-28', valor: '73.8', unidad: 'kg', estado: 'normal' }
            ],
            '3': [ // Glicemia
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

        fetchAllHealthData()
    }

    function actualizarMedicion(medicion) {
         ultimaMedicion.value = medicion
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
        // Getters
        controlesActivos,
        tieneControlesPendientes,
        estadoSalud,
        getHistorial,
        // Actions
        fetchControles,
        fetchVideos,
        fetchCampanhas,
        fetchUltimaMedicion,
        fetchHistorial,
        actualizarMedicion,
        addMedicion,
        fetchAllHealthData,
        initMockData
    }
})
