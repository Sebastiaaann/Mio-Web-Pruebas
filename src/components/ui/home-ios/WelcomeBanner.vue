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
    <div class="glass-card rounded-3xl p-8 shadow-xl shadow-purple-100/30 overflow-hidden relative">
      <!-- Decorative gradient -->
      <div class="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-purple-200/40 to-transparent rounded-full blur-2xl pointer-events-none" />
      
      <div class="relative flex items-center justify-between">
        <div class="flex-1">
         
          
          <!-- Name -->
          <h2 class="text-3xl text-gray-800 mb-2" style="font-weight: 425;">
            Bienvenido, <span class="gradient-text font-bold">{{ nombre }}</span>
          </h2>
          
          <p class="text-gray-500 max-w-lg">
            Tu bienestar es nuestra prioridad. Accede a todos tus servicios de salud desde un solo lugar.
          </p>
          
          <!-- CTAs -->
          <div class="flex items-center gap-4 mt-6">
            <button 
              @click="emit('nuevaCita')"
              class="shine-effect inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl font-medium shadow-lg shadow-purple-300/40 hover:shadow-purple-400/50 transition-all duration-300 hover:scale-105"
            >
              <CalendarPlus class="w-5 h-5" />
              Nueva Cita
            </button>
            <button 
              @click="emit('verHistorial')"
              class="inline-flex items-center gap-2 px-6 py-3 bg-white/80 text-purple-600 rounded-xl font-medium border border-purple-200 hover:bg-purple-50 transition-all duration-300"
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
              <div class="w-48 h-48 rounded-3xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                <Stethoscope class="w-20 h-20 text-purple-500" />
              </div>
            </Motion>
            <Motion
              :animate="{ scale: [1, 1.1, 1] }"
              :transition="{ duration: 2, repeat: Infinity, ease: 'easeInOut' }"
              class="absolute -bottom-2 -right-2"
            >
              <div class="w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center">
                <Heart class="w-7 h-7 text-red-400" />
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
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.gradient-text {
  background: linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #c084fc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
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
