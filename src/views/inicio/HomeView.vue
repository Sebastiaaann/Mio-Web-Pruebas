<script setup>
/**
 * HomeView - Dashboard Principal estilo iOS
 * Diseño púrpura/blanco con glass effects y motion-v
 */
import { onMounted, computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/tiendaUsuario'
import { useHealthStore } from '@/stores/tiendaSalud'
import { useTiendaServicios } from '@/stores/tiendaServicios'
import { useTiendaCampanas } from '@/stores/tiendaCampanas'
import { useConfigStore } from '@/stores/tiendaConfig'
import { pacienteService } from '@/services/pacienteService'
import { logger } from '@/utils/logger'

// iOS Components
import WelcomeBanner from '@/components/ui/home-ios/WelcomeBanner.vue'
import CampaignCard from '@/components/ui/home-ios/CampaignCard.vue'
import BannerCarouselIOS from '@/components/ui/home-ios/BannerCarouselIOS.vue'
import HealthDashboard from '@/components/ui/home-ios/HealthDashboard.vue'
import OperativosCard from '@/components/ui/home-ios/OperativosCard.vue'
import ChatbotCard from '@/components/ui/home-ios/ChatbotCard.vue'
import TarjetaMaterialAudiovisual from '@/components/ui/home-ios/TarjetaMaterialAudiovisual.vue'

import { Motion } from 'motion-v'

const router = useRouter()
const userStore = useUserStore()
const serviciosStore = useTiendaServicios()
const healthStore = useHealthStore()
const campanasStore = useTiendaCampanas()
const configStore = useConfigStore()

const { nombreCompleto, firstName, usuario } = storeToRefs(userStore)
const { servicios, cargando } = storeToRefs(serviciosStore)
const { campanas, cargando: cargandoCampanas } = storeToRefs(campanasStore)
const { ultimaMedicion, controlesProximos: controlesStore } = storeToRefs(healthStore)
const { clientBrand, planActivo } = storeToRefs(configStore)

const materialAudiovisual = ref([])
const cargandoMaterial = ref(false)
const errorMaterial = ref(null)

// ═══════════════════════════════════════════════════════════════
// COMPUTED DATA
// ═══════════════════════════════════════════════════════════════

// Saludo dinámico según la hora
const saludo = computed(() => {
  const hora = new Date().getHours()
  if (hora < 12) return 'Buenos días'
  if (hora < 19) return 'Buenas tardes'
  return 'Buenas noches'
})

// Visibilidad de secciones según el plan (usando planActivo del store)
const visibilidadSeccion = computed(() => {
  const plan = planActivo.value.toLowerCase()
  const esPlanEsencial = plan.includes('esencial') || plan.includes('vital')
  
  return {
    // Plan Esencial/Vital muestra:
    campanas: true, // Muestra campañas (pero filtradas a solo "MIO Te protege" + agregados de Mutual)
    miSalud: true, 
    reservarCita: true,
    videosEducativos: true, // Todos los planes ven videos
    
    // Plan Esencial/Vital NO muestra:
    chatbot: !esPlanEsencial,
    clubBeneficios: !esPlanEsencial,
    bibliotecaVirtual: !esPlanEsencial,
    campanaAnual: !esPlanEsencial,
    operativos: !esPlanEsencial,
    bannersDestacados: !esPlanEsencial
  }
})

// Filtrar campañas según plan
const campanasVisibles = computed(() => {
  const plan = planActivo.value.toLowerCase()
  const esPlanEsencial = plan.includes('esencial') || plan.includes('vital')
  
  if (esPlanEsencial) {
    // Plan Esencial: muestra "MIO Te protege" + campañas de Mutual como agregado (Salud Mental, Cardiovascular)
    return campanas.value.filter(campana => {
      const nombre = (campana.name || campana.titulo || '').toLowerCase()
      return nombre.includes('mio te protege') || 
             nombre.includes('protege') ||
             nombre.includes('salud mental') ||
             nombre.includes('mental') ||
             nombre.includes('cardiovascular') ||
             nombre.includes('corazón') ||
             nombre.includes('cardiaco')
    })
  }
  
  // Plan Mutual y otros: muestran TODAS las campañas
  return campanas.value
})

// ═══════════════════════════════════════════════════════════════
// COMPUTED DATA
// ═══════════════════════════════════════════════════════════════

// Banners destacados
const bannersDestacados = computed(() => {
  const bannerService = servicios.value.find(s => 
    s.nombre?.toUpperCase().includes('BANNER')
  )
  
  if (bannerService?.items?.length > 0) {
    return bannerService.items.map(item => ({
      id: item.id,
      title: item.name || item.titulo,
      description: item.description || item.descripcion,
      image: item.image || item.imagen,
      url: item.url || item.link,
      colorFrom: '#9333ea',
      colorTo: '#7c3aed',
      live: item.live || false
    }))
  }
  
  // Fallback banners
  return [
    {
      id: 'beneficios',
      title: 'Beneficios Mutual',
      description: 'Descubre todos tus beneficios',
      image: 'https://docs.accuhealth.cl/mutual/clubbeneficiosmutual.png',
      url: 'https://www.mutualbeneficios.cl',
      colorFrom: '#9333ea',
      colorTo: '#7c3aed'
    },
    {
      id: 'berni',
      title: 'Clases en vivo',
      description: 'Con Berni Allen',
      image: 'https://docs.accuhealth.cl/mutual/BannerMIO.png',
      url: 'https://on.mediastre.am/events/berni-allen/mioapp-accuhealth/live',
      colorFrom: '#ec4899',
      colorTo: '#f97316',
      live: true
    }
  ]
})

// Datos de salud
const datosUltimaMedicion = computed(() => {
  if (!ultimaMedicion.value) return {
    valor: '--',
    unidad: '',
    tipo: 'Sin datos recientes',
    fecha: ''
  }

  // Parse valor composed (e.g., "120/80")
  let valorPrincipal = ultimaMedicion.value.valor
  let valorSecundario = null

  if (typeof valorPrincipal === 'string' && valorPrincipal.includes('/')) {
    const parts = valorPrincipal.split('/')
    valorPrincipal = parts[0]
    valorSecundario = parts[1]
  }

  // Format date readable (e.g. "Hace 2 días" or "12 Ene")
  // Simple format for now
  const dateObj = new Date(ultimaMedicion.value.fecha)
  const fechaFormatted = isNaN(dateObj.getTime()) 
    ? ultimaMedicion.value.fecha 
    : dateObj.toLocaleDateString('es-CL', { month: 'short', day: 'numeric' })

  return {
    valor: valorPrincipal,
    valorSecundario: valorSecundario,
    unidad: ultimaMedicion.value.unidad,
    tipo: ultimaMedicion.value.tipo,
    fecha: fechaFormatted
  }
})

const proximosControles = computed(() => {
  if (!controlesStore.value || controlesStore.value.length === 0) return []

  return controlesStore.value.map(c => {
    // Map control type to 'presion' | 'peso' | 'default' for icons
    let tipoIcono = 'default'
    const nombreLower = c.nombre.toLowerCase()
    
    if (nombreLower.includes('presi') || nombreLower.includes('arterial')) tipoIcono = 'presion'
    else if (nombreLower.includes('peso') || nombreLower.includes('masa')) tipoIcono = 'peso'

    // Format date if needed
    let fechaTxt = 'Pendiente'
    if (c.fechaProgramada) {
        const d = new Date(c.fechaProgramada)
        // Check if date is valid
        if (!isNaN(d.getTime())) {
             const now = new Date()
             const isToday = d.toDateString() === now.toDateString()
             const hour = d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
             fechaTxt = isToday ? `Hoy, ${hour}` : d.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        } else {
             fechaTxt = c.fechaProgramada
        }
    }

    return {
      id: c.id,
      titulo: c.nombre,
      fecha: fechaTxt, 
      tipo: tipoIcono, 
      href: '/controles'
    }
  })
})

const materialAudiovisualDesdeServicios = computed(() => {
  const serviciosMaterial = servicios.value.filter(servicio =>
    servicio.nombre?.toUpperCase() === 'MATERIAL AUDIOVISUAL'
  )

  const opciones = serviciosMaterial.flatMap(servicio => servicio.items || [])

  const tarjetas = opciones.map((opcion, index) => {
    let titulo = opcion.titulo || opcion.title || ''
    let descripcion = opcion.descripcion || ''
    let categoria = ''
    let incluyeCategorias = []
    let excluyeCategorias = []

    if (opcion.tipo_mensaje) {
      try {
        const parsed = JSON.parse(opcion.tipo_mensaje)
        const detalle = Array.isArray(parsed) ? parsed[0] : parsed

        if (detalle?.title) titulo = detalle.title
        if (Array.isArray(detalle?.included_categories)) {
          incluyeCategorias = detalle.included_categories
          if (incluyeCategorias.length) {
            categoria = incluyeCategorias.join(', ')
          }
        }
        if (Array.isArray(detalle?.excluded_categories)) {
          excluyeCategorias = detalle.excluded_categories
          if (excluyeCategorias.length) {
            categoria = `Excluye: ${excluyeCategorias.join(', ')}`
          }
        }
      } catch (error) {
        // Si no es JSON válido, se mantienen los valores originales
      }
    }

    if (!titulo) titulo = opcion.title || 'Material audiovisual'
    if (!descripcion) descripcion = opcion.title || opcion.titulo || ''

    const params = new URLSearchParams()
    params.set('titulo', titulo)
    if (incluyeCategorias.length) params.set('incluye', incluyeCategorias.join(','))
    if (excluyeCategorias.length) params.set('excluye', excluyeCategorias.join(','))
    const urlInterna = `/recursos?${params.toString()}`

    return {
      id: opcion.id || `material-servicio-${index}`,
      titulo,
      descripcion,
      imagen: opcion.image || opcion.imagen || '',
      url: opcion.url || urlInterna,
      categoria
    }
  })

  const vistos = new Set()
  return tarjetas.filter(item => {
    const clave = `${item.titulo}|${item.descripcion}`
    if (vistos.has(clave)) return false
    vistos.add(clave)
    return true
  })
})

const materialAudiovisualNormalizado = computed(() => {
  const plan = planActivo.value.toLowerCase()
  const esPlanEsencial = plan.includes('esencial') || plan.includes('vital')
  
  let videos = []
  
  if (materialAudiovisualDesdeServicios.value.length > 0) {
    videos = materialAudiovisualDesdeServicios.value
  } else if (materialAudiovisual.value.length === 0) {
    // Si no hay datos del API, retornar videos de prueba con imágenes placeholder
    videos = [
      {
        id: 'video-1',
        titulo: 'Ejercicios para el corazón',
        descripcion: 'Rutina cardiovascular de 15 minutos para mejorar tu salud del corazón',
        imagen: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=450&fit=crop',
        url: '#',
        categoria: 'Ejercicio'
      },
      {
        id: 'video-2',
        titulo: 'Alimentación saludable',
        descripcion: 'Consejos nutricionales para una dieta balanceada y saludable',
        imagen: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=450&fit=crop',
        url: '#',
        categoria: 'Nutrición'
      },
      {
        id: 'video-3',
        titulo: 'Meditación y relajación',
        descripcion: 'Técnicas de respiración y mindfulness para reducir el estrés',
        imagen: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=450&fit=crop',
        url: '#',
        categoria: 'Bienestar Mental'
      },
      {
        id: 'video-4',
        titulo: 'Control de presión arterial',
        descripcion: 'Aprende a medir y controlar tu presión arterial en casa',
        imagen: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=450&fit=crop',
        url: '#',
        categoria: 'Salud'
      },
      {
        id: 'video-5',
        titulo: 'Yoga para principiantes',
        descripcion: 'Sesión de yoga suave ideal para comenzar tu práctica diaria',
        imagen: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=450&fit=crop',
        url: '#',
        categoria: 'Ejercicio'
      },
      {
        id: 'video-6',
        titulo: 'Manejo del estrés',
        descripcion: 'Estrategias prácticas para manejar el estrés del día a día',
        imagen: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&h=450&fit=crop',
        url: '#',
        categoria: 'Bienestar Mental'
      }
    ]
  } else {
    videos = materialAudiovisual.value.map((item, index) => {
      if (typeof item === 'string') {
        return {
          id: `material-${index}`,
          titulo: item,
          descripcion: 'Revisa el material audiovisual disponible para ti.',
          imagen: '',
          url: '#',
          categoria: ''
        }
      }

      return {
        id: item.id || item.material_id || item.audiovisual_id || item.video_id || `material-${index}`,
        titulo: item.title || item.titulo || item.name || 'Material audiovisual',
        descripcion: item.description || item.descripcion || item.summary || item.main_text || '',
        imagen: item.image || item.imagen || item.thumbnail || item.thumbnail_url || item.url_thumbnail || item.cover || '',
        url: item.url || item.link || item.video_url || item.enlace || '#',
        categoria: item.category || item.categoria || item.tipo || ''
      }
    })
  }
  
  // Filtrar videos según el plan
  if (esPlanEsencial) {
    // Plan Esencial: Excluir "Biblioteca Virtual" y "Campaña Anual"
    return videos.filter(video => {
      const titulo = (video.titulo || video.title || '').toLowerCase()
      const categoria = (video.categoria || video.category || '').toLowerCase()
      
      const esBiblioteca = titulo.includes('biblioteca') || categoria.includes('biblioteca')
      const esCampanaAnual = titulo.includes('campaña anual') || categoria.includes('campaña anual')
      
      return !esBiblioteca && !esCampanaAnual
    })
  }
  
  // Plan Mutual: Mostrar todos los videos
  return videos
})

// Operativos
const operativos = computed(() => {
  const operativosService = servicios.value.find(s => 
    s.nombre?.toUpperCase() === 'OPERATIVOS'
  )
  
  if (operativosService?.items?.length > 0) {
    return operativosService.items.map(item => ({
      id: item.id,
      titulo: item.name || item.titulo || 'Control General',
      descripcion: item.description || item.descripcion || 'Exámenes de rutina',
      fecha: item.date || item.fecha,
      estado: item.status || 'Pendiente'
    }))
  }
  
  return [{
    id: 'default',
    titulo: 'Control General de Salud',
    descripcion: 'Exámenes de rutina programados',
    fecha: new Date().toISOString(),
    estado: 'Pendiente'
  }]
})

// ═══════════════════════════════════════════════════════════════
// ACTIONS
// ═══════════════════════════════════════════════════════════════

const handleNuevaCita = () => router.push('/citas')
const handleVerHistorial = () => router.push('/controles')
const handleVerTodoSalud = () => router.push('/controles')
const handleVerCalendario = () => router.push('/citas')

const obtenerPatientIdActivo = () => {
  const patientIdStore = usuario.value?.patient_id
  if (patientIdStore) return patientIdStore

  const sessionMeta = localStorage.getItem('mio-session-meta')
  if (!sessionMeta) return null

  try {
    const { patient_id } = JSON.parse(sessionMeta)
    return patient_id || null
  } catch (error) {
    return null
  }
}

const cargarMaterialAudiovisual = async () => {
  const patientId = obtenerPatientIdActivo()
  if (!patientId) {
    errorMaterial.value = 'No hay paciente asociado para cargar material audiovisual.'
    return
  }

  cargandoMaterial.value = true
  errorMaterial.value = null

  try {
    const resultado = await pacienteService.obtenerMaterialAudiovisual(patientId)
    if (resultado.success) {
      materialAudiovisual.value = resultado.items || []
    } else {
      errorMaterial.value = resultado.error || 'No se pudo cargar el material audiovisual.'
    }
  } catch (error) {
    errorMaterial.value = 'No se pudo cargar el material audiovisual.'
  } finally {
    cargandoMaterial.value = false
  }
}

// Detectar plan del usuario desde el API (solo si no hay preferencia guardada)
const detectarPlanUsuario = async () => {
  const patientId = obtenerPatientIdActivo()
  if (!patientId) return
  
  // Si ya hay un plan guardado manualmente, no sobrescribir
  const planGuardado = localStorage.getItem('mio-plan-preferencia')
  if (planGuardado) {
    configStore.setPlanActivo(planGuardado)
    logger.info('📋 Plan cargado desde preferencia guardada:', planGuardado)
    return
  }
  
  try {
    const plansResponse = await pacienteService.obtenerPlanes(patientId)
    
    if (plansResponse.success && plansResponse.data?.plans) {
      const activePlan = plansResponse.data.plans.find(p => p.active_plan === '1')
      if (activePlan) {
        const planName = activePlan.name_plan || 'esencial'
        // Normalizar nombre del plan a esencial/mutual/vital
        let planNormalizado = 'esencial'
        if (planName.toLowerCase().includes('mutual')) {
          planNormalizado = 'mutual'
        } else if (planName.toLowerCase().includes('vital')) {
          planNormalizado = 'vital'
        }
        configStore.setPlanActivo(planNormalizado)
        logger.info('📋 Plan detectado desde API:', planNormalizado)
      }
    } else if (plansResponse.success && plansResponse.planes && Array.isArray(plansResponse.planes)) {
      const activePlan = plansResponse.planes.find(p => p.activo)
      if (activePlan) {
        const planName = activePlan.nombre || 'esencial'
        let planNormalizado = 'esencial'
        if (planName.toLowerCase().includes('mutual')) {
          planNormalizado = 'mutual'
        } else if (planName.toLowerCase().includes('vital')) {
          planNormalizado = 'vital'
        }
        configStore.setPlanActivo(planNormalizado)
        logger.info('📋 Plan detectado desde API:', planNormalizado)
      }
    }
  } catch (error) {
    logger.error('Error detectando plan:', error)
    configStore.setPlanActivo('esencial') // Fallback a esencial
  }
}

// Cargar servicios al montar
onMounted(async () => {
  await Promise.all([
    serviciosStore.cargarServicios(),
    healthStore.fetchAllHealthData(),
    campanasStore.cargarCampanas(),
    detectarPlanUsuario()
  ])

  await cargarMaterialAudiovisual()
})

watch(
  () => usuario.value?.patient_id,
  async (nuevoId, anteriorId) => {
    if (nuevoId && nuevoId !== anteriorId) {
      await cargarMaterialAudiovisual()
    }
  }
)

watch(
  () => servicios.value,
  async (nuevosServicios, serviciosAnteriores) => {
    if (nuevosServicios !== serviciosAnteriores) {
      await cargarMaterialAudiovisual()
    }
  }
)
</script>

<template>
  <div class="home-ios min-h-full bg-linear-to-br from-stone-50 via-white to-emerald-50  overflow-y-auto">
    <!-- Floating Background Elements -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div class="absolute top-20 left-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" />
      <div class="absolute top-40 right-20 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style="animation-delay: -2s;" />
      <div class="absolute bottom-20 left-1/3 w-80 h-80 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-float" style="animation-delay: -4s;" />
    </div>

    <!-- Main Content -->
    <main class="relative z-10 pt-6 pb-12 px-6 max-w-7xl mx-auto space-y-10">
      
      <!-- Welcome Banner -->
      <WelcomeBanner 
        :nombre="nombreCompleto || 'Usuario'"
        :saludo="saludo"
        @nuevaCita="handleNuevaCita"
        @verHistorial="handleVerHistorial"
      />

      <!-- Health Campaigns -->
      <section v-if="visibilidadSeccion.campanas">
        <Motion
          :initial="{ opacity: 0, y: 20 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.5, delay: 0.1 }"
        >
          <div class="flex items-center justify-between mb-6">
            <div>
              <h3 class="text-xl font-bold text-gray-800">Tus Campañas de Salud</h3>
              <p class="text-gray-500 text-sm">Participa y cuida tu bienestar</p>
            </div>
          </div>
        </Motion>

        <div v-if="cargandoCampanas && campanasVisibles.length === 0" class="flex justify-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
        
        <div v-else-if="campanasVisibles.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <CampaignCard
            v-for="(campana, index) in campanasVisibles"
            :key="campana.id"
            :titulo="campana.name || campana.titulo"
            :descripcion="campana.description || campana.descripcion || ''"
            :imagen="campana.image || campana.imagen"
            :url="campana.url || campana.link"
            :delay="0.1 + (index * 0.1)"
          />
        </div>

        <div v-else class="bg-white/50 backdrop-blur-sm rounded-2xl p-8 border border-purple-100 text-center">
            <p class="text-gray-500">No tienes campañas activas en este momento.</p>
        </div>
      </section>

      <!-- Destacados + Mi Salud -->
      <section class="space-y-6">
        <BannerCarouselIOS 
          v-if="visibilidadSeccion.bannersDestacados"
          :banners="bannersDestacados" 
        />

        <!-- Mi Salud - Ancho completo -->
        <div v-if="visibilidadSeccion.miSalud" class="w-full">
          <HealthDashboard 
            :ultimaMedicion="datosUltimaMedicion"
            :proximosControles="proximosControles"
            @verTodo="handleVerTodoSalud"
          />
        </div>
      </section>

      <!-- Explora Nuestros Videos - Scroll horizontal -->
      <section v-if="visibilidadSeccion.videosEducativos" aria-labelledby="videos-titulo" class="w-full">
        <Motion
          :initial="{ opacity: 0, y: 20 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.5, delay: 0.3 }"
        >
          <div class="flex items-center justify-between mb-6">
            <div>
              <h3 id="videos-titulo" class="text-xl font-bold text-gray-800">Explora Nuestros Videos</h3>
              <p class="text-gray-500 text-sm">Contenido educativo y recursos para tu bienestar</p>
            </div>
            <button 
              v-if="materialAudiovisualNormalizado.length > 3"
              @click="router.push('/recursos')"
              class="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center gap-1"
            >
              Ver todo
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </Motion>

        <div v-if="cargandoMaterial" class="flex justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
        </div>

        <div v-else-if="materialAudiovisualNormalizado.length > 0" class="relative">
          <!-- Scroll horizontal con motion -->
          <Motion
            :initial="{ opacity: 0, x: -20 }"
            :animate="{ opacity: 1, x: 0 }"
            :transition="{ duration: 0.6, delay: 0.4 }"
            class="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
            style="scroll-behavior: smooth;"
          >
            <div 
              v-for="(item, index) in materialAudiovisualNormalizado" 
              :key="item.id"
              class="flex-shrink-0 w-80 snap-start"
            >
              <Motion
                :initial="{ opacity: 0, scale: 0.95 }"
                :animate="{ opacity: 1, scale: 1 }"
                :transition="{ duration: 0.4, delay: 0.5 + (index * 0.08) }"
              >
                <TarjetaMaterialAudiovisual
                  :titulo="item.titulo"
                  :descripcion="item.descripcion"
                  :imagen="item.imagen"
                  :url="item.url"
                  :categoria="item.categoria"
                  :delay="0"
                />
              </Motion>
            </div>
          </Motion>
        </div>

        <div v-else class="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-stone-200 text-center">
          <p v-if="errorMaterial" class="text-rose-600">{{ errorMaterial }}</p>
          <p v-else class="text-gray-600">No hay material audiovisual disponible en este momento.</p>
        </div>
      </section>

      <!-- Chatbot Assistant -->
      <ChatbotCard v-if="visibilidadSeccion.chatbot" :delay="0.4" />

      <!-- Biblioteca Virtual (solo Plan Mutual) - Ancho completo -->
      <section v-if="visibilidadSeccion.bibliotecaVirtual" aria-labelledby="biblioteca-titulo" class="w-full">
        <Motion
          :initial="{ opacity: 0, y: 20 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.5, delay: 0.5 }"
        >
         
        </Motion>
      </section>

     

      <!-- Operativos -->
      <OperativosCard 
        v-if="visibilidadSeccion.operativos"
        :operativos="operativos"
        @verCalendario="handleVerCalendario"
      />

    </main>
  </div>
</template>

<style scoped>
.gradient-mesh {
  background: 
    radial-gradient(at 20% 10%, rgba(226, 232, 240, 0.6) 0px, transparent 50%),
    radial-gradient(at 80% 0%, rgba(221, 214, 254, 0.35) 0px, transparent 50%),
    radial-gradient(at 0% 60%, rgba(236, 253, 245, 0.5) 0px, transparent 50%),
    radial-gradient(at 90% 60%, rgba(209, 250, 229, 0.35) 0px, transparent 50%),
    radial-gradient(at 10% 100%, rgba(251, 245, 237, 0.6) 0px, transparent 50%);
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

/* Scrollbar styling */
.home-ios::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.home-ios::-webkit-scrollbar-track {
  background: rgba(147, 51, 234, 0.05);
  border-radius: 10px;
}

.home-ios::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #a855f7, #7c3aed);
  border-radius: 10px;
}
</style>
