<script setup>
/**
 * OperativosCard - Card de operativos próximos estilo iOS
 */
import { Motion } from 'motion-v'
import { CalendarCheck, ArrowRight } from 'lucide-vue-next'
import { usePrefersReducedMotion } from '@/composables/usePrefersReducedMotion'
import { computed } from 'vue'

const { prefersReduced } = usePrefersReducedMotion()

const motionTransition = computed(() =>
  prefersReduced.value ? { duration: 0.001 } : { duration: 0.6, delay: 0.6, ease: 'easeOut' }
)

const props = defineProps({
  operativos: { type: Array, default: () => [] },
  toVerCalendario: { type: String, default: '/citas' }
})

// Formatear mes corto
const formatMes = (fecha) => {
  if (!fecha) return 'ENE'
  const meses = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC']
  const date = new Date(fecha)
  return meses[date.getMonth()] || 'ENE'
}

const formatDia = (fecha) => {
  if (!fecha) return '--'
  const date = new Date(fecha)
  return date.getDate().toString().padStart(2, '0')
}
</script>

<template>
  <Motion
    :initial="{ opacity: 0, y: 30 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="motionTransition"
  >
    <div class="glass-card rounded-2xl p-6">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
            <CalendarCheck class="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 class="font-bold text-gray-800">Operativos por Realizar</h3>
            <p class="text-xs text-gray-500">Próximos procedimientos programados</p>
          </div>
        </div>
        <RouterLink
          :to="toVerCalendario"
          class="text-purple-600 text-sm font-medium hover:text-purple-700 flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded-md"
        >
          Ver calendario
          <ArrowRight class="w-4 h-4" />
        </RouterLink>
      </div>
      
      <!-- Operativo Item -->
      <div 
        v-for="operativo in operativos.slice(0, 1)"
        :key="operativo.id"
        class="bg-gradient-to-r from-purple-50 to-white rounded-xl p-4 border border-purple-100"
      >
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-xl bg-white shadow-md flex flex-col items-center justify-center">
            <span class="text-xs text-purple-500 font-medium">{{ formatMes(operativo.fecha) }}</span>
            <span class="text-xl font-bold text-gray-800">{{ formatDia(operativo.fecha) }}</span>
          </div>
          <div class="flex-1">
            <p class="font-semibold text-gray-800">{{ operativo.titulo }}</p>
            <p class="text-sm text-gray-500">{{ operativo.descripcion }}</p>
          </div>
          <span class="px-3 py-1 bg-purple-100 text-purple-600 text-xs font-medium rounded-full">
            {{ operativo.estado || 'Pendiente' }}
          </span>
        </div>
      </div>
      
      <!-- Empty state -->
      <div v-if="operativos.length === 0" class="text-center py-6">
        <p class="text-gray-400">No hay operativos programados</p>
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
