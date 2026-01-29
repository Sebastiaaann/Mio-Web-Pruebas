<script setup>
/**
 * BannerCarouselIOS - Carrusel de banners estilo iOS
 * Con glass cards y hover effects
 */
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Motion } from 'motion-v'
import { usePrefersReducedMotion } from '@/composables/usePrefersReducedMotion'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

const props = defineProps({
  banners: { type: Array, default: () => [] },
  autoplay: { type: Boolean, default: true },
  interval: { type: Number, default: 5000 }
})

const currentIndex = ref(0)
let autoplayTimer = null

const visibleBanners = computed(() => {
  if (props.banners.length === 0) return []
  // Mostrar 2 banners a la vez
  const first = currentIndex.value
  const second = (currentIndex.value + 1) % props.banners.length
  return [props.banners[first], props.banners[second]].filter(Boolean)
})

function next() {
  currentIndex.value = (currentIndex.value + 1) % props.banners.length
}

function prev() {
  currentIndex.value = (currentIndex.value - 1 + props.banners.length) % props.banners.length
}

function startAutoplay() {
  if (!props.autoplay || props.banners.length <= 2 || prefersReduced.value) return
  autoplayTimer = setInterval(next, props.interval)
}

function stopAutoplay() {
  if (autoplayTimer) clearInterval(autoplayTimer)
}

onMounted(startAutoplay)
onUnmounted(stopAutoplay)

const { prefersReduced } = usePrefersReducedMotion()

const motionTransition = computed(() =>
  prefersReduced.value ? { duration: 0.001, delay: 0 } : { duration: 0.6, delay: 0.3, ease: 'easeOut' }
)
</script>

<template>
  <Motion
    :initial="{ opacity: 0, y: 30 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="motionTransition"
  >
    <div class="glass-card rounded-2xl p-5 h-full">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-bold text-gray-800">Destacados</h3>
        <div v-if="banners.length > 2" class="flex gap-2">
          <button 
            @click="prev"
            class="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center hover:bg-purple-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            aria-label="Ver banner anterior"
            type="button"
          >
            <ChevronLeft class="w-4 h-4 text-purple-600" />
          </button>
          <button 
            @click="next"
            class="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center hover:bg-purple-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            aria-label="Ver siguiente banner"
            type="button"
          >
            <ChevronRight class="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <a 
          v-for="(banner, index) in visibleBanners"
          :key="banner.id || index"
          :href="banner.url || '#'"
          target="_blank"
          rel="noopener noreferrer"
          class="group relative overflow-hidden rounded-2xl aspect-video md:aspect-21/9 lg:aspect-24/9 card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          :style="{ 
            background: `linear-gradient(135deg, ${banner.colorFrom || '#9333ea'}, ${banner.colorTo || '#7c3aed'})`
          }"
          @mouseenter="stopAutoplay"
          @mouseleave="startAutoplay"
        >
          <img 
            v-if="banner.image"
            :src="banner.image" 
            :alt="banner.title"
            width="1280" height="720"
            loading="lazy" decoding="async"
            class="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-500"
          />
          <div class="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
          <div class="absolute bottom-3 left-3 right-3">
            <p class="text-white font-semibold text-sm">{{ banner.title }}</p>
            <p v-if="banner.description" class="text-white/70 text-xs">{{ banner.description }}</p>
          </div>
          
        </a>
      </div>
    </div>
  </Motion>
</template>

<style scoped>
.glass-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.card-hover {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-hover:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 20px 40px -15px rgba(147, 51, 234, 0.25);
}
</style>
