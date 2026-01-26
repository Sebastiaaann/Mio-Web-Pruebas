<script setup>
/**
 * BannerHero - Banner principal con gradiente, imagen y CTA
 * Datos provenientes del servicio BANNERS de la API
 */
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const props = defineProps({
  titulo: { type: String, required: true },
  subtitulo: { type: String, default: '' },
  descripcion: { type: String, default: '' },
  imagenUrl: { type: String, default: '' },
  ctaTexto: { type: String, default: 'Comenzar Ahora' },
  ctaHref: { type: String, default: '#' },
  colorFondo: { type: String, default: '' }, // Color desde la API
  class: { type: String, default: '' }
})

const estiloFondo = computed(() => {
  if (props.colorFondo) {
    return { background: `linear-gradient(135deg, ${props.colorFondo} 0%, ${ajustarColor(props.colorFondo, -20)} 100%)` }
  }
  return { background: 'linear-gradient(135deg, #2D9A8A 0%, #1A6B5E 100%)' }
})

// Oscurecer color en un porcentaje
function ajustarColor(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = Math.max(0, Math.min(255, (num >> 16) + amt))
  const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amt))
  const B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt))
  return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`
}
</script>

<template>
  <div 
    :class="cn(
      'relative rounded-2xl overflow-hidden p-6 md:p-8 min-h-[200px] md:min-h-[220px]',
      'shadow-lg transition-transform duration-300 hover:scale-[1.01]',
      props.class
    )"
    :style="estiloFondo"
  >
    <!-- Contenido -->
    <div class="relative z-10 flex flex-col h-full justify-between max-w-[60%] md:max-w-[55%]">
      <div>
        <h2 class="text-white text-2xl md:text-3xl font-bold mb-2">
          {{ titulo }}
        </h2>
        <p v-if="subtitulo" class="text-white/90 text-sm md:text-base mb-1">
          {{ subtitulo }}
        </p>
        <p v-if="descripcion" class="text-white/80 text-sm leading-relaxed">
          {{ descripcion }}
        </p>
      </div>
      
      <router-link :to="ctaHref" class="mt-4 inline-block w-fit">
        <Button 
          variant="secondary"
          class="bg-white text-emerald-700 hover:bg-gray-100 font-medium rounded-full px-6 py-2 shadow-md"
        >
          {{ ctaTexto }}
        </Button>
      </router-link>
    </div>

    <!-- Imagen decorativa -->
    <div v-if="imagenUrl" class="absolute right-0 top-0 bottom-0 w-[45%] md:w-[40%]">
      <img 
        :src="imagenUrl" 
        :alt="titulo"
        class="h-full w-full object-contain object-right-bottom"
      />
    </div>
    
    <!-- Placeholder decorativo si no hay imagen -->
    <div v-else class="absolute right-4 top-1/2 -translate-y-1/2 w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
      <div class="text-center text-white/80 text-xs">
        <div class="text-2xl mb-1">🧘</div>
        <span class="font-medium">BIENESTAR</span>
      </div>
    </div>
  </div>
</template>
