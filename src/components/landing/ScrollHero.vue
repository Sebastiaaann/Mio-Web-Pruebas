<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Motion } from 'motion-v';
import InteractiveHoverButton from '@/components/ui/InteractiveHoverButton.vue';
import GooeyText from '@/components/ui/GooeyText.vue';
import LoginModal from '@/components/auth/LoginModal.vue';

const router = useRouter();
const isLoginOpen = ref(false);
</script>

<template>
  <section class="bg-gray-950 min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      <!-- Background matching pure black reference -->
      <div 
        class="absolute inset-0 w-full h-full bg-black"
      ></div>

      <!-- Radiant Glow Effect -->
      <div class="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-900/30 rounded-full blur-[100px] pointer-events-none"></div>

      <!-- Main Content -->
      <div class="relative z-10 flex flex-col items-center gap-12 w-full max-w-4xl px-4">
        
        <!-- MIO+ Logo -->
        <Motion 
           :initial="{ opacity: 0, scale: 0.9 }"
           :animate="{ opacity: 1, scale: 1 }"
           :transition="{ duration: 0.8, ease: 'easeOut' }"
        >
            <img 
              src="/assets/robot_mascot.png" 
              alt="MIO+ Logo" 
              class="h-48 md:h-56 object-contain drop-shadow-[0_0_25px_rgba(139,92,246,0.4)] animate-pulse-slow"
            />
        </Motion>

        <!-- Gooey Text Morphing -->
        <div class="h-32 flex items-center justify-center w-full">
            <GooeyText 
                :texts="['Gestiona', 'Monitorea', 'Controla', 'Optimiza']" 
                class="w-full"
                textClassName="text-4xl md:text-6xl font-black tracking-tight text-white drop-shadow-lg"
            />
        </div>

       
        
        <!-- Interactive Hover Button -->
        <Motion
            :initial="{ opacity: 0, y: 20 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ delay: 0.5, duration: 0.5 }"
        >
            <InteractiveHoverButton 
                text="Ingresar"
                @click="isLoginOpen = true"
                class="w-48 border-blue-500/50 shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)]"
            />
        </Motion>

      </div>

      <!-- Login Modal -->
      <LoginModal 
        :isOpen="isLoginOpen" 
        @close="isLoginOpen = false" 
      />
  </section>
</template>

<style scoped>
/* Ensure custom animations if needed, though Tailwind utilities are preferred */
</style>
