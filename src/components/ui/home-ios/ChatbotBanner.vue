<script setup>
/**
 * ChatbotBanner - Banner destacado para el Asistente Virtual
 * Reutiliza el componente MioRobot existente
 */
import { Motion } from 'motion-v'
import { MessageCircle } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import MioRobot from '@/components/ui/MioRobot.vue'

const router = useRouter()

function openChat() {
  router.push('/chat')
}
</script>

<template>
  <Motion
    :initial="{ opacity: 0, y: 10 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="{ duration: 0.5, delay: 0.2 }"
  >
    <div 
      class="chatbot-banner cursor-pointer relative overflow-hidden group"
      @click="openChat"
    >
      <!-- Background & Mesh -->
      <div class="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600"></div>
      <div class="absolute inset-0 opacity-10 pattern-dots"></div>
      
      <!-- Content Container -->
      <div class="relative z-10 flex items-center justify-between p-5">
        <div class="flex items-center gap-4">
          <!-- Robot usando MioRobot component -->
          <div class="robot-container bg-white/20 backdrop-blur-md rounded-2xl p-2 group-hover:scale-110 transition-transform">
            <MioRobot size="sm" mood="happy" :animate="true" :showBubble="true" />
          </div>
          
          <!-- Text -->
          <div>
            <h3 class="text-xl font-bold text-white mb-1">Asistente Virtual</h3>
            <p class="text-emerald-50 text-sm font-medium">
              Resuelve tus dudas médicas al instante
            </p>
          </div>
        </div>

        <!-- Action Button -->
        <div class="hidden sm:flex items-center gap-2 bg-white text-teal-600 px-5 py-2.5 rounded-full font-bold text-sm shadow-lg transform group-hover:translate-x-1 transition-transform">
          CHATEAR
          <MessageCircle class="w-4 h-4" />
        </div>
      </div>
    </div>
  </Motion>
</template>

<style scoped>
.chatbot-banner {
  border-radius: 24px;
  box-shadow: 0 10px 30px -10px rgba(16, 185, 129, 0.4);
  transition: all 0.3s ease;
}

.chatbot-banner:hover {
  box-shadow: 0 20px 40px -12px rgba(16, 185, 129, 0.5);
  transform: translateY(-2px);
}

.pattern-dots {
  background-image: radial-gradient(rgba(255, 255, 255, 0.5) 1px, transparent 1px);
  background-size: 12px 12px;
}

.robot-container {
  width: fit-content;
}
</style>
