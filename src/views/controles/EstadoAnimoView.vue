<script setup>
/**
 * EstadoAnimoView - Paso 2 del flujo de Nueva Medición
 * Permite al usuario seleccionar su estado de ánimo antes de ingresar los valores.
 */
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  HelpCircle, 
  Bell, 
  ArrowRight,
  ArrowLeft,
  Check
} from 'lucide-vue-next'

// Router
const route = useRoute()
const router = useRouter()

// Obtener el tipo de medición desde query params
const tipoMedicion = computed(() => route.query.tipo || '')

// Estado de ánimo seleccionado
const selectedMood = ref(null)

// Opciones de estado de ánimo
const moodOptions = [
  {
    id: 'bien',
    emoji: '😊',
    title: 'Me siento Bien',
    subtitle: 'Energía positiva',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    ringColor: 'ring-green-500/20',
    selectedBg: 'bg-green-100'
  },
  {
    id: 'regular',
    emoji: '😐',
    title: 'Regular',
    subtitle: 'Neutral / Estable',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    ringColor: 'ring-yellow-500/20',
    selectedBg: 'bg-yellow-100'
  },
  {
    id: 'mal',
    emoji: '😞',
    title: 'Mal',
    subtitle: 'Con dificultades',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    ringColor: 'ring-red-500/20',
    selectedBg: 'bg-red-100'
  }
]

// Seleccionar estado de ánimo
function selectMood(moodId) {
  selectedMood.value = moodId
}

// Volver al paso anterior
function goBack() {
  router.push('/controles')
}

// Continuar al paso 3 (Ingreso de valores)
function continueMeasurement() {
  if (!selectedMood.value || !tipoMedicion.value) return

  // Navegar al paso 3 manteniendo los query params
  router.push({
    path: '/nueva-medicion/valores',
    query: { 
      tipo: tipoMedicion.value,
      estado: selectedMood.value
    }
  })
}

// Nombre del tipo de medición para mostrar
const tipoMedicionLabel = computed(() => {
  const labels = {
    'presion': 'Presión Arterial',
    'peso': 'Control de Peso',
    'glicemia': 'Glicemia'
  }
  return labels[tipoMedicion.value] || 'Medición'
})
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
          <p class="text-[#FF9500] font-medium text-sm">Paso 2 de 4 <span class="text-gray-400 mx-2">•</span> <span class="text-gray-500">Estado de Ánimo</span></p>
        </div>

        <!-- Progress Bar -->
        <div class="flex items-center gap-3 mb-6">
          <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div class="h-full bg-gradient-to-r from-[#FF9500] to-orange-400 rounded-full transition-all duration-300" style="width: 50%"></div>
          </div>
          <span class="text-sm font-mono text-gray-500">50%</span>
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

          <!-- Step 2: Estado (Activo) -->
          <div class="flex flex-col items-center gap-2">
            <div class="w-10 h-10 rounded-full bg-[#FF9500] flex items-center justify-center ring-4 ring-orange-100">
              <span class="text-white font-bold text-sm">2</span>
            </div>
            <p class="text-xs text-[#FF9500] font-medium">Estado</p>
          </div>

          <!-- Step 3: Valores -->
          <div class="flex flex-col items-center gap-2">
            <div class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              <span class="text-gray-400 font-bold text-sm">3</span>
            </div>
            <p class="text-xs text-gray-400">Valores</p>
          </div>

          <!-- Step 4: Confirmar -->
          <div class="flex flex-col items-center gap-2">
            <div class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              <span class="text-gray-400 font-bold text-sm">4</span>
            </div>
            <p class="text-xs text-gray-400">Confirmar</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Content Area -->
    <div class="flex-1 overflow-y-auto p-8">
      <div class="max-w-4xl mx-auto">
        
        <!-- Question Section -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 mb-8">
          <div class="text-center mb-10">
            <h2 class="font-display font-bold text-4xl text-gray-900 mb-4">¿Cómo te sientes hoy?</h2>
            <p class="text-gray-500 text-lg">Tu estado emocional puede influir en tus mediciones</p>
          </div>

          <!-- Mood Options Grid -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div
              v-for="mood in moodOptions"
              :key="mood.id"
              @click="selectMood(mood.id)"
              class="cursor-pointer rounded-2xl border-2 p-8 transition-all duration-300 text-center relative"
              :class="[
                selectedMood === mood.id 
                  ? `${mood.selectedBg} ${mood.borderColor} ring-4 ${mood.ringColor} scale-105` 
                  : `${mood.bgColor} border-transparent hover:-translate-y-1 hover:shadow-lg`
              ]"
            >
              <!-- Emoji -->
              <div class="text-7xl mb-4 transform transition-transform group-hover:scale-110">{{ mood.emoji }}</div>
              
              <!-- Title -->
              <h3 class="font-display font-bold text-xl text-gray-900 mb-2">{{ mood.title }}</h3>
              
              <!-- Subtitle -->
              <p class="text-gray-600 text-sm">{{ mood.subtitle }}</p>

              <!-- Selection border overlay -->
              <div 
                v-if="selectedMood === mood.id"
                class="absolute inset-0 rounded-2xl border-4 border-[#FF9500] pointer-events-none"
              ></div>

              <!-- Checkmark badge -->
              <div 
                class="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200"
                :class="selectedMood === mood.id 
                  ? 'bg-[#FF9500] opacity-100 scale-100' 
                  : 'opacity-0 scale-75'"
              >
                <Check class="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          <!-- Navigation Buttons -->
          <div class="flex justify-between items-center pt-6 border-t border-gray-100">
            <button 
              @click="goBack"
              class="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors font-medium"
            >
              <ArrowLeft class="w-5 h-5" />
              <span>Atrás</span>
            </button>

            <button 
              @click="continueMeasurement"
              :disabled="!selectedMood"
              class="flex items-center gap-2 px-8 py-3 rounded-lg font-semibold transition-all"
              :class="selectedMood 
                ? 'bg-[#FF9500] text-white hover:bg-orange-600 cursor-pointer shadow-lg shadow-orange-500/25' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'"
            >
              <span>Continuar</span>
              <ArrowRight class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Help Text -->
        <div class="text-center">
          <p class="text-sm text-gray-400">
            Esta información nos ayuda a contextualizar mejor tus datos de salud
          </p>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.font-display {
  font-family: 'Cabinet Grotesk', sans-serif;
}

.hover\:scale-102:hover {
  transform: scale(1.02);
}
</style>
