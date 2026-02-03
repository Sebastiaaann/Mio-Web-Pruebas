<script setup>
/**
 * BannerCarousel - Carrusel de banners promocionales estilo Stripe
 * Adaptado con indicador inferior, navegación con íconos y transiciones suaves
 */
import { ref, onMounted, onUnmounted, computed } from 'vue'

const props = defineProps({
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
    default: 6000
  },
  height: {
    type: String,
    default: 'h-56' // Tailwind class para altura
  }
})

const currentIndex = ref(0)
const isPaused = ref(false)
let autoplayTimer = null

const totalSlides = computed(() => props.banners.length)

const currentBanner = computed(() => {
  if (props.banners.length === 0) return null
  return props.banners[currentIndex.value]
})

// Detectar si es banner de Berni para usar object-contain
const isBerniBanner = computed(() => {
  if (!currentBanner.value) return false
  const title = (currentBanner.value.title || '').toString().toLowerCase()
  return title.includes('berni')
})

// Color del indicador según el banner actual
const indicatorColors = computed(() => {
  return props.banners.map(b => {
    const title = (b.title || '').toString().toLowerCase()
    if (title.includes('berni')) return '#84cc16' // lime verde Berni
    return '#0ea5e9' // sky azul por defecto
  })
})

function goTo(index) {
  currentIndex.value = index
}

function startAutoplay() {
  if (!props.autoplay || totalSlides.value <= 1) return
  
  autoplayTimer = setInterval(() => {
    if (!isPaused.value) {
      currentIndex.value = (currentIndex.value + 1) % totalSlides.value
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
</script>

<template>
  <div 
    v-if="banners.length > 0"
    class="banner-carousel flex flex-col w-full"
    @mouseenter="pauseAutoplay"
    @mouseleave="resumeAutoplay"
  >
    <!-- Carrusel principal estilo Stripe -->
    <div 
      class="relative w-full overflow-hidden rounded-xl shadow-md group"
      :class="(currentBanner?.title || '').toString().toLowerCase().includes('berni') ? 'h-80 md:h-96' : height"
    >
      <!-- Slides Container -->
      <div class="relative w-full h-full">
        <!-- Banner Slides -->
        <TransitionGroup name="fade">
          <div
            v-for="(banner, idx) in banners"
            v-show="idx === currentIndex"
            :key="banner.id || idx"
            class="absolute inset-0"
          >
            <!-- Imagen de fondo -->
            <div 
              class="absolute inset-0 flex items-center justify-center"
              :class="(banner.title || '').toString().toLowerCase().includes('berni') ? 'bg-gradient-to-br from-purple-500 to-purple-600' : ''"
            >
              <img
                v-if="banner.image"
                :src="banner.image"
                :alt="banner.title"
                loading="eager"
                decoding="async"
                :class="[
                  'transition-transform duration-500',
                  (banner.title || '').toString().toLowerCase().includes('berni')
                    ? 'object-contain object-center w-full h-full max-h-full'
                    : 'object-cover group-hover:scale-105 w-full h-full'
                ]"
              />
              <div v-else class="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900" />
            </div>

            <!-- Overlay gradient suave solo para banners que no son Berni -->
            <div 
              v-if="!(banner.title || '').toString().toLowerCase().includes('berni')"
              class="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" 
            />

            <!-- Contenido del banner (texto + CTA) -->
            <div class="relative z-10 h-full flex items-end p-6 md:p-8">
              <div class="w-full md:w-2/3 lg:w-1/2">
                <!-- Título con fondo semi-transparente para legibilidad -->
                <div 
                  :class="[
                    'inline-block rounded-lg px-4 py-2 mb-3',
                    (banner.title || '').toString().toLowerCase().includes('berni')
                      ? 'bg-black/0'
                      : 'bg-black/70 backdrop-blur-sm'
                  ]"
                >
                  <h2 
                    :class="[
                      'font-bold leading-tight',
                      (banner.title || '').toString().toLowerCase().includes('berni')
                        ? 'text-gray-900 text-xl md:text-2xl'
                        : 'text-white text-2xl md:text-3xl'
                    ]"
                  >
                    {{ banner.title }}
                  </h2>
                </div>

                <!-- Botón CTA -->
                <a
                  :href="banner.url || '#'"
                  target="_blank"
                  rel="noopener noreferrer"
                  :class="[
                    'inline-flex items-center gap-2 rounded-full px-6 py-3 font-medium transition-colors',
                    (banner.title || '').toString().toLowerCase().includes('berni')
                      ? 'bg-lime-500 text-white hover:bg-lime-600'
                      : 'bg-white text-gray-900 hover:bg-gray-100'
                  ]"
                >
                  <span>Ver más información</span>
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                  </svg>
                </a>
              </div>
            </div>

            <!-- Indicadores de paginación (dots centro superior) -->
            <div
              v-if="totalSlides > 1"
              class="absolute top-6 left-1/2 -translate-x-1/2 flex items-center justify-center gap-2 z-20"
            >
              <button
                v-for="(_, dotIdx) in banners"
                :key="dotIdx"
                @click.prevent="goTo(dotIdx)"
                class="h-0.5 bg-white transition-all duration-300"
                :class="currentIndex === dotIdx ? 'w-10 opacity-100' : 'w-10 opacity-30'"
                :aria-label="`Ir a slide ${dotIdx + 1}`"
              />
            </div>
          </div>
        </TransitionGroup>
      </div>
    </div>

    <!-- Navegación inferior con logos/nombres -->
    <div v-if="totalSlides > 1" class="relative mt-0 border-t border-gray-200">
      <!-- Indicador de línea (subrayado móvil) -->
      <div
        class="absolute top-0 left-0 h-0.5 bg-gray-900 transition-all duration-300 ease-out z-10"
        :style="{
          width: `${100 / totalSlides}%`,
          transform: `translateX(${currentIndex * 100}%)`
        }"
      />

      <!-- Botones de navegación -->
      <div class="grid" :style="{ gridTemplateColumns: `repeat(${totalSlides}, 1fr)` }">
        <button
          v-for="(banner, idx) in banners"
          :key="idx"
          @click.prevent="goTo(idx)"
          class="relative py-6 px-4 flex items-center justify-center transition-all duration-300 hover:bg-gray-50"
          :class="currentIndex === idx ? 'opacity-100' : 'opacity-40 grayscale'"
        >
          <!-- Logo o título del banner -->
          <span class="text-sm font-semibold text-gray-900 text-center">
            {{ banner.title }}
          </span>
        </button>
      </div>
    </div>
  </div>
  
  <!-- Empty State -->
  <div
    v-else
    class="w-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-xl"
    :class="height"
  >
    <p class="text-gray-400 text-sm">Sin banners disponibles</p>
  </div>
</template>

<style scoped>
/* Fade transition para slides */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Slide-up transition para textos */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.4s ease-out;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
