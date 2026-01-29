<script setup>
/**
 * WizardProgress - Componente de barra de progreso del wizard
 * Muestra el progreso actual y los pasos completados
 */
import { computed } from 'vue'
import { Check } from 'lucide-vue-next'

const props = defineProps({
  currentStep: {
    type: Number,
    required: true
  },
  totalSteps: {
    type: Number,
    required: true
  },
  steps: {
    type: Array,
    default: () => []
  },
  stepTitles: {
    type: Array,
    default: () => []
  }
})

// Porcentaje de progreso
const progressPercentage = computed(() => {
  if (props.totalSteps === 0) return 0
  return ((props.currentStep + 1) / props.totalSteps) * 100
})

// Determinar estado de un paso
function getStepStatus(index) {
  if (index < props.currentStep) return 'completed'
  if (index === props.currentStep) return 'current'
  return 'pending'
}

// Obtener título del paso
function getStepTitle(index) {
  if (props.stepTitles && props.stepTitles[index]) {
    return props.stepTitles[index]
  }
  if (props.steps && props.steps[index]) {
    return props.steps[index].header || `Paso ${index + 1}`
  }
  return `Paso ${index + 1}`
}
</script>

<template>
  <div class="w-full">
    <!-- Indicador de paso actual -->
    <div class="flex items-center justify-center gap-2 mb-4">
      <span class="text-sm font-medium text-[#FF9500]">
        Paso {{ currentStep + 1 }} de {{ totalSteps }}
      </span>
      <span class="text-sm text-gray-400">•</span>
      <span class="text-sm text-gray-500">
        {{ getStepTitle(currentStep) }}
      </span>
    </div>

    <!-- Barra de progreso -->
    <div class="flex items-center gap-3 mb-6">
      <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          class="h-full bg-gradient-to-r from-[#FF9500] to-orange-400 rounded-full transition-all duration-500 ease-out"
          :style="{ width: `${progressPercentage}%` }"
        />
      </div>
      <span class="text-sm font-mono text-gray-500 w-12 text-right">
        {{ Math.round(progressPercentage) }}%
      </span>
    </div>

    <!-- Indicadores de pasos -->
    <div class="flex justify-between">
      <div 
        v-for="index in totalSteps" 
        :key="index"
        class="flex flex-col items-center gap-2 flex-1"
        :class="{ 'cursor-pointer': getStepStatus(index - 1) === 'completed' }"
      >
        <!-- Círculo del paso -->
        <div 
          class="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300"
          :class="{
            'bg-[#10B981]': getStepStatus(index - 1) === 'completed',
            'bg-[#FF9500] ring-4 ring-[#FF9500]/20': getStepStatus(index - 1) === 'current',
            'bg-gray-200': getStepStatus(index - 1) === 'pending'
          }"
        >
          <Check 
            v-if="getStepStatus(index - 1) === 'completed'"
            class="text-white w-5 h-5"
          />
          <span 
            v-else
            class="text-sm font-semibold"
            :class="getStepStatus(index - 1) === 'current' ? 'text-white' : 'text-gray-400'"
          >
            {{ index }}
          </span>
        </div>

        <!-- Título del paso (solo en desktop) -->
        <span 
          class="hidden md:block text-xs text-center max-w-[80px] truncate"
          :class="{
            'text-[#FF9500] font-medium': getStepStatus(index - 1) === 'current',
            'text-gray-500': getStepStatus(index - 1) !== 'current'
          }"
        >
          {{ getStepTitle(index - 1) }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.font-mono {
  font-family: 'Space Grotesk', monospace;
}
</style>
