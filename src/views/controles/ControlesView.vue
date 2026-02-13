<script setup>
/**
 * ControlesView - Vista de "Nueva Medición"
 * Carga dinámicamente los protocolos disponibles desde los health plans del paciente
 */
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTiendaUsuario } from '@/stores/tiendaUsuario'
import { getAvailableProtocols } from '@/services/healthPlanService'
import {
  HelpCircle,
  Check,
  Heart,
  Scale,
  Droplet,
  ArrowRight,
  Activity,
  Loader2,
  AlertCircle
} from 'lucide-vue-next'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/bearnie/carousel"
import HeaderCompleto from "@/components/ui/HeaderCompleto.vue";
import SkeletonCard from '@/components/ui/SkeletonCard.vue'

// Router y Store
const router = useRouter()
const userStore = useTiendaUsuario()

// Estado
const protocols = ref([])
const isLoading = ref(true)
const error = ref(null)
const selectedProtocol = ref(null)

// Cargar protocolos al montar el componente
onMounted(async () => {
  await loadProtocols()
})

// Cargar protocolos disponibles
async function loadProtocols() {
  isLoading.value = true
  error.value = null

  try {
    // Usar patient_id numérico de la API HOMA, NO el Firebase UID
    const patientId = userStore.usuario?.patient_id

    if (!patientId) {
      throw new Error('No se encontró ID del paciente. Asegúrate de haber iniciado sesión correctamente.')
    }

    console.log('Cargando protocolos para paciente ID:', patientId)

    const result = await getAvailableProtocols(patientId)

    if (result.success) {
      protocols.value = result.data
      console.log('Protocolos cargados:', protocols.value)
    } else {
      throw new Error(result.error || 'No se pudieron cargar los protocolos')
    }
  } catch (err) {
    console.error('Error cargando protocolos:', err)
    error.value = err.message || 'Error al cargar los protocolos disponibles'
  } finally {
    isLoading.value = false
  }
}

// Seleccionar protocolo
function selectProtocol(protocol) {
  selectedProtocol.value = protocol
}

// Continuar al wizard
function continueMeasurement() {
  if (!selectedProtocol.value) return

  // Navegar al wizard dinámico con el ID del protocolo (como integer)
  router.push({
    path: '/nueva-medicion/wizard',
    query: {
      protocol: selectedProtocol.value.id,
      name: selectedProtocol.value.name
    }
  })
}

// Obtener icono según el nombre del protocolo
function getProtocolIcon(name) {
  const lowerName = name?.toLowerCase() || ''
  if (lowerName.includes('presión') || lowerName.includes('tensión') || lowerName.includes('arterial')) {
    return Heart
  }
  if (lowerName.includes('peso') || lowerName.includes('imc') || lowerName.includes('masa')) {
    return Scale
  }
  if (lowerName.includes('glucosa') || lowerName.includes('glicemia') || lowerName.includes('azúcar')) {
    return Droplet
  }
  return Activity
}

