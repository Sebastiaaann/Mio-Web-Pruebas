<script>
/**
 * StatusIcon - Indicador visual de estado
 * Muestra diferentes iconos y colores según el estado
 * Migrado a Lucide icons
 * 
 * OPTIMIZACIÓN: statusConfig definido fuera del setup 
 * para compartir entre todas las instancias del componente
 */
import { computed } from 'vue'
import { 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Minus, 
  Check 
} from 'lucide-vue-next'

// Constante estática compartida entre todas las instancias
const STATUS_CONFIG = Object.freeze({
  pendiente: {
    icon: Clock,
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-600',
    label: 'Pendiente'
  },
  completado: {
    icon: CheckCircle,
    bgColor: 'bg-green-100',
    textColor: 'text-green-600',
    label: 'Completado'
  },
  alerta: {
    icon: AlertTriangle,
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-600',
    label: 'Alerta'
  },
  critico: {
    icon: XCircle,
    bgColor: 'bg-red-100',
    textColor: 'text-red-600',
    label: 'Crítico'
  },
  na: {
    icon: Minus,
    bgColor: 'bg-muted',
    textColor: 'text-muted-foreground',
    label: 'N/A'
  },
  normal: {
    icon: Check,
    bgColor: 'bg-emerald-100',
    textColor: 'text-emerald-600',
    label: 'Normal'
  }
})
</script>

<script setup>
import { computed } from 'vue'

const { 
  status = 'na', // 'pendiente' | 'completado' | 'alerta' | 'critico' | 'na'
  size = 'md' // 'sm' | 'md' | 'lg'
} = defineProps(['status', 'size'])

const config = computed(() => STATUS_CONFIG[status] || STATUS_CONFIG.na)

const sizeClasses = computed(() => {
  switch (size) {
    case 'sm':
      return { container: 'w-6 h-6', icon: 'h-3 w-3' }
    case 'lg':
      return { container: 'w-10 h-10', icon: 'h-5 w-5' }
    default:
      return { container: 'w-8 h-8', icon: 'h-4 w-4' }
  }
})
</script>

<template>
  <div 
    :class="[
      'inline-flex items-center justify-center rounded-full',
      config.bgColor,
      config.textColor,
      sizeClasses.container
    ]"
    :title="config.label"
    role="status"
    :aria-label="`Estado: ${config.label}`"
  >
    <component :is="config.icon" :class="sizeClasses.icon" />
  </div>
</template>
