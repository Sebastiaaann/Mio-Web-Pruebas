<script setup>
import { computed, inject, ref, onMounted } from 'vue'
import { cn } from "@/lib/utils";

const props = defineProps({
  class: { type: String, default: '' }
})

const carousel = inject('carousel')
const containerRef = ref(null)

const transformStyle = computed(() => {
  return {
    transform: `translateX(-${carousel.currentIndex.value * 100}%)`
  }
})
</script>

<template>
  <div 
    ref="containerRef"
    :class="cn('flex transition-transform duration-500 ease-out', props.class)"
    :style="transformStyle"
  >
    <slot />
  </div>
</template>
