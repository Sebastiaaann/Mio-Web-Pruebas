<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from '@/composables/useTheme'
import { useTiendaServicios } from '@/stores/tiendaServicios'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselDots,
} from '@/components/ui/carousel/index.js'

interface OpcionServicio {
  titulo?: string
  title?: string
  imagen?: string
  image?: string
  tipo_mensaje?: string
  type_message?: string
  id?: string | number
  [key: string]: unknown
}

const props = withDefaults(defineProps<{
  opciones?: OpcionServicio[]
  rutaDetalle?: string
}>(), {
  opciones: () => [],
  rutaDetalle: '/recursos'
})

const router = useRouter()
const { isMutual, colors } = useTheme()
const serviciosStore = useTiendaServicios()

const hayContenido = computed(() => props.opciones.length > 0)

function construirQueryParams(opcion: OpcionServicio): Record<string, string> {
  const titulo = String(opcion.titulo || opcion.title || 'Material Audiovisual')
  const tipoMensaje = String(opcion.tipo_mensaje || opcion.type_message || '')
  const params: Record<string, string> = { titulo }

  try {
    const categorias = JSON.parse(tipoMensaje)
    if (Array.isArray(categorias) && categorias.length > 0) {
      const primera = categorias[0]
      if (Array.isArray(primera.included_categories) && primera.included_categories.length > 0) {
        params.incluye = primera.included_categories.join(',')
      } else if (Array.isArray(primera.excluded_categories) && primera.excluded_categories.length > 0) {
        params.excluye = primera.excluded_categories.join(',')
      }
    }
  } catch {
    // tipo_mensaje malformado — navegar sin filtros adicionales
  }

  return params
}

function irADetalle(opcion: OpcionServicio): void {
  serviciosStore.registrarUso(String(opcion.id ?? ''), String(opcion.titulo || opcion.title || ''))
  router.push({ path: props.rutaDetalle, query: construirQueryParams(opcion) })
}
</script>

<template>
  <div v-if="hayContenido">
    <Carousel
      :autoplay="true"
      :interval="4000"
      loop
      class="w-full"
    >
      <CarouselContent>
        <CarouselItem
          v-for="(opcion, index) in opciones"
          :key="String(opcion.id ?? index)"
          class="cursor-pointer"
          @click="irADetalle(opcion)"
        >
          <div class="group">
            <!-- Imagen o placeholder -->
            <div
              v-if="opcion.imagen || opcion.image"
              class="relative w-full aspect-video rounded-xl overflow-hidden mb-3"
            >
              <img
                :src="String(opcion.imagen || opcion.image)"
                :alt="String(opcion.titulo || opcion.title || '')"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            </div>
            <div
              v-else
              class="relative w-full aspect-video rounded-xl overflow-hidden mb-3 flex items-center justify-center"
              :style="{ background: `linear-gradient(135deg, ${colors.primary}22, ${colors.primary}44)` }"
            >
              <iconify-icon
                icon="lucide:play-circle"
                class="text-6xl"
                :style="{ color: colors.primary }"
              ></iconify-icon>
            </div>

            <!-- Texto inferior -->
            <div
              class="relative transition-all duration-300"
              :class="[isMutual ? '-mx-2 -mb-2 p-4 pt-6 mt-[-1rem] rounded-b-xl' : 'space-y-1']"
              :style="isMutual ? { backgroundColor: '#C4D600', zIndex: 10 } : {}"
            >
              <img
                v-if="isMutual"
                src="/assets/robot_mascot.png"
                alt="Mio Robot"
                class="absolute -top-10 right-2 w-12 h-auto z-20 drop-shadow-sm hover:scale-110 transition-transform"
              />
              <p class="font-bold text-gray-text text-base group-hover:text-primary transition-colors line-clamp-1 relative z-10">
                {{ opcion.titulo || opcion.title }}
              </p>
              <p
                class="text-sm text-gray-text-light font-medium line-clamp-2 relative z-10"
                :class="isMutual ? 'text-slate-800/80' : ''"
              >
                {{ opcion.descripcion || 'Ver contenido disponible' }}
              </p>
            </div>
          </div>
        </CarouselItem>
      </CarouselContent>
      <CarouselDots />
    </Carousel>
  </div>

  <!-- Sin contenido -->
  <div v-else class="flex flex-col items-center justify-center py-8 text-center">
    <iconify-icon icon="lucide:video-off" class="text-4xl text-gray-300 mb-3"></iconify-icon>
    <p class="text-gray-500 text-sm">No hay material audiovisual disponible</p>
  </div>
</template>
