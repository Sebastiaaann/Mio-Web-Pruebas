<script setup>
/**
 * TextStep - Componente para mensajes informativos
 * Muestra texto estático sin interacción del usuario
 * Ejemplos: Indicaciones previas, resultados, felicitaciones
 */
import { computed } from 'vue'
import { Info, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-vue-next'
import DOMPurify from 'dompurify'

const props = defineProps({
  step: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['valid'])

// Sanitizar contenido HTML para prevenir XSS
const sanitizedBody = computed(() => {
  if (!props.step.body) return ''
  return DOMPurify.sanitize(props.step.body, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'span'],
    ALLOWED_ATTR: []
  })
})

// Determinar el tipo de mensaje basado en el header
const messageType = computed(() => {
  const header = (props.step.header || '').toLowerCase()
  
  if (header.includes('indicaciones') || header.includes('instrucciones')) {
    return 'info'
  }
  if (header.includes('alterado') || header.includes('bajo') || header.includes('alto') || header.includes('alerta')) {
    return 'warning'
  }
  if (header.includes('normal') || header.includes('excelente') || header.includes('bien') || header.includes('felicitaciones')) {
    return 'success'
  }
  if (header.includes('error')) {
    return 'error'
  }
  
  return 'info'
})

// Configuración según tipo de mensaje
const messageConfig = {
  info: {
    icon: Info,
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    iconColor: 'text-blue-500',
    title: 'Información'
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-800',
    iconColor: 'text-amber-500',
    title: 'Atención'
  },
  success: {
    icon: CheckCircle,
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-800',
    iconColor: 'text-emerald-500',
    title: '¡Excelente!'
  },
  error: {
    icon: AlertCircle,
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    iconColor: 'text-red-500',
    title: 'Error'
  }
}

const config = computed(() => messageConfig[messageType.value])

// Este paso siempre es válido (no requiere input del usuario)
emit('valid', true)
</script>

<template>
  <div class="space-y-8">
    <!-- Mensaje principal -->
    <div 
      class="p-8 rounded-2xl border-2 transition-all duration-300 animate-fade-in"
      :class="[config.bg, config.border]"
    >
      <!-- Icono -->
      <div class="flex justify-center mb-6">
        <div 
          class="w-20 h-20 rounded-full flex items-center justify-center bg-white shadow-sm"
        >
          <component 
            :is="config.icon" 
            class="w-10 h-10"
            :class="config.iconColor"
          />
        </div>
      </div>

      <!-- Título -->
      <h2 
        class="font-display font-bold text-2xl text-center mb-4"
        :class="config.text"
      >
        {{ step.header || config.title }}
      </h2>

      <!-- Cuerpo del mensaje -->
      <div 
        class="text-lg text-center leading-relaxed"
        :class="config.text"
        v-html="sanitizedBody"
      />

      <!-- Información adicional si existe -->
      <div 
        v-if="step.footer"
        class="mt-6 pt-6 border-t border-current border-opacity-20 text-center text-sm"
        :class="config.text"
      >
        {{ step.footer }}
      </div>
    </div>

    <!-- Indicador de que no requiere acción -->
    <div class="text-center">
      <p class="text-sm text-gray-400">
        Presiona "Continuar" para seguir con el siguiente paso
      </p>
    </div>
  </div>
</template>

<style scoped>
.font-display {
  font-family: 'Cabinet Grotesk', sans-serif;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fadeIn 0.4s ease forwards;
}
</style>
