<script setup lang="ts">
/**
 * EmptyState - Componente para estados vacíos informativos
 * 
 * Muestra un mensaje amigable cuando no hay datos disponibles,
 * con icono, título, descripción y opcionalmente una acción sugerida.
 */

import { computed } from 'vue'

interface Props {
  /** Icono a mostrar (formato iconify) */
  icon?: string
  /** Título del estado vacío */
  title: string
  /** Descripción o mensaje explicativo */
  description?: string
  /** Texto del botón de acción (opcional) */
  actionText?: string
  /** Si debe mostrar el botón de acción */
  showAction?: boolean
  /** Variante visual del empty state */
  variant?: 'default' | 'compact' | 'large'
}

const props = withDefaults(defineProps<Props>(), {
  icon: 'lucide:inbox',
  description: '',
  actionText: 'Crear nuevo',
  showAction: false,
  variant: 'default'
})

const emit = defineEmits<{
  /** Emitido cuando se hace clic en el botón de acción */
  (e: 'action'): void
}>()

const handleAction = () => {
  emit('action')
}

// Clase del icono computada como string
const iconClass = computed(() => {
  const baseClass = 'text-gray-400'
  const sizeClass = props.variant === 'default' ? 'text-2xl' 
    : props.variant === 'compact' ? 'text-xl' 
    : 'text-3xl'
  return `${baseClass} ${sizeClass}`
})
</script>

<template>
  <div 
    :class="[
      'flex flex-col items-center justify-center text-center',
      {
        'p-8': variant === 'default',
        'p-4': variant === 'compact',
        'p-12': variant === 'large'
      }
    ]"
  >
    <!-- Icono -->
    <div 
      :class="[
        'rounded-full bg-gray-100 flex items-center justify-center mb-4',
        {
          'w-16 h-16': variant === 'default',
          'w-12 h-12': variant === 'compact',
          'w-20 h-20': variant === 'large'
        }
      ]"
    >
      <iconify-icon 
        :icon="icon" 
        :class="iconClass"
      />
    </div>

    <!-- Título -->
    <h3 
      :class="[
        'font-semibold text-gray-900 mb-2',
        {
          'text-lg': variant === 'default',
          'text-base': variant === 'compact',
          'text-xl': variant === 'large'
        }
      ]"
    >
      {{ title }}
    </h3>

    <!-- Descripción -->
    <p 
      v-if="description"
      :class="[
        'text-gray-500 mb-4 max-w-md',
        {
          'text-sm': variant === 'compact',
          'text-base': variant !== 'compact'
        }
      ]"
    >
      {{ description }}
    </p>

    <!-- Botón de acción -->
    <button
      v-if="showAction"
      @click="handleAction"
      class="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium text-sm flex items-center gap-2"
    >
      <iconify-icon icon="lucide:plus" />
      {{ actionText }}
    </button>
  </div>
</template>
