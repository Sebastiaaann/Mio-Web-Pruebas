<script setup>
/**
 * BaseCard - Componente de card reutilizable
 * Sigue el Sistema de Diseño Unificado
 */
import { computed } from 'vue'

const props = defineProps({
  // Variantes de tamaño
  padding: {
    type: String,
    default: 'normal', // 'small' | 'normal' | 'large'
    validator: (value) => ['small', 'normal', 'large'].includes(value)
  },
  
  // Variantes de border radius
  rounded: {
    type: String,
    default: 'normal', // 'small' | 'normal' | 'large' | 'full'
    validator: (value) => ['small', 'normal', 'large', 'full'].includes(value)
  },
  
  // Hover effects
  hoverable: {
    type: Boolean,
    default: true
  },
  
  // Clickable cursor
  clickable: {
    type: Boolean,
    default: false
  },
  
  // Background variant
  variant: {
    type: String,
    default: 'white', // 'white' | 'gray' | 'transparent'
    validator: (value) => ['white', 'gray', 'transparent'].includes(value)
  }
})

const paddingClass = computed(() => {
  const map = {
    small: 'p-4',
    normal: 'p-6',
    large: 'p-8'
  }
  return map[props.padding]
})

const roundedClass = computed(() => {
  const map = {
    small: 'rounded-xl',
    normal: 'rounded-2xl',
    large: 'rounded-3xl',
    full: 'rounded-full'
  }
  return map[props.rounded]
})

const variantClass = computed(() => {
  const map = {
    white: 'bg-white border border-gray-100',
    gray: 'bg-gray-50 border border-gray-200',
    transparent: 'bg-transparent'
  }
  return map[props.variant]
})

const hoverClass = computed(() => {
  if (!props.hoverable) return ''
  return 'hover:shadow-md transition-all duration-300'
})

const cursorClass = computed(() => {
  return props.clickable ? 'cursor-pointer' : ''
})
</script>

<template>
  <div 
    :class="[
      paddingClass,
      roundedClass,
      variantClass,
      hoverClass,
      cursorClass,
      'shadow-sm'
    ]"
  >
    <slot />
  </div>
</template>