// Obtener color según el nombre del protocolo
function getProtocolColor(name) {
  const lowerName = name?.toLowerCase() || ''
  if (lowerName.includes('presión') || lowerName.includes('tensión') || lowerName.includes('arterial')) {
    return { bg: 'bg-red-50', icon: 'text-[#DC2626]', border: 'border-red-200' }
  }
  if (lowerName.includes('peso') || lowerName.includes('imc') || lowerName.includes('masa')) {
    return { bg: 'bg-orange-50', icon: 'text-[#FF9500]', border: 'border-orange-200' }
  }
  if (lowerName.includes('glucosa') || lowerName.includes('glicemia') || lowerName.includes('azúcar')) {
    return { bg: 'bg-blue-50', icon: 'text-[#3B82F6]', border: 'border-blue-200' }
  }
  return { bg: 'bg-gray-50', icon: 'text-gray-600', border: 'border-gray-200' }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col font-sans" style="font-family: 'Cabinet Grotesk', sans-serif;">

    <!-- Header Completo -->
    <HeaderCompleto
      titulo="Nueva Medición"
      subtitulo="Selecciona un control para registrar tus valores"
      :mostrar-saludo="false"
      :show-notification-badge="true"
      notification-badge-color="#10B981"
      @click-notification="console.log('Notificaciones clicked')"
      @click-profile="console.log('Perfil clicked')"
    />

    <!-- Content Area -->
    <div class="flex-1 overflow-y-auto p-8">
      <div class="max-w-7xl mx-auto">
        <!-- Greeting Section -->
        <div class="mb-10">
          <h2 class="text-h1 text-slate-900 mb-2">
            Hola, {{ userStore.nombreCompleto?.split(' ')[0] || 'Usuario' }} 👋
          </h2>
          <p class="text-body text-lg text-slate-600">Selecciona el control que deseas realizar hoy</p>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="flex flex-col py-20 max-w-7xl mx-auto px-8">
          <!-- Greeting skeleton -->
          <div class="mb-10 space-y-4 animate-pulse">
            <div class="h-12 w-96 bg-slate-200 rounded max-w-full"></div>
            <div class="h-6 w-64 bg-slate-200 rounded max-w-full"></div>
          </div>

          <!-- Protocols section skeleton -->
          <div class="mb-8">
            <div class="h-8 w-64 bg-slate-200 rounded mb-6 animate-pulse"></div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <SkeletonCard 
                v-for="i in 6" 
                :key="`protocol-skeleton-${i}`" 
                :show-chart="false"
              />
            </div>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="flex flex-col items-center justify-center py-20">
          <AlertCircle class="w-12 h-12 text-red-500 mb-4" />
          <p class="text-red-600 text-lg font-medium mb-2">{{ error }}</p>
          <button
            @click="loadProtocols"
            class="mt-4 px-6 py-2 text-white rounded-lg hover:opacity-90 transition-colors"
            :style="{ backgroundColor: 'var(--theme-primary)' }"
          >
            Reintentar
          </button>
        </div>

        <!-- Empty State -->
        <div v-else-if="protocols.length === 0" class="flex flex-col items-center justify-center py-20">
          <Activity class="w-12 h-12 text-gray-400 mb-4" />
          <p class="text-slate-900 text-lg font-medium mb-2">No hay controles disponibles</p>
          <p class="text-slate-600 text-center max-w-md">
            No tienes protocolos de control asignados en tu plan actual.
            Contacta a tu equipo de salud para más información.
          </p>
        </div>

        <!-- Protocols Grid -->
        <template v-else>
          <div class="mb-8">
            <h3 class="text-h2 text-slate-900 mb-6">
              Controles disponibles ({{ protocols.length }})
            </h3>

            <div class="px-12">
              <Carousel :spacing="24" class="w-full">
                <CarouselContent>
                  <CarouselItem
                    v-for="protocol in protocols"
                    :key="protocol.id"
                    class="basis-full md:basis-1/2 lg:basis-1/3"
                  >
                    <div
                      @click="selectProtocol(protocol)"
                      class="protocol-card bg-white rounded-2xl border-2 p-6 cursor-pointer relative transition-all duration-200 h-full"
                      :class="selectedProtocol?.id === protocol.id
                        ? 'ring-4 selected-shadow'
                        : 'border-transparent hover:shadow-xl'"
                      :style="selectedProtocol?.id === protocol.id ? { borderColor: 'var(--theme-primary)', '--tw-ring-color': 'var(--theme-primary)', '--tw-ring-opacity': '0.1' } : {}"
                    >
                      <!-- Checkmark -->
                      <div
                        class="absolute top-4 right-4 w-8 h-8 bg-[#10B981] rounded-full flex items-center justify-center transition-all duration-200"
                        :class="selectedProtocol?.id === protocol.id ? 'opacity-100 scale-100' : 'opacity-0 scale-75'"
                      >
                        <Check class="text-white w-5 h-5" />
                      </div>

                      <!-- Icon -->
                      <div
                        class="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                        :class="getProtocolColor(protocol.name).bg"
                      >
                        <component
                          :is="getProtocolIcon(protocol.name)"
                          class="w-8 h-8"
                          :class="getProtocolColor(protocol.name).icon"
                        />
                      </div>

                      <!-- Content -->
                      <h4 class="text-h3 text-slate-900 mb-2">
                        {{ protocol.name }}
                      </h4>
                      <p class="text-body text-slate-600 mb-4 text-sm">
                        {{ protocol.description || 'Control de salud programado' }}
                      </p>

                      <!-- Health Plan Badge -->
                      <div class="flex items-center gap-2">
                        <span class="px-3 py-1 bg-gray-100 text-slate-600 text-xs rounded-full">
                          {{ protocol.healthPlanName || 'Plan de Salud' }}
                        </span>
                      </div>

                      <!-- Button -->
                      <button
                        class="w-full mt-6 py-3 px-4 border-2 rounded-xl font-medium transition-colors"
                        :class="selectedProtocol?.id === protocol.id
                          ? 'text-white'
                          : 'bg-white text-gray-700 border-gray-200'"
                        :style="selectedProtocol?.id === protocol.id ? { backgroundColor: 'var(--theme-primary)', borderColor: 'var(--theme-primary)' } : {}"
                        @mouseenter="selectedProtocol?.id !== protocol.id && $event.target.style.setProperty('border-color', 'var(--theme-primary)')"
                        @mouseleave="selectedProtocol?.id !== protocol.id && $event.target.style.removeProperty('border-color')"
                      >
                        {{ selectedProtocol?.id === protocol.id ? 'Seleccionado' : 'Seleccionar' }}
                      </button>
                    </div>
                  </CarouselItem>
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </div>
          </div>

          <!-- Continue Button -->
          <div class="flex justify-end pt-6 border-t border-gray-200">
            <button
              @click="continueMeasurement"
              :disabled="!selectedProtocol"
              class="px-8 py-4 font-bold rounded-xl transition-all flex items-center gap-2 hover:opacity-90"
              :class="selectedProtocol
                ? 'text-white cursor-pointer shadow-lg'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'"
              :style="selectedProtocol ? { backgroundColor: 'var(--theme-primary)' } : {}"
            >
              <span>Continuar</span>
              <ArrowRight class="w-5 h-5" />
            </button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.font-display {
  font-family: 'Cabinet Grotesk', sans-serif;
}

.selected-shadow {
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
}
</style>
