<script setup>
import { computed } from 'vue'
import { Button } from '@/components/ui/button'

const props = defineProps({
  // Icono a mostrar (componente Lucide)
  icon: {
    type: Object,
    default: null
  },
  
  // Título del estado vacío
  title: {
    type: String,
    default: 'No hay datos disponibles'
  },
  
  // Descripción/mensaje
  description: {
    type: String,
    default: ''
  },
  
  // Texto del botón de acción
  actionLabel: {
    type: String,
    default: ''
  },
  
  // Tamaño del componente
  size: {
    type: String,
    default: 'medium', // 'small', 'medium', 'large'
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  
  // Variante de color del icono
  variant: {
    type: String,
    default: 'default', // 'default', 'primary', 'success', 'warning'
    validator: (value) => ['default', 'primary', 'success', 'warning'].includes(value)
  }
})

const emit = defineEmits(['action'])

// Clases dinámicas del contenedor según tamaño
const containerClasses = computed(() => {
  const sizes = {
    small: 'py-8',
    medium: 'py-12',
    large: 'py-16'
  }
  return sizes[props.size] || sizes.medium
})

// Clases del icono según tamaño
const iconSizeClasses = computed(() => {
  const sizes = {
    small: 'w-12 h-12',
    medium: 'w-16 h-16',
    large: 'w-20 h-20'
  }
  return sizes[props.size] || sizes.medium
})

// Clases del contenedor del icono según variante
const iconContainerClasses = computed(() => {
  const variants = {
    default: 'bg-gray-100 text-gray-400',
    primary: 'bg-violet-50 text-violet-500',
    success: 'bg-emerald-50 text-emerald-500',
    warning: 'bg-amber-50 text-amber-500'
  }
  return variants[props.variant] || variants.default
})

// Tamaño del título según size prop
const titleClasses = computed(() => {
  const sizes = {
    small: 'text-lg',
    medium: 'text-xl',
    large: 'text-2xl'
  }
  return sizes[props.size] || sizes.medium
})

// Tamaño de la descripción según size prop
const descriptionClasses = computed(() => {
  const sizes = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  }
  return sizes[props.size] || sizes.medium
})

const handleAction = () => {
  emit('action')
}
</script>

<template>
  <div 
    class="flex flex-col items-center justify-center text-center"
    :class="containerClasses"
  >
    <!-- Icono -->
    <div 
      v-if="icon"
      class="rounded-full flex items-center justify-center mb-4"
      :class="[iconContainerClasses, iconSizeClasses]"
    >
      <component 
        :is="icon" 
        :class="size === 'small' ? 'w-6 h-6' : size === 'large' ? 'w-10 h-10' : 'w-8 h-8'"
      />
    </div>

    <!-- Título -->
    <h3 
      class="font-bold text-gray-900 mb-2"
      :class="titleClasses"
    >
      {{ title }}
    </h3>

    <!-- Descripción -->
    <p 
      v-if="description"
      class="text-gray-500 max-w-md mb-6"
      :class="descriptionClasses"
    >
      {{ description }}
    </p>

    <!-- Botón de acción (opcional) -->
    <Button
      v-if="actionLabel"
      @click="handleAction"
      class="mt-2"
    >
      {{ actionLabel }}
    </Button>

    <!-- Slot para contenido personalizado -->
    <slot />
  </div>
</template>
