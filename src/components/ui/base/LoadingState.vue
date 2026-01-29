<script setup>
import { computed } from 'vue'
import { Loader2 } from 'lucide-vue-next'

const props = defineProps({
  // Tipo de loading
  type: {
    type: String,
    default: 'spinner', // 'spinner', 'skeleton-text', 'skeleton-card', 'skeleton-list'
    validator: (value) => ['spinner', 'skeleton-text', 'skeleton-card', 'skeleton-list'].includes(value)
  },
  
  // Tamaño del spinner
  size: {
    type: String,
    default: 'medium', // 'small', 'medium', 'large'
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  
  // Color del spinner (clase Tailwind sin intensidad)
  color: {
    type: String,
    default: 'violet'
  },
  
  // Texto de carga (solo para spinner)
  text: {
    type: String,
    default: ''
  },
  
  // Número de líneas para skeleton-text
  lines: {
    type: Number,
    default: 3
  },
  
  // Número de items para skeleton-list
  items: {
    type: Number,
    default: 3
  }
})

// Tamaño del spinner
const spinnerSizeClasses = computed(() => {
  const sizes = {
    small: 'w-5 h-5',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  }
  return sizes[props.size] || sizes.medium
})

// Color del spinner
const spinnerColorClass = computed(() => {
  return `text-${props.color}-600`
})
</script>

<template>
  <!-- Spinner -->
  <div v-if="type === 'spinner'" class="flex flex-col items-center justify-center gap-3">
    <Loader2 
      class="animate-spin"
      :class="[spinnerSizeClasses, spinnerColorClass]"
    />
    <p v-if="text" class="text-sm text-gray-500">{{ text }}</p>
  </div>

  <!-- Skeleton Text (múltiples líneas) -->
  <div v-else-if="type === 'skeleton-text'" class="space-y-3 animate-pulse">
    <div 
      v-for="i in lines" 
      :key="i"
      class="h-4 bg-gray-200 rounded"
      :class="i === lines ? 'w-3/4' : 'w-full'"
    />
  </div>

  <!-- Skeleton Card -->
  <div v-else-if="type === 'skeleton-card'" class="animate-pulse">
    <div class="rounded-2xl border border-gray-200 bg-white p-6 space-y-4">
      <!-- Header -->
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 bg-gray-200 rounded-full" />
        <div class="flex-1 space-y-2">
          <div class="h-4 bg-gray-200 rounded w-1/3" />
          <div class="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
      
      <!-- Content -->
      <div class="space-y-2">
        <div class="h-3 bg-gray-200 rounded w-full" />
        <div class="h-3 bg-gray-200 rounded w-5/6" />
        <div class="h-3 bg-gray-200 rounded w-4/6" />
      </div>
      
      <!-- Footer -->
      <div class="flex gap-3 pt-4">
        <div class="h-8 bg-gray-200 rounded-lg w-20" />
        <div class="h-8 bg-gray-200 rounded-lg w-24" />
      </div>
    </div>
  </div>

  <!-- Skeleton List -->
  <div v-else-if="type === 'skeleton-list'" class="space-y-4 animate-pulse">
    <div 
      v-for="i in items" 
      :key="i"
      class="rounded-xl border border-gray-200 bg-white p-4"
    >
      <div class="flex items-center gap-4">
        <!-- Icono -->
        <div class="w-10 h-10 bg-gray-200 rounded-lg shrink-0" />
        
        <!-- Contenido -->
        <div class="flex-1 space-y-2">
          <div class="h-4 bg-gray-200 rounded w-2/3" />
          <div class="h-3 bg-gray-200 rounded w-1/2" />
        </div>
        
        <!-- Badge -->
        <div class="w-16 h-6 bg-gray-200 rounded-full" />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Animación personalizada para el skeleton shimmer (opcional) */
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
