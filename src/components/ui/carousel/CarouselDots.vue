<script setup>
import { inject, computed } from 'vue'
import { cn } from "@/lib/utils";

const props = defineProps({
  class: { type: String, default: '' }
})

const carousel = inject('carousel')

const dots = computed(() => {
  return Array.from({ length: carousel.totalItems.value }, (_, i) => i)
})
</script>

<template>
  <div 
    :class="cn('flex items-center justify-center gap-2 mt-4', props.class)"
  >
    <button
      v-for="index in dots" 
      :key="index"
      @click="carousel.goTo(index)"
      :class="cn(
        'w-2 h-2 rounded-full transition-all duration-300',
        carousel.currentIndex.value === index 
          ? 'bg-primary w-6' 
          : 'bg-gray-300 hover:bg-gray-400'
      )"
    />
  </div>
</template>
