<script setup>
/**
 * QuickServiceCard - Card de servicio principal estilo iOS
 * Para los 4 servicios principales del grid
 */
import { Motion } from 'motion-v'
import { computed } from 'vue'
import ClipButton from '@/components/ui/ClipButton.vue'
import { Bell } from 'lucide-vue-next'
import { usePrefersReducedMotion } from '@/composables/usePrefersReducedMotion'

const props = defineProps({
  titulo: { type: String, required: true },
  descripcion: { type: String, default: '' },
  icono: { type: [Object, Function], required: true },
  colorFrom: { type: String, default: '#a855f7' },
  colorTo: { type: String, default: '#9333ea' },
  badge: { type: String, default: '' },
  badgeColor: { type: String, default: 'green' },
  disponible: { type: Boolean, default: false },
  href: { type: String, default: '#' },
  delay: { type: Number, default: 0 },
  imagen: { type: String, default: '' }, // Nueva prop para imagen 3D
  destacado: { type: Boolean, default: false } // Nueva prop para estilo destacado
})

const badgeClasses = {
  green: 'bg-green-100 text-green-600',
  blue: 'bg-blue-100 text-blue-600',
  pink: 'bg-pink-100 text-pink-600',
  emerald: 'bg-emerald-100 text-emerald-600'
}
const { prefersReduced } = usePrefersReducedMotion()

const motionTransition = computed(() =>
  prefersReduced.value ? { duration: 0.001, delay: props.delay } : { duration: 0.4, delay: props.delay, ease: 'easeOut' }
)
</script>

<template>
  <Motion
    :initial="{ opacity: 0, scale: 0.9 }"
    :animate="{ opacity: 1, scale: 1 }"
    :transition="motionTransition"
    class="h-full"
    :class="{ 'col-span-2': destacado }" 
  >
    <router-link 
      :to="href"
      class="glass-card rounded-2xl p-6 card-hover block h-full relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
      :class="{ 'api-destacada': destacado }"
    >
      <div class="relative z-10 flex flex-col h-full" :class="{ 'max-w-[60%]': destacado }">
            <!-- Botón de acción rápido (ClipButton) -->
            <div class="absolute top-4 right-4 z-20">
              <ClipButton
                bg-class="bg-orange-100"
                color-class="bg-orange-500"
                text-class="text-orange-500"
                @success="() => console.log('Acción completada:', titulo)"
              >
                <template #baseIcon><Bell :size="18" :stroke-width="2.2" /></template>
                <template #filledIcon><Bell :size="18" :stroke-width="2.2" fill="currentColor" /></template>
                <template #successIcon><Bell :size="18" :stroke-width="2.2" /></template>
              </ClipButton>
            </div>
        <!-- Icon or Image -->
        <div v-if="!imagen"
          class="icon-container w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
          :style="{ 
            background: `linear-gradient(135deg, ${colorFrom}, ${colorTo})`,
            boxShadow: `0 10px 25px -5px ${colorFrom}66`
          }"
        >
          <component :is="icono" class="w-6 h-6 text-white" />
        </div>
        
        <!-- Content -->
        <h4 class="font-semibold text-gray-800 mb-1" :class="{ 'text-lg': destacado }">{{ titulo }}</h4>
        <p class="text-xs text-gray-500 mb-3" :class="{ 'text-sm': destacado }">{{ descripcion }}</p>
        
        <!-- Status/Badge -->
        <div class="mt-auto">
          <div v-if="disponible" class="flex items-center gap-2">
            <span class="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span class="text-xs text-green-600 font-medium">Disponible ahora</span>
          </div>
          <div v-else-if="badge" class="flex items-center gap-1">
            <span 
              class="px-2 py-0.5 text-xs rounded-full"
              :class="badgeClasses[badgeColor]"
            >
              {{ badge }}
            </span>
          </div>
        </div>
      </div>

      <!-- 3D Image (Absolute positioned for Highlight) -->
      <div v-if="destacado && imagen" class="absolute -right-4 -bottom-4 w-40 h-40 animate-float-slow" aria-hidden="true">
        <img :src="imagen" :alt="titulo" width="160" height="160" loading="lazy" decoding="async" class="w-full h-full object-contain drop-shadow-xl" />
      </div>
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

.api-destacada {
  background: linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(240,240,255,0.9) 100%);
  border: 1px solid rgba(168, 85, 247, 0.2);
}

.card-hover {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-hover:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 20px 40px -15px rgba(147, 51, 234, 0.25);
}

.icon-container {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-hover:hover .icon-container {
  transform: scale(1.1) rotate(-5deg);
}

@keyframes float-slow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.animate-float-slow {
  animation: float-slow 4s ease-in-out infinite;
}
</style>
