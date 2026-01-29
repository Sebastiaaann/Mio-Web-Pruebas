<script setup>
/**
 * WeightStep - Componente para medición de peso
 * Campos: Peso (kg), IMC (calculado automáticamente)
 */
import { ref, computed, watch } from 'vue'
import { Scale, Calculator } from 'lucide-vue-next'

const props = defineProps({
  step: {
    type: Object,
    required: true
  },
  modelValue: {
    type: Object,
    default: () => ({ weight: null, IMC: null })
  },
  // Altura del paciente para calcular IMC (podría venir del store o props)
  patientHeight: {
    type: Number,
    default: 1.70 // metros
  }
})

const emit = defineEmits(['update:modelValue', 'valid'])

// Valores locales
const weight = ref(props.modelValue?.weight || '')

// Rangos de referencia
const ranges = {
  weight: { min: 30, max: 200 },
  imc: {
    underweight: 18.5,
    normal: 25,
    overweight: 30
  }
}

// Calcular IMC
const calculatedIMC = computed(() => {
  const w = parseFloat(weight.value)
  if (!w || !props.patientHeight) return null
  return (w / (props.patientHeight * props.patientHeight)).toFixed(1)
})

// Evaluación del IMC
const imcEvaluation = computed(() => {
  const imc = parseFloat(calculatedIMC.value)
  if (!imc) return 'neutral'
  if (imc < ranges.imc.underweight) return 'underweight'
  if (imc < ranges.imc.normal) return 'normal'
  if (imc < ranges.imc.overweight) return 'overweight'
  return 'obese'
})

// Validación
const isValid = computed(() => {
  const w = parseFloat(weight.value)
  return w > 0 && w >= ranges.weight.min && w <= ranges.weight.max
})

// Emitir cambios
watch(weight, () => {
  const values = {
    weight: parseFloat(weight.value) || null,
    IMC: calculatedIMC.value ? parseFloat(calculatedIMC.value) : null
  }
  emit('update:modelValue', values)
  emit('valid', isValid.value)
}, { immediate: true })

// Colores según evaluación
const evalColors = {
  neutral: {
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    text: 'text-gray-500',
    label: 'Peso'
  },
  underweight: {
    bg: 'bg-blue-50',
    border: 'border-blue-500',
    text: 'text-blue-600',
    label: 'Bajo peso'
  },
  normal: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-500',
    text: 'text-emerald-600',
    label: 'Peso normal'
  },
  overweight: {
    bg: 'bg-amber-50',
    border: 'border-amber-500',
    text: 'text-amber-600',
    label: 'Sobrepeso'
  },
  obese: {
    bg: 'bg-red-50',
    border: 'border-red-500',
    text: 'text-red-600',
    label: 'Obesidad'
  }
}

// Prevenir caracteres no numéricos (permitir punto decimal)
function onlyNumbersAndDot(event) {
  const charCode = event.which ? event.which : event.keyCode
  const char = String.fromCharCode(charCode)
  
  // Permitir números y un solo punto decimal
  if (charCode === 46 && weight.value.includes('.')) {
    event.preventDefault()
    return
  }
  
  if (charCode > 31 && (charCode < 48 || charCode > 57) && charCode !== 46) {
    event.preventDefault()
  }
}
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="text-center">
      <h2 class="font-display font-bold text-3xl text-gray-900 mb-4">
        {{ step.header || 'Control de Peso' }}
      </h2>
      <p v-if="step.body" class="text-lg text-gray-500">
        {{ step.body }}
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Input de Peso -->
      <div class="space-y-6">
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            Tu peso actual
          </label>
          <div class="relative">
            <input
              v-model="weight"
              type="number"
              step="0.1"
              :min="ranges.weight.min"
              :max="ranges.weight.max"
              placeholder="70.5"
              class="w-full px-4 py-4 text-3xl font-bold text-center border-2 rounded-xl focus:outline-none focus:border-[#FF9500] transition-colors"
              :class="imcEvaluation !== 'neutral' ? evalColors[imcEvaluation].border + ' ' + evalColors[imcEvaluation].bg : 'border-gray-200'"
              @keypress="onlyNumbersAndDot"
            />
            <span class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg font-medium">
              kg
            </span>
          </div>
          <p class="text-xs text-gray-500 text-center">
            Rango válido: {{ ranges.weight.min }} - {{ ranges.weight.max }} kg
          </p>
        </div>

        <!-- Indicador visual -->
        <div 
          class="flex justify-center"
          :class="{ 'animate-pulse': imcEvaluation !== 'neutral' }"
        >
          <div 
            class="w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500"
            :class="evalColors[imcEvaluation].bg"
          >
            <Scale 
              class="w-12 h-12 transition-colors duration-500"
              :class="evalColors[imcEvaluation].text"
            />
          </div>
        </div>
      </div>

      <!-- Resultado IMC -->
      <div class="space-y-6">
        <div 
          class="p-6 rounded-2xl border-2 transition-all duration-300"
          :class="imcEvaluation !== 'neutral' ? evalColors[imcEvaluation].bg + ' ' + evalColors[imcEvaluation].border : 'bg-gray-50 border-gray-200'"
        >
          <div class="flex items-center gap-3 mb-4">
            <Calculator class="w-6 h-6" :class="evalColors[imcEvaluation].text" />
            <span class="font-medium text-gray-700">Índice de Masa Corporal</span>
          </div>
          
          <div class="text-center">
            <div 
              class="text-5xl font-bold mb-2"
              :class="evalColors[imcEvaluation].text"
            >
              {{ calculatedIMC || '--.-' }}
            </div>
            <div 
              class="text-lg font-medium"
              :class="evalColors[imcEvaluation].text"
            >
              {{ evalColors[imcEvaluation].label }}
            </div>
          </div>

          <!-- Barra de referencia IMC -->
          <div class="mt-6">
            <div class="h-3 bg-gray-200 rounded-full overflow-hidden flex">
              <div class="w-1/4 bg-blue-400" title="Bajo peso"></div>
              <div class="w-1/4 bg-emerald-400" title="Normal"></div>
              <div class="w-1/4 bg-amber-400" title="Sobrepeso"></div>
              <div class="w-1/4 bg-red-400" title="Obesidad"></div>
            </div>
            <div class="flex justify-between text-xs text-gray-500 mt-2">
              <span>18.5</span>
              <span>25</span>
              <span>30</span>
              <span>40+</span>
            </div>
          </div>
        </div>

        <!-- Información adicional -->
        <div class="bg-blue-50 rounded-xl p-4">
          <p class="text-sm text-blue-700">
            <strong>Altura registrada:</strong> {{ (props.patientHeight * 100).toFixed(0) }} cm
          </p>
          <p class="text-xs text-blue-600 mt-1">
            El IMC se calcula automáticamente basado en tu peso y altura
          </p>
        </div>
      </div>
    </div>

    <!-- Mensaje de validación -->
    <div 
      v-if="!isValid && weight"
      class="text-center p-4 bg-red-50 rounded-xl"
    >
      <p class="text-red-600 text-sm">
        Por favor ingresa un peso válido entre {{ ranges.weight.min }} y {{ ranges.weight.max }} kg
      </p>
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
