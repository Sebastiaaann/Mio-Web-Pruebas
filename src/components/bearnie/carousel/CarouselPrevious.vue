<script setup>
import { ArrowLeft } from 'lucide-vue-next'
import { inject } from 'vue'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const props = defineProps({
  class: { type: String, default: '' },
  variant: { type: String, default: 'outline' },
  size: { type: String, default: 'icon' },
})

const { orientation, scrollPrev, canScrollPrev } = inject('carousel')
</script>

<template>
  <Button
    :disabled="!canScrollPrev"
    :class="cn(
      'absolute h-8 w-8 rounded-full',
      orientation === 'horizontal'
        ? '-left-12 top-1/2 -translate-y-1/2'
        : '-top-12 left-1/2 -translate-x-1/2 rotate-90',
      props.class
    )"
    :variant="variant"
    :size="size"
    @click="scrollPrev"
  >
    <slot>
      <ArrowLeft class="h-4 w-4" />
      <span class="sr-only">Previous slide</span>
    </slot>
  </Button>
</template>
