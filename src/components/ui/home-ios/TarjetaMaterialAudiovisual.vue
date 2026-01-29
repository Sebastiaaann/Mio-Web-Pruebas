<script setup>
/**
 * TarjetaMaterialAudiovisual - Card para material audiovisual
 * Diseño limpio y moderno, con imagen y CTA
 */
import { computed } from 'vue'
import { Motion } from 'motion-v'
import { usePrefersReducedMotion } from '@/composables/usePrefersReducedMotion'
import { PlayCircle } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'

const props = defineProps({
  titulo: { type: String, required: true },
  descripcion: { type: String, default: '' },
  imagen: { type: String, default: '' },
  url: { type: String, default: '#' },
  categoria: { type: String, default: '' },
  delay: { type: Number, default: 0 }
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
  const base =
    'card-audiovisual rounded-2xl overflow-hidden bg-white border border-stone-200 shadow-sm hover:shadow-md transition-transform transition-shadow transition-colors group block'

  if (!esUrlValida.value) return `${base} cursor-default opacity-80`

  return `${base} cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white`
})

const { prefersReduced } = usePrefersReducedMotion()

const motionTransition = computed(() =>
  prefersReduced.value ? { duration: 0.001, delay: props.delay } : { duration: 0.4, delay: props.delay, ease: 'easeOut' }
)
</script>

<template>
  <Motion
    :initial="{ opacity: 0, y: 16 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="motionTransition"
  >
    <component
      :is="componenteRaiz"
      v-bind="atributosEnlace"
      :class="clasesCard"
      :aria-label="esUrlValida ? `Abrir material: ${titulo}` : `Material no disponible: ${titulo}`"
    >
      <div class="relative aspect-video bg-stone-100">
        <img
          v-if="imagen"
          :src="imagen"
          :alt="titulo"
          class="w-full h-full object-cover"
          width="1280" height="720"
          loading="lazy"
          decoding="async"
        />
        <div v-else class="w-full h-full flex items-center justify-center text-stone-400 text-sm">
          Vista previa no disponible
        </div>
        <div class="absolute inset-0 bg-linear-to-t from-black/30 to-transparent" />
        <div class="absolute bottom-3 left-3 inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/90 text-xs font-semibold text-stone-700">
          <PlayCircle class="w-3.5 h-3.5 text-violet-600" />
          Reproducir
        </div>
      </div>

      <div class="p-4">
        <div v-if="categoria" class="text-[11px] uppercase tracking-wider text-stone-500 font-semibold mb-1">
          {{ categoria }}
        </div>
        <h4 class="text-sm font-semibold text-gray-900 line-clamp-2">
          {{ titulo }}
        </h4>
        <p v-if="descripcion" class="text-xs text-gray-600 mt-1 line-clamp-2">
          {{ descripcion }}
        </p>
      </div>
    </component>
  </Motion>
</template>

<style scoped>
.card-audiovisual {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card-audiovisual:hover {
  transform: translateY(-2px);
}
</style>
