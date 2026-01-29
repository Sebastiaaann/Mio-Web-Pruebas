<script setup>
import { computed, inject } from 'vue'
import { cn } from "@/lib/utils";

const props = defineProps({
  class: { type: String, default: '' }
})

const carousel = inject('carousel')

const transformStyle = computed(() => {
  return {
    transform: `translateX(-${carousel.currentIndex.value * 100}%)`
  }
})
</script>

<template>
  <div 
    :class="cn('flex transition-transform duration-500 ease-out', props.class)"
    :style="transformStyle"
  >
    <slot />
  </div>
</template>
