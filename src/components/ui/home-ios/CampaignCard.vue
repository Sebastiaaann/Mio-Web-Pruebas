<script setup>
import { Motion } from 'motion-v'
import { ArrowRight } from 'lucide-vue-next'

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
})

const handleAction = () => {
  if (props.url && props.url !== '#') {
    console.log('🔗 Abriendo campaña:', props.titulo, '| URL:', props.url)
    window.open(props.url, '_blank')
  } else {
    console.warn('⚠️ Campaña sin URL:', props.titulo)
  }
}
</script>

<template>
  <Motion
    :initial="{ opacity: 0, y: 20 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="{ duration: 0.5, delay: delay }"
  >
    <div 
      class="campaign-card bg-white rounded-2xl p-5 shadow-sm border border-stone-200 flex items-center gap-4 hover:shadow-md transition-all cursor-pointer group"
      @click="handleAction"
    >
      <!-- Logo Container -->
      <div class="w-14 h-14 shrink-0 bg-stone-50 rounded-2xl overflow-hidden border border-stone-100 flex items-center justify-center p-2">
        <img 
          v-if="imagen" 
          :src="imagen" 
          :alt="titulo"
          class="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
        />
        <div v-else class="w-full h-full bg-violet-50 flex items-center justify-center">
            <span class="text-violet-400 text-xs text-center font-bold">MIO</span>
        </div>
      </div>

      <!-- Content -->
      <div class="grow min-w-0">
        <h4 class="text-sm font-semibold text-gray-900 line-clamp-2 mb-1 group-hover:text-violet-600 transition-colors">
          {{ titulo }}
        </h4>
        <p v-if="descripcion" class="text-xs text-gray-600 line-clamp-2 mb-3">
          {{ descripcion }}
        </p>
        <div class="flex items-center gap-2 text-violet-600">
          <span class="text-[11px] font-semibold tracking-wide">COMENZAR AHORA</span>
          <ArrowRight class="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
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
