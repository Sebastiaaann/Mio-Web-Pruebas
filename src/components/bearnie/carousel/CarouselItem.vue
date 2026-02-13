<script setup>
import { inject, computed } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps({
  class: { type: String, default: '' }
})

const { orientation, slidesPerView, spacing } = inject('carousel')

const basisStyle = computed(() => {
  const slides = Number(slidesPerView)
  if (!slides || slides <= 0) return {}
  const percentage = 100 / slides
  return { flexBasis: `${percentage}%` }
})
</script>

<template>
  <div
    role="group"
    aria-roledescription="slide"
    :class="cn(
      'min-w-0 shrink-0 grow-0',
      orientation === 'horizontal' ? 'pl-4' : 'pt-4',
      props.class
    )"
    :style="{
      ...(orientation === 'horizontal' 
        ? (spacing ? { paddingLeft: `${spacing}px` } : {}) 
        : (spacing ? { paddingTop: `${spacing}px` } : {})),
      ...basisStyle
    }"
  >
    <slot />
  </div>
</template>
