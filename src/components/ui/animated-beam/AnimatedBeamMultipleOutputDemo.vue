<script setup>
import { cn } from "@/lib/utils";
import { User, Share2, Database, Cloud } from "lucide-vue-next";
import { Motion } from "motion-v";

const props = defineProps({
  class: {
    type: String,
    default: "",
  },
});
</script>

<template>
  <div :class="cn('flex items-center justify-center p-4 relative', props.class)">
    <div class="relative w-full max-w-[200px] aspect-square flex items-center justify-center">
        <!-- Center Node -->
        <div class="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-black border p-3 rounded-full shadow-lg">
            <User class="w-6 h-6" />
        </div>

        <!-- Right Nodes -->
        <div class="absolute right-0 top-0 flex flex-col justify-between h-full py-4">
             <Motion 
                :animate="{ scale: [1, 1.1, 1] }"
                :transition="{ duration: 2, repeat: Infinity }"
                class="bg-white dark:bg-black border p-2 rounded-full shadow-sm"
             >
                <Share2 class="w-4 h-4" />
             </Motion>
             <Motion 
                :animate="{ scale: [1, 1.1, 1] }"
                :transition="{ duration: 2, repeat: Infinity, delay: 0.5 }"
                class="bg-white dark:bg-black border p-2 rounded-full shadow-sm"
             >
                <Database class="w-4 h-4" />
             </Motion>
             <Motion 
                :animate="{ scale: [1, 1.1, 1] }"
                :transition="{ duration: 2, repeat: Infinity, delay: 1 }"
                class="bg-white dark:bg-black border p-2 rounded-full shadow-sm"
             >
                <Cloud class="w-4 h-4" />
             </Motion>
        </div>

        <!-- Connecting Lines -->
        <svg class="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
            <path d="M40 100 Q 100 100 180 20" fill="none" class="stroke-gray-300 dark:stroke-gray-700" stroke-width="1" />
            <path d="M40 100 Q 100 100 180 100" fill="none" class="stroke-gray-300 dark:stroke-gray-700" stroke-width="1" />
            <path d="M40 100 Q 100 100 180 180" fill="none" class="stroke-gray-300 dark:stroke-gray-700" stroke-width="1" />
        </svg>
    </div>
  </div>
</template>
