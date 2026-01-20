<script setup>
import { ref } from 'vue';

const interpolationMode = ref('srgb');
const hintPosition = ref(50);
</script>

<template>
    <div class="min-h-screen bg-neutral-950 text-white font-sans p-8 flex flex-col items-center gap-16">
        
        <div class="text-center max-w-2xl">
            <h1 class="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Advanced Gradients
            </h1>
            <p class="text-neutral-400">
                Comparación de espacios de color (<code class="text-blue-300">sRGB</code> vs <code class="text-blue-300">OKLCH</code>),
                Color Hints y Layering.
            </p>
        </div>

        <!-- 1. Interpolation Comparison -->
        <div class="w-full max-w-3xl space-y-4">
            <h2 class="text-2xl font-semibold border-b border-white/10 pb-2">1. Interpolation: sRGB vs OKLCH</h2>
            <p class="text-neutral-500 text-sm">
                Nota cómo <strong>sRGB</strong> tiene una "zona muerta" grisácea en el medio (ej. azul a amarillo),
                mientras que <strong>OKLCH</strong> mantiene la vibrancia.
            </p>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                <!-- sRGB -->
                <div class="space-y-2">
                    <span class="text-xs uppercase tracking-widest text-neutral-500">sRGB (Classic)</span>
                    <div 
                        class="h-24 rounded-2xl w-full"
                        style="background: linear-gradient(to right, blue, yellow);"
                    ></div>
                    <p class="text-xs text-neutral-600 font-mono">linear-gradient(to right, blue, yellow)</p>
                </div>

                <!-- OKLCH -->
                <div class="space-y-2">
                    <span class="text-xs uppercase tracking-widest text-neutral-500">OKLCH (Modern)</span>
                    <div 
                        class="h-24 rounded-2xl w-full"
                        style="background: linear-gradient(in oklch to right, blue, yellow);"
                    ></div>
                    <p class="text-xs text-neutral-600 font-mono">linear-gradient(in oklch to right, blue, yellow)</p>
                </div>
            </div>
        </div>

        <!-- 2. Color Hints -->
        <div class="w-full max-w-3xl space-y-4">
            <h2 class="text-2xl font-semibold border-b border-white/10 pb-2">2. Color Hints (Midpoints)</h2>
            <p class="text-neutral-500 text-sm">
                Mueve el slider para cambiar el "punto medio" de la mezcla sin mover los colores de inicio/fin.
            </p>

            <div 
                class="h-24 rounded-2xl w-full transition-all duration-200"
                :style="`background: linear-gradient(to right, #ef4444, ${hintPosition}%, #3b82f6)`"
            ></div>
            
            <div class="flex items-center gap-4">
                <span class="font-mono text-red-400">Red</span>
                <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    v-model="hintPosition" 
                    class="flex-1 h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-white"
                >
                <span class="font-mono text-blue-400">Blue</span>
            </div>
            <p class="text-center font-mono text-sm text-neutral-400">
                linear-gradient(to right, red, <span class="text-white">{{ hintPosition }}%</span>, blue)
            </p>
        </div>

        <!-- 3. Gradient Layering (Mesh) -->
        <div class="w-full max-w-3xl space-y-4">
             <h2 class="text-2xl font-semibold border-b border-white/10 pb-2">3. Gradient Layering & Blend Modes</h2>
             <p class="text-neutral-500 text-sm">
                 Combinando múltiples gradientes con <code>background-blend-mode</code> para crear efectos complejos (Mesh).
             </p>

             <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <!-- Simple Layering -->
                 <div class="h-64 rounded-3xl w-full relative overflow-hidden"
                      style="
                        background-color: #000;
                        background-image: 
                            radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%), 
                            radial-gradient(at 50% 0%, hsla(225,39%,30%,1) 0, transparent 50%), 
                            radial-gradient(at 100% 0%, hsla(339,49%,30%,1) 0, transparent 50%);
                      "
                 >
                    <div class="absolute inset-0 flex items-center justify-center font-bold text-white/50">Basic Layering</div>
                 </div>

                 <!-- Advanced Mesh (Jakub Style) -->
                 <div class="h-64 rounded-3xl w-full relative overflow-hidden"
                      style="
                        background-color: #ff9a9e;
                        background-image: 
                            radial-gradient(at 80% 0%, hsla(189,100%,56%,1) 0px, transparent 50%),
                            radial-gradient(at 0% 50%, hsla(355,100%,93%,1) 0px, transparent 50%),
                            radial-gradient(at 80% 50%, hsla(340,100%,76%,1) 0px, transparent 50%),
                            radial-gradient(at 0% 100%, hsla(22,100%,77%,1) 0px, transparent 50%),
                            radial-gradient(at 80% 100%, hsla(242,100%,70%,1) 0px, transparent 50%),
                            radial-gradient(at 0% 0%, hsla(343,100%,76%,1) 0px, transparent 50%);
                        filter: blur(40px);
                      "
                 >
                    <div class="absolute inset-0 z-10 flex items-center justify-center font-bold text-black/50 mix-blend-overlay">Mesh + Blur</div>
                 </div>
             </div>
        </div>

    </div>
</template>
