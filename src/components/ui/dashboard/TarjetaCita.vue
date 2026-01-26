<script setup>
/**
 * TarjetaCita - Card para teleconsulta y citas médicas
 * Con icono, descripción y botón de acción
 */
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const props = defineProps({
  titulo: { type: String, required: true },
  descripcion: { type: String, default: '' },
  icono: { type: [Object, Function], required: true },
  iconoColor: { type: String, default: '#0D9488' },
  ctaTexto: { type: String, default: 'Ver más' },
  ctaHref: { type: String, default: '#' },
  ctaVariante: { type: String, default: 'outline' }, // 'solid' | 'outline'
  class: { type: String, default: '' }
})
</script>

<template>
  <div
    :class="cn(
      'group relative bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700',
      'transition-all duration-300 hover:shadow-md',
      'flex flex-col min-h-[200px]',
      props.class
    )"
  >
    <!-- Icono -->
    <div 
      class="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-gray-50 dark:bg-gray-700/50"
    >
      <component 
        :is="icono" 
        class="w-6 h-6"
        :style="{ color: iconoColor }"
      />
    </div>

    <!-- Contenido -->
    <div class="flex-1">
      <h3 class="text-base font-bold text-gray-900 dark:text-white mb-2">
        {{ titulo }}
      </h3>
      <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
        {{ descripcion }}
      </p>
    </div>

    <!-- CTA Button -->
    <router-link :to="ctaHref" class="mt-4 block">
      <Button 
        :variant="ctaVariante === 'solid' ? 'default' : 'outline'"
        :class="cn(
          'w-full rounded-full font-medium',
          ctaVariante === 'solid' 
            ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
            : 'border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
        )"
      >
        {{ ctaTexto }}
      </Button>
    </router-link>
  </div>
</template>
