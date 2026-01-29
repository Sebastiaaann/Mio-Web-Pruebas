<script setup>
import emblaCarouselVue from "embla-carousel-vue";
import Autoplay from "embla-carousel-autoplay";

defineProps({
  videos: {
    type: Array,
    required: true
  }
});

const [emblaRef] = emblaCarouselVue({ loop: true, align: 'start' }, [Autoplay()]);
</script>

<template>
  <div class="mt-8">
      <h3 class="font-bold text-lg text-gray-900 mb-4 px-1">Educación Recomendada</h3>
      <!-- Embla Carousel -->
      <div class="overflow-hidden" ref="emblaRef">
          <div class="flex -ml-4">
               <!-- Slide 1 -->
              <div class="flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.33%] min-w-0 pl-4" v-for="video in videos" :key="video.id">
                   <div class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 h-full hover:shadow-md transition-shadow cursor-pointer group">
                      <div class="h-40 bg-gray-200 relative">
                          <img v-if="video.thumbnail" :src="video.thumbnail" class="w-full h-full object-cover">
                          <div v-else class="w-full h-full bg-gray-100 flex items-center justify-center">
                               <iconify-icon icon="lucide:image" class="text-gray-300 text-4xl"></iconify-icon>
                          </div>
                          <div class="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-all">
                              <iconify-icon icon="lucide:play-circle" class="text-white text-4xl opacity-90 scale-95 group-hover:scale-110 transition-transform duration-200 drop-shadow-lg"></iconify-icon>
                          </div>
                          <span class="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-md font-medium">05:20</span>
                      </div>
                      <div class="p-4">
                          <div class="flex items-start justify-between gap-2 mb-2">
                              <span class="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-600 uppercase tracking-wide">Educación</span>
                          </div>
                          <h4 class="font-bold text-gray-900 line-clamp-1 mb-1 group-hover:text-orange-500 transition-colors">{{ video.titulo }}</h4>
                          <p class="text-sm text-gray-500 line-clamp-2 h-10">{{ video.descripcion }}</p>
                      </div>
                  </div>
              </div>
              
              <!-- Fallback/Mock Slides if no videos -->
               <div  v-if="videos.length === 0" class="flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.33%] min-w-0 pl-4">
                   <div class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 h-full group cursor-pointer">
                      <div class="h-40 bg-gray-100 relative flex items-center justify-center">
                         <iconify-icon icon="lucide:video" class="text-gray-300 text-4xl"></iconify-icon>
                      </div>
                      <div class="p-4">
                          <h4 class="font-bold text-gray-900 mb-1">Cargando contenido...</h4>
                          <p class="text-sm text-gray-500">Estamos preparando tus videos.</p>
                      </div>
                  </div>
              </div>
          </div>
      </div>
  </div>
</template>
