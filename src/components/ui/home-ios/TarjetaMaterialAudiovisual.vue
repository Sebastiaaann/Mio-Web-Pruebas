<script setup>
/**
 * TarjetaMaterialAudiovisual - Card para material audiovisual
 * Diseño limpio y moderno, con imagen y CTA
 */
import { Motion } from 'motion-v'
import { PlayCircle } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const props = defineProps({
  titulo: { type: String, required: true },
  descripcion: { type: String, default: '' },
  imagen: { type: String, default: '' },
  url: { type: String, default: '#' },
  categoria: { type: String, default: '' },
  delay: { type: Number, default: 0 }
})

const router = useRouter()

const abrirMaterial = () => {
  if (!props.url || props.url === '#') return

  if (props.url.startsWith('/')) {
    router.push(props.url)
    return
  }

  window.open(props.url, '_blank')
}
</script>

<template>
  <Motion
    :initial="{ opacity: 0, y: 16 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="{ duration: 0.4, delay: delay, ease: 'easeOut' }"
  >
    <article
      class="card-audiovisual rounded-2xl overflow-hidden bg-white border border-stone-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
      @click="abrirMaterial"
      :aria-label="`Abrir material: ${titulo}`"
      role="button"
    >
      <div class="relative aspect-video bg-stone-100">
        <img
          v-if="imagen"
          :src="imagen"
          :alt="titulo"
          class="w-full h-full object-cover"
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
    </article>
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
