<script setup>
/**
 * ServiceMockupView - Vista Landing Genérica
 * Detecta automáticamente la estructura del servicio y genera una vista atractiva.
 * Permite visualizar todos los datos disponibles para planificar la UI final.
 */
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  ArrowLeft, 
  Package, 
  ExternalLink, 
  Image as ImageIcon,
  FileText,
  List,
  Code,
  LayoutGrid,
  Info
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import BannerCarousel from '@/components/ui/BannerCarousel.vue'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const error = ref(null)
const serviceData = ref(null)

const props = defineProps({
  serviceName: {
    type: String,
    default: null
  }
})

// Computed: Uses prop if available, otherwise route param
const serviceName = computed(() => props.serviceName || route.params.serviceId)

// Cargar datos
async function fetchServiceData() {
  loading.value = true
  error.value = null
  serviceData.value = null
  
  try {
    const sessionMeta = localStorage.getItem("mio-session-meta")
    const token = localStorage.getItem("mio-token")
    
    if (!sessionMeta || !token) throw new Error("No hay sesión activa")
    
    const { patient_id } = JSON.parse(sessionMeta)
    const baseUrl = import.meta.env.VITE_API_HOMA_URL
    
    const response = await fetch(
      `${baseUrl}/api/v1/patients/${patient_id}/services`,
      { headers: { 'X-API-KEY': token } }
    )
    
    if (!response.ok) throw new Error("Error cargando servicios")
    
    const data = await response.json()
    const services = data?.data?.services || data?.services || []
    
    // Buscar servicio por nombre (case insensitive, partial match)
    const found = services.find(s => 
      s.name?.toUpperCase() === serviceName.value?.toUpperCase() ||
      s.name?.toUpperCase().includes(serviceName.value?.toUpperCase())
    )
    
    if (!found) {
        // Intento de búsqueda inversa si el param es un slug
        const decoded = decodeURIComponent(serviceName.value).replace(/-/g, ' ')
        const foundSlack = services.find(s => s.name?.toUpperCase().includes(decoded.toUpperCase()))
        
        if (foundSlack) {
             serviceData.value = foundSlack
        } else {
             throw new Error(`Servicio "${serviceName.value}" no encontrado`)
        }
    } else {
        serviceData.value = found
    }

  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

// Helpers para visualización
const hasItems = computed(() => {
    return (serviceData.value?.options?.length > 0) || (serviceData.value?.items?.length > 0)
})

const items = computed(() => {
    return serviceData.value?.options || serviceData.value?.items || []
})

const bannerItems = computed(() => {
    return items.value.filter(i => i.image || i.imagen)
        .map(i => ({
             image: i.image || i.imagen,
             title: i.title || i.name || i.titulo,
             description: i.description || i.descripcion,
             url: i.url || i.link || '#'
        }))
})

function goBack() {
  router.back()
}

onMounted(() => {
  if (serviceName.value) fetchServiceData()
})

watch(() => route.params.serviceId, () => {
    if (route.params.serviceId) fetchServiceData()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
    <!-- Header Navigation -->
    <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20">
      <div class="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <Button variant="ghost" size="icon" @click="goBack">
            <ArrowLeft class="w-5 h-5" />
          </Button>
          <div>
            <h1 class="font-bold text-lg text-gray-900 dark:text-gray-100 flex items-center gap-2">
               <Package class="w-5 h-5 text-indigo-500" />
               Mockup: {{ serviceName }}
            </h1>
          </div>
        </div>
        
        <div class="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-500">
            ID: {{ serviceData?.service_id || 'N/A' }}
        </div>
      </div>
    </header>

    <div v-if="loading" class="flex justify-center items-center h-[50vh]">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>

    <div v-else-if="error" class="max-w-md mx-auto mt-20 p-6 text-center">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package class="w-8 h-8 text-red-500" />
        </div>
        <h3 class="text-lg font-bold text-gray-900 mb-2">Servicio no encontrado</h3>
        <p class="text-gray-500 mb-6">{{ error }}</p>
        <Button @click="goBack">Volver</Button>
    </div>

    <div v-else class="max-w-7xl mx-auto px-4 py-8 space-y-8">
        
        <!-- Hero Section Automático -->
        <div class="relative overflow-hidden rounded-3xl bg-indigo-600 text-white p-8 md:p-12 shadow-xl">
             <div class="relative z-10 max-w-2xl">
                 <div class="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium mb-4 border border-white/10">
                     <Info class="w-4 h-4" />
                     Vista Previa Generada Automáticamente
                 </div>
                 <h1 class="text-4xl md:text-5xl font-bold mb-4 capitalize">
                     {{ serviceData.name?.toLowerCase() }}
                 </h1>
                 <p class="text-indigo-100 text-lg md:text-xl leading-relaxed max-w-xl">
                     {{ serviceData.description || 'Sin descripción disponible para este servicio.' }}
                 </p>
                 
                 <div class="flex gap-4 mt-8">
                     <Button class="bg-white text-indigo-600 hover:bg-gray-100 border-0">
                         Simular Acción Principal
                     </Button>
                     <Button variant="outline" class="text-white border-white/30 hover:bg-white/10">
                         Ver Documentación
                     </Button>
                 </div>
             </div>
             
             <!-- Decorative elements -->
             <div class="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-indigo-500 rounded-full blur-3xl opacity-50"></div>
             <div class="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-purple-500 rounded-full blur-3xl opacity-50"></div>
        </div>

        <!-- Layout de Contenido -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <!-- Columna Izquierda: Contenido Principal -->
            <div class="lg:col-span-2 space-y-8">
                
                <!-- 1. Si tiene imágenes -> Carrusel -->
                <section v-if="bannerItems.length > 0">
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <ImageIcon class="w-5 h-5 text-gray-400" />
                        Galería / Banners
                    </h3>
                    <div class="h-[250px] rounded-2xl overflow-hidden shadow-sm">
                        <BannerCarousel :banners="bannerItems" />
                    </div>
                </section>

                <!-- 2. items/options Grid -->
                <section v-if="hasItems">
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <List class="w-5 h-5 text-gray-400" />
                        Items Disponibles ({{ items.length }})
                    </h3>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card v-for="(item, idx) in items" :key="idx" class="hover:shadow-md transition-shadow group cursor-pointer border-l-4 border-l-transparent hover:border-l-indigo-500">
                            <CardContent class="p-5">
                                <div class="flex items-start gap-4">
                                    <!-- Icono/Thumbnail -->
                                    <div class="shrink-0 w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                                        <img 
                                            v-if="item.image || item.thumbnail" 
                                            :src="item.image || item.thumbnail" 
                                            class="w-full h-full object-cover"
                                            alt=""
                                        />
                                        <Package v-else class="w-6 h-6 text-gray-400" />
                                    </div>
                                    
                                    <div class="flex-1 min-w-0">
                                        <h4 class="font-semibold text-gray-900 truncate pr-6">
                                            {{ item.name || item.title || item.titulo || `Item #${idx+1}` }}
                                        </h4>
                                        <p class="text-sm text-gray-500 line-clamp-2 mt-1">
                                            {{ item.description || item.descripcion || 'Sin descripción' }}
                                        </p>
                                        
                                        <!-- Tags/Metadatos -->
                                        <div class="flex flex-wrap gap-2 mt-3">
                                            <span v-if="item.id" class="px-2 py-0.5 rounded text-[10px] bg-gray-100 text-gray-600 font-mono">
                                                ID: {{ item.id }}
                                            </span>
                                            <span v-if="item.type" class="px-2 py-0.5 rounded text-[10px] bg-blue-50 text-blue-600 capitalize">
                                                {{ item.type }}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <ExternalLink class="w-4 h-4 text-gray-300 group-hover:text-indigo-500" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </section>
                
                <div v-else class="p-8 rounded-2xl border border-dashed border-gray-300 text-center">
                    <p class="text-gray-500">Este servicio no contiene items anidados (opciones) visibles.</p>
                </div>

            </div>

            <!-- Columna Derecha: Detalles Técnicos -->
            <div class="space-y-6">
                <!-- Metadata Card -->
                <Card>
                    <CardHeader>
                        <CardTitle class="text-base flex items-center gap-2">
                            <LayoutGrid class="w-4 h-4" />
                            Propiedades
                        </CardTitle>
                    </CardHeader>
                    <CardContent class="p-0">
                        <div class="divide-y divide-gray-100">
                            <div class="flex justify-between p-4 bg-gray-50">
                                <span class="text-sm text-gray-500">ID Servicio</span>
                                <span class="text-sm font-mono font-medium">{{ serviceData.service_id }}</span>
                            </div>
                            <div class="flex justify-between p-4">
                                <span class="text-sm text-gray-500">Posición</span>
                                <span class="text-sm font-medium">{{ serviceData.home_position || 'N/A' }}</span>
                            </div>
                            <div class="flex justify-between p-4 bg-gray-50">
                                <span class="text-sm text-gray-500">Items Count</span>
                                <span class="text-sm font-medium">{{ items.length }}</span>
                            </div>
                             <div class="flex justify-between p-4">
                                <span class="text-sm text-gray-500">Tiene Img</span>
                                <span class="text-sm font-medium">
                                    {{ serviceData.image ? 'Sí' : 'No' }}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <!-- RAW JSON Card -->
                <Card class="overflow-hidden">
                    <CardHeader class="bg-gray-900 border-b border-gray-800">
                         <CardTitle class="text-white text-sm font-mono flex items-center gap-2">
                            <Code class="w-4 h-4" />
                            RAW Response
                         </CardTitle>
                    </CardHeader>
                    <CardContent class="p-0 bg-gray-900">
                        <div class="max-h-[400px] overflow-auto p-4">
                            <pre class="text-xs text-green-400 font-mono whitespace-pre-wrap">{{ JSON.stringify(serviceData, null, 2) }}</pre>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>

    </div>
  </div>
</template>
