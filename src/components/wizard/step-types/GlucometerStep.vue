<script setup>
/**
 * GlucometerStep - Componente para medición de glucosa
 * Campo: Glucosa (mg/dL)
 */
import { ref, computed, watch } from 'vue'
import { Droplet } from 'lucide-vue-next'

const props = defineProps({
  step: {
    type: Object,
    required: true
  },
  modelValue: {
    type: Object,
    default: () => ({ glucose: null })
  }
})

const emit = defineEmits(['update:modelValue', 'valid'])

// Valores locales
const glucose = ref(props.modelValue?.glucose || '')

// Rangos de referencia (valores estándar para glucosa)
const ranges = {
  glucose: {
    min: 50,
    max: 400,
    low: 70,
    normal: 100,
    high: 140
  }
}

// Evaluación del nivel de glucosa
const evaluation = computed(() => {
  const g = parseInt(glucose.value)
  if (!g) return 'neutral'
  if (g < ranges.glucose.low) return 'low'
  if (g <= ranges.glucose.normal) return 'normal'
  if (g <= ranges.glucose.high) return 'warning'
  return 'high'
})

// Validación
const isValid = computed(() => {
  const g = parseInt(glucose.value)
  return g > 0 && g >= ranges.glucose.min && g <= ranges.glucose.max
})

// Emitir cambios
watch(glucose, () => {
  const values = {
    glucose: parseInt(glucose.value) || null
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
    label: 'Ingresa tu valor'
  },
  low: {
    bg: 'bg-blue-50',
    border: 'border-blue-500',
    text: 'text-blue-600',
    label: 'Hipoglucemia (Baja)'
  },
  normal: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-500',
    text: 'text-emerald-600',
    label: 'Normal'
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-500',
    text: 'text-amber-600',
    label: 'Elevada (Pre-diabetes)'
  },
  high: {
    bg: 'bg-red-50',
    border: 'border-red-500',
    text: 'text-red-600',
    label: 'Hiperglucemia (Alta)'
  }
}

// Prevenir caracteres no numéricos
function onlyNumbers(event) {
  const charCode = event.which ? event.which : event.keyCode
  if (charCode > 31 && (charCode < 48 || charCode > 57)) {
    event.preventDefault()
  }
}

// Obtener recomendación según nivel
const recommendation = computed(() => {
  const evalType = evaluation.value
  const recommendations = {
    low: 'Considera consumir algo dulce y consulta a tu médico si persiste.',
    normal: '¡Excelente! Mantén tus hábitos saludables.',
    warning: 'Monitorea tu alimentación y consulta a tu médico.',
    high: 'Contacta a tu médico lo antes posible.',
    neutral: ''
  }
  return recommendations[evalType]
})
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="text-center">
      <h2 class="font-display font-bold text-3xl text-gray-900 mb-4">
        {{ step.header || 'Medición de Glucosa' }}
      </h2>
      <p v-if="step.body" class="text-lg text-gray-500">
        {{ step.body }}
      </p>
    </div>

    <!-- Indicador visual -->
    <div 
      class="flex justify-center mb-8"
      :class="{ 'animate-pulse': evaluation !== 'neutral' }"
    >
      <div 
        class="w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500"
        :class="evalColors[evaluation].bg"
      >
        <Droplet 
          class="w-16 h-16 transition-colors duration-500"
          :class="evalColors[evaluation].text"
        />
      </div>
    </div>

    <!-- Input de Glucosa -->
    <div class="max-w-md mx-auto space-y-6">
      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700 text-center">
          Nivel de Glucosa en Sangre
        </label>
        <div class="relative">
          <input
            v-model="glucose"
            type="number"
            :min="ranges.glucose.min"
            :max="ranges.glucose.max"
            placeholder="100"
            class="w-full px-4 py-5 text-4xl font-bold text-center border-2 rounded-xl focus:outline-none focus:border-[#FF9500] transition-colors"
            :class="evaluation !== 'neutral' ? evalColors[evaluation].border + ' ' + evalColors[evaluation].bg : 'border-gray-200'"
            @keypress="onlyNumbers"
          />
          <span class="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 text-lg font-medium">
            mg/dL
          </span>
        </div>
        <p class="text-xs text-gray-500 text-center">
          Rango válido: {{ ranges.glucose.min }} - {{ ranges.glucose.max }} mg/dL
        </p>
      </div>

      <!-- Resultado -->
      <div 
        v-if="evaluation !== 'neutral'"
        class="p-6 rounded-2xl border-2 transition-all duration-300 animate-fade-in"
        :class="evalColors[evaluation].bg + ' ' + evalColors[evaluation].border"
      >
        <div class="text-center">
          <div 
            class="text-2xl font-bold mb-2"
            :class="evalColors[evaluation].text"
          >
            {{ evalColors[evaluation].label }}
          </div>
          <p 
            class="text-sm"
            :class="evalColors[evaluation].text"
          >
            {{ recommendation }}
          </p>
        </div>
      </div>

      <!-- Referencia de valores -->
      <div class="bg-gray-50 rounded-xl p-4">
        <p class="text-sm font-medium text-gray-700 mb-3">Referencias:</p>
        <div class="space-y-2 text-sm">
          <div class="flex items-center justify-between">
            <span class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-blue-400"></span>
              Hipoglucemia
            </span>
            <span class="text-gray-500">< {{ ranges.glucose.low }} mg/dL</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-emerald-400"></span>
              Normal
            </span>
            <span class="text-gray-500">{{ ranges.glucose.low }} - {{ ranges.glucose.normal }} mg/dL</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-amber-400"></span>
              Elevada
            </span>
            <span class="text-gray-500">{{ ranges.glucose.normal + 1 }} - {{ ranges.glucose.high }} mg/dL</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-red-400"></span>
              Alta
            </span>
            <span class="text-gray-500">> {{ ranges.glucose.high }} mg/dL</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Mensaje de validación -->
    <div 
      v-if="!isValid && glucose"
      class="text-center p-4 bg-red-50 rounded-xl max-w-md mx-auto"
    >
      <p class="text-red-600 text-sm">
        Por favor ingresa un valor válido entre {{ ranges.glucose.min }} y {{ ranges.glucose.max }} mg/dL
      </p>
    </div>
  </div>
</template>

<style scoped>
.font-display {
  font-family: 'Cabinet Grotesk', sans-serif;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease forwards;
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
