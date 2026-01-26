<script setup>
/**
 * HealthDashboard - Panel de salud estilo iOS
 * Muestra última medición y próximos controles
 */
import { Motion } from 'motion-v'
import { HeartPulse, Scale, ChevronRight } from 'lucide-vue-next'

const props = defineProps({
  ultimaMedicion: { 
    type: Object, 
    default: () => ({ valor: '--', unidad: 'mmHg', tipo: 'Presión Arterial', fecha: '' })
  },
  proximosControles: { 
    type: Array, 
    default: () => [] 
  }
})

const emit = defineEmits(['verTodo'])

const iconMap = {
  presion: HeartPulse,
  peso: Scale,
  default: HeartPulse
}

const iconColors = {
  presion: { bg: 'bg-red-100', text: 'text-red-500' },
  peso: { bg: 'bg-blue-100', text: 'text-blue-500' },
  default: { bg: 'bg-purple-100', text: 'text-purple-500' }
}
</script>

<template>
  <Motion
    :initial="{ opacity: 0, y: 30 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="{ duration: 0.6, delay: 0.4, ease: 'easeOut' }"
  >
    <div class="glass-card rounded-2xl p-5 h-full">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-bold text-gray-800">Mi Salud</h3>
        <button 
          @click="emit('verTodo')"
          class="text-purple-600 text-xs font-medium hover:text-purple-700"
        >
          Ver todo
        </button>
      </div>
      
      <!-- Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Last Measurement -->
        <div class="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-4 h-full">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs text-purple-600 font-medium">Última Medición</span>
            <span class="text-xs text-gray-400">{{ ultimaMedicion.fecha || 'Sin datos' }}</span>
          </div>
          <div class="flex items-end gap-4">
            <div>
              <p class="text-3xl font-bold text-gray-800">
                {{ ultimaMedicion.valor }}
                <span v-if="ultimaMedicion.valorSecundario" class="text-lg text-gray-400">/{{ ultimaMedicion.valorSecundario }}</span>
              </p>
              <p class="text-xs text-gray-500">{{ ultimaMedicion.unidad }} - {{ ultimaMedicion.tipo }}</p>
            </div>
            <div class="flex-1 h-12">
              <svg viewBox="0 0 100 40" class="w-full h-full">
                <path 
                  d="M0,30 Q10,28 20,25 T40,20 T60,22 T80,18 T100,15" 
                  fill="none" 
                  stroke="url(#gradient)" 
                  stroke-width="2" 
                  stroke-linecap="round"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#a855f7"/>
                    <stop offset="100%" stop-color="#7c3aed"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>

        <!-- Upcoming Controls -->
        <div>
          <p class="text-xs text-gray-500 font-medium mb-3">Próximos Controles</p>
          <div class="space-y-2">
            <router-link 
              v-for="control in proximosControles.slice(0, 2)"
              :key="control.id"
              :to="control.href || '/controles'"
              class="flex items-center gap-3 p-3 bg-white/60 rounded-xl hover:bg-white/80 transition-colors"
            >
              <div 
                class="w-10 h-10 rounded-xl flex items-center justify-center"
                :class="iconColors[control.tipo]?.bg || iconColors.default.bg"
              >
                <component 
                  :is="iconMap[control.tipo] || iconMap.default" 
                  class="w-5 h-5"
                  :class="iconColors[control.tipo]?.text || iconColors.default.text"
                />
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-800">{{ control.titulo }}</p>
                <p class="text-xs text-gray-400">{{ control.fecha }}</p>
              </div>
              <ChevronRight class="w-4 h-4 text-gray-400" />
            </router-link>
            
            <!-- Empty state -->
            <div v-if="proximosControles.length === 0" class="text-center py-4">
              <p class="text-sm text-gray-400">No hay controles programados</p>
            </div>
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
</style>
