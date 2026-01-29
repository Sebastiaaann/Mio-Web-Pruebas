<script setup>
/**
 * IconContainer - Contenedor de iconos reutilizable
 * Sigue el Sistema de Diseño Unificado
 */
import { computed } from 'vue'

const props = defineProps({
  // Tamaño del contenedor
  size: {
    type: String,
    default: 'medium', // 'small' | 'medium' | 'large'
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  
  // Color de fondo
  bgColor: {
    type: String,
    default: 'gray' // Nombre de color Tailwind (gray, emerald, blue, etc.)
  },
  
  // Intensidad del background (50, 100, 200...)
  bgIntensity: {
    type: String,
    default: '50'
  },
  
  // Color del icono
  iconColor: {
    type: String,
    default: 'gray'
  },
  
  // Intensidad del color del icono
  iconIntensity: {
    type: String,
    default: '600'
  },
  
  // Border radius
  rounded: {
    type: String,
    default: 'lg', // 'md' | 'lg' | 'xl' | 'full'
    validator: (value) => ['md', 'lg', 'xl', 'full'].includes(value)
  }
})

const containerSize = computed(() => {
  const map = {
    small: 'w-8 h-8',
    medium: 'w-10 h-10',
    large: 'w-12 h-12'
  }
  return map[props.size]
})

const iconSize = computed(() => {
  const map = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-6 h-6'
  }
  return map[props.size]
})

const backgroundClass = computed(() => {
  return `bg-${props.bgColor}-${props.bgIntensity}`
})

const iconColorClass = computed(() => {
  return `text-${props.iconColor}-${props.iconIntensity}`
})

const roundedClass = computed(() => {
  return `rounded-${props.rounded}`
})
</script>

<template>
  <div 
    :class="[
      containerSize,
      backgroundClass,
      roundedClass,
      'flex items-center justify-center shrink-0'
    ]"
  >
    <div :class="[iconSize, iconColorClass]">
      <slot />
    </div>
  </div>
</template>
