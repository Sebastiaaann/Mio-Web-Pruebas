<script setup>
import { ref } from 'vue';
import { Motion, AnimatePresence } from 'motion-v';

const tabs = ['Diseño', 'Ingeniería', 'Producto', 'Marketing', 'Ventas'];
const activeTab = ref(tabs[0]);
</script>

<template>
  <div class="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-8 gap-12 font-sans">
    <div class="text-center">
      <h1 class="text-3xl font-bold text-white mb-2">Shared Layout Animations</h1>
      <p class="text-neutral-400">Concepto de "pestañas morfológicas" usando motion-v</p>
    </div>

    <!-- Tab Container -->
    <div class="flex space-x-1 bg-neutral-900/50 p-1.5 rounded-full backdrop-blur-md border border-white/5">
      <button
        v-for="tab in tabs"
        :key="tab"
        @click="activeTab = tab"
        class="relative px-6 py-2.5 rounded-full text-sm font-medium transition-colors duration-300 outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
        :class="activeTab === tab ? 'text-white' : 'text-neutral-400 hover:text-white'"
      >
        <!-- The text is always on top -->
        <span class="relative z-10">{{ tab }}</span>

        <!-- The shared layout element -->
        <Motion
          v-if="activeTab === tab"
          class="absolute inset-0 bg-blue-600 rounded-full"
          layoutId="active-tab-indicator"
          :transition="{
            type: 'spring',
            stiffness: 350,
            damping: 30
          }"
        />
      </button>
    </div>

    <!-- Content Area -->
    <div class="relative w-full max-w-md mx-auto">
        <AnimatePresence mode="popLayout">
            <Motion
                :key="activeTab"
                :initial="{ 
                    opacity: 0, 
                    filter: 'blur(4px)', 
                    scale: 0.95, 
                    y: 32 
                }"
                :animate="{ 
                    opacity: 1, 
                    filter: 'blur(0px)', 
                    scale: 1, 
                    y: 0 
                }"
                :exit="{ 
                    opacity: 0, 
                    filter: 'blur(4px)', 
                    scale: 0.95, 
                    y: 32 
                }"
                :transition="{
                    type: 'spring',
                    duration: 0.55,
                    bounce: 0
                }"
                class="text-center w-full"
            >
                <div class="p-8 border border-white/10 rounded-2xl bg-neutral-900/30 backdrop-blur-sm">
                    <h2 class="text-xl font-semibold text-blue-400 mb-2">{{ activeTab }}</h2>
                    <p class="text-neutral-500 text-sm">
                        Contenido dinámico para la sección de {{ activeTab.toLowerCase() }}.
                        <br>
                        Observa el efecto de desenfoque y escala al cambiar.
                    </p>
                </div>
            </Motion>
        </AnimatePresence>
    </div>

  </div>
</template>
