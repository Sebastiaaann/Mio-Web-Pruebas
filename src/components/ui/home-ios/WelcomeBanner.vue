<script setup>
/**
 * WelcomeBanner - Banner de bienvenida estilo iOS
 * Muestra saludo personalizado con CTAs principales
 */
import { Motion } from 'motion-v'
import { CalendarPlus, FileText, Stethoscope, Heart } from 'lucide-vue-next'
import { usePrefersReducedMotion } from '@/composables/usePrefersReducedMotion'
import { computed } from 'vue'

const { prefersReduced } = usePrefersReducedMotion()

const mainTransition = computed(() =>
  prefersReduced.value ? { duration: 0.001 } : { duration: 0.6, ease: 'easeOut' }
)

const floatTransition = (duration = 6) =>
  prefersReduced.value ? { duration: 0.001, repeat: 0 } : { duration, repeat: Infinity, ease: 'easeInOut' }

const pulseTransition = (duration = 2) =>
  prefersReduced.value ? { duration: 0.001, repeat: 0 } : { duration, repeat: Infinity, ease: 'easeInOut' }

const props = defineProps({
  nombre: { type: String, default: 'Usuario' },
  saludo: { type: String, default: 'Buenos días' },
  toNuevaCita: { type: String, default: '/citas' },
  toVerHistorial: { type: String, default: '/controles' }
})

const emit = defineEmits(['nuevaCita', 'verHistorial'])
</script>

<template>
  <Motion
    :initial="{ opacity: 0, y: 30 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="mainTransition"
  >
    <div class="glass-card rounded-3xl p-10 shadow-xl shadow-black/5 overflow-hidden relative">
      <!-- Decorative gradient -->
      <div class="absolute top-0 right-0 w-72 h-72 bg-linear-to-bl from-emerald-100/60 to-transparent rounded-full blur-2xl pointer-events-none" aria-hidden="true" />
      
      <div class="relative flex items-center justify-between">
        <div class="flex-1">
          <!-- Greeting -->
          <div class="flex items-center gap-2 mb-2">
            <span class="text-2xl">👋</span>
            <p class="text-emerald-600 font-medium text-sm">{{ saludo }}</p>
          </div>
          
          <!-- Name -->
          <h2 class="text-3xl font-bold text-gray-900 mb-2">
            Bienvenido, <span class="text-violet-600">{{ nombre }}</span>
          </h2>
          
          <p class="text-gray-600 max-w-xl">
            Tu bienestar es nuestra prioridad. Accede a todos tus servicios de salud desde un solo lugar.
          </p>
          
          <!-- CTAs -->
          <div class="flex items-center gap-4 mt-6">
            <RouterLink
              :to="toNuevaCita"
              class="shine-effect inline-flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-lg font-semibold shadow-lg shadow-black/10 hover:bg-violet-700 transition-colors transition-transform duration-300 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              @click="emit('nuevaCita')"
            >
              <CalendarPlus class="w-5 h-5" />
              Nueva Cita
            </RouterLink>
            <RouterLink
              :to="toVerHistorial"
              class="inline-flex items-center gap-2 px-6 py-3 bg-white/90 text-gray-700 rounded-lg font-semibold border border-stone-200 hover:bg-stone-50 transition-colors transition-transform duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              @click="emit('verHistorial')"
            >
              <FileText class="w-5 h-5" />
              Ver Historial
            </RouterLink>
          </div>
        </div>
        
        <!-- Decorative Icon -->
        <div class="hidden lg:block">
          <div class="relative">
            <Motion
              :animate="{ y: [0, -10, 0] }"
              :transition="floatTransition(6)"
            >
              <div class="w-52 h-40 rounded-3xl bg-linear-to-br from-violet-100 to-emerald-100 flex items-center justify-center" aria-hidden="true">
                <Stethoscope class="w-16 h-16 text-violet-600" />
              </div>
            </Motion>
            <Motion
              :animate="{ scale: [1, 1.1, 1] }"
              :transition="pulseTransition(2)"
              class="absolute -bottom-2 -right-2"
            >
              <div class="w-14 h-14 rounded-2xl bg-white shadow-lg flex items-center justify-center" aria-hidden="true">
                <Heart class="w-6 h-6 text-rose-500" />
              </div>
            </Motion>
          </div>
        </div>
      </div>
    </div>
  </Motion>
</template>

<style scoped>
.glass-card {
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border: 1px solid rgba(226, 232, 240, 0.8);
}

.shine-effect {
  position: relative;
  overflow: hidden;
}

.shine-effect::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  transition: left 0.5s ease;
}

.shine-effect:hover::before {
  left: 100%;
}
</style>
