<script setup>
import { cn } from '@/lib/utils'; // Assuming this utility exists as per shadcn-vue structure

defineProps({
  class: {
    type: String,
    default: '',
  },
});
</script>

<template>
  <div
    :class="cn(
      'grid w-full auto-rows-[22rem] grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
      $props.class
    )"
  >
    <slot />
  </div>
</template>
