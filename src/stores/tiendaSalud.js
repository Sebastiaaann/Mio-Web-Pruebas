// stores/healthStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

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

    /** @type {import('vue').Ref<Record<string, Medicion[]>>} */
    const historialMediciones = ref({})

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
        
        if (import.meta.env.DEV) {
            console.log('📊 Medición agregada:', controlId, medicion)
        }
    }

    /**
     * Cargar controles próximos
     */
    async function fetchControles() {
        // ... (existing fetchControles logic)
        loading.value = true
        error.value = null

        try {
            await new Promise(resolve => setTimeout(resolve, 500))

            controlesProximos.value = [
                {
                    id: '1',
                    nombre: 'Presión Arterial',
                    descripcion: 'Control de presión sistólica y diastólica',
                    icono: 'pi pi-heart',
                    color: '#EF4444',
                    fechaProgramada: '2026-01-20',
                    estado: 'pendiente'
                },
                {
                    id: '2',
                    nombre: 'Peso Básico',
                    descripcion: 'Control de peso corporal',
                    icono: 'pi pi-chart-line',
                    color: '#3B82F6',
                    fechaProgramada: '2026-01-22',
                    estado: 'pendiente'
                },
                {
                    id: '3',
                    nombre: 'Glicemia',
                    descripcion: 'Medición de glucosa en sangre',
                    icono: 'pi pi-bolt',
                    color: '#10B981',
                    fechaProgramada: '2026-01-24',
                    estado: 'pendiente'
                }
            ]
        } catch (e) {
            error.value = e.message
        } finally {
            loading.value = false
        }
    }

    // ... (existing fetchVideos and fetchCampanhas)
    async function fetchVideos() {
        // ... same as before
        videos.value = [
                {
                    id: '1',
                    titulo: 'Cómo medir tu presión arterial',
                    descripcion: 'Aprende la técnica correcta para medir tu presión',
                    thumbnailUrl: '/assets/video-thumb-1.jpg',
                    videoUrl: '#',
                    duracion: '3:45'
                },
                {
                    id: '2',
                    titulo: 'Importancia del control de peso',
                    descripcion: 'Por qué es importante mantener un peso saludable',
                    thumbnailUrl: '/assets/video-thumb-2.jpg',
                    videoUrl: '#',
                    duracion: '5:20'
                },
                {
                    id: '3',
                    titulo: 'Entendiendo la glicemia',
                    descripcion: 'Qué es y cómo afecta tu salud',
                    thumbnailUrl: '/assets/video-thumb-3.jpg',
                    videoUrl: '#',
                    duracion: '4:15'
                }
            ]
    }

    async function fetchCampanhas() {
        campanhas.value = [
            {
                id: '1',
                nombre: 'MIO Te Protege',
                descripcion: 'Programa de prevención cardiovascular',
                imagenUrl: '/assets/campanha-mio-protege.jpg',
                activa: true
            }
        ]
    }

    /**
     * Cargar todos los datos de salud
     */
    async function fetchAllHealthData() {
        await Promise.all([
            fetchControles(),
            fetchVideos(),
            fetchCampanhas()
        ])
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
        actualizarMedicion,
        addMedicion,
        fetchAllHealthData,
        initMockData
    }
})
