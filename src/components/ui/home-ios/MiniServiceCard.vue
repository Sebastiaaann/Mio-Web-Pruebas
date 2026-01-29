<script setup>
/**
 * MiniServiceCard - Card pequeña para servicios adicionales
 * Layout de 6 cards en grid
 */
import { Motion } from 'motion-v'
import { computed } from 'vue'
import { usePrefersReducedMotion } from '@/composables/usePrefersReducedMotion'

const props = defineProps({
  titulo: { type: String, required: true },
  subtitulo: { type: String, default: '' },
  icono: { type: [Object, Function], required: true },
  colorFrom: { type: String, default: '#a855f7' },
  colorTo: { type: String, default: '#9333ea' },
  href: { type: String, default: '#' },
  delay: { type: Number, default: 0 }
})
const { prefersReduced } = usePrefersReducedMotion()

const motionTransition = computed(() =>
  prefersReduced.value ? { duration: 0.001, delay: props.delay } : { duration: 0.5, delay: props.delay, ease: 'easeOut' }
)
</script>

<template>
  <Motion
    :initial="{ opacity: 0, y: 20 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="motionTransition"
  >
      <router-link 
      :to="href"
      class="glass-card rounded-2xl p-5 card-hover text-center block min-h-30 touch-target focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
      :aria-label="`Ir a ${titulo}: ${subtitulo}`"
    >
      <div 
        class="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg"
        aria-hidden="true"
        :style="{ 
          background: `linear-gradient(135deg, ${colorFrom}, ${colorTo})`,
          boxShadow: `0 8px 20px -5px ${colorFrom}50`
        }"
      >
        <component :is="icono" class="w-5 h-5 text-white" />
      </div>
      <h4 class="font-semibold text-gray-800 text-sm leading-tight">{{ titulo }}</h4>
      <p v-if="subtitulo" class="text-xs text-gray-500 mt-1.5 line-clamp-2">{{ subtitulo }}</p>
    </router-link>
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
  box-shadow: 0 15px 30px -10px rgba(147, 51, 234, 0.2);
}

/* Touch target mínimo de 48x48px (Mobile Design skill) */
.touch-target {
  min-width: 48px;
  min-height: 48px;
}

/* Mejorar contrast ratio para WCAG AA */
.glass-card h4 {
  color: #1f2937; /* gray-800 con mejor contraste */
}
</style>
