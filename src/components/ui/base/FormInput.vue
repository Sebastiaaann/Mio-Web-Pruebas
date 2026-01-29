<script setup>
import { computed, ref } from 'vue'
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-vue-next'

const props = defineProps({
  // Modelo v-model
  modelValue: {
    type: [String, Number],
    default: ''
  },
  
  // Tipo de input
  type: {
    type: String,
    default: 'text', // 'text', 'email', 'password', 'tel', 'number', 'url'
    validator: (value) => ['text', 'email', 'password', 'tel', 'number', 'url', 'textarea'].includes(value)
  },
  
  // Label del input
  label: {
    type: String,
    default: ''
  },
  
  // Placeholder
  placeholder: {
    type: String,
    default: ''
  },
  
  // Hint text (ayuda debajo del input)
  hint: {
    type: String,
    default: ''
  },
  
  // Mensaje de error
  error: {
    type: String,
    default: ''
  },
  
  // Estado de validación
  success: {
    type: Boolean,
    default: false
  },
  
  // Requerido
  required: {
    type: Boolean,
    default: false
  },
  
  // Deshabilitado
  disabled: {
    type: Boolean,
    default: false
  },
  
  // Tamaño
  size: {
    type: String,
    default: 'medium', // 'small', 'medium', 'large'
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  
  // Número de filas para textarea
  rows: {
    type: Number,
    default: 4
  },
  
  // Icono opcional (componente Lucide)
  icon: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'blur', 'focus', 'enter'])

// Estado local para mostrar/ocultar password
const showPassword = ref(false)

// Tipo dinámico para password toggle
const inputType = computed(() => {
  if (props.type === 'password') {
    return showPassword.value ? 'text' : 'password'
  }
  return props.type
})

// Clases dinámicas según el tamaño
const sizeClasses = computed(() => {
  const sizes = {
    small: 'px-3 py-2 text-sm',
    medium: 'px-4 py-2.5 text-base',
    large: 'px-5 py-3 text-lg'
  }
  return sizes[props.size] || sizes.medium
})

// Clases dinámicas según el estado
const stateClasses = computed(() => {
  if (props.error) {
    return 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
  }
  if (props.success) {
    return 'border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500/20'
  }
  return 'border-gray-200 focus:border-violet-500 focus:ring-violet-500/20'
})

// Handler para actualizar el modelo
const handleInput = (event) => {
  emit('update:modelValue', event.target.value)
}

const handleBlur = (event) => {
  emit('blur', event)
}

const handleFocus = (event) => {
  emit('focus', event)
}

const handleKeydown = (event) => {
  if (event.key === 'Enter' && props.type !== 'textarea') {
    emit('enter', event)
  }
}
</script>

<template>
  <div class="w-full">
    <!-- Label -->
    <label 
      v-if="label" 
      class="block text-sm font-medium text-gray-700 mb-2"
    >
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1">*</span>
    </label>

    <!-- Input Container -->
    <div class="relative">
      <!-- Icono izquierdo (opcional) -->
      <div 
        v-if="icon" 
        class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
      >
        <component :is="icon" class="w-5 h-5" />
      </div>

      <!-- Input o Textarea -->
      <textarea
        v-if="type === 'textarea'"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :rows="rows"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
        class="w-full rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 resize-none"
        :class="[
          sizeClasses,
          stateClasses,
          { 'opacity-60 cursor-not-allowed bg-gray-50': disabled },
          { 'pl-10': icon }
        ]"
      />

      <input
        v-else
        :type="inputType"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
        @keydown="handleKeydown"
        class="w-full rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2"
        :class="[
          sizeClasses,
          stateClasses,
          { 'opacity-60 cursor-not-allowed bg-gray-50': disabled },
          { 'pl-10': icon },
          { 'pr-10': type === 'password' || error || success }
        ]"
      />

      <!-- Botón mostrar/ocultar password -->
      <button
        v-if="type === 'password'"
        type="button"
        @click="showPassword = !showPassword"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
        tabindex="-1"
      >
        <Eye v-if="!showPassword" class="w-5 h-5" />
        <EyeOff v-else class="w-5 h-5" />
      </button>

      <!-- Icono de error -->
      <div
        v-else-if="error"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 pointer-events-none"
      >
        <AlertCircle class="w-5 h-5" />
      </div>

      <!-- Icono de éxito -->
      <div
        v-else-if="success"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none"
      >
        <CheckCircle class="w-5 h-5" />
      </div>
    </div>

    <!-- Hint o Error Message -->
    <div v-if="error || hint" class="mt-2 text-sm">
      <p v-if="error" class="text-red-600 flex items-start gap-1">
        <AlertCircle class="w-4 h-4 mt-0.5 shrink-0" />
        <span>{{ error }}</span>
      </p>
      <p v-else-if="hint" class="text-gray-500">{{ hint }}</p>
    </div>
  </div>
</template>
