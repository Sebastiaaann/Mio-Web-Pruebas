<script setup>
import { ref, computed } from 'vue';
import { Motion, AnimatePresence } from 'motion-v';

const isOpen = ref(true);
const activeTab = ref('signin'); // 'signin' | 'signup'
const step = ref('email'); // 'email' | 'password' | 'success'

const tabs = [
    { id: 'signin', label: 'Sign In' },
    { id: 'signup', label: 'Create Account' }
];

const toggleTab = (id) => {
    activeTab.value = id;
    step.value = 'email'; // Reset step on tab change
};

// Simulated Height variants (In a real app, use ResizeObserver or auto height)
// motion-v supports animate={{ height: 'auto' }} perfectly!
const containerVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { 
        opacity: 1, 
        scale: 1,
        height: "auto",
        transition: { type: "spring", bounce: 0, duration: 0.4 }
    },
    exit: { opacity: 0, scale: 0.95 }
};

const contentVariants = {
    initial: { x: 20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -20, opacity: 0 }
};
</script>

<template>
    <div class="min-h-screen bg-neutral-950 flex items-center justify-center p-4 font-sans text-neutral-200">
        
        <!-- Dialog Container -->
        <Motion 
            class="w-full max-w-sm bg-neutral-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative"
            v-if="isOpen"
            :initial="false"
            :animate="{ height: 'auto' }" 
            :transition="{ type: 'spring', bounce: 0, duration: 0.4 }"
        >
            <div class="p-6 flex flex-col gap-6">
                
                <!-- 1. Morphing Tabs -->
                <div class="flex bg-neutral-950/50 p-1 rounded-full relative">
                    <button 
                        v-for="tab in tabs" 
                        :key="tab.id"
                        @click="toggleTab(tab.id)"
                        class="flex-1 relative py-2.5 text-sm font-medium z-10 transition-colors duration-200"
                        :class="activeTab === tab.id ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'"
                    >
                        {{ tab.label }}
                        
                        <!-- Shared Layout Background -->
                        <Motion 
                            v-if="activeTab === tab.id"
                            layoutId="dialog-tab"
                            class="absolute inset-0 bg-neutral-800 rounded-full -z-10 shadow-sm"
                            :transition="{ type: 'spring', bounce: 0.2, duration: 0.6 }"
                        />
                    </button>
                </div>

                <!-- 2. Content with popLayout -->
                <div class="relative overflow-hidden">
                    <AnimatePresence mode="popLayout" :initial="false">
                        
                        <!-- Email Step -->
                        <Motion 
                            v-if="step === 'email'"
                            key="email"
                            :initial="{ x: '100%', opacity: 0 }"
                            :animate="{ x: 0, opacity: 1 }"
                            :exit="{ x: '-100%', opacity: 0 }"
                            :transition="{ type: 'spring', bounce: 0, duration: 0.4 }"
                            class="flex flex-col gap-4"
                        >
                            <div class="space-y-1">
                                <label class="text-xs font-medium text-neutral-400">Email Address</label>
                                <input 
                                    type="email" 
                                    placeholder="john@example.com"
                                    class="w-full bg-neutral-950 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                >
                            </div>
                            <button 
                                @click="step = 'password'"
                                class="w-full bg-white text-black font-semibold rounded-xl py-3 mt-2 hover:bg-neutral-200 transition-colors"
                            >
                                Continue
                            </button>
                             <div class="h-4"></div> <!-- Extra spacer to test height anim -->
                        </Motion>

                        <!-- Password Step (Different Height) -->
                        <Motion 
                            v-if="step === 'password'"
                            key="password"
                            :initial="{ x: '100%', opacity: 0 }"
                            :animate="{ x: 0, opacity: 1 }"
                            :exit="{ x: '-100%', opacity: 0 }"
                             :transition="{ type: 'spring', bounce: 0, duration: 0.4 }"
                            class="flex flex-col gap-4"
                        >
                            <div class="flex items-center gap-2 mb-2">
                                <button 
                                    @click="step = 'email'"
                                    class="text-xs text-neutral-500 hover:text-white flex items-center gap-1"
                                >
                                    ← Back
                                </button>
                            </div>

                            <div class="space-y-1">
                                <label class="text-xs font-medium text-neutral-400">Password</label>
                                <input 
                                    type="password" 
                                    placeholder="••••••••"
                                    class="w-full bg-neutral-950 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                >
                            </div>
                             <!-- Extra field for SignUp only to change height -->
                            <div v-if="activeTab === 'signup'" class="space-y-1">
                                <label class="text-xs font-medium text-neutral-400">Confirm Password</label>
                                <input 
                                    type="password" 
                                    class="w-full bg-neutral-950 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                >
                            </div>

                            <button 
                                class="w-full bg-blue-600 text-white font-semibold rounded-xl py-3 mt-2 hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/20"
                            >
                                {{ activeTab === 'signin' ? 'Sign In' : 'Create Account' }}
                            </button>
                        </Motion>

                    </AnimatePresence>
                </div>

                <div class="flex justify-center border-t border-white/5 pt-4">
                    <span class="text-xs text-neutral-600">Protected by reCAPTCHA</span>
                </div>

            </div>
        </Motion>

    </div>
</template>
