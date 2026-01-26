<script setup>
/**
 * MiniServiceCard - Card pequeña para servicios adicionales
 * Layout de 6 cards en grid
 */
import { Motion } from 'motion-v'

const props = defineProps({
  titulo: { type: String, required: true },
  subtitulo: { type: String, default: '' },
  icono: { type: [Object, Function], required: true },
  colorFrom: { type: String, default: '#a855f7' },
  colorTo: { type: String, default: '#9333ea' },
  href: { type: String, default: '#' },
  delay: { type: Number, default: 0 }
})
</script>

<template>
  <Motion
    :initial="{ opacity: 0, y: 20 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="{ duration: 0.5, delay: delay, ease: 'easeOut' }"
  >
    <router-link 
      :to="href"
      class="glass-card rounded-2xl p-4 card-hover text-center block"
    >
      <div 
        class="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg"
        :style="{ 
          background: `linear-gradient(135deg, ${colorFrom}, ${colorTo})`,
          boxShadow: `0 8px 20px -5px ${colorFrom}50`
        }"
      >
        <component :is="icono" class="w-5 h-5 text-white" />
      </div>
      <h4 class="font-medium text-gray-800 text-sm">{{ titulo }}</h4>
      <p v-if="subtitulo" class="text-xs text-gray-400 mt-1">{{ subtitulo }}</p>
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
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-hover:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 15px 30px -10px rgba(147, 51, 234, 0.2);
}
</style>
