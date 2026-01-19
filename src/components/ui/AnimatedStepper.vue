<script setup>
import { computed } from 'vue'
import { Motion } from 'motion-v'

const props = defineProps({
  currentStep: {
    type: Number,
    required: true
  },
  steps: {
    type: Array,
    default: () => [
      { id: 1, label: 'Inicio' },
      { id: 2, label: 'Datos' },
      { id: 3, label: 'Revisión' },
      { id: 4, label: 'Final' }
    ]
  }
})

// Calculate progress percentage for the connecting line
const progress = computed(() => {
  if (props.currentStep === 1) return 0
  return ((props.currentStep - 1) / (props.steps.length - 1)) * 100
})
</script>

<template>
  <div class="w-full max-w-md mx-auto mb-8">
    <div class="relative flex justify-between items-center z-0">
      
      <!-- Background Line -->
      <div class="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -z-10 rounded-full overflow-hidden">
         <!-- Animated Progress Line -->
         <Motion
            class="h-full bg-blue-600 rounded-full"
            :initial="{ width: '0%' }"
            :animate="{ width: `${progress}%` }"
            :transition="{ type: 'spring', stiffness: 300, damping: 30 }"
         />
      </div>

      <!-- Steps -->
      <div 
        v-for="(step, index) in steps" 
        :key="step.id"
        class="relative flex flex-col items-center group"
      >
        <!-- Circle -->
        <Motion
          class="w-8 h-8 rounded-full flex items-center justify-center border-2 z-10 bg-white"
          :initial="false"
          :animate="{
            borderColor: step.id <= currentStep ? '#2563eb' : '#e5e7eb', // blue-600 or gray-200
            scale: step.id === currentStep ? 1.1 : 1,
            backgroundColor: step.id < currentStep ? '#2563eb' : (step.id === currentStep ? '#fff' : '#fff')
          }"
          :transition="{ type: 'spring', stiffness: 300, damping: 25 }"
        >
          <!-- Content inside circle -->
            <div class="absolute inset-0 flex items-center justify-center">
              
                <!-- Completed Check (Drawing Animation) -->
                <svg 
                    v-if="step.id < currentStep" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    stroke-width="3" 
                    stroke-linecap="round" 
                    stroke-linejoin="round" 
                    class="w-4 h-4 text-white"
                >
                    <Motion 
                        tag="path"
                        d="M20 6 9 17 4 12"
                        :initial="{ pathLength: 0, opacity: 0 }"
                        :animate="{ pathLength: 1, opacity: 1 }"
                        :transition="{ duration: 0.4, ease: 'easeOut' }"
                    />
                </svg>

                <!-- Current Number (Active) -->
                <Motion
                  v-else-if="step.id === currentStep"
                  :initial="{ scale: 0 }"
                  :animate="{ scale: 1 }"
                  class="w-2.5 h-2.5 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.4)]"
                />
                
                <!-- Future Number/Dot -->
                <span 
                  v-else 
                  class="text-xs font-semibold text-gray-400"
                >
                  {{ step.id }}
                </span>
            </div>
        </Motion>
      </div>
    </div>
  </div>
</template>
