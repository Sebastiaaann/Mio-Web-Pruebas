<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useTheme } from '@/composables/useTheme'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselDots,
} from '@/components/ui/carousel/index.js'

interface MaterialAudiovisualItem {
  id: string | number
  titulo: string
  descripcion: string
  imagen?: string
  categoria: string
}

const props = withDefaults(defineProps<{
  items: MaterialAudiovisualItem[]
  rutaDetalle?: string
}>(), {
  rutaDetalle: '/recursos'
})

const router = useRouter()
const { isMutual } = useTheme()

function irADetalle(): void {
  router.push(props.rutaDetalle)
}
</script>

<template>
  <Carousel
    v-if="items.length > 0"
    :autoplay="true"
    :interval="3000"
    loop
    class="w-full"
  >
    <CarouselContent>
      <CarouselItem
        v-for="item in items"
        :key="item.id"
        class="cursor-pointer"
        @click="irADetalle"
      >
        <div class="group">
          <div v-if="item.imagen" class="relative w-full aspect-video rounded-xl overflow-hidden mb-3">
            <img
              :src="item.imagen"
              :alt="item.titulo"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            <div class="absolute bottom-3 left-3 right-3">
              <span class="px-2 py-1 bg-primary/90 text-white text-xs font-bold rounded-full">
                {{ item.categoria }}
              </span>
            </div>
          </div>
          <div
            v-else
            class="relative w-full aspect-video rounded-xl overflow-hidden mb-3 bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center"
          >
            <iconify-icon icon="lucide:play-circle" class="text-6xl text-violet-400"></iconify-icon>
            <div class="absolute bottom-3 left-3 right-3">
              <span class="px-2 py-1 bg-primary/90 text-white text-xs font-bold rounded-full">
                {{ item.categoria }}
              </span>
            </div>
          </div>
          <div 
            class="relative transition-all duration-300"
            :class="[
              isMutual ? '-mx-2 -mb-2 p-4 pt-6 mt-[-1rem] rounded-b-xl' : 'space-y-1'
            ]"
            :style="isMutual ? { backgroundColor: '#C4D600', zIndex: 10 } : {}"
          >
            <!-- Robot Mascota (Solo Modo Mutual) -->
            <img 
                v-if="isMutual"
                src="/assets/robot_mascot.png"
                alt="Mio Robot"
                class="absolute -top-10 right-2 w-12 h-auto z-20 drop-shadow-sm hover:scale-110 transition-transform"
            />

            <p class="font-bold text-gray-text text-base group-hover:text-primary transition-colors line-clamp-1 relative z-10">
              {{ item.titulo }}
            </p>
            <p 
              class="text-sm text-gray-text-light font-medium line-clamp-2 relative z-10"
              :class="isMutual ? 'text-slate-800/80' : ''"
            >
              {{ item.descripcion }}
            </p>
          </div>
        </div>
      </CarouselItem>
    </CarouselContent>
    <CarouselDots />
  </Carousel>

  <div v-else class="flex flex-col items-center justify-center py-8 text-center">
    <iconify-icon icon="lucide:video-off" class="text-4xl text-gray-300 mb-3"></iconify-icon>
    <p class="text-gray-500 text-sm">No hay material audiovisual disponible</p>
  </div>
</template>
