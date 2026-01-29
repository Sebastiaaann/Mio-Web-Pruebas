<script setup>
/**
 * WizardNavigation - Componente de navegación del wizard
 * Botones Atrás y Continuar/Guardar
 */
import { computed } from 'vue'
import { ArrowLeft, ArrowRight, Loader2, Check } from 'lucide-vue-next'

const props = defineProps({
  currentStep: {
    type: Number,
    required: true
  },
  totalSteps: {
    type: Number,
    required: true
  },
  isValid: {
    type: Boolean,
    default: false
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  isSubmitting: {
    type: Boolean,
    default: false
  },
  // Textos personalizables
  backText: {
    type: String,
    default: 'Atrás'
  },
  continueText: {
    type: String,
    default: 'Continuar'
  },
  submitText: {
    type: String,
    default: 'Guardar'
  }
})

const emit = defineEmits(['back', 'continue', 'submit'])

// Determinar si es el último paso
const isLastStep = computed(() => props.currentStep === props.totalSteps - 1)

// Texto del botón principal
const primaryButtonText = computed(() => {
  if (props.isSubmitting) return 'Guardando...'
  if (isLastStep.value) return props.submitText
  return props.continueText
})

// Icono del botón principal
const primaryButtonIcon = computed(() => {
  if (props.isSubmitting) return Loader2
  if (isLastStep.value) return Check
  return ArrowRight
})

// Manejar click en botón principal
function handlePrimaryClick() {
  if (isLastStep.value) {
    emit('submit')
  } else {
    emit('continue')
  }
}
</script>

<template>
  <div class="flex justify-between items-center pt-6 border-t border-gray-100">
    <!-- Botón Atrás -->
    <button
      @click="$emit('back')"
      :disabled="currentStep === 0 || isLoading || isSubmitting"
      class="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200"
      :class="{
        'text-gray-600 hover:text-gray-900 hover:bg-gray-100': currentStep > 0 && !isLoading && !isSubmitting,
        'text-gray-300 cursor-not-allowed': currentStep === 0 || isLoading || isSubmitting
      }"
    >
      <ArrowLeft class="w-5 h-5" />
      <span>{{ backText }}</span>
    </button>

    <!-- Botón Continuar/Guardar -->
    <button
      @click="handlePrimaryClick"
      :disabled="!isValid || isLoading || isSubmitting"
      class="flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all duration-200"
      :class="{
        'bg-[#FF9500] text-white hover:bg-orange-600 shadow-lg hover:shadow-orange-500/25': isValid && !isLoading && !isSubmitting,
        'bg-gray-200 text-gray-400 cursor-not-allowed': !isValid || isLoading || isSubmitting
      }"
    >
      <span>{{ primaryButtonText }}</span>
      <component 
        :is="primaryButtonIcon" 
        class="w-5 h-5"
        :class="{ 'animate-spin': isSubmitting }"
      />
    </button>
  </div>
</template>

<style scoped>
/* Animación de spin para el loader */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
