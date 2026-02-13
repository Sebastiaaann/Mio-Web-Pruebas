<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight, Activity } from 'lucide-vue-next'
import { useTheme } from '@/composables/useTheme'

interface Medicion {
  id: string
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
const { isMutual, colors } = useTheme()

// Mostrar solo las últimas 3-4 mediciones (default: 4)
const medicionesRecientes = computed(() => {
  const max = props.maxItems || 4
  return props.measurements.slice(0, max)
})

const verHistorialCompleto = () => {
  router.push('/historial-controles')
}

// Color del botón según el tema
const buttonColor = computed(() => isMutual.value ? colors.value.primary : '#F97316')
</script>

<template>
  <div class="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden border border-slate-200">
    <!-- Header -->
    <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
      <div class="flex items-center gap-2">
        <Activity class="w-5 h-5 text-orange-500" />
        <h3 class="font-bold text-lg text-slate-900 font-display">Actividad Reciente</h3>
      </div>
      <span class="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full font-medium">
        {{ measurements.length }} total
      </span>
    </div>
    
    <!-- Headers de tabla -->
    <div class="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-200">
      <div class="col-span-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
        Tipo
      </div>
      <div class="col-span-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
        Fecha
      </div>
      <div class="col-span-3 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">
        Valor
      </div>
      <div class="col-span-2 text-xs font-semibold text-slate-500 uppercase tracking-wide text-center">
        Estado
      </div>
    </div>
    
    <!-- Filas de datos -->
    <div class="divide-y divide-slate-100">
      <div 
        v-for="(medicion, index) in medicionesRecientes" 
        :key="medicion.id || index"
        class="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-slate-50/50 transition-colors cursor-pointer group items-center"
      >
        <!-- Columna Tipo -->
        <div class="col-span-4 flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all flex-shrink-0">
            <iconify-icon :icon="medicion.icon" :class="medicion.iconColor" class="text-lg"></iconify-icon>
          </div>
          <div class="min-w-0">
            <p class="text-sm font-semibold text-slate-900 truncate">{{ medicion.type }}</p>
          </div>
        </div>
        
        <!-- Columna Fecha -->
        <div class="col-span-3">
          <p class="text-sm text-slate-700 font-medium">{{ medicion.date }}</p>
          <p class="text-xs text-slate-400 mt-0.5">{{ medicion.time }}</p>
        </div>
        
        <!-- Columna Valor -->
        <div class="col-span-3 text-right">
          <div class="flex items-baseline justify-end gap-1">
            <span class="text-lg font-bold text-slate-900 font-mono">{{ medicion.value }}</span>
            <span class="text-xs text-slate-500">{{ medicion.unit }}</span>
          </div>
        </div>

        <!-- Columna Estado -->
        <div class="col-span-2 flex justify-center">
          <span :class="['inline-flex items-center px-2.5 py-0.5 text-[10px] font-medium rounded-full', medicion.statusBadges]">
            {{ medicion.status }}
          </span>
        </div>
      </div>
    </div>
    
    <!-- Footer con enlace -->
    <div class="px-6 py-4 bg-slate-50/50 border-t border-slate-200">
      <button 
        @click="verHistorialCompleto"
        class="w-full flex items-center justify-center gap-2 text-sm font-semibold transition-colors group"
        :style="{ color: buttonColor }"
      >
        <span>Ver historial completo</span>
        <ArrowRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  </div>
</template>
