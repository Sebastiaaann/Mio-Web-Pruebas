<script setup>
import { ref, computed, watch, onMounted, onUnmounted, provide } from 'vue'
import { cn } from "@/lib/utils";

const props = defineProps({
  loop: { type: Boolean, default: false },
  class: { type: String, default: '' },
  autoplay: { type: Boolean, default: true },
  interval: { type: Number, default: 5000 }
})

const currentIndex = ref(0)
const totalItems = ref(0)
const autoplayInterval = ref(null)

const canGoNext = computed(() => {
  if (props.loop) return true
  return currentIndex.value < totalItems.value - 1
})

const canGoPrev = computed(() => {
  if (props.loop) return true
  return currentIndex.value > 0
})

function next() {
  if (canGoNext.value) {
    currentIndex.value = (currentIndex.value + 1) % totalItems.value
  }
}

function prev() {
  if (canGoPrev.value) {
    currentIndex.value = currentIndex.value === 0 
      ? totalItems.value - 1 
      : currentIndex.value - 1
  }
}

function goTo(index) {
  currentIndex.value = index
}

function startAutoplay() {
  if (props.autoplay && totalItems.value > 1) {
    autoplayInterval.value = setInterval(() => {
      next()
    }, props.interval)
  }
}

function stopAutoplay() {
  if (autoplayInterval.value) {
    clearInterval(autoplayInterval.value)
    autoplayInterval.value = null
  }
}

function registerItem() {
  totalItems.value++
}

onMounted(() => {
  startAutoplay()
})

onUnmounted(() => {
  stopAutoplay()
})

watch(() => totalItems.value, (newVal) => {
  if (newVal > 0 && props.autoplay) {
    startAutoplay()
  }
})

provide('carousel', {
  currentIndex,
  totalItems,
  registerItem,
  next,
  prev
})
</script>

<template>
  <div 
    :class="cn('relative w-full overflow-hidden', props.class)"
    @mouseenter="stopAutoplay"
    @mouseleave="startAutoplay"
  >
    <slot />
  </div>
</template>
