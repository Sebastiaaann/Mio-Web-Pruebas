<script setup>
import { ref } from 'vue';
import { Motion, AnimatePresence } from 'motion-v';
import ShowcaseNavbar from './ShowcaseNavbar.vue';

const isExpanded = ref(false);
const isHovered = ref(false);

const images = [
    'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', // Camera
    'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', // Pineapple
    'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', // Coffee
    'https://images.unsplash.com/photo-1493612276216-9c78379837f6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', // Hand
];

// Variants for dragging/hovering in collapsed state
// Each image has a unique rotation and position in the "deck"
const stackVariants = [
    { zIndex: 4, rotate: 0, x: 0, y: 0 },         // Top
    { zIndex: 3, rotate: -5, x: -10, y: 5 },       // Second
    { zIndex: 2, rotate: 5, x: 10, y: 5 },         // Third
    { zIndex: 1, rotate: -2, x: 0, y: 10 },        // Bottom
];
    
const hoverVariants = [
    { rotate: 0, x: 0, y: -20 },
    { rotate: -15, x: -40, y: 10 },
    { rotate: 15, x: 40, y: 10 },
    { rotate: 0, x: 0, y: 30 },
];
</script>

<template>
  <div class="min-h-screen bg-neutral-950 font-sans text-white flex flex-col items-center justify-center p-8 relative">
    <ShowcaseNavbar />

    <div class="w-full max-w-4xl min-h-[600px] flex items-center justify-center relative">
        
        <!-- Expanded Grid View -->
        <div v-if="isExpanded" class="relative z-10 w-full">
            <Motion 
                layoutId="collection-container"
                class="bg-neutral-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 w-full"
                :transition="{ type: 'spring', bounce: 0, duration: 0.6 }"
            >
                <div class="flex items-center justify-between mb-8">
                     <Motion layoutId="collection-title" class="text-2xl font-bold">Photography Set</Motion>
                     <button 
                        @click="isExpanded = false"
                        class="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm font-medium transition-colors"
                     >
                        Close
                     </button>
                </div>

                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Motion 
                        v-for="(src, index) in images" 
                        :key="src"
                        :layoutId="`image-${src}`"
                        class="aspect-square rounded-2xl overflow-hidden shadow-lg bg-neutral-800"
                         :transition="{ type: 'spring', bounce: 0, duration: 0.6 }"
                    >
                        <img :src="src" class="w-full h-full object-cover" />
                    </Motion>
                </div>
                
                 <Motion layoutId="collection-meta" class="mt-8 text-neutral-500 text-sm">
                    4 items • Created Jan 2026
                </Motion>
            </Motion>
        </div>

        <!-- Collapsed Stack View -->
        <div v-else class="relative z-0 group cursor-pointer" @click="isExpanded = true">
             <Motion 
                layoutId="collection-container"
                class="w-64 h-80 relative flex items-center justify-center"
                 @hoverstart="isHovered = true"
                 @hoverend="isHovered = false"
            >
                <!-- Images Stack -->
                <div class="relative w-48 h-48">
                    <Motion 
                        v-for="(src, index) in images" 
                        :key="src"
                        :layoutId="`image-${src}`"
                        class="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl border-4 border-neutral-900 bg-neutral-800"
                        :initial="stackVariants[index]"
                        :animate="isHovered ? hoverVariants[index] : stackVariants[index]"
                        :transition="{ type: 'spring', bounce: 0.2, duration: 0.5 }"
                    >
                         <img :src="src" class="w-full h-full object-cover" />
                    </Motion>
                </div>

                <!-- Title & Meta (Hidden or minimized in stack, but layoutId keeps connection if we wanted) -->
                 <div class="absolute -bottom-12 text-center">
                    <Motion layoutId="collection-title" class="text-lg font-bold">Photography Set</Motion>
                    <Motion layoutId="collection-meta" class="text-neutral-500 text-xs">4 items</Motion>
                 </div>

            </Motion>
        </div>
        
    </div>
  </div>
</template>
