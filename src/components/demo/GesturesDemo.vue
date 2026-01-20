<script setup>
import { ref } from 'vue';
import { Motion } from 'motion-v';

const constraintRef = ref(null);
</script>

<template>
    <div class="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-8 gap-16 font-sans text-white">
        
        <div class="text-center max-w-2xl">
            <h1 class="text-4xl font-bold mb-4">Motion Gestures</h1>
            <p class="text-neutral-400">
                Interacciones físicas usando 
                <code class="bg-neutral-900 px-1.5 py-0.5 rounded text-purple-400 font-mono text-sm">whileHover</code>,
                <code class="bg-neutral-900 px-1.5 py-0.5 rounded text-purple-400 font-mono text-sm">whileTap</code>,
                y <code class="bg-neutral-900 px-1.5 py-0.5 rounded text-purple-400 font-mono text-sm">drag</code>.
            </p>
        </div>

        <!-- Demo 1: Hover & Tap Button -->
        <div class="flex flex-col items-center gap-4">
            <h2 class="text-xl font-semibold text-neutral-300">1. Hover & Tap (Button)</h2>
            
            <Motion
                is="button"
                class="px-8 py-4 bg-purple-600 rounded-2xl font-bold text-lg shadow-lg shadow-purple-900/20 outline-none"
                :whileHover="{ scale: 1.1, rotate: 2 }"
                :whileTap="{ scale: 0.9 }"
                :transition="{ type: 'spring', stiffness: 400, damping: 10 }"
            >
                ¡Pulsame!
            </Motion>
            <p class="text-sm text-neutral-500">Scale 1.1 on Hover, 0.9 on Tap</p>
        </div>

        <!-- Demo 2: Draggable Card -->
        <div class="flex flex-col items-center gap-4 w-full max-w-md">
            <h2 class="text-xl font-semibold text-neutral-300">2. Drag & Constraints</h2>
            
            <!-- Constraints Container -->
            <div 
                ref="constraintRef" 
                class="w-full h-64 bg-neutral-900/50 border border-white/5 rounded-3xl flex items-center justify-center overflow-hidden relative"
            >
                <div class="absolute text-neutral-700 font-bold uppercase tracking-widest pointer-events-none">
                    Área Restringida
                </div>

                <Motion
                    class="w-24 h-24 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl shadow-2xl cursor-grab active:cursor-grabbing flex items-center justify-center font-bold text-2xl"
                    drag
                    :dragConstraints="constraintRef"
                    :dragElastic="0.2"
                    :whileHover="{ cursor: 'grab' }"
                    :whileTap="{ cursor: 'grabbing' }"
                >
                    👋
                </Motion>
            </div>
            <p class="text-sm text-neutral-500">Arrástrame dentro de la caja. Rebota al soltar.</p>
        </div>

        <!-- Demo 3: Pan / Slide (Simple) -->
        <div class="flex flex-col items-center gap-4">
             <h2 class="text-xl font-semibold text-neutral-300">3. Drag Lock (Axis)</h2>
             <div class="w-64 h-2 bg-neutral-800 rounded-full relative flex items-center px-1">
                 <Motion
                    class="w-8 h-8 bg-blue-500 rounded-full shadow-lg cursor-grab active:cursor-grabbing"
                    drag="x"
                    :dragConstraints="{ left: 0, right: 240 }"
                    :dragElastic="0"
                    :dragMomentum="false"
                 />
             </div>
             <p class="text-sm text-neutral-500">Deslizador bloqueado en eje X</p>
        </div>

    </div>
</template>
