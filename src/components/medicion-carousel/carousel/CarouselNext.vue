<script setup>
import { ArrowRight } from 'lucide-vue-next'
import { inject } from 'vue'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const props = defineProps({
  class: { type: String, default: '' },
  variant: { type: String, default: 'outline' },
  size: { type: String, default: 'icon' },
})

const { orientation, scrollNext, canScrollNext } = inject('carousel')
</script>

<template>
  <Button
    :disabled="!canScrollNext"
    :class="cn(
      'absolute h-8 w-8 rounded-full',
      orientation === 'horizontal'
        ? '-right-12 top-1/2 -translate-y-1/2'
        : '-bottom-12 left-1/2 -translate-x-1/2 rotate-90',
      props.class
    )"
    :variant="variant"
    :size="size"
    @click="scrollNext"
  >
    <slot>
      <ArrowRight class="h-4 w-4" />
      <span class="sr-only">Next slide</span>
    </slot>
  </Button>
</template>
