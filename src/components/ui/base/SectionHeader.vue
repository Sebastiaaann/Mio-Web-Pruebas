<script setup>
/**
 * SectionHeader - Header de sección reutilizable
 * Sigue el Sistema de Diseño Unificado
 */
import { ChevronRight } from 'lucide-vue-next'

defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  actionLabel: {
    type: String,
    default: ''
  },
  actionTo: {
    type: String,
    default: ''
  },
  // Tamaño del título
  size: {
    type: String,
    default: 'normal', // 'small' | 'normal' | 'large'
    validator: (value) => ['small', 'normal', 'large'].includes(value)
  }
})

defineEmits(['action'])
</script>

<template>
  <div class="flex items-center justify-between mb-6">
    <div>
      <h2 
        :class="[
          'font-bold text-gray-900',
          size === 'small' ? 'text-xl' : '',
          size === 'normal' ? 'text-2xl' : '',
          size === 'large' ? 'text-3xl' : ''
        ]"
      >
        {{ title }}
      </h2>
      <p v-if="subtitle" class="text-sm text-gray-500">{{ subtitle }}</p>
    </div>
    
    <router-link 
      v-if="actionTo && actionLabel"
      :to="actionTo" 
      class="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors"
    >
      {{ actionLabel }}
      <ChevronRight class="w-4 h-4" />
    </router-link>
    
    <button
      v-else-if="actionLabel"
      @click="$emit('action')"
      class="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors"
    >
      {{ actionLabel }}
      <ChevronRight class="w-4 h-4" />
    </button>
  </div>
</template>
