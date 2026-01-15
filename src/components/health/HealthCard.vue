<script setup>
/**
 * HealthCard - Tarjeta reutilizable para métricas de salud
 * Usado en el Dashboard para mostrar controles programados
 * Migrado a Lucide icons
 */
import { computed } from 'vue'
import StatusIcon from '@/components/ui/StatusIcon.vue'
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
  clickable = true
} = defineProps([
  'titulo',
  'descripcion',
  'fecha',
  'icono',
  'color',
  'estado',
  'clickable'
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
  'transition-all duration-200 ease-out',
  clickable ? 'cursor-pointer hover:border-primary/30' : ''
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
  <article 
    :class="containerClasses"
    :aria-label="ariaLabel"
    @click="handleClick"
    role="button"
    :tabindex="clickable ? 0 : -1"
    @keydown.enter="handleClick"
    @keydown.space.prevent="handleClick"
  >
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
      
      <StatusIcon :status="estado" size="sm" />
    </div>
    
    <!-- Contenido -->
    <div class="relative z-10">
      <h3 class="text-lg font-bold text-card-foreground mb-1">
        {{ titulo }}
      </h3>
      <p v-if="descripcion" class="text-sm text-muted-foreground mb-3 line-clamp-2">
        {{ descripcion }}
      </p>
      
      <!-- Fecha programada -->
      <div v-if="fechaFormateada" class="flex items-center text-sm text-muted-foreground">
        <Calendar class="h-3 w-3 mr-2" />
        <span>{{ fechaFormateada }}</span>
      </div>
    </div>
  </article>
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
