<script setup>
/**
 * TarjetaCampana - Card para campañas de salud (OPERATIVOS, VIDA SANA)
 * Muestra badge de estado, icono, descripción y CTA
 */
import { cn } from '@/lib/utils'
import { ArrowRight } from 'lucide-vue-next'

const props = defineProps({
  titulo: { type: String, required: true },
  descripcion: { type: String, default: '' },
  icono: { type: [Object, Function], required: true },
  iconoColor: { type: String, default: '#10B981' }, // Emerald por defecto
  estado: { type: String, default: '' }, // ACTIVA, RECOMENDADA, etc.
  estadoColor: { type: String, default: 'emerald' }, // emerald, yellow, pink
  href: { type: String, default: '#' },
  ctaTexto: { type: String, default: 'COMENZAR AHORA' },
  class: { type: String, default: '' }
})

const estadoClases = {
  emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  pink: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
}

const iconoFondoClases = {
  emerald: 'bg-emerald-50 dark:bg-emerald-900/20',
  yellow: 'bg-yellow-50 dark:bg-yellow-900/20',
  pink: 'bg-pink-50 dark:bg-pink-900/20',
  blue: 'bg-blue-50 dark:bg-blue-900/20',
  purple: 'bg-purple-50 dark:bg-purple-900/20'
}
</script>

<template>
  <div
    :class="cn(
      'group relative bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700',
      'transition-all duration-300 hover:shadow-md hover:-translate-y-1 cursor-pointer',
      'flex flex-col min-h-[220px]',
      props.class
    )"
  >
    <!-- Badge de estado -->
    <span 
      v-if="estado"
      :class="cn(
        'absolute top-4 right-4 text-xs font-semibold px-2 py-0.5 rounded-full',
        estadoClases[estadoColor] || estadoClases.emerald
      )"
    >
      {{ estado }}
    </span>

    <!-- Icono -->
    <div 
      :class="cn(
        'w-12 h-12 rounded-xl flex items-center justify-center mb-4',
        iconoFondoClases[estadoColor] || iconoFondoClases.emerald
      )"
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
      <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-3">
        {{ descripcion }}
      </p>
    </div>

    <!-- CTA -->
    <router-link 
      :to="href"
      class="mt-4 inline-flex items-center gap-1 text-sm font-semibold transition-colors"
      :style="{ color: iconoColor }"
    >
      {{ ctaTexto }}
      <ArrowRight class="w-4 h-4 transition-transform group-hover:translate-x-1" />
    </router-link>

    <!-- Link overlay -->
    <router-link :to="href" class="absolute inset-0 z-10" :aria-label="titulo" />
  </div>
</template>
