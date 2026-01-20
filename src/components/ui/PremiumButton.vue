<script setup>
import { Motion } from 'motion-v';

defineProps({
  variant: {
    type: String,
    default: 'primary', // 'primary', 'secondary', 'ghost'
  }
});
</script>

<template>
  <Motion
    is="button"
    class="relative inline-flex items-center justify-center rounded-full font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background active:scale-95 px-6 py-3"
    :class="[
      variant === 'primary' ? 'bg-[#007AFF] text-white shadow-lg shadow-blue-500/20 hover:bg-[#0066CC]' : '',
      variant === 'secondary' ? 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100' : '',
      variant === 'ghost' ? 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300' : '',
      variant === 'outline' ? 'border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800' : ''
    ]"
    :whileTap="{ scale: 0.96 }"
    :transition="{ type: 'spring', stiffness: 400, damping: 25 }"
  >
    <slot />
  </Motion>
</template>
