<script setup>
import { inject, onMounted, onUnmounted } from 'vue'
import { cn } from "@/lib/utils";

const props = defineProps({
  class: { type: String, default: '' }
})

const carousel = inject('carousel')
onMounted(() => {
  carousel.registerItem()
})

onUnmounted(() => {
  carousel.unregisterItem()
})
</script>

<template>
  <div 
    :class="cn('w-full min-w-full flex-shrink-0 flex-grow-0', props.class)"
  >
    <slot />
  </div>
</template>
