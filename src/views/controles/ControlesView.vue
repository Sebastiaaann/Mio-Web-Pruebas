<script setup>
/**
 * ControlesView - Vista de "Nueva Medición"
 * Carga dinámicamente los protocolos disponibles desde los health plans del paciente
 */
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTiendaUsuario } from '@/stores/tiendaUsuario'
import { useHealthStore } from '@/stores/tiendaSalud'
import { getAvailableProtocols } from '@/services/healthPlanService'
import { logger } from '@/utils/logger';
import {
  Check,
  Heart,
  Scale,
  Droplet,
  ArrowRight,
  Activity,
  AlertCircle,
  ChevronRight,
} from 'lucide-vue-next'
import HeaderCompleto from "@/components/ui/HeaderCompleto.vue";
import SkeletonCard from '@/components/ui/SkeletonCard.vue'

// Router y Store
const router = useRouter()
const userStore = useTiendaUsuario()
const healthStore = useHealthStore()

// Estado
const protocols = ref([])
const isLoading = ref(true)
const error = ref(null)
const selectedProtocol = ref(null)

// Fecha del último registro por protocolo
const ultimoRegistroPorProtocolo = computed(() => {
  const mapa = {}
  for (const protocol of protocols.value) {
    const entradas = healthStore.historialMediciones?.[protocol.id]
    if (entradas && entradas.length > 0) {
      // Ordenar descendente por fecha para garantizar el más reciente primero
      const ordenadas = [...entradas].sort(
        (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      )
      mapa[protocol.id] = new Date(ordenadas[0].fecha)
    } else {
      mapa[protocol.id] = null
    }
  }
  return mapa
})

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

    logger.info('Cargando protocolos para paciente ID:', patientId)

    const result = await getAvailableProtocols(patientId, { incluirDuplicados: true })

    if (result.success) {
      protocols.value = result.data
      logger.info('Protocolos cargados:', protocols.value)
    } else {
      throw new Error(result.error || 'No se pudieron cargar los protocolos')
    }
  } catch (err) {
    logger.error('Error cargando protocolos:', err)
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

  const planId = selectedProtocol.value.healthPlanId || selectedProtocol.value.health_plan_id
  const planName = selectedProtocol.value.healthPlanName || selectedProtocol.value.plan_name

  // Navegar al wizard dinámico con el ID del protocolo (como integer)
  router.push({
    path: '/nueva-medicion/wizard',
    query: {
      protocol: selectedProtocol.value.id,
      name: selectedProtocol.value.name,
      planId: planId ? String(planId) : undefined,
      planName: planName || undefined
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
      @click-notification="logger.info('Notificaciones clicked')"
      @click-profile="logger.info('Perfil clicked')"
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

            <!-- Lista vertical de protocolos -->
            <div class="space-y-4">
              <div
                v-for="protocol in protocols"
                :key="protocol.uid || protocol.id"
                @click="selectProtocol(protocol)"
                class="flex items-center gap-4 bg-white rounded-2xl border-2 p-5 cursor-pointer transition-all duration-200 hover:shadow-md"
                :class="selectedProtocol?.id === protocol.id ? 'shadow-md' : 'border-gray-100'"
                :style="selectedProtocol?.id === protocol.id
                  ? { borderColor: 'var(--theme-primary)', backgroundColor: 'var(--theme-primary-light, #f5f3ff)' }
                  : {}"
              >
                <!-- Icono -->
                <div
                  class="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                  :class="getProtocolColor(protocol.name).bg"
                >
                  <component
                    :is="getProtocolIcon(protocol.name)"
                    class="w-7 h-7"
                    :class="getProtocolColor(protocol.name).icon"
                  />
                </div>

                <!-- Contenido -->
                <div class="flex-1 min-w-0">
                  <h4 class="text-base font-bold text-slate-900 truncate">{{ protocol.name }}</h4>
                  <p class="text-sm text-slate-500 mb-1.5 line-clamp-1">
                    {{ protocol.description || 'Control de salud programado' }}
                  </p>
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="px-2.5 py-0.5 bg-gray-100 text-slate-600 text-xs rounded-full">
                      {{ protocol.healthPlanName || 'Plan de Salud' }}
                    </span>
                    <span v-if="ultimoRegistroPorProtocolo[protocol.id]" class="text-xs text-slate-400">
                      Último: {{ ultimoRegistroPorProtocolo[protocol.id].toLocaleDateString('es-CL') }}
                    </span>
                    <span v-else class="text-xs text-slate-400">Sin registros</span>
                  </div>
                </div>

                <!-- Check / Chevron -->
                <div class="shrink-0">
                  <div
                    v-if="selectedProtocol?.id === protocol.id"
                    class="w-8 h-8 bg-[#10B981] rounded-full flex items-center justify-center"
                  >
                    <Check class="text-white w-5 h-5" />
                  </div>
                  <ChevronRight v-else class="w-5 h-5 text-gray-400" />
                </div>
              </div>
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
</style>
