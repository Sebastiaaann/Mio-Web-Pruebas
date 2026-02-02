<!-- src/components/ui/BotonPrimario.vue -->
<script setup>
import { unirClases } from '@/utils/UnirClases'

const { 
  variant = 'primario',
  size = 'medium',
  disabled = false,
  loading = false,
  type = 'button'
} = defineProps({
  variant: {
    type: String,
    default: 'primario',
    validator: (value) => ['primario', 'secundario'].includes(value)
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: 'button'
  }
});

const clases = unirClases(
  'font-medium rounded-full transition-colors duration-200 border inline-flex items-center justify-center',
  {
    'homa-button': variant === 'primario',
    'homa-button-outline': variant === 'secundario',
    'px-3 py-2 text-sm': size === 'small',
    'px-4 py-2 text-base': size === 'medium',
    'px-6 py-3 text-lg': size === 'large',
    'opacity-50 cursor-not-allowed': disabled || loading
  }
);
</script>

<template>
  <button 
    :class="clases"
    :disabled="disabled || loading"
    :type="type"
  >
    <span v-if="loading" class="mr-2">⏳</span>
    <slot />
  </button>
</template>
