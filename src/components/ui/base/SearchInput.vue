<script setup>
import { ref, computed, watch } from 'vue'
import { Search, X } from 'lucide-vue-next'

const props = defineProps({
  // Modelo v-model
  modelValue: {
    type: String,
    default: ''
  },
  
  // Placeholder
  placeholder: {
    type: String,
    default: 'Buscar...'
  },
  
  // Tamaño
  size: {
    type: String,
    default: 'medium', // 'small', 'medium', 'large'
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  
  // Deshabilitado
  disabled: {
    type: Boolean,
    default: false
  },
  
  // Autofocus
  autofocus: {
    type: Boolean,
    default: false
  },
  
  // Debounce en milisegundos (para búsquedas en tiempo real)
  debounce: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['update:modelValue', 'search', 'clear'])

// Valor interno para debounce
const internalValue = ref(props.modelValue)

// Timer para debounce
let debounceTimer = null

// Watch para sincronizar prop con valor interno
watch(() => props.modelValue, (newValue) => {
  internalValue.value = newValue
})

// Watch para debounce
watch(internalValue, (newValue) => {
  if (props.debounce > 0) {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      emit('update:modelValue', newValue)
      emit('search', newValue)
    }, props.debounce)
  } else {
    emit('update:modelValue', newValue)
    emit('search', newValue)
  }
})

// Limpiar búsqueda
const clearSearch = () => {
  internalValue.value = ''
  emit('update:modelValue', '')
  emit('clear')
}

// Clases dinámicas según tamaño
const sizeClasses = computed(() => {
  const sizes = {
    small: 'h-9 pl-9 pr-9 text-sm',
    medium: 'h-11 pl-10 pr-10 text-base',
    large: 'h-13 pl-11 pr-11 text-lg'
  }
  return sizes[props.size] || sizes.medium
})

const iconSizeClasses = computed(() => {
  const sizes = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-6 h-6'
  }
  return sizes[props.size] || sizes.medium
})

const iconPositionClasses = computed(() => {
  const positions = {
    small: 'left-2.5',
    medium: 'left-3',
    large: 'left-3.5'
  }
  return positions[props.size] || positions.medium
})

const clearButtonPositionClasses = computed(() => {
  const positions = {
    small: 'right-2.5',
    medium: 'right-3',
    large: 'right-3.5'
  }
  return positions[props.size] || positions.medium
})
</script>

<template>
  <div class="relative w-full">
    <!-- Icono de búsqueda -->
    <div 
      class="absolute top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
      :class="iconPositionClasses"
    >
      <Search :class="iconSizeClasses" />
    </div>

    <!-- Input -->
    <input
      v-model="internalValue"
      type="text"
      :placeholder="placeholder"
      :disabled="disabled"
      :autofocus="autofocus"
      class="w-full rounded-xl border border-gray-200 bg-white transition-all duration-200 
             focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20
             disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-50"
      :class="sizeClasses"
    />

    <!-- Botón de limpiar (aparece solo cuando hay texto) -->
    <button
      v-if="internalValue"
      type="button"
      @click="clearSearch"
      class="absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 
             transition-colors p-1 rounded-full hover:bg-gray-100"
      :class="clearButtonPositionClasses"
      tabindex="-1"
    >
      <X :class="iconSizeClasses" />
    </button>
  </div>
</template>
