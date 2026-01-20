<script setup>
import { computed } from 'vue';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-vue-next';
import { cn } from '@/lib/utils'; // Assuming lib/utils exists

const props = defineProps({
  name: { type: String, required: true },
  class: { type: String, default: '' },
  icon: { type: Object, required: true }, // Expecting a component definition
  description: { type: String, required: true },
  href: { type: String, required: true },
  cta: { type: String, required: true },
  contentClass: { type: String, default: '' },
});

// We accept slots for background to allow flexibility
</script>

<template>
  <div
    :class="cn(
      'group relative flex flex-col justify-between overflow-hidden rounded-3xl',
      // light styles
      'bg-white dark:bg-gray-800 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1',
      // dark styles
      'dark:border dark:border-gray-700',
      props.class
    )"
  >
    <!-- Background Slot -->
    <div class="absolute inset-0 z-0">
      <slot name="background" />
    </div>

    <div :class="cn('relative z-10 flex flex-col gap-1 p-8 mt-auto', props.contentClass)">
      <div class="mb-4 inline-flex items-center justify-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-2xl text-gray-900 dark:text-white border border-gray-100 dark:border-gray-600 w-fit">
         <component :is="icon" class="h-8 w-8 text-neutral-900 dark:text-white" />
      </div>
      
      <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
        {{ name }}
      </h3>
      <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
        {{ description }}
      </p>
    </div>
    
    <!-- Link overlay -->
    <router-link :to="href" class="absolute inset-0 z-20" aria-label="Open"></router-link>
  </div>
</template>
