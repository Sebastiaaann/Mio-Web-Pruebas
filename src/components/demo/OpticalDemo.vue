<script setup>
import { ref, computed } from 'vue';
import { useMouse, useElementBounding } from '@vueuse/core';
import { Motion } from 'motion-v';

// --- Optical Alignment Logic ---
const alignmentMode = ref('geometric'); // 'geometric' | 'optical'

// --- Pattern Logic ---
const container = ref(null);
const { x, y } = useMouse();
const { top, left, width, height } = useElementBounding(container);

// Grid configuration
const rows = 6;
const cols = 12;
const items = Array.from({ length: rows * cols }, (_, i) => ({ id: i }));

// Calculate rotation for a single item
const getItemTransform = (index) => {
    if (!width.value) return {};

    const row = Math.floor(index / cols);
    const col = index % cols;
    
    // Calculate center of this item
    // Assuming uniform distribution in grid
    const itemX = left.value + (col + 0.5) * (width.value / cols);
    const itemY = top.value + (row + 0.5) * (height.value / rows);

    const deltaX = x.value - itemX;
    const deltaY = y.value - itemY;
    
    // Calculate angle
    const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
    
    // Calculate distance for scale effect (max distance ~300px)
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const maxDist = 300;
    const scale = Math.max(0.5, 1 - Math.min(distance, maxDist) / maxDist * 0.5);

    return {
        rotate: `${angle}deg`,
        scale: scale
    };
};
</script>

<template>
    <div class="min-h-screen bg-neutral-950 text-white font-sans p-8 flex flex-col items-center gap-16">
        
        <div class="text-center max-w-2xl">
            <h1 class="text-4xl font-bold mb-4">Patterns & Alignment</h1>
            <p class="text-neutral-400">
                Optical mechanics and Interactive Grids.
            </p>
        </div>

        <!-- 1. Optical Alignment -->
        <div class="flex flex-col items-center gap-6">
            <h2 class="text-2xl font-semibold text-neutral-300">1. Optical vs Geometric</h2>
            
            <div class="flex items-center gap-8">
                <!-- Toggle -->
                <div class="flex bg-neutral-900 rounded-full p-1 border border-white/10">
                    <button 
                        v-for="mode in ['geometric', 'optical']"
                        :key="mode"
                        @click="alignmentMode = mode"
                        class="px-4 py-2 rounded-full text-sm font-medium transition-colors"
                        :class="alignmentMode === mode ? 'bg-blue-600 text-white' : 'text-neutral-500 hover:text-white'"
                    >
                        {{ mode.charAt(0).toUpperCase() + mode.slice(1) }}
                    </button>
                </div>
            </div>

            <!-- Play Button Demo -->
            <div class="relative group">
                <div 
                    class="w-24 h-24 rounded-full bg-white flex items-center shadow-2xl transition-all duration-500"
                    :class="alignmentMode === 'geometric' ? 'justify-center' : 'pl-1 justify-center'"
                >
                    <!-- 
                        Geometric Center: justify-center puts the bbox center at container center.
                        Optical Center: The visual mass of the triangle is left-heavy, so we add padding-left (pl-1) to push it right.
                    -->
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" class="text-black">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                </div>
                
                <!-- Guidelines overlay -->
                <div class="absolute inset-0 border border-red-500/30 rounded-full pointer-events-none">
                    <div class="absolute top-1/2 left-0 right-0 h-px bg-red-500/30"></div>
                    <div class="absolute left-1/2 top-0 bottom-0 w-px bg-red-500/30"></div>
                </div>
            </div>
            <p class="text-sm text-neutral-500 max-w-xs text-center">
                <span v-if="alignmentMode === 'optical'" class="text-blue-400">Optically Aligned:</span>
                <span v-else class="text-red-400">Geometrically Aligned:</span>
                The triangle looks centered because we shifted it slightly to the right to account for visual weight.
            </p>
        </div>

        <!-- 2. Interactive Pattern -->
        <div class="w-full max-w-4xl flex flex-col items-center gap-6">
            <h2 class="text-2xl font-semibold text-neutral-300">2. Mouse-Tracking Pattern</h2>
            
            <div 
                ref="container"
                class="grid gap-4 p-8 bg-neutral-900/30 rounded-3xl border border-white/5"
                :style="`grid-template-columns: repeat(${cols}, 1fr);`"
            >
                <div 
                    v-for="(item, index) in items" 
                    :key="item.id"
                    class="w-8 h-8 flex items-center justify-center"
                >
                    <!-- The shape that rotates -->
                    <div 
                        class="w-full h-1 bg-neutral-700 rounded-full transition-transform duration-75 will-change-transform"
                        :style="{ 
                            transform: `rotate(${getItemTransform(index).rotate}) scale(${getItemTransform(index).scale})`,
                            backgroundColor: getItemTransform(index).scale > 0.8 ? '#60a5fa' : '#404040'
                        }"
                    ></div>
                </div>
            </div>
            <p class="text-sm text-neutral-500">
                Items rotate to face the cursor and scale up based on proximity.
            </p>
        </div>

    </div>
</template>
