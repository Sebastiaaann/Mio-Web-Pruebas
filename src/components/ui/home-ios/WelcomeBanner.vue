<script setup>
/**
 * WelcomeBanner - Banner de bienvenida estilo iOS
 * Muestra saludo personalizado con CTAs principales
 */
import { computed } from 'vue'
import { Motion } from 'motion-v'
import { CalendarPlus, FileText, Stethoscope, Heart } from 'lucide-vue-next'

const props = defineProps({
  nombre: { type: String, default: 'Usuario' },
  saludo: { type: String, default: 'Buenos días' }
})

const emit = defineEmits(['nuevaCita', 'verHistorial'])
</script>

<template>
  <Motion
    :initial="{ opacity: 0, y: 30 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="{ duration: 0.6, ease: 'easeOut' }"
  >
    <div class="glass-card rounded-3xl p-10 shadow-xl shadow-black/5 overflow-hidden relative">
      <!-- Decorative gradient -->
      <div class="absolute top-0 right-0 w-72 h-72 bg-linear-to-bl from-emerald-100/60 to-transparent rounded-full blur-2xl pointer-events-none" />
      
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
            <button 
              @click="emit('nuevaCita')"
              class="shine-effect inline-flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-lg font-semibold shadow-lg shadow-black/10 hover:bg-violet-700 transition-all duration-300 hover:scale-[1.02]"
            >
              <CalendarPlus class="w-5 h-5" />
              Nueva Cita
            </button>
            <button 
              @click="emit('verHistorial')"
              class="inline-flex items-center gap-2 px-6 py-3 bg-white/90 text-gray-700 rounded-lg font-semibold border border-stone-200 hover:bg-stone-50 transition-all duration-300"
            >
              <FileText class="w-5 h-5" />
              Ver Historial
            </button>
          </div>
        </div>
        
        <!-- Decorative Icon -->
        <div class="hidden lg:block">
          <div class="relative">
            <Motion
              :animate="{ y: [0, -10, 0] }"
              :transition="{ duration: 6, repeat: Infinity, ease: 'easeInOut' }"
            >
              <div class="w-52 h-40 rounded-3xl bg-linear-to-br from-violet-100 to-emerald-100 flex items-center justify-center">
                <Stethoscope class="w-16 h-16 text-violet-600" />
              </div>
            </Motion>
            <Motion
              :animate="{ scale: [1, 1.1, 1] }"
              :transition="{ duration: 2, repeat: Infinity, ease: 'easeInOut' }"
              class="absolute -bottom-2 -right-2"
            >
              <div class="w-14 h-14 rounded-2xl bg-white shadow-lg flex items-center justify-center">
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
