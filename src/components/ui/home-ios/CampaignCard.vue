<script setup>
import { Motion } from 'motion-v'
import { ArrowRight } from 'lucide-vue-next'
import { computed } from 'vue'
import { usePrefersReducedMotion } from '@/composables/usePrefersReducedMotion'
import { useRouter } from 'vue-router'
import ClipButton from '@/components/ui/ClipButton.vue'

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
  delay: {
    type: Number,
    default: 0
  }
  ,
  variant: {
    type: String,
    default: 'default' // 'default' | 'feature'
  }
})

const esUrlValida = computed(() => Boolean(props.url) && props.url !== '#')
const esUrlInterna = computed(() => esUrlValida.value && props.url.startsWith('/'))

// Usaremos navegación programática para evitar elementos interactivos anidados
const router = useRouter()
const componenteRaiz = 'div'
const atributosEnlace = {}

function navegar() {
  if (!esUrlValida.value) return
  if (esUrlInterna.value) {
    router.push(props.url)
  } else {
    window.open(props.url, '_blank', 'noopener,noreferrer')
  }
}

const { prefersReduced } = usePrefersReducedMotion()

const clasesCard = computed(() => {
  const baseDefault = 'campaign-card bg-white rounded-2xl p-5 shadow-sm border border-stone-200 flex items-center gap-4 hover:shadow-md transition-transform transition-shadow transition-colors group'
  const baseFeature = 'campaign-card campaign-card--feature rounded-2xl overflow-hidden shadow-lg'

  if (props.variant === 'feature') return baseFeature

  if (!esUrlValida.value) return `${baseDefault} cursor-default opacity-80`

  return `${baseDefault} cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white`
})

const motionTransition = computed(() =>
  prefersReduced.value ? { duration: 0.001, delay: props.delay } : { duration: 0.5, delay: props.delay }
)
</script>

<template>
  <Motion
    :initial="{ opacity: 0, y: 20 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="motionTransition"
  >
    <component
      :is="componenteRaiz"
      v-bind="atributosEnlace"
      :class="clasesCard"
      :aria-label="esUrlValida ? `Abrir campaña: ${titulo}` : `Campaña no disponible: ${titulo}`"
    >
      <!-- Variante 'feature' - diseño claro estilo tarjeta con CTA tipo píldora -->
      <template v-if="props.variant === 'feature'">
        <div class="feature-root flex items-stretch">
          <div class="feature-image w-40 bg-stone-50 overflow-hidden">
            <img v-if="imagen" :src="imagen" :alt="titulo" class="w-full h-full object-cover" />
            <div v-else class="w-full h-full flex items-center justify-center bg-violet-50">
              <span class="text-violet-400 text-xs font-bold">MIO</span>
            </div>
          </div>

          <div class="flex-1 p-5 flex items-center">
            <div class="grow min-w-0">
              <h4 class="text-sm font-semibold text-gray-900 line-clamp-2 mb-1">{{ titulo }}</h4>
              <p v-if="descripcion" class="text-xs text-gray-600 line-clamp-2">{{ descripcion }}</p>
            </div>

            <div class="feature-cta flex items-center pl-6">
              <button
                class="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white border border-violet-100 text-violet-600 shadow-sm hover:bg-violet-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40"
                @click="navegar"
                :aria-disabled="!esUrlValida"
              >
                <span class="text-sm font-medium">Leer</span>
                <ArrowRight class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </template>

      <!-- Variante por defecto -->
      <template v-else>
        <!-- Logo Container -->
        <div class="w-14 h-14 shrink-0 bg-stone-50 rounded-2xl overflow-hidden border border-stone-100 flex items-center justify-center p-2">
          <img 
            v-if="imagen" 
            :src="imagen" 
            :alt="titulo"
            width="56" height="56"
            loading="lazy" decoding="async"
            class="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
          />
          <div v-else class="w-full h-full bg-violet-50 flex items-center justify-center">
              <span class="text-violet-400 text-xs text-center font-bold">MIO</span>
          </div>
        </div>

        <!-- Content -->
        <div class="grow min-w-0 flex items-center justify-between">
          <div class="pr-4">
            <h4 class="text-sm font-semibold text-gray-900 line-clamp-2 mb-1 group-hover:text-violet-600 transition-colors">
              {{ titulo }}
            </h4>
            <p v-if="descripcion" class="text-xs text-gray-600 line-clamp-2 mb-3">
              {{ descripcion }}
            </p>
          </div>

          <div class="shrink-0">
            <ClipButton
              bg-class="bg-violet-50"
              color-class="bg-violet-600"
              text-class="text-violet-600"
              @success="navegar"
            >
              <template #baseIcon><ArrowRight class="w-4 h-4" /></template>
              <template #filledIcon><ArrowRight class="w-4 h-4" /></template>
              <template #successIcon><ArrowRight class="w-4 h-4" /></template>
            </ClipButton>
          </div>
        </div>
      </template>
    </component>
  </Motion>
</template>

<style scoped>
.campaign-card {
  position: relative;
  overflow: hidden;
}

.campaign-card {
  transition: box-shadow 0.3s ease, transform 0.3s ease;
}

.campaign-card:hover {
  transform: translateY(-2px);
}
</style>
