<script setup>
import { ref } from 'vue';
import { Motion, AnimatePresence } from 'motion-v';

// --- Input Logic ---
const email = ref('');
const isFocused = ref(false);
const status = ref('idle'); // 'idle' | 'valid' | 'error'

const validate = () => {
    if (email.value.includes('@')) {
        status.value = 'valid';
    } else {
        status.value = 'error';
        // Auto-reset error after shaking
        setTimeout(() => status.value = 'idle', 2000);
    }
};

// --- Orbit Logic ---
// We can use simple CSS keyframes for rotation or performant svg dash offset
// The reference used 3 offset rects. We'll simplify to 1 for the demo, or 2 for the effect.
</script>

<template>
    <div class="min-h-screen bg-neutral-950 text-white font-sans p-8 flex flex-col items-center gap-16">
        
        <div class="text-center max-w-2xl">
            <h1 class="text-4xl font-bold mb-4">Input & Orbit</h1>
            <p class="text-neutral-400">
                Micro-interactions for forms and loading states.
            </p>
        </div>

        <!-- 1. Input Field -->
        <div class="w-full max-w-sm flex flex-col gap-8">
            <h2 class="text-2xl font-semibold text-neutral-300 text-center">1. Input Interaction</h2>
            
            <div class="relative">
                <Motion 
                    class="relative bg-neutral-900 border rounded-xl overflow-hidden transition-colors duration-300"
                    :class="{
                        'border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.3)]': isFocused && status !== 'error',
                        'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.3)]': status === 'error',
                        'border-white/10': !isFocused && status !== 'error'
                    }"
                    :animate="status === 'error' ? { x: [-5, 5, -5, 5, 0] } : { x: 0 }"
                    :transition="{ duration: 0.4 }"
                >
                    <label 
                        class="absolute left-4 transition-all duration-200 pointer-events-none text-neutral-500"
                        :class="(isFocused || email) ? 'top-2 text-xs text-blue-400' : 'top-4 text-base'"
                    >
                        Email Address
                    </label>
                    
                    <input 
                        v-model="email"
                        @focus="isFocused = true"
                        @blur="isFocused = false"
                        @keydown.enter="validate"
                        type="text"
                        class="w-full bg-transparent px-4 pt-6 pb-2 outline-none text-white relative z-10"
                    />

                    <!-- Valid Indicator -->
                    <AnimatePresence>
                        <Motion 
                            v-if="status === 'valid'"
                            :initial="{ scale: 0, opacity: 0 }"
                            :animate="{ scale: 1, opacity: 1 }"
                            :exit="{ scale: 0, opacity: 0 }"
                            class="absolute right-4 top-4 text-green-400"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </Motion>
                    </AnimatePresence>
                </Motion>

                <!-- Error Message -->
                <AnimatePresence>
                    <Motion
                        v-if="status === 'error'"
                        :initial="{ opacity: 0, y: -10, height: 0 }"
                        :animate="{ opacity: 1, y: 0, height: 'auto' }"
                        :exit="{ opacity: 0, y: -10, height: 0 }"
                        class="overflow-hidden"
                    >
                        <p class="text-red-400 text-sm mt-2 pl-1">Please enter a valid email address.</p>
                    </Motion>
                </AnimatePresence>
            </div>
            <p class="text-sm text-neutral-500 text-center">Press Enter to validate</p>
        </div>

        <!-- 2. Outline Orbit (Passkey Animation) -->
        <div class="flex flex-col items-center gap-6">
            <h2 class="text-2xl font-semibold text-neutral-300">2. Outline Orbit (Passkey)</h2>
            
            <div class="relative w-32 h-32 flex items-center justify-center bg-neutral-900 rounded-3xl border border-white/5 shadow-2xl">
                <!-- Static Fingerprint -->
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-neutral-500">
                    <path d="M2 12C2 6.5 6.5 2 12 2a10 10 0 0 1 8 4"/>
                    <path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2"/>
                    <path d="M17.29 21.02c.12-.6.43-2.3.5-3.02"/>
                    <path d="M12 10a2 2 0 0 1 2 2c0 .73-.12 1.41-.35 2"/>
                    <path d="M9 22c0-1.29.35-2.52.96-3.6"/>
                    <path d="M12 6c3.31 0 6 2.69 6 6 0 1.95-.5 3.32-1.34 4.54"/>
                </svg>

                <!-- Orbiting Stroke 1 (Blue) -->
                <svg class="absolute inset-0 w-full h-full p-[1px] pointer-events-none" viewBox="0 0 128 128">
                     <Motion 
                        is="rect"
                        x="1.5" y="1.5" width="125" height="125" rx="23"
                        fill="none"
                        stroke="#3b82f6"
                        stroke-width="3"
                        stroke-dasharray="30 150"
                        :animate="{ strokeDashoffset: [0, -180] }"
                        :transition="{ duration: 2, ease: 'linear', repeat: Infinity }"
                     />
                </svg>
                
                 <!-- Orbiting Stroke 2 (White) - Slower or opposite -->
                <svg class="absolute inset-0 w-full h-full p-[1px] pointer-events-none opacity-50" viewBox="0 0 128 128">
                     <Motion 
                        is="rect"
                        x="1.5" y="1.5" width="125" height="125" rx="23"
                        fill="none"
                        stroke="white"
                        stroke-width="3"
                        stroke-dasharray="10 200"
                        :animate="{ strokeDashoffset: [0, -210] }"
                        :transition="{ duration: 3, ease: 'linear', repeat: Infinity }"
                     />
                </svg>

                <!-- Blur Glow behind -->
                <div class="absolute inset-0 bg-blue-500/20 blur-xl rounded-full -z-10 animate-pulse"></div>
            </div>
            <p class="text-sm text-neutral-500">Infinite rotating dashes using `strokeDashoffset`.</p>
        </div>

    </div>
</template>
