<template>
  <div
    class="relative w-14 h-14 rounded-full overflow-hidden cursor-pointer select-none touch-none tap-highlight-transparent"
    @mousedown="startHold"
    @mouseup="endHold"
    @mouseleave="endHold"
    @touchstart.prevent="startHold"
    @touchend="endHold"
  >
    <div :class="cn('absolute inset-0 flex items-center justify-center transition-colors', bgClass)">
      <div :class="cn('transition-all duration-300', textClass, status === 'holding' ? 'scale-90 opacity-0' : 'scale-100 opacity-100')">
        <Transition name="fade" mode="out-in">
          <slot v-if="status === 'success'" name="successIcon" />
          <slot v-else name="baseIcon" />
        </Transition>
      </div>
    </div>

    <div
      :class="cn('absolute inset-0 flex items-center justify-center text-white', colorClass)"
      :style="overlayStyle"
      @transitionend="onTransitionEnd"
    >
      <Transition name="bounce" mode="wait">
        <div v-if="status === 'success'" key="success">
          <slot name="successIcon" />
        </div>

        <div v-else key="filling" class="scale-100">
          <slot name="filledIcon" />
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

// Props y eventos (documentación en español según pautas del proyecto)
const props = defineProps({
  bgClass: { type: String, default: '' },
  colorClass: { type: String, default: '' },
  textClass: { type: String, default: '' },
  loading: { type: Boolean, default: false }
})
const emit = defineEmits(['success', 'click'])

// Estados: 'idle' | 'holding' | 'success'
const status = ref('idle')

// Manejadores de interacción táctil/ratón
const startHold = () => {
  if (status.value === 'success') return
  status.value = 'holding'
}
const endHold = () => {
  if (status.value === 'success') return
  status.value = 'idle'
}

// Detectar cuando termina la transición CSS
const onTransitionEnd = (e) => {
  if (e.propertyName === 'clip-path' && status.value === 'holding') {
    status.value = 'success'
    emit('success')
  }
}

// Reset automático después del éxito
watch(status, (newVal) => {
  if (newVal === 'success' && !props.loading) {
    setTimeout(() => {
      status.value = 'idle'
    }, 1600)
  }
})

// Unión simple de clases (evita dependencia externa)
function cn(...inputs) {
  return inputs.filter(Boolean).join(' ')
}

// Estilos dinámicos para el efecto de "llenado"
const overlayStyle = computed(() => {
  const isFilling = status.value === 'holding' || status.value === 'success'
  return {
    clipPath: isFilling ? 'inset(0% 0 0 0)' : 'inset(100% 0 0 0)',
    transition: isFilling ? 'clip-path 1.5s ease-in-out' : 'clip-path 0.2s ease-out'
  }
})
</script>

<style scoped>
/* Animaciones para la entrada/salida del icono */
.bounce-enter-active { animation: bounce-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.bounce-leave-active { transition: opacity 0.2s ease; }
.bounce-enter-from, .bounce-leave-to { opacity: 0; transform: scale(0.5); }

@keyframes bounce-in {
  0% { opacity: 0; transform: scale(0.5); }
  50% { opacity: 1; transform: scale(1.1); }
  100% { transform: scale(1); }
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.tap-highlight-transparent { -webkit-tap-highlight-color: transparent; }
</style>
