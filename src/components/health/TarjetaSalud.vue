<script setup>
/**
 * HealthCard - Tarjeta reutilizable para métricas de salud
 * Usado en el Dashboard para mostrar controles programados
 * Migrado a Lucide icons
 */
import { computed } from 'vue'
import { Motion } from 'motion-v'
import IconoEstado from '@/components/ui/IconoEstado.vue'
import { 
  Heart, 
  Activity, 
  Droplets, 
  Calendar,
  Scale,
  Thermometer,
  Stethoscope
} from 'lucide-vue-next'

const { 
  titulo = 'Control',
  descripcion = '',
  fecha = null,
  icono = 'pi pi-heart', // legacy, now we'll use a mapping
  color = '#7B61FF',
  estado = 'pendiente',
  clickable = true,
  variant = 'default'
} = defineProps([
  'titulo',
  'descripcion',
  'fecha',
  'icono',
  'color',
  'estado',
  'clickable',
  'variant' // 'default' | 'minimal'
])

const emit = defineEmits(['click'])

// Map old PrimeIcons to Lucide components
const iconMap = {
  'pi pi-heart': Heart,
  'pi pi-chart-line': Activity,
  'pi pi-bolt': Droplets,
  'default': Stethoscope
}

const IconComponent = computed(() => {
  return iconMap[icono] || iconMap['default']
})

const fechaFormateada = computed(() => {
  if (!fecha) return null
  const date = new Date(fecha)
  return date.toLocaleDateString('es-CL', { 
    day: 'numeric', 
    month: 'short' 
  })
})

const containerClasses = computed(() => [
  'health-card',
  'neu-card',
  'relative overflow-hidden rounded-2xl p-5',
  'bg-card border border-border',
  // Removed custom transition classes because Motion handles it
  clickable ? 'cursor-pointer' : ''
])

// Accessibility: descriptive label for screen readers
const ariaLabel = computed(() => {
  let label = titulo
  if (fechaFormateada.value) {
    label += `, programado para ${fechaFormateada.value}`
  }
  if (estado) {
    label += `, estado: ${estado}`
  }
  return label
})

function handleClick() {
  if (clickable) {
    emit('click')
  }
}
</script>

<template>
  <Motion 
    is="article"
    :class="containerClasses"
    :aria-label="ariaLabel"
    @click="handleClick"
    role="button"
    :tabindex="clickable ? 0 : -1"
    @keydown.enter="handleClick"
    @keydown.space.prevent="handleClick"
    :whileHover="clickable ? { y: -4, boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)' } : {}"
    :whileTap="clickable ? { scale: 0.98 } : {}"
    :transition="{ type: 'spring', stiffness: 400, damping: 17 }"
  >
    <!-- Variant: Default (Dashboard Style) -->
    <template v-if="variant === 'default'">
      <!-- Icono decorativo de fondo -->
      <div 
        class="absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10"
        :style="{ backgroundColor: color }"
        aria-hidden="true"
      />
      
      <!-- Header con icono -->
      <div class="flex items-start justify-between mb-3 relative z-10">
        <div 
          class="w-12 h-12 rounded-xl flex items-center justify-center"
          :style="{ backgroundColor: `${color}15` }"
        >
          <component 
            :is="IconComponent" 
            class="h-6 w-6"
            :style="{ color: color }"
            aria-hidden="true"
          />
        </div>
        
        <IconoEstado :status="estado" size="sm" />
      </div>
      
      <!-- Contenido -->
      <div class="relative z-10">
        <h3 class="text-lg font-bold text-card-foreground mb-1">
          {{ titulo }}
        </h3>
        <p v-if="descripcion" class="text-sm text-muted-foreground mb-3 line-clamp-2 text-pretty">
          {{ descripcion }}
        </p>
        
        <!-- Fecha programada -->
        <div v-if="fechaFormateada" class="flex items-center text-sm text-muted-foreground">
          <Calendar class="h-3 w-3 mr-2" />
          <span>{{ fechaFormateada }}</span>
        </div>
      </div>
    </template>

    <!-- Variant: Minimal (Light Button Style) -->
    <template v-else-if="variant === 'minimal'">
       <div class="flex flex-col items-center justify-center text-center h-full w-full py-2">
          
          <!-- Estado (Absolute Top Right) -->
          <div class="absolute top-4 right-4">
              <div v-if="estado === 'pendiente'" class="w-2 h-2 rounded-full bg-orange-400"></div>
              <div v-else-if="estado === 'vencido'" class="w-2 h-2 rounded-full bg-red-500"></div>
          </div>

          <!-- Icon (Soft Bubble) -->
          <div 
            class="w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300"
            :style="{ backgroundColor: `${color}10` }"
          >
             <component 
              :is="IconComponent" 
              class="h-7 w-7"
              :style="{ color: color }"
              stroke-width="2.5"
            />
          </div>

          <!-- Title -->
          <h3 class="text-lg font-bold text-gray-900 mb-4 tracking-tight">
            {{ titulo }}
          </h3>

          <!-- Pill Button (Visual Only, card is clicked) -->
          <div class="px-6 py-2 rounded-full bg-white border border-gray-200 shadow-sm text-sm font-semibold text-gray-700 group-hover:bg-gray-50 group-hover:border-gray-300 transition-all">
             Registrar
          </div>
       </div>
    </template>
  </Motion>
</template>

<style scoped>
.health-card {
  min-width: 200px;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
