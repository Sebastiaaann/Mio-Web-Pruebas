<script setup>
import { inject } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps({
  class: { type: String, default: '' }
})

const { carouselRef, orientation, spacing } = inject('carousel')
</script>

<template>
  <div ref="carouselRef" class="overflow-hidden">
    <div
      :class="cn(
        'flex',
        orientation === 'horizontal' ? '-ml-4' : '-mt-4 flex-col',
        props.class
      )"
      :style="orientation === 'horizontal' 
        ? (spacing ? { marginLeft: `-${spacing}px` } : {}) 
        : (spacing ? { marginTop: `-${spacing}px` } : {})"
    >
      <slot />
    </div>
  </div>
</template>
