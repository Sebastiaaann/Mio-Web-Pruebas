<script setup>
import { ref, computed, watch } from 'vue'
import { Loader2 } from 'lucide-vue-next'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Utilidad para unir clases
function cn(...inputs) {
  return twMerge(clsx(inputs))
}

const props = defineProps({
  bgClass: { type: String, default: '' },    // Color fondo inactivo
  colorClass: { type: String, default: '' }, // Color fondo activo (llenado)
  textClass: { type: String, default: '' },  // Color icono/texto base
  bgStyle: { type: Object, default: () => ({}) }, // Estilo inline fondo inactivo
  colorStyle: { type: Object, default: () => ({}) }, // Estilo inline fondo activo
  loading: { type: Boolean, default: false }, // Estado de carga externo
  class: { type: String, default: '' },      // Clases contenedor (tamaño, forma)
  holdDuration: { type: Number, default: 1500 } // Duración del hold en ms
})

const emit = defineEmits(['success', 'click', 'hold-start', 'hold-end'])

// Estados: 'idle' | 'holding' | 'success'
const status = ref('idle')

// Manejadores de eventos
const startHold = () => {
  if (status.value === 'success') return
  status.value = 'holding'
  emit('hold-start')
}

const endHold = (e) => {
  if (status.value === 'success') return
  status.value = 'idle'
  emit('hold-end')
  // Emitir click para comportamiento estándar si no se completó el hold
  if (status.value !== 'success') {
    emit('click', e)
  }
}

// Detectar cuando termina la transición CSS
const onTransitionEnd = (e) => {
  if (e.propertyName === 'clip-path' && status.value === 'holding') {
    status.value = 'success'
    emit('success')
  }
}

// Resetear automáticamente después del éxito
watch(status, (newVal) => {
  if (newVal === 'success' && !props.loading) {
    setTimeout(() => {
      status.value = 'idle'
    }, 2000)
  }
})

// Estilos dinámicos para la animación del "líquido"
const overlayStyle = computed(() => {
  const isFilling = status.value === 'holding' || status.value === 'success'
  return {
    // Fill from bottom up
    clipPath: isFilling ? 'inset(0% 0 0 0)' : 'inset(100% 0 0 0)',
    transition: isFilling ? `clip-path ${props.holdDuration}ms ease-in-out` : 'clip-path 0.2s ease-out'
  }
})
</script>

<template>
  <div 
    :class="cn('relative overflow-hidden cursor-pointer select-none touch-none tap-highlight-transparent', props.class)"
    @mousedown="startHold"
    @mouseup="endHold"
    @mouseleave="endHold"
    @touchstart.prevent="startHold"
    @touchend="endHold"
  >
    <!-- Background / Inactive State -->
    <div 
      :class="cn('absolute inset-0 flex items-center justify-center transition-colors', props.bgClass)"
      :style="props.bgStyle"
    >
      <div 
        :class="cn('transition-all duration-300 flex items-center justify-center w-full h-full', props.textClass, status === 'holding' ? 'scale-90 opacity-80' : 'scale-100 opacity-100')"
      >
        <Transition name="fade" mode="out-in">
           <slot v-if="status === 'success'" name="successIcon" />
           <slot v-else name="baseIcon" />
        </Transition>
      </div>
    </div>

    <!-- Foreground / Active Filling State -->
    <div 
      :class="cn('absolute inset-0 flex items-center justify-center text-white', props.colorClass)"
      :style="{ ...overlayStyle, ...props.colorStyle }"
      @transitionend="onTransitionEnd"
    >
      <Transition name="bounce" mode="wait">
        <div v-if="status === 'success'" key="success" class="flex items-center justify-center w-full h-full">
           <Loader2 v-if="loading" class="w-6 h-6 animate-spin" />
           <slot v-else name="successIcon" />
        </div>
        
        <div v-else key="filling" class="scale-100 flex items-center justify-center w-full h-full">
           <slot name="filledIcon" />
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.bounce-enter-active {
  animation: bounce-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.bounce-leave-active {
  transition: opacity 0.2s ease;
}
.bounce-enter-from, .bounce-leave-to {
  opacity: 0;
  transform: scale(0.5);
}

@keyframes bounce-in {
  0% { opacity: 0; transform: scale(0.5); }
  50% { opacity: 1; transform: scale(1.1); }
  100% { transform: scale(1); }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.tap-highlight-transparent {
  -webkit-tap-highlight-color: transparent;
}
</style>
