<script setup>
/**
 * DiagnosticoView - Landing Page de Diagnóstico
 * Muestra el estado de todos los servicios y vistas disponibles
 * Útil para debugging y planificación de UX
 */
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Loader2, 
  ExternalLink,
  Home,
  Calendar,
  Activity,
  BookOpen,
  HelpCircle,
  MessageCircle,
  Video,
  Megaphone,
  ClipboardList,
  User,
  RefreshCw,
  Heart,
  FileText
} from 'lucide-vue-next'
import ThemeSwitcher from '@/components/debug/ThemeSwitcher.vue'

// Estado
const router = useRouter()
const loading = ref(true)
const error = ref(null)
const serviciosRaw = ref([])
const perfilRaw = ref(null)

// Mapeo de rutas a vistas
const vistasConfig = [
  { 
    nombre: 'Home', 
    ruta: '/home', 
    icono: Home, 
    descripcion: 'Panel principal con servicios dinámicos',
    serviciosRelacionados: ['BIENVENIDA', 'BANNERS', 'OPERATIVOS']
  },
  { 
    nombre: 'Controles', 
    ruta: '/controles', 
    icono: Activity, 
    descripcion: 'Protocolos de medición y historial',
    serviciosRelacionados: ['CONTROLES', 'ÚLTIMA MEDICIÓN', 'ULTIMA_MEDICION']
  },
  { 
    nombre: 'Citas', 
    ruta: '/citas', 
    icono: Calendar, 
    descripcion: 'Wizard de agendamiento de citas',
    serviciosRelacionados: ['PRÓXIMOS CONTROLES', 'PROXIMOS_CONTROLES']
  },
  { 
    nombre: 'Recursos', 
    ruta: '/recursos', 
    icono: BookOpen, 
    descripcion: 'Biblioteca de recursos educativos',
    serviciosRelacionados: ['MATERIAL AUDIOVISUAL']
  },
  { 
    nombre: 'Ayuda', 
    ruta: '/ayuda', 
    icono: HelpCircle, 
    descripcion: 'Centro de soporte y FAQ',
    serviciosRelacionados: ['CHATBOT', 'TELECONSULTA']
  },
  { 
    nombre: 'Mensajes', 
    ruta: '/mensajes', 
    icono: MessageCircle, 
    descripcion: 'Centro de notificaciones',
    serviciosRelacionados: []
  },
  { 
    nombre: 'Perfil', 
    ruta: '/perfil', 
    icono: User, 
    descripcion: 'Configuración de cuenta',
    serviciosRelacionados: []
  },
  // Vistas Mockup / En desarrollo
  { nombre: 'Vida Sana', ruta: '/vida-sana', icono: Heart, descripcion: 'Mockup', serviciosRelacionados: ['VIDA SANA'] },
  { nombre: 'Videos Salud', ruta: '/videos', icono: Video, descripcion: 'Mockup', serviciosRelacionados: ['VIDEOS'] },
  { nombre: 'Recomendaciones', ruta: '/recomendaciones', icono: ClipboardList, descripcion: 'Mockup', serviciosRelacionados: ['RECOMENDACIONES'] },
  { nombre: 'Biométrico', ruta: '/biometrico', icono: RefreshCw, descripcion: 'Mockup', serviciosRelacionados: ['BIOMETRICO'] },
  { nombre: 'OMT', ruta: '/omt', icono: Activity, descripcion: 'Mockup', serviciosRelacionados: ['OMT'] },
  { nombre: 'Encuesta', ruta: '/encuesta', icono: FileText, descripcion: 'Mockup', serviciosRelacionados: ['ENCUESTA'] },
  { nombre: 'Operativos', ruta: '/operativos', icono: Megaphone, descripcion: 'Mockup', serviciosRelacionados: ['OPERATIVOS'] }
]

// Vistas faltantes (servicios sin vista)
const vistasFaltantes = ref([])

