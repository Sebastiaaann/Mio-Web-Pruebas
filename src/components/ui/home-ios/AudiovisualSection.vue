<script setup>
/**
 * AudiovisualSection - Sección de Material Audiovisual
 * Muestra Biblioteca Virtual y Campaña Anual
 */
import { Motion } from 'motion-v'
import { computed } from 'vue'
import { usePrefersReducedMotion } from '@/composables/usePrefersReducedMotion'
import { PlayCircle, ExternalLink } from 'lucide-vue-next'

defineProps({
  items: {
    type: Array,
    default: () => []
  }
})

function obtenerRuta(item) {
  const titulo = (item?.title || '').toLowerCase()
  if (titulo.includes('campaña')) {
    return { path: '/recursos', query: { campaign: 'anual' } }
  }
  return '/recursos'
}
</script>

<template>
  <section v-if="items.length > 0">
    <Motion
      :initial="{ opacity: 0, y: 20 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="prefersReduced ? { duration: 0.001 } : { duration: 0.5, delay: 0.3 }"
    >
      <div class="mb-4">
        <h3 class="text-xl text-gray-800" style="font-weight: 425;">Material Audiovisual</h3>
        <p class="text-gray-500 text-sm">Contenido educativo y campañas</p>
      </div>
    </Motion>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Motion
        v-for="(item, index) in items"
        :key="index"
        :initial="{ opacity: 0, scale: 0.95 }"
        :animate="{ opacity: 1, scale: 1 }"
        :transition="prefersReduced ? { duration: 0.001 } : { duration: 0.4, delay: 0.4 + (index * 0.1) }"
      >
        <RouterLink
          :to="obtenerRuta(item)"
          class="audiovisual-card group cursor-pointer overflow-hidden relative block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          :aria-label="`Abrir material audiovisual: ${item.title}`"
        >
          <!-- Background Gradient/Image -->
          <div class="absolute inset-0 bg-gradient-to-br from-[#badc58] to-[#6ab04c] opacity-90 transition-opacity group-hover:opacity-100"></div>
          
          <img 
            v-if="item.image" 
            :src="item.image" 
            width="128" height="128"
            loading="lazy" decoding="async"
            class="absolute right-0 bottom-0 w-32 h-32 object-contain opacity-20 group-hover:opacity-30 transition-opacity transition-transform transform group-hover:scale-110"
            alt="Decoration"
            aria-hidden="true"
          />
          
          <!-- Content -->
          <div class="relative z-10 p-6 flex flex-col h-full justify-between">
            <div class="flex items-start gap-3">
              <div class="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <PlayCircle class="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 class="text-lg font-bold text-white leading-tight mb-1">
                  {{ item.title }}
                </h4>
                <p class="text-white/80 text-sm line-clamp-2">
                  {{ item.subtitle || 'Ver contenido disponible' }}
                </p>
              </div>
            </div>

            <div class="mt-4 flex justify-end">
              <span class="bg-white/20 hover:bg-white/30 text-white text-xs font-bold py-2 px-4 rounded-full flex items-center gap-1 backdrop-blur-md transition-colors transition-background transition-transform">
                EXPLORAR
                <ExternalLink class="w-3 h-3" />
              </span>
            </div>
          </div>
        </RouterLink>
      </Motion>
    </div>
  </section>
</template>

<style scoped>
.audiovisual-card {
  height: 140px;
  border-radius: 20px;
  box-shadow: 0 4px 15px rgba(106, 176, 76, 0.15);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.audiovisual-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 25px rgba(106, 176, 76, 0.25);
}
</style>
