<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight, Activity } from 'lucide-vue-next'

interface Medicion {
  date: string
  time: string
  type: string
  icon: string
  iconColor: string
  value: string
  unit: string
  status: string
  statusBadges: string
  statusDot: string
}

const props = defineProps<{
  measurements: Medicion[]
  maxItems?: number
}>()

const router = useRouter()

// Mostrar solo las últimas N mediciones (default: 5)
const medicionesRecientes = computed(() => {
  const max = props.maxItems || 5
  return props.measurements.slice(0, max)
})

const verHistorialCompleto = () => {
  router.push('/historial-controles')
}
</script>

<template>
  <div class="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden">
    <!-- Header -->
    <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <Activity class="w-5 h-5 text-orange-500" />
        <h3 class="font-bold text-lg text-gray-900 font-display">Actividad Reciente</h3>
      </div>
      <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
        {{ measurements.length }} total
      </span>
    </div>
    
    <!-- Lista de mediciones -->
    <div class="divide-y divide-gray-100">
      <div 
        v-for="(medicion, index) in medicionesRecientes" 
        :key="index"
        class="px-6 py-4 hover:bg-gray-50/50 transition-colors cursor-pointer group flex items-center gap-4"
      >
        <!-- Icono -->
        <div class="flex-shrink-0">
          <div class="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
            <iconify-icon :icon="medicion.icon" :class="medicion.iconColor" class="text-lg"></iconify-icon>
          </div>
        </div>
        
        <!-- Info principal -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-0.5">
            <span class="text-sm font-semibold text-gray-900 truncate">{{ medicion.type }}</span>
            <span :class="['px-2 py-0.5 text-[10px] font-medium rounded-full', medicion.statusBadges]">
              {{ medicion.status }}
            </span>
          </div>
          <div class="flex items-center gap-2 text-xs text-gray-500">
            <span>{{ medicion.date }}</span>
            <span class="text-gray-300">•</span>
            <span>{{ medicion.time }}</span>
          </div>
        </div>
        
        <!-- Valor -->
        <div class="flex-shrink-0 text-right">
          <div class="flex items-baseline gap-1">
            <span class="text-lg font-bold text-gray-900 font-mono">{{ medicion.value }}</span>
            <span class="text-xs text-gray-500">{{ medicion.unit }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Footer con enlace -->
    <div class="px-6 py-4 bg-gray-50/50 border-t border-gray-100">
      <button 
        @click="verHistorialCompleto"
        class="w-full flex items-center justify-center gap-2 text-sm font-medium text-orange-500 hover:text-orange-600 transition-colors group"
      >
        <span>Ver historial completo</span>
        <ArrowRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  </div>
</template>
