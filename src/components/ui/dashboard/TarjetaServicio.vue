<script setup>
/**
 * TarjetaServicio - Card compacta para servicios digitales
 * CHATBOT, MATERIAL AUDIOVISUAL, TELECONSULTA, etc.
 */
import { cn } from '@/lib/utils'

const props = defineProps({
  titulo: { type: String, required: true },
  descripcion: { type: String, default: '' },
  icono: { type: [Object, Function], required: true },
  href: { type: String, default: '#' },
  colorFondo: { type: String, default: '#0D9488' }, // Teal por defecto
  variante: { type: String, default: 'gradiente' }, // 'gradiente' | 'solido'
  class: { type: String, default: '' }
})

const estiloFondo = () => {
  if (props.variante === 'solido') {
    return { backgroundColor: props.colorFondo }
  }
  return { 
    background: `linear-gradient(135deg, ${props.colorFondo} 0%, ${ajustarColor(props.colorFondo, -15)} 100%)`
  }
}

function ajustarColor(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = Math.max(0, Math.min(255, (num >> 16) + amt))
  const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amt))
  const B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt))
  return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`
}
</script>

<template>
  <router-link 
    :to="href"
    :class="cn(
      'group block rounded-xl p-4 min-h-[100px]',
      'transition-all duration-300 hover:scale-[1.02] hover:shadow-lg',
      'cursor-pointer',
      props.class
    )"
    :style="estiloFondo()"
  >
    <!-- Icono -->
    <div class="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center mb-3">
      <component :is="icono" class="w-5 h-5 text-white" />
    </div>

    <!-- Contenido -->
    <h3 class="text-white font-semibold text-sm mb-1">
      {{ titulo }}
    </h3>
    <p v-if="descripcion" class="text-white/80 text-xs leading-relaxed line-clamp-2">
      {{ descripcion }}
    </p>
  </router-link>
</template>
