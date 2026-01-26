<script setup>
/**
 * BannerCarousel - Carrusel de banners promocionales
 * Carga datos desde el servicio BANNERS de la API
 */
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-vue-next'
import { Motion, AnimatePresence } from 'motion-v'

const props = defineProps({
  // Los banners pueden venir como prop o cargarse internamente
  banners: {
    type: Array,
    default: () => []
  },
  autoplay: {
    type: Boolean,
    default: true
  },
  interval: {
    type: Number,
    default: 5000
  }
})

const currentIndex = ref(0)
const direction = ref(1) // 1 = next, -1 = prev
const isPaused = ref(false)
let autoplayTimer = null

const totalSlides = computed(() => props.banners.length)

const currentBanner = computed(() => {
  if (props.banners.length === 0) return null
  return props.banners[currentIndex.value]
})

function next() {
  direction.value = 1
  currentIndex.value = (currentIndex.value + 1) % totalSlides.value
}

function prev() {
  direction.value = -1
  currentIndex.value = (currentIndex.value - 1 + totalSlides.value) % totalSlides.value
}

function goTo(index) {
  direction.value = index > currentIndex.value ? 1 : -1
  currentIndex.value = index
}

function startAutoplay() {
  if (!props.autoplay || totalSlides.value <= 1) return
  
  autoplayTimer = setInterval(() => {
    if (!isPaused.value) {
      next()
    }
  }, props.interval)
}

function stopAutoplay() {
  if (autoplayTimer) {
    clearInterval(autoplayTimer)
    autoplayTimer = null
  }
}

function pauseAutoplay() {
  isPaused.value = true
}

function resumeAutoplay() {
  isPaused.value = false
}

onMounted(() => {
  startAutoplay()
})

onUnmounted(() => {
  stopAutoplay()
})

// Animation variants
const slideVariants = {
  enter: (dir) => ({
    x: dir > 0 ? '100%' : '-100%',
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1
  },
  exit: (dir) => ({
    x: dir > 0 ? '-100%' : '100%',
    opacity: 0
  })
}
</script>

<template>
  <div 
    v-if="banners.length > 0"
    class="banner-carousel relative w-full h-full overflow-hidden rounded-2xl"
    @mouseenter="pauseAutoplay"
    @mouseleave="resumeAutoplay"
  >
    <!-- Slides -->
    <AnimatePresence mode="wait" :custom="direction">
      <Motion
        v-if="currentBanner"
        :key="currentIndex"
        :initial="slideVariants.enter(direction)"
        :animate="slideVariants.center"
        :exit="slideVariants.exit(direction)"
        :transition="{ type: 'spring', stiffness: 300, damping: 30 }"
        class="absolute inset-0"
      >
        <a 
          :href="currentBanner.url || '#'"
          target="_blank"
          rel="noopener noreferrer"
          class="block w-full h-full relative group"
        >
          <!-- Background Image -->
          <div 
            class="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
            :style="currentBanner.image ? { backgroundImage: `url(${currentBanner.image})` } : {}"
          >
            <!-- Fallback gradient if no image -->
            <div 
              v-if="!currentBanner.image" 
              class="absolute inset-0 bg-gradient-to-br from-purple-600 to-indigo-700"
            />
          </div>
          
          <!-- Overlay -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          
          <!-- Content -->
          <div class="absolute bottom-0 left-0 right-0 p-6">
            <h3 class="text-white text-lg font-bold mb-1 line-clamp-2">
              {{ currentBanner.title || '' }}
            </h3>
            <p v-if="currentBanner.description" class="text-white/80 text-sm line-clamp-2">
              {{ currentBanner.description }}
            </p>
            
            <!-- External link indicator -->
            <div class="mt-3 inline-flex items-center gap-2 text-white/70 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
              <ExternalLink class="w-3 h-3" />
              <span>Ver más</span>
            </div>
          </div>
        </a>
      </Motion>
    </AnimatePresence>

    <!-- Navigation Arrows -->
    <template v-if="totalSlides > 1">
      <button 
        @click.prevent="prev"
        class="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity z-10"
        aria-label="Anterior"
      >
        <ChevronLeft class="w-5 h-5" />
      </button>
      
      <button 
        @click.prevent="next"
        class="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity z-10"
        aria-label="Siguiente"
      >
        <ChevronRight class="w-5 h-5" />
      </button>
    </template>

    <!-- Dots -->
    <div v-if="totalSlides > 1" class="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
      <button
        v-for="(_, index) in banners"
        :key="index"
        @click.prevent="goTo(index)"
        class="w-2 h-2 rounded-full transition-all"
        :class="currentIndex === index 
          ? 'bg-white w-4' 
          : 'bg-white/50 hover:bg-white/70'"
        :aria-label="`Ir a slide ${index + 1}`"
      />
    </div>
  </div>
  
  <!-- Empty State -->
  <div v-else class="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-2xl">
    <p class="text-gray-400 text-sm">Sin banners disponibles</p>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
