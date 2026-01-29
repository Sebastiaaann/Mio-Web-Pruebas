<script setup>
/**
 * ValoresPresionView - Paso 3 del flujo de Nueva Medición
 * Permite al usuario ingresar los valores de presión arterial.
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
  Lightbulb,
  AlertCircle
} from 'lucide-vue-next'

// Router
const route = useRoute()
const router = useRouter()

// Obtener el tipo de medición y estado desde query params
const tipoMedicion = computed(() => route.query.tipo || '')
const estadoAnimo = computed(() => route.query.estado || '')

// Valores del formulario
const sistolica = ref('')
const diastolica = ref('')
const pulso = ref('')

// Rangos normales
const RANGES = {
  sistolica: { min: 90, max: 120 },
  diastolica: { min: 60, max: 80 },
  pulso: { min: 60, max: 100 }
}

// Verificar si todos los campos están completos
const isFormComplete = computed(() => {
  return sistolica.value !== '' && diastolica.value !== '' && pulso.value !== ''
})

// Validar si un valor está en rango normal
function isInRange(value, type) {
  const numValue = parseInt(value)
  if (isNaN(numValue) || value === '') return null
  const range = RANGES[type]
  return numValue >= range.min && numValue <= range.max
}

// Verificar si todos los valores están en rango normal
const allValuesNormal = computed(() => {
  return isInRange(sistolica.value, 'sistolica') === true &&
         isInRange(diastolica.value, 'diastolica') === true &&
         isInRange(pulso.value, 'pulso') === true
})

// Verificar si algún valor está fuera de rango
const hasAbnormalValues = computed(() => {
  const sistolicaNormal = isInRange(sistolica.value, 'sistolica')
  const diastolicaNormal = isInRange(diastolica.value, 'diastolica')
  const pulsoNormal = isInRange(pulso.value, 'pulso')
  
  // Solo mostrar alerta si hay valores ingresados y alguno está fuera de rango
  return (sistolicaNormal === false || diastolicaNormal === false || pulsoNormal === false)
})

// Obtener clase de validación para un campo
function getValidationClass(value, type) {
  const inRange = isInRange(value, type)
  if (inRange === null) return ''
  return inRange ? 'border-green-400 focus:border-green-500 focus:ring-green-500/20' : 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
}

// Volver al paso anterior
function goBack() {
  router.push({
    path: '/nueva-medicion/estado',
    query: { tipo: tipoMedicion.value }
  })
}

// Continuar al paso 4 (Confirmar)
function continueMeasurement() {
  if (!isFormComplete.value) return

  // Navegar al paso 4 manteniendo los query params y agregando los valores
  router.push({
    path: '/nueva-medicion/confirmar',
    query: { 
      tipo: tipoMedicion.value,
      estado: estadoAnimo.value,
      sistolica: sistolica.value,
      diastolica: diastolica.value,
      pulso: pulso.value
    }
  })
}

// Solo permitir números en los inputs
function onlyNumbers(event) {
  const charCode = event.which ? event.which : event.keyCode
  if (charCode > 31 && (charCode < 48 || charCode > 57)) {
    event.preventDefault()
  }
}

// Limitar longitud del input
function limitLength(event, maxLength) {
  if (event.target.value.length >= maxLength) {
    event.preventDefault()
  }
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
          <p class="text-[#FF9500] font-medium text-sm">Paso 3 de 4 <span class="text-gray-400 mx-2">•</span> <span class="text-gray-500">Valores</span></p>
        </div>

        <!-- Progress Bar -->
        <div class="flex items-center gap-3 mb-6">
          <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div class="h-full bg-gradient-to-r from-[#FF9500] to-orange-400 rounded-full transition-all duration-300" style="width: 75%"></div>
          </div>
          <span class="text-sm font-mono text-gray-500">75%</span>
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

          <!-- Step 3: Valores (Activo) -->
          <div class="flex flex-col items-center gap-2">
            <div class="w-10 h-10 rounded-full bg-[#FF9500] flex items-center justify-center ring-4 ring-orange-100">
              <span class="text-white font-bold text-sm">3</span>
            </div>
            <p class="text-xs text-[#FF9500] font-medium">Valores</p>
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
        
        <!-- Form Section -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 mb-8">
          <!-- Title Section -->
          <div class="text-center mb-10">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-red-50 rounded-full mb-4">
              <Heart class="w-8 h-8 text-red-500" />
            </div>
            <h2 class="font-display font-bold text-4xl text-gray-900 mb-4">Presión Arterial</h2>
            <p class="text-gray-500 text-lg">Registra la presión sistólica y diastólica</p>
          </div>

          <!-- Form Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <!-- Sistólica -->
            <div class="space-y-3">
              <label class="block text-sm font-semibold text-gray-700">
                Presión Sistólica
                <span class="text-gray-400 font-normal ml-1">(mmHg)</span>
              </label>
              <div class="relative">
                <input
                  v-model="sistolica"
                  type="number"
                  placeholder="120"
                  min="1"
                  max="300"
                  @keypress="onlyNumbers"
                  @input="(e) => limitLength(e, 3)"
                  class="w-full px-6 py-5 text-4xl font-bold text-center text-gray-900 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-[#FF9500] transition-all placeholder:text-gray-300"
                  :class="getValidationClass(sistolica, 'sistolica')"
                />
                <span class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">mmHg</span>
              </div>
              <p class="text-xs text-gray-400">Rango normal: 90-120 mmHg</p>
            </div>

            <!-- Diastólica -->
            <div class="space-y-3">
              <label class="block text-sm font-semibold text-gray-700">
                Presión Diastólica
                <span class="text-gray-400 font-normal ml-1">(mmHg)</span>
              </label>
              <div class="relative">
                <input
                  v-model="diastolica"
                  type="number"
                  placeholder="80"
                  min="1"
                  max="200"
                  @keypress="onlyNumbers"
                  @input="(e) => limitLength(e, 3)"
                  class="w-full px-6 py-5 text-4xl font-bold text-center text-gray-900 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-[#FF9500] transition-all placeholder:text-gray-300"
                  :class="getValidationClass(diastolica, 'diastolica')"
                />
                <span class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">mmHg</span>
              </div>
              <p class="text-xs text-gray-400">Rango normal: 60-80 mmHg</p>
            </div>
          </div>

          <!-- Pulso (Full Width) -->
          <div class="mb-8">
            <label class="block text-sm font-semibold text-gray-700 mb-3">
              Pulso (Frecuencia Cardíaca)
              <span class="text-gray-400 font-normal ml-1">(BPM)</span>
            </label>
            <div class="relative max-w-md mx-auto">
              <input
                v-model="pulso"
                type="number"
                placeholder="72"
                min="1"
                max="300"
                @keypress="onlyNumbers"
                @input="(e) => limitLength(e, 3)"
                class="w-full px-6 py-5 text-4xl font-bold text-center text-gray-900 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-[#FF9500] transition-all placeholder:text-gray-300"
                :class="getValidationClass(pulso, 'pulso')"
              />
              <span class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">BPM</span>
            </div>
            <p class="text-xs text-gray-400 text-center mt-2">Rango normal: 60-100 BPM</p>
          </div>

          <!-- Validation Badge -->
          <div class="flex justify-center mb-8">
            <div
              v-if="allValuesNormal && isFormComplete"
              class="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium"
            >
              <Check class="w-4 h-4" />
              <span>Valores normales</span>
            </div>
            <div
              v-else-if="hasAbnormalValues"
              class="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-full text-sm font-medium"
            >
              <AlertCircle class="w-4 h-4" />
              <span>Valores fuera de rango</span>
            </div>
          </div>

          <!-- Info Box -->
          <div class="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
            <div class="flex items-start gap-4">
              <div class="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <Lightbulb class="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h4 class="font-semibold text-amber-900 mb-1">Consejo de medición</h4>
                <p class="text-amber-800 text-sm leading-relaxed">
                  Mide en posición sentada después de 5 minutos de reposo. El brazo debe estar a la altura del corazón. 
                  Evita cafeína, ejercicio o fumar 30 minutos antes de medir.
                </p>
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
              :disabled="!isFormComplete"
              class="flex items-center gap-2 px-8 py-3 rounded-lg font-semibold transition-all"
              :class="isFormComplete 
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
            Los valores ingresados se validan automáticamente con rangos de referencia
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

/* Ocultar flechas de input number */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}
</style>