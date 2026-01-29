<script setup>
/**
 * CampaignCardMini - Tarjeta de campaña estilo "Más Servicios"
 * Layout vertical con icono circular en la parte superior
 */
import { Motion } from 'motion-v'
import { computed } from 'vue'
import { usePrefersReducedMotion } from '@/composables/usePrefersReducedMotion'

const { prefersReduced } = usePrefersReducedMotion()

const motionTransition = (delay = 0) =>
  prefersReduced.value ? { duration: 0.001 } : { duration: 0.5, delay, ease: 'easeOut' }
import { RouterLink } from 'vue-router'

const props = defineProps({
  titulo: {
    type: String,
    required: true
  },
  descripcion: {
    type: String,
    default: ''
  },
  imagen: {
    type: String,
    default: ''
  },
  url: {
    type: String,
    default: '#'
  },
  colorFrom: {
    type: String,
    default: '#06b6d4' // cyan-500
  },
  colorTo: {
    type: String,
    default: '#0891b2' // cyan-600
  },
  delay: {
    type: Number,
    default: 0
  }
})

const esUrlValida = computed(() => Boolean(props.url) && props.url !== '#')
const esUrlInterna = computed(() => esUrlValida.value && props.url.startsWith('/'))

const componenteRaiz = computed(() => {
  if (!esUrlValida.value) return 'div'
  return esUrlInterna.value ? RouterLink : 'a'
})

const atributosEnlace = computed(() => {
  if (!esUrlValida.value) return { 'aria-disabled': 'true' }
  if (esUrlInterna.value) return { to: props.url }
  return { href: props.url, target: '_blank', rel: 'noopener noreferrer' }
})

const clasesCard = computed(() => {
  const base = 'glass-card rounded-2xl p-5 card-hover text-center group block'
  if (!esUrlValida.value) return `${base} cursor-default opacity-80`
  return `${base} cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white`
})

// Generar colores dinámicos basados en el título (para variedad visual)
const coloresGradiente = computed(() => {
  const titulo = props.titulo.toLowerCase()
  
  // Mapear campañas a colores específicos
  if (titulo.includes('protege')) {
    return { from: '#22c55e', to: '#16a34a' } // verde
  } else if (titulo.includes('mental')) {
    return { from: '#a855f7', to: '#9333ea' } // púrpura
  } else if (titulo.includes('cardiovascular') || titulo.includes('corazón')) {
    return { from: '#f43f5e', to: '#e11d48' } // rosa/rojo
  } else if (titulo.includes('bienestar')) {
    return { from: '#3b82f6', to: '#2563eb' } // azul
  }
  
  // Por defecto: cyan (color del diseño original)
  return { from: props.colorFrom, to: props.colorTo }
})
</script>

<template>
  <Motion
    :initial="{ opacity: 0, y: 20 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="motionTransition(delay)"
  >
    <component
      :is="componenteRaiz"
      v-bind="atributosEnlace"
      :class="clasesCard"
      :aria-label="esUrlValida ? `Abrir campaña: ${titulo}` : `Campaña no disponible: ${titulo}`"
    >
      <!-- Icono Circular -->
      <div 
        class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg overflow-hidden"
        :style="{ 
          background: `linear-gradient(135deg, ${coloresGradiente.from}, ${coloresGradiente.to})`,
          boxShadow: `0 8px 20px -5px ${coloresGradiente.from}50`
        }"
      >
        <img 
          v-if="imagen" 
          :src="imagen" 
          :alt="titulo"
          width="40" height="40"
          loading="lazy" decoding="async"
          class="w-10 h-10 object-contain"
        />
        <div v-else class="text-white text-xl font-black">
          {{ titulo.charAt(0).toUpperCase() }}
        </div>
      </div>

      <!-- Contenido -->
      <div>
        <h4 class="font-semibold text-gray-800 text-sm mb-1 line-clamp-2 min-h-10">
          {{ titulo }}
        </h4>
        <p v-if="descripcion" class="text-xs text-gray-500 line-clamp-2">
          {{ descripcion }}
        </p>
      </div>
    </component>
  </Motion>
</template>

<style scoped>
.glass-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.card-hover {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-hover:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 15px 30px -10px rgba(147, 51, 234, 0.2);
}
</style>