// Cargar datos
async function fetchAllData() {
  loading.value = true
  error.value = null
  
  try {
    const sessionMeta = localStorage.getItem("mio-session-meta")
    const token = localStorage.getItem("mio-token")
    
    if (!sessionMeta || !token) {
      throw new Error("No hay sesión activa. Por favor, inicia sesión.")
    }
    
    const { patient_id } = JSON.parse(sessionMeta)
    const baseUrl = import.meta.env.VITE_API_HOMA_URL
    
    // Cargar servicios
    const servicesRes = await fetch(
      `${baseUrl}/api/v1/patients/${patient_id}/services`,
      { headers: { 'X-API-KEY': token } }
    )
    
    if (!servicesRes.ok) throw new Error(`Error ${servicesRes.status} al cargar servicios`)
    
    const servicesData = await servicesRes.json()
    serviciosRaw.value = servicesData?.data?.services || servicesData?.services || []
    
    // Cargar perfil
    const perfilRes = await fetch(
      `${baseUrl}/api/v1/patients/${patient_id}`,
      { headers: { 'X-API-KEY': token } }
    )
    
    if (perfilRes.ok) {
      const perfilData = await perfilRes.json()
      perfilRaw.value = perfilData?.data?.patient?.[0] || perfilData?.patient || perfilData?.data || {}
    }
    
    // Identificar vistas faltantes
    const serviciosMapeados = vistasConfig.flatMap(v => v.serviciosRelacionados).map(s => s.toUpperCase())
    vistasFaltantes.value = serviciosRaw.value
      .filter(s => !serviciosMapeados.includes(s.name?.toUpperCase()))
      .map(s => s.name)
    
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

// Obtener servicio por nombre
function getServicio(nombres) {
  return serviciosRaw.value.filter(s => 
    nombres.some(n => s.name?.toUpperCase().includes(n.toUpperCase()))
  )
}

// Obtener items de un servicio
function getServicioItems(nombreServicio) {
  const servicio = serviciosRaw.value.find(s => 
    s.name?.toUpperCase().includes(nombreServicio.toUpperCase())
  )
  return servicio?.options || []
}

// Navegación
function goToView(ruta) {
  window.location.href = ruta
}

onMounted(() => {
  fetchAllData()
})
</script>

<template>
  <div class="diagnostico-view p-6 max-w-7xl mx-auto space-y-8">
    <!-- Header -->
    <header class="text-center mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        🔍 Diagnóstico de Vistas y Servicios
      </h1>
      <p class="text-gray-500 dark:text-gray-400">
        Visualiza el estado de todas las vistas y los datos disponibles desde la API
      </p>
      <Button @click="fetchAllData" class="mt-4" variant="outline">
        <RefreshCw class="mr-2 h-4 w-4" />
        Recargar Datos
      </Button>
    </header>

    <!-- Theme Switcher (Branding Debug) -->
    <ThemeSwitcher />

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-16">
      <Loader2 class="h-12 w-12 text-primary animate-spin" />
    </div>

    <!-- Error -->
    <Card v-else-if="error" class="border-destructive">
      <CardContent class="text-center py-8">
        <XCircle class="h-12 w-12 text-destructive mx-auto mb-4" />
        <p class="text-destructive font-medium">{{ error }}</p>
        <Button @click="goToView('/')" class="mt-4" variant="outline">
          Ir a Login
        </Button>
      </CardContent>
    </Card>

    <!-- Content -->
    <div v-else class="space-y-8">
      <!-- Perfil del Paciente -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <User class="h-5 w-5" />
            Perfil del Paciente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span class="text-gray-500">Nombre:</span>
              <p class="font-medium">{{ perfilRaw?.nombre || perfilRaw?.name || 'N/A' }}</p>
            </div>
            <div>
              <span class="text-gray-500">RUT:</span>
              <p class="font-medium">{{ perfilRaw?.rut || 'N/A' }}</p>
            </div>
            <div>
              <span class="text-gray-500">Email:</span>
              <p class="font-medium">{{ perfilRaw?.email || 'N/A' }}</p>
            </div>
            <div>
              <span class="text-gray-500">Plan:</span>
              <p class="font-medium">{{ perfilRaw?.medical_plan_name || perfilRaw?.plan || 'N/A' }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Resumen de Servicios -->
      <Card>
        <CardHeader>
          <CardTitle>📊 Resumen de Servicios ({{ serviciosRaw.length }} total)</CardTitle>
          <CardDescription>Haz clic en un servicio para ver su Mockup detallado</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="flex flex-wrap gap-2">
            <button 
              v-for="servicio in serviciosRaw" 
              :key="servicio.service_id"
              @click="router.push(`/mockup/${encodeURIComponent(servicio.name)}`)"
              class="px-3 py-1 rounded-full text-xs font-medium transition-transform hover:scale-105 active:scale-95 border cursor-pointer"
              :class="getServicio([servicio.name]).length > 0 
                ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400' 
                : 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400'"
              title="Ver Mockup Detallado"
            >
              {{ servicio.name }}
              <span v-if="servicio.options?.length" class="ml-1 opacity-60">
                ({{ servicio.options.length }})
              </span>
            </button>
          </div>
        </CardContent>
      </Card>

      <!-- Vistas del Proyecto -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card 
          v-for="vista in vistasConfig" 
          :key="vista.ruta"
          class="hover:shadow-lg transition-shadow cursor-pointer group"
          @click="goToView(vista.ruta)"
        >
          <CardHeader class="pb-2">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <component :is="vista.icono" class="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle class="text-lg">{{ vista.nombre }}</CardTitle>
                  <CardDescription>{{ vista.ruta }}</CardDescription>
                </div>
              </div>
              <ExternalLink class="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </CardHeader>
          <CardContent>
            <p class="text-sm text-gray-500 mb-4">{{ vista.descripcion }}</p>
            
            <!-- Servicios relacionados -->
            <div v-if="vista.serviciosRelacionados.length > 0" class="space-y-2">
              <p class="text-xs font-medium text-gray-400 uppercase">Servicios asociados:</p>
              <div 
                v-for="nombreServ in vista.serviciosRelacionados" 
                :key="nombreServ"
                class="flex items-center gap-2"
              >
                <CheckCircle 
                  v-if="getServicio([nombreServ]).length > 0" 
                  class="h-4 w-4 text-green-500" 
                />
                <AlertCircle v-else class="h-4 w-4 text-yellow-500" />
                <span class="text-sm">{{ nombreServ }}</span>
                <span 
                  v-if="getServicioItems(nombreServ).length > 0" 
                  class="text-xs text-gray-400"
                >
                  ({{ getServicioItems(nombreServ).length }} items)
                </span>
              </div>
            </div>
            <p v-else class="text-xs text-gray-400 italic">Sin servicios específicos</p>
          </CardContent>
        </Card>
      </div>

      <!-- Servicios sin Vista -->
      <Card v-if="vistasFaltantes.length > 0" class="border-yellow-200 dark:border-yellow-900">
        <CardHeader>
          <CardTitle class="flex items-center gap-2 text-yellow-600">
            <AlertCircle class="h-5 w-5" />
            Servicios sin Vista Asignada
          </CardTitle>
          <CardDescription>Estos servicios de la API no tienen una vista dedicada aún</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="flex flex-wrap gap-2">
            <span 
              v-for="servicio in vistasFaltantes" 
              :key="servicio"
              class="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
            >
              {{ servicio }}
            </span>
          </div>
        </CardContent>
      </Card>

      <!-- Datos Raw de Servicios -->
      <Card>
        <CardHeader>
          <CardTitle>🔧 Datos Raw de Servicios (Debug)</CardTitle>
          <CardDescription>Datos completos de la API para debugging</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="max-h-[400px] overflow-auto bg-gray-900 rounded-lg p-4">
            <pre class="text-xs text-green-400 whitespace-pre-wrap">{{ JSON.stringify(serviciosRaw, null, 2) }}</pre>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<style scoped>
.diagnostico-view {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
}

:deep(.dark) .diagnostico-view {
  background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
}
</style>
