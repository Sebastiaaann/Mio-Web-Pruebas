<script setup>
import { ref } from 'vue';
import { Motion } from 'motion-v';

const isChecked = ref(false);
const isHighlighted = ref(false);

const checkPath = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: { 
        pathLength: 1, 
        opacity: 1,
        transition: { 
            pathLength: { type: "spring", duration: 0.5, bounce: 0 },
            opacity: { duration: 0.1 }
        }
    }
};

const circlePath = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: { 
        pathLength: 1, 
        opacity: 1,
        transition: { 
            pathLength: { duration: 1, ease: "easeInOut" },
            opacity: { duration: 0.1 }
        }
    }
};
</script>

<template>
    <div class="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-8 gap-16 font-sans text-white">
        
        <div class="text-center max-w-2xl">
            <h1 class="text-4xl font-bold mb-4">SVG Path Animations</h1>
            <p class="text-neutral-400">
                Usando <code class="bg-neutral-900 px-1.5 py-0.5 rounded text-blue-400 font-mono text-sm">pathLength</code>
                para crear efectos de dibujado a mano.
            </p>
        </div>

        <!-- Demo 1: Checkbox -->
        <div class="flex flex-col items-center gap-4">
            <h2 class="text-xl font-semibold text-neutral-300">1. Animated Checkbox</h2>
            
            <button 
                @click="isChecked = !isChecked"
                class="flex items-center gap-3 px-6 py-3 bg-neutral-900/50 hover:bg-neutral-900 border border-white/10 rounded-xl transition-colors"
            >
                <!-- Checkbox Container -->
                <div 
                    class="w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-colors duration-300"
                    :class="isChecked ? 'bg-blue-600 border-blue-600' : 'border-neutral-500'"
                >
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" class="stroke-white stroke-[3]">
                        <Motion
                            d="M2.5 9.5L6.5 13.5L15.5 4.5"
                            :initial="false"
                            :animate="isChecked ? 'visible' : 'hidden'"
                            :variants="checkPath"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        />
                    </svg>
                </div>
                <span class="text-lg">Marcar como completado</span>
            </button>
        </div>

        <!-- Demo 2: Hand-drawn Highlight -->
        <div class="flex flex-col items-center gap-6">
            <h2 class="text-xl font-semibold text-neutral-300">2. Hand-drawn Highlight</h2>
            
            <div class="relative inline-block group cursor-pointer" @mouseenter="isHighlighted = true" @mouseleave="isHighlighted = false">
                <span class="text-5xl font-black relative z-10 px-4">
                    Importante
                </span>
                
                <!-- The Circle SVG -->
                <svg 
                    class="absolute -inset-4 w-[120%] h-[150%] -z-0 pointer-events-none text-blue-500" 
                    viewBox="0 0 200 100" 
                    preserveAspectRatio="none"
                >
                    <Motion
                        d="M10,50 Q40,10 100,50 T190,50 Q160,95 10,85 T10,50"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="3"
                        stroke-linecap="round"
                        :initial="false"
                        :animate="isHighlighted ? 'visible' : 'hidden'"
                        :variants="circlePath"
                    />
                </svg>
            </div>
            <p class="text-sm text-neutral-500">Pasa el mouse sobre el texto</p>
        </div>

    </div>
</template>
