<script setup>
import { ref, computed } from 'vue';
import { Motion } from 'motion-v';
import ShowcaseNavbar from './ShowcaseNavbar.vue';

// --- Concentric Radius Logic ---
const padding = ref(20);
const innerRadius = ref(20);
// Formula: Outer = Inner + Padding
const outerRadius = computed(() => innerRadius.value + parseInt(padding.value));

// --- Will Change Logic ---
const useWillChange = ref(false);
</script>

<template>
  <div class="min-h-screen bg-neutral-950 font-sans text-white flex flex-col items-center p-8 gap-16 pt-24">
    <ShowcaseNavbar />

    <div class="text-center max-w-2xl">
        <h1 class="text-4xl font-bold mb-4">Visual Utilities</h1>
        <p class="text-neutral-400">
            Concentric Radius, Clip Paths, and Performance hints.
        </p>
    </div>

    <!-- 1. Concentric Border Radius -->
    <div class="w-full max-w-lg flex flex-col gap-6 p-6 bg-neutral-900/50 rounded-3xl border border-white/5">
        <h2 class="text-xl font-semibold text-neutral-300">1. Concentric Radius</h2>
        <p class="text-sm text-neutral-500">
            Mathematical harmony: <code>Outer Radius = Inner Radius + Padding</code>
        </p>

        <!-- Visualization -->
        <div class="flex justify-center p-8">
            <div 
                class="bg-neutral-800 border-2 border-dashed border-blue-500/50 transition-all duration-300 flex items-center justify-center"
                :style="{ 
                    borderRadius: `${outerRadius}px`,
                    padding: `${padding}px`,
                    width: '200px',
                    height: '200px'
                }"
            >
                <div 
                    class="bg-blue-600 w-full h-full flex items-center justify-center text-xs font-mono shadow-inner"
                    :style="{ borderRadius: `${innerRadius}px` }"
                >
                    Inner: {{ innerRadius }}px
                </div>
            </div>
        </div>

        <!-- Controls -->
        <div class="space-y-4">
            <div class="flex items-center gap-4">
                <span class="text-xs w-20">Padding: {{ padding }}px</span>
                <input type="range" min="0" max="50" v-model="padding" class="flex-1 accent-blue-500">
            </div>
            <div class="flex items-center gap-4">
                <span class="text-xs w-20">Inner R: {{ innerRadius }}px</span>
                <input type="range" min="0" max="50" v-model="innerRadius" class="flex-1 accent-blue-500">
            </div>
             <p class="text-xs text-center text-blue-300 font-mono">
                Calculated Outer Radius: {{ outerRadius }}px
            </p>
        </div>
    </div>

    <!-- 2. Clip Path Buttons -->
    <div class="w-full max-w-lg flex flex-col gap-6">
         <h2 class="text-xl font-semibold text-neutral-300 text-center">2. Clip Path Buttons</h2>
         
         <div class="flex justify-center gap-8">
            <!-- Hexagon -->
            <button 
                class="bg-gradient-to-br from-purple-500 to-pink-500 w-32 h-12 font-bold hover:brightness-110 transition-all active:scale-95"
                style="clip-path: polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%);"
            >
                Cyber
            </button>

            <!-- Chevron -->
             <button 
                class="bg-white text-black w-32 h-12 font-bold hover:bg-neutral-200 transition-all active:scale-95"
                style="clip-path: polygon(0 0, 90% 0, 100% 50%, 90% 100%, 0 100%, 10% 50%);"
            >
                Next Step
            </button>
         </div>
    </div>

     <!-- 3. Will Change -->
    <div class="w-full max-w-lg flex flex-col gap-6">
         <h2 class="text-xl font-semibold text-neutral-300 text-center">3. will-change Property</h2>
         
         <div class="flex flex-col items-center gap-4">
             <div class="flex items-center gap-3">
                 <input type="checkbox" v-model="useWillChange" id="wc" class="w-4 h-4">
                 <label for="wc" class="text-sm cursor-pointer">Enable `will-change: transform`</label>
             </div>

             <div class="flex gap-4">
                 <div 
                    v-for="i in 3" :key="i"
                    class="w-16 h-16 bg-neutral-800 rounded-xl animate-spin-slow border border-white/10"
                    :style="{ 
                        willChange: useWillChange ? 'transform' : 'auto',
                        animationDuration: '3s'
                    }"
                 ></div>
             </div>
             <p class="text-xs text-neutral-500 max-w-xs text-center">
                Hints the browser to promote element to a new layer. Useful for complex animations to prevent stutter.
             </p>
         </div>
    </div>

  </div>
</template>

<style scoped>
.animate-spin-slow {
    animation: spin 3s linear infinite;
}
@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}
</style>
