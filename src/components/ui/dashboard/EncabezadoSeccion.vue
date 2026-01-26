<script setup>
/**
 * EncabezadoSeccion - Encabezado reutilizable para secciones del dashboard
 */
import { cn } from '@/lib/utils'

const props = defineProps({
  titulo: { type: String, required: true },
  icono: { type: [Object, Function], default: null },
  enlaceTexto: { type: String, default: '' },
  enlaceHref: { type: String, default: '' },
  class: { type: String, default: '' }
})
</script>

<template>
  <div :class="cn('flex items-center justify-between mb-4', props.class)">
    <div class="flex items-center gap-2">
      <component 
        v-if="props.icono" 
        :is="props.icono" 
        class="w-5 h-5 text-emerald-600 dark:text-emerald-400" 
      />
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
        {{ props.titulo }}
      </h2>
    </div>
    <router-link 
      v-if="props.enlaceTexto && props.enlaceHref" 
      :to="props.enlaceHref"
      class="text-sm text-gray-500 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400 transition-colors flex items-center gap-1"
    >
      {{ props.enlaceTexto }}
      <slot name="icono-enlace" />
    </router-link>
    <slot v-else name="accion" />
  </div>
</template>
