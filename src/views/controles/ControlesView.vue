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
  Bell,
  Check,
  Heart,
  Scale,
  Droplet,
  ArrowRight,
  Activity,
  Loader2,
  AlertCircle
} from 'lucide-vue-next'

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
  <div class="min-h-screen bg-gray-50 flex flex-col font-sans">

    <!-- Header Personalizado -->
    <header class="bg-white border-b border-gray-200 px-8 py-5 flex-shrink-0">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="font-display font-bold text-2xl text-gray-900">Nueva Medición</h1>
          <p class="text-gray-500 text-sm mt-1">Selecciona un control para registrar tus valores</p>
        </div>
        <div class="flex items-center gap-4">
          <button class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <HelpCircle class="w-6 h-6" />
          </button>
          <button class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors relative">
            <Bell class="w-6 h-6" />
            <span class="absolute top-2 right-2 w-2 h-2 bg-[#DC2626] rounded-full"></span>
          </button>
        </div>
      </div>
    </header>

    <!-- Content Area -->
    <div class="flex-1 overflow-y-auto p-8">
      <div class="max-w-5xl mx-auto">
        <!-- Greeting Section -->
        <div class="mb-10">
          <h2 class="font-display font-bold text-4xl text-gray-900 mb-2">
            Hola, {{ userStore.nombreCompleto?.split(' ')[0] || 'Usuario' }} 👋
          </h2>
          <p class="text-gray-500 text-lg">Selecciona el control que deseas realizar hoy</p>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="flex flex-col items-center justify-center py-20">
          <Loader2 class="w-12 h-12 text-[#FF9500] animate-spin mb-4" />
          <p class="text-gray-500">Cargando controles disponibles...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="flex flex-col items-center justify-center py-20">
          <AlertCircle class="w-12 h-12 text-red-500 mb-4" />
          <p class="text-red-600 text-lg font-medium mb-2">{{ error }}</p>
          <button
            @click="loadProtocols"
            class="mt-4 px-6 py-2 bg-[#FF9500] text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Reintentar
          </button>
        </div>

        <!-- Empty State -->
        <div v-else-if="protocols.length === 0" class="flex flex-col items-center justify-center py-20">
          <Activity class="w-12 h-12 text-gray-400 mb-4" />
          <p class="text-gray-600 text-lg font-medium mb-2">No hay controles disponibles</p>
          <p class="text-gray-500 text-center max-w-md">
            No tienes protocolos de control asignados en tu plan actual.
            Contacta a tu equipo de salud para más información.
          </p>
        </div>

        <!-- Protocols Grid -->
        <template v-else>
          <div class="mb-8">
            <h3 class="font-display font-bold text-xl text-gray-900 mb-6">
              Controles disponibles ({{ protocols.length }})
            </h3>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div
                v-for="protocol in protocols"
                :key="protocol.id"
                @click="selectProtocol(protocol)"
                class="protocol-card bg-white rounded-2xl border-2 p-6 cursor-pointer relative transition-all duration-200"
                :class="selectedProtocol?.id === protocol.id
                  ? 'border-[#FF9500] ring-4 ring-[#FF9500]/10 selected-shadow'
                  : 'border-transparent hover:shadow-xl'"
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
                <h4 class="font-display font-bold text-xl text-gray-900 mb-2">
                  {{ protocol.name }}
                </h4>
                <p class="text-gray-500 mb-4 text-sm">
                  {{ protocol.description || 'Control de salud programado' }}
                </p>

                <!-- Health Plan Badge -->
                <div class="flex items-center gap-2">
                  <span class="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    {{ protocol.healthPlanName || 'Plan de Salud' }}
                  </span>
                </div>

                <!-- Button -->
                <button
                  class="w-full mt-6 py-3 px-4 border-2 rounded-xl font-medium transition-colors"
                  :class="selectedProtocol?.id === protocol.id
                    ? 'bg-[#FF9500] text-white border-[#FF9500]'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-[#FF9500] hover:text-[#FF9500]'"
                >
                  {{ selectedProtocol?.id === protocol.id ? 'Seleccionado' : 'Seleccionar' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Continue Button -->
          <div class="flex justify-end pt-6 border-t border-gray-200">
            <button
              @click="continueMeasurement"
              :disabled="!selectedProtocol"
              class="px-8 py-4 font-bold rounded-xl transition-all flex items-center gap-2"
              :class="selectedProtocol
                ? 'bg-[#FF9500] text-white hover:bg-orange-600 cursor-pointer shadow-lg hover:shadow-orange-500/20'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'"
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
