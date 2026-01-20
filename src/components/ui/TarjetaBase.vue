<!-- src/components/ui/TarjetaBase.vue -->
<script setup>
import { unirClases } from '@/utils/UnirClases';

const { 
  padding = 'normal',
  hover = false 
} = defineProps({
  padding: {
    type: String,
    default: 'normal',
    validator: (value) => ['none', 'small', 'normal', 'large'].includes(value)
  },
  hover: {
    type: Boolean,
    default: false
  }
});

const clases = unirClases(
  'bg-homa-blanco border border-homa-gris-200 rounded-3xl',
  {
    'p-0': padding === 'none',
    'p-3': padding === 'small', 
    'p-4': padding === 'normal',
    'p-6': padding === 'large',
    'hover:bg-homa-gris-50 transition-colors duration-200 cursor-pointer': hover
  }
);
</script>

<template>
  <div :class="clases">
    <slot />
  </div>
</template>