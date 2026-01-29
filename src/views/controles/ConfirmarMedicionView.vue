<script setup>
/**
 * ConfirmarMedicionView - Paso 4 del flujo de Nueva Medición
 * Permite al usuario revisar y confirmar los datos antes de guardar.
 */
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  HelpCircle, 
  Bell, 
  ArrowRight,
  ArrowLeft,
  Check,
  Heart,
  Activity,
  Calendar,
  Clock,
  Smile,
  AlertTriangle,
  AlertCircle,
  CheckCircle2
} from 'lucide-vue-next'

// Router
const route = useRoute()
const router = useRouter()

// Obtener datos desde query params
const tipoMedicion = computed(() => route.query.tipo || '')
const estadoAnimo = computed(() => route.query.estado || '')
const sistolica = computed(() => route.query.sistolica || '')
const diastolica = computed(() => route.query.diastolica || '')
const pulso = computed(() => route.query.pulso || '')

// Estado de guardado
const isSaving = ref(false)
const isSaved = ref(false)

// Rangos normales
const RANGES = {
  sistolica: { min: 90, max: 120 },
  diastolica: { min: 60, max: 80 },
  pulso: { min: 60, max: 100 }
}

// Opciones de estado de ánimo
const moodOptions = {
  'bien': { emoji: '😊', text: 'Me siento Bien', color: 'text-green-600', bgColor: 'bg-green-50' },
  'regular': { emoji: '😐', text: 'Regular', color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
  'mal': { emoji: '😞', text: 'Mal', color: 'text-red-600', bgColor: 'bg-red-50' }
}

// Obtener información del estado de ánimo
const moodInfo = computed(() => {
  return moodOptions[estadoAnimo.value] || { emoji: '❓', text: 'No especificado', color: 'text-gray-600', bgColor: 'bg-gray-50' }
})

// Validar si un valor está en rango normal
function isInRange(value, type) {
  const numValue = parseInt(value)
  if (isNaN(numValue) || value === '') return null
  const range = RANGES[type]
  return numValue >= range.min && numValue <= range.max
}

// Determinar el estado de la medición
const measurementStatus = computed(() => {
  const sistolicaNormal = isInRange(sistolica.value, 'sistolica')
  const diastolicaNormal = isInRange(diastolica.value, 'diastolica')
  const pulsoNormal = isInRange(pulso.value, 'pulso')
  
  // Si algún valor está fuera de rango (false), es crítico
  if (sistolicaNormal === false || diastolicaNormal === false || pulsoNormal === false) {
    return {
      type: 'danger',
      badge: 'Consulte a su médico',
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      description: 'Algunos valores están fuera de los rangos normales. Es recomendable consultar con un profesional de salud.'
    }
  }
  
  // Si todos están en rango (true), es normal
  if (sistolicaNormal === true && diastolicaNormal === true && pulsoNormal === true) {
    return {
      type: 'success',
      badge: 'Valores normales',
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      description: 'Todos los valores se encuentran dentro de los rangos normales.'
    }
  }
  
  // Si hay valores nulos o mixtos, es de advertencia
  return {
    type: 'warning',
    badge: 'Valores a monitorear',
    icon: AlertTriangle,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    description: 'Algunos valores podrían requerir atención. Mantén un seguimiento regular.'
  }
})

// Fecha y hora actual formateada
const currentDateTime = computed(() => {
  const now = new Date()
  const dateOptions = { day: 'numeric', month: 'long', year: 'numeric' }
  const timeOptions = { hour: '2-digit', minute: '2-digit' }
  return {
    date: now.toLocaleDateString('es-ES', dateOptions),
    time: now.toLocaleTimeString('es-ES', timeOptions)
  }
})

// Volver al paso anterior
function goBack() {
  router.push({
    path: '/nueva-medicion/valores',
    query: { 
      tipo: tipoMedicion.value,
      estado: estadoAnimo.value
    }
  })
}

// Guardar medición
async function saveMeasurement() {
  isSaving.value = true
  
  // Simular llamada a API
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  isSaving.value = false
  isSaved.value = true
}

// Volver a controles
function goToControles() {
  router.push('/controles')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col font-sans">
    
    <!-- Header -->
    <header class="bg-white border-b border-gray-200 px-8 py-5 flex-shrink-0">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div>
            <div class="flex items-center gap-3">
              <h1 class="font-display font-bold text-2xl text-gray-900">Nueva Medición</h1>
              <span class="px-3 py-1 bg-gray-100 text-gray-600 text-sm font-medium rounded-full">Manual</span>
            </div>
          </div>
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

    <!-- Progress Section -->
    <div class="bg-white px-8 py-6">
      <div class="max-w-4xl mx-auto">
        <!-- Progress Info -->
        <div class="text-center mb-4">
          <p class="text-[#FF9500] font-medium text-sm">Paso 4 de 4 <span class="text-gray-400 mx-2">•</span> <span class="text-gray-500">Confirmar</span></p>
        </div>

        <!-- Progress Bar -->
        <div class="flex items-center gap-3 mb-6">
          <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div class="h-full bg-gradient-to-r from-[#FF9500] to-orange-400 rounded-full transition-all duration-300" style="width: 100%"></div>
          </div>
          <span class="text-sm font-mono text-gray-500">100%</span>
        </div>

        <!-- Step Indicators -->
        <div class="flex items-center justify-between">
          <!-- Step 1: Tipo (Completado) -->
          <div class="flex flex-col items-center gap-2">
            <div class="w-10 h-10 rounded-full bg-[#10B981] flex items-center justify-center">
              <Check class="w-5 h-5 text-white" />
            </div>
            <p class="text-xs text-gray-500">Tipo</p>
          </div>

          <!-- Step 2: Estado (Completado) -->
          <div class="flex flex-col items-center gap-2">
            <div class="w-10 h-10 rounded-full bg-[#10B981] flex items-center justify-center">
              <Check class="w-5 h-5 text-white" />
            </div>
            <p class="text-xs text-gray-500">Estado</p>
          </div>

          <!-- Step 3: Valores (Completado) -->
          <div class="flex flex-col items-center gap-2">
            <div class="w-10 h-10 rounded-full bg-[#10B981] flex items-center justify-center">
              <Check class="w-5 h-5 text-white" />
            </div>
            <p class="text-xs text-gray-500">Valores</p>
          </div>

          <!-- Step 4: Confirmar (Activo) -->
          <div class="flex flex-col items-center gap-2">
            <div class="w-10 h-10 rounded-full bg-[#FF9500] flex items-center justify-center ring-4 ring-orange-100">
              <span class="text-white font-bold text-sm">4</span>
            </div>
            <p class="text-xs text-[#FF9500] font-medium">Confirmar</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Content Area -->
    <div class="flex-1 overflow-y-auto p-8">
      <div class="max-w-4xl mx-auto">
        
        <!-- Success Message (After Save) -->
        <div 
          v-if="isSaved"
          class="bg-green-50 border border-green-200 rounded-2xl p-8 mb-8 text-center"
        >
          <div class="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle2 class="w-8 h-8 text-green-600" />
          </div>
          <h2 class="font-display font-bold text-2xl text-green-800 mb-2">
            ¡Medición guardada exitosamente!
          </h2>
          <p class="text-green-700 mb-6">
            Tu registro ha sido almacenado en tu historial
          </p>
          <button 
            @click="goToControles"
            class="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            <ArrowLeft class="w-5 h-5" />
            <span>Volver a Controles</span>
          </button>
        </div>

        <!-- Confirmation Content (Before Save) -->
        <template v-else>
          <!-- Title Section -->
          <div class="text-center mb-8">
            <h2 class="font-display font-bold text-3xl text-gray-900 mb-2">Confirmar Medición</h2>
            <p class="text-gray-500 text-lg">Revisa los datos antes de guardar</p>
          </div>

          <!-- Summary Card -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
            <!-- Header with Icon -->
            <div class="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
              <div class="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center">
                <Heart class="w-7 h-7 text-red-500" />
              </div>
              <div>
                <h3 class="font-semibold text-lg text-gray-900">Presión Arterial</h3>
                <p class="text-sm text-gray-500">Medición manual</p>
              </div>
            </div>

            <!-- Values Grid -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <!-- Presión Sistólica/Diastólica -->
              <div class="bg-gray-50 rounded-xl p-5 text-center">
                <div class="flex items-center justify-center gap-2 mb-2">
                  <Activity class="w-4 h-4 text-gray-400" />
                  <span class="text-sm text-gray-500">Presión</span>
                </div>
                <p class="text-3xl font-bold text-gray-900">
                  {{ sistolica }}/{{ diastolica }}
                  <span class="text-sm font-normal text-gray-500">mmHg</span>
                </p>
              </div>

              <!-- Pulso -->
              <div class="bg-gray-50 rounded-xl p-5 text-center">
                <div class="flex items-center justify-center gap-2 mb-2">
                  <Heart class="w-4 h-4 text-gray-400" />
                  <span class="text-sm text-gray-500">Pulso</span>
                </div>
                <p class="text-3xl font-bold text-gray-900">
                  {{ pulso }}
                  <span class="text-sm font-normal text-gray-500">BPM</span>
                </p>
              </div>

              <!-- Estado de Ánimo -->
              <div class="bg-gray-50 rounded-xl p-5 text-center">
                <div class="flex items-center justify-center gap-2 mb-2">
                  <Smile class="w-4 h-4 text-gray-400" />
                  <span class="text-sm text-gray-500">Estado</span>
                </div>
                <div class="flex items-center justify-center gap-2">
                  <span class="text-2xl">{{ moodInfo.emoji }}</span>
                  <span class="text-sm font-medium" :class="moodInfo.color">{{ moodInfo.text }}</span>
                </div>
              </div>
            </div>

            <!-- Date and Time -->
            <div class="flex items-center justify-center gap-6 text-sm text-gray-500 pt-4 border-t border-gray-100">
              <div class="flex items-center gap-2">
                <Calendar class="w-4 h-4" />
                <span>{{ currentDateTime.date }}</span>
              </div>
              <div class="flex items-center gap-2">
                <Clock class="w-4 h-4" />
                <span>{{ currentDateTime.time }}</span>
              </div>
            </div>
          </div>

          <!-- Status Badge -->
          <div 
            class="rounded-xl p-5 mb-8 border-2"
            :class="[measurementStatus.bgColor, measurementStatus.borderColor]"
          >
            <div class="flex items-start gap-4">
              <div class="flex-shrink-0">
                <component 
                  :is="measurementStatus.icon" 
                  class="w-6 h-6"
                  :class="measurementStatus.color"
                />
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <span 
                    class="px-3 py-1 rounded-full text-xs font-semibold"
                    :class="[measurementStatus.bgColor, measurementStatus.color]"
                  >
                    {{ measurementStatus.badge }}
                  </span>
                </div>
                <p class="text-sm" :class="measurementStatus.color">
                  {{ measurementStatus.description }}
                </p>
              </div>
            </div>
          </div>

          <!-- Navigation Buttons -->
          <div class="flex justify-between items-center">
            <button 
              @click="goBack"
              :disabled="isSaving"
              class="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft class="w-5 h-5" />
              <span>Atrás</span>
            </button>

            <button 
              @click="saveMeasurement"
              :disabled="isSaving"
              class="flex items-center gap-2 px-8 py-3 rounded-lg font-semibold transition-all bg-[#FF9500] text-white hover:bg-orange-600 shadow-lg shadow-orange-500/25 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <template v-if="isSaving">
                <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Guardando...</span>
              </template>
              <template v-else>
                <span>Guardar Medición</span>
                <ArrowRight class="w-5 h-5" />
              </template>
            </button>
          </div>
        </template>

        <!-- Help Text -->
        <div class="text-center mt-8" v-if="!isSaved">
          <p class="text-sm text-gray-400">
            Revisa cuidadosamente los valores antes de guardar. Una vez guardada, la medición se agregará a tu historial.
          </p>
        </div>
      </div>
    </div>

  </div>
</template>
