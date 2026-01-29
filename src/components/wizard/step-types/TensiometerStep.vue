<script setup>
/**
 * TensiometerStep - Componente para medición de presión arterial
 * Campos: Sistólica, Diastólica, BPM
 */
import { ref, computed, watch } from 'vue'
import { Heart, Activity } from 'lucide-vue-next'

const props = defineProps({
  step: {
    type: Object,
    required: true
  },
  modelValue: {
    type: Object,
    default: () => ({ Systolic: null, Diastolic: null, bpm: null })
  }
})

const emit = defineEmits(['update:modelValue', 'valid'])

// Valores locales
const systolic = ref(props.modelValue?.Systolic || '')
const diastolic = ref(props.modelValue?.Diastolic || '')
const bpm = ref(props.modelValue?.bpm || '')

// Rangos de referencia (podrían venir de la API)
const ranges = computed(() => {
  return {
    systolic: { min: 90, max: 180, normal: 120 },
    diastolic: { min: 60, max: 110, normal: 80 },
    bpm: { min: 60, max: 100, normal: 70 }
  }
})

// Validación
const isValid = computed(() => {
  const sys = parseInt(systolic.value)
  const dia = parseInt(diastolic.value)
  const pulse = parseInt(bpm.value)
  
  return sys > 0 && dia > 0 && pulse > 0 &&
         sys >= ranges.value.systolic.min && sys <= ranges.value.systolic.max &&
         dia >= ranges.value.diastolic.min && dia <= ranges.value.diastolic.max &&
         pulse >= ranges.value.bpm.min && pulse <= ranges.value.bpm.max
})

// Evaluación del color según valores
const evaluation = computed(() => {
  const sys = parseInt(systolic.value)
  const dia = parseInt(diastolic.value)
  
  if (!sys || !dia) return 'neutral'
  
  if (sys > 140 || dia > 90) return 'red'
  if (sys > 120 || dia > 80) return 'orange'
  return 'green'
})

// Emitir cambios
watch([systolic, diastolic, bpm], () => {
  const values = {
    Systolic: parseInt(systolic.value) || null,
    Diastolic: parseInt(diastolic.value) || null,
    bpm: parseInt(bpm.value) || null
  }
  emit('update:modelValue', values)
  emit('valid', isValid.value)
}, { immediate: true })

// Colores según evaluación
const evalColors = {
  neutral: 'bg-gray-50 border-gray-200',
  green: 'bg-emerald-50 border-emerald-500',
  orange: 'bg-amber-50 border-amber-500',
  red: 'bg-red-50 border-red-500'
}

// Prevenir caracteres no numéricos
function onlyNumbers(event) {
  const charCode = event.which ? event.which : event.keyCode
  if (charCode > 31 && (charCode < 48 || charCode > 57)) {
    event.preventDefault()
  }
}
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="text-center">
      <h2 class="font-display font-bold text-3xl text-gray-900 mb-4">
        {{ step.header || 'Medición de Presión Arterial' }}
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
        :class="evalColors[evaluation]"
      >
        <Heart 
          class="w-16 h-16 transition-colors duration-500"
          :class="{
            'text-emerald-500': evaluation === 'green',
            'text-amber-500': evaluation === 'orange',
            'text-red-500': evaluation === 'red',
            'text-gray-400': evaluation === 'neutral'
          }"
        />
      </div>
    </div>

    <!-- Campos de entrada -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Sistólica -->
      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">
          Presión Sistólica
        </label>
        <div class="relative">
          <input
            v-model="systolic"
            type="number"
            :min="ranges.systolic.min"
            :max="ranges.systolic.max"
            placeholder="120"
            class="w-full px-4 py-4 text-2xl font-bold text-center border-2 rounded-xl focus:outline-none focus:border-[#FF9500] transition-colors"
            :class="evaluation === 'red' ? 'border-red-300 bg-red-50' : 'border-gray-200'"
            @keypress="onlyNumbers"
          />
          <span class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
            mmHg
          </span>
        </div>
        <p class="text-xs text-gray-500 text-center">
          Normal: {{ ranges.systolic.normal }}
        </p>
      </div>

      <!-- Diastólica -->
      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">
          Presión Diastólica
        </label>
        <div class="relative">
          <input
            v-model="diastolic"
            type="number"
            :min="ranges.diastolic.min"
            :max="ranges.diastolic.max"
            placeholder="80"
            class="w-full px-4 py-4 text-2xl font-bold text-center border-2 rounded-xl focus:outline-none focus:border-[#FF9500] transition-colors"
            :class="evaluation === 'red' ? 'border-red-300 bg-red-50' : 'border-gray-200'"
            @keypress="onlyNumbers"
          />
          <span class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
            mmHg
          </span>
        </div>
        <p class="text-xs text-gray-500 text-center">
          Normal: {{ ranges.diastolic.normal }}
        </p>
      </div>

      <!-- BPM -->
      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">
          Pulso (BPM)
        </label>
        <div class="relative">
          <input
            v-model="bpm"
            type="number"
            :min="ranges.bpm.min"
            :max="ranges.bpm.max"
            placeholder="70"
            class="w-full px-4 py-4 text-2xl font-bold text-center border-2 rounded-xl focus:outline-none focus:border-[#FF9500] transition-colors"
            :class="evaluation === 'red' ? 'border-red-300 bg-red-50' : 'border-gray-200'"
            @keypress="onlyNumbers"
          />
          <Activity class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>
        <p class="text-xs text-gray-500 text-center">
          Normal: {{ ranges.bpm.min }}-{{ ranges.bpm.max }}
        </p>
      </div>
    </div>

    <!-- Mensaje de validación -->
    <div 
      v-if="!isValid && (systolic || diastolic || bpm)"
      class="text-center p-4 bg-red-50 rounded-xl"
    >
      <p class="text-red-600 text-sm">
        Por favor ingresa valores válidos dentro de los rangos indicados
      </p>
    </div>

    <!-- Resumen cuando es válido -->
    <div 
      v-if="isValid"
      class="text-center p-6 rounded-xl transition-all duration-300"
      :class="{
        'bg-emerald-50': evaluation === 'green',
        'bg-amber-50': evaluation === 'orange',
        'bg-red-50': evaluation === 'red'
      }"
    >
      <p class="text-lg font-semibold" :class="{
        'text-emerald-700': evaluation === 'green',
        'text-amber-700': evaluation === 'orange',
        'text-red-700': evaluation === 'red'
      }">
        {{ systolic }}/{{ diastolic }} mmHg - {{ bpm }} BPM
      </p>
      <p class="text-sm mt-1" :class="{
        'text-emerald-600': evaluation === 'green',
        'text-amber-600': evaluation === 'orange',
        'text-red-600': evaluation === 'red'
      }">
        {{ evaluation === 'green' ? 'Valores normales' : evaluation === 'orange' ? 'Valores elevados' : 'Valores altos - Consulta recomendada' }}
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
