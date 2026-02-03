<script setup>
import emblaCarouselVue from 'embla-carousel-vue'
import { provide, ref, watchEffect, onMounted, computed } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps({
  opts: {
    type: Object,
    default: () => ({})
  },
  plugins: {
    type: Array,
    default: () => []
  },
  orientation: {
    type: String,
    default: 'horizontal'
  },
  setApi: {
    type: Function,
    default: undefined
  },
  class: {
    type: String,
    default: ''
  },
  slidesPerView: {
    type: [Number, String],
    default: 0
  },
  spacing: {
    type: [Number, String],
    default: 0
  }
})

const emits = defineEmits(['init-api'])

const [emblaRef, emblaApi] = emblaCarouselVue({
  ...props.opts,
  axis: props.orientation === 'horizontal' ? 'x' : 'y',
}, props.plugins)

const canScrollPrev = ref(false)
const canScrollNext = ref(false)

const scrollPrev = () => {
  emblaApi.value?.scrollPrev()
}

const scrollNext = () => {
  emblaApi.value?.scrollNext()
}

const onSelect = (api) => {
  if (!api) return
  canScrollPrev.value = api.canScrollPrev()
  canScrollNext.value = api.canScrollNext()
}

onMounted(() => {
  if (!emblaApi.value) return

  emblaApi.value.on('init', onSelect)
  emblaApi.value.on('reInit', onSelect)
  emblaApi.value.on('select', onSelect)

  emits('init-api', emblaApi.value)
  if (props.setApi) props.setApi(emblaApi.value)
  
  onSelect(emblaApi.value)
})

provide('carousel', {
  carouselRef: emblaRef,
  api: emblaApi,
  scrollPrev,
  scrollNext,
  canScrollPrev,
  canScrollNext,
  orientation: props.orientation,
  slidesPerView: props.slidesPerView,
  spacing: props.spacing
})
</script>

<template>
  <div
    :class="cn('relative', props.class)"
    role="region"
    aria-roledescription="carousel"
  >
    <slot />
  </div>
</template>
