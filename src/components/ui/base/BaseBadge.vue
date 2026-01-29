<script setup>
/**
 * BaseBadge - Badge/Chip reutilizable
 * Sigue el Sistema de Diseño Unificado
 */
import { computed } from 'vue'

const props = defineProps({
  // Variantes de color
  variant: {
    type: String,
    default: 'default', // 'default' | 'success' | 'info' | 'warning' | 'error' | 'purple'
    validator: (value) => ['default', 'success', 'info', 'warning', 'error', 'purple'].includes(value)
  },
  
  // Tamaño
  size: {
    type: String,
    default: 'medium', // 'small' | 'medium' | 'large'
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  
  // Icono opcional
  icon: {
    type: Object,
    default: null
  },
  
  // Punto de estado
  dot: {
    type: Boolean,
    default: false
  }
})

const variantClass = computed(() => {
  const map = {
    default: 'bg-gray-100 text-gray-700',
    success: 'bg-emerald-50 text-emerald-700',
    info: 'bg-blue-50 text-blue-700',
    warning: 'bg-amber-50 text-amber-700',
    error: 'bg-rose-50 text-rose-700',
    purple: 'bg-violet-50 text-violet-700'
  }
  return map[props.variant]
})

const sizeClass = computed(() => {
  const map = {
    small: 'px-2 py-0.5 text-[10px]',
    medium: 'px-3 py-1 text-xs',
    large: 'px-4 py-1.5 text-sm'
  }
  return map[props.size]
})

const dotColor = computed(() => {
  const map = {
    default: 'bg-gray-500',
    success: 'bg-emerald-500',
    info: 'bg-blue-500',
    warning: 'bg-amber-500',
    error: 'bg-rose-500',
    purple: 'bg-violet-500'
  }
  return map[props.variant]
})
</script>

<template>
  <span 
    :class="[
      'inline-flex items-center gap-1.5 rounded-full font-semibold',
      variantClass,
      sizeClass
    ]"
  >
    <span v-if="dot" :class="['w-1.5 h-1.5 rounded-full', dotColor]"></span>
    <component v-if="icon" :is="icon" class="w-3 h-3" />
    <slot />
  </span>
</template>
