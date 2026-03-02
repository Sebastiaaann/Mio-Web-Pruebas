<script setup lang="ts">
/**
 * CaminosFlotantes — Adaptación Vue de FloatingPaths (motion-v)
 * Genera 36 paths SVG animados en loop infinito
 */
import { Motion } from 'motion-v'

interface Props {
  posicion?: number
}

const props = withDefaults(defineProps<Props>(), {
  posicion: 1
})

// Generar los 36 caminos igual que el original
const caminos = Array.from({ length: 36 }, (_, i) => ({
  id: i,
  d: `M-${380 - i * 5 * props.posicion} -${189 + i * 6}C-${
    380 - i * 5 * props.posicion
  } -${189 + i * 6} -${312 - i * 5 * props.posicion} ${216 - i * 6} ${
    152 - i * 5 * props.posicion
  } ${343 - i * 6}C${616 - i * 5 * props.posicion} ${470 - i * 6} ${
    684 - i * 5 * props.posicion
  } ${875 - i * 6} ${684 - i * 5 * props.posicion} ${875 - i * 6}`,
  anchura: 0.5 + i * 0.03,
  opacidadTrazo: 0.1 + i * 0.03,
  duracion: 20 + (i % 10),
}))
</script>

<template>
  <!-- Caminos flotantes decorativos — pointer-events-none -->
  <div class="pointer-events-none absolute inset-0">
    <svg
      class="h-full w-full text-violet-300"
      fill="none"
      viewBox="0 0 696 316"
    >
      <Motion
        v-for="camino in caminos"
        :key="camino.id"
        as="path"
        :d="camino.d"
        stroke="currentColor"
        :style="{
          strokeOpacity: camino.opacidadTrazo,
          strokeWidth: camino.anchura,
        }"
        :initial="{ pathLength: 0.3, opacity: 0.6 }"
        :animate="{
          pathLength: 1,
          opacity: [0.3, 0.6, 0.3],
          pathOffset: [0, 1, 0],
        }"
        :transition="{
          duration: camino.duracion,
          repeat: Infinity,
          ease: 'linear',
        }"
      />
    </svg>
  </div>
</template>
