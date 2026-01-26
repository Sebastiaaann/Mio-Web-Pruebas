<script setup>
/**
 * TarjetaBeneficios - Card especial para Club de Beneficios (Mutual)
 * Con imagen de fondo, overlay y CTA
 */
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const props = defineProps({
  titulo: { type: String, default: 'Club de Beneficios' },
  subtitulo: { type: String, default: '' },
  descripcion: { type: String, default: '' },
  imagenUrl: { type: String, default: '' },
  ctaTexto: { type: String, default: 'Explorar Beneficios' },
  ctaHref: { type: String, default: '/beneficios' },
  class: { type: String, default: '' }
})
</script>

<template>
  <div 
    :class="cn(
      'group relative rounded-2xl overflow-hidden min-h-[280px]',
      'shadow-lg transition-transform duration-300 hover:scale-[1.01]',
      'bg-gradient-to-b from-purple-900 to-purple-950',
      props.class
    )"
  >
    <!-- Imagen de fondo -->
    <div 
      v-if="imagenUrl" 
      class="absolute inset-0 bg-cover bg-center opacity-60"
      :style="{ backgroundImage: `url(${imagenUrl})` }"
    />
    
    <!-- Overlay gradiente -->
    <div class="absolute inset-0 bg-gradient-to-t from-purple-950 via-purple-900/80 to-transparent" />

    <!-- Contenido -->
    <div class="relative z-10 h-full flex flex-col justify-between p-6">
      <div>
        <h3 class="text-white text-xl font-bold mb-1">
          {{ titulo }}
        </h3>
        <p v-if="subtitulo" class="text-yellow-300 text-sm font-medium">
          {{ subtitulo }}
        </p>
      </div>

      <!-- Imagen decorativa central -->
      <div class="flex-1 flex items-center justify-center py-4">
        <div class="w-24 h-24 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
          <span class="text-4xl">🎁</span>
        </div>
      </div>

      <div>
        <p v-if="descripcion" class="text-white/80 text-sm mb-4 leading-relaxed">
          {{ descripcion }}
        </p>
        
        <router-link :to="ctaHref" class="block">
          <Button 
            variant="outline"
            class="w-full bg-transparent border-white/30 text-white hover:bg-white/10 rounded-full"
          >
            {{ ctaTexto }}
          </Button>
        </router-link>
      </div>
    </div>

    <!-- Link overlay -->
    <router-link :to="ctaHref" class="absolute inset-0 z-20" :aria-label="titulo" />
  </div>
</template>
