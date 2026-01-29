<script setup>
import { inject, computed } from 'vue'
import { ChevronRight } from 'lucide-vue-next'
import { cn } from "@/lib/utils";

const props = defineProps({
  class: { type: String, default: '' }
})

const carousel = inject('carousel')

const canGoNext = computed(() => carousel.canGoNext?.value ?? true)
</script>

<template>
  <button
    @click="carousel.next"
    :disabled="!canGoNext"
    :class="cn(
      'absolute right-4 top-1/2 -translate-y-1/2 z-10',
      'w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm',
      'flex items-center justify-center',
      'shadow-lg border border-gray-200',
      'text-gray-700 hover:bg-white hover:scale-110',
      'transition-all duration-200',
      'disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100',
      props.class
    )"
  >
    <ChevronRight class="w-5 h-5" />
  </button>
</template>
