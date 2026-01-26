<script setup>
import { Motion } from 'motion-v'
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps({
  delay: {
    type: Number,
    default: 0
  }
})

const abrirChat = () => {
  router.push('/chat')
}
</script>

<template>
  <Motion
    :initial="{ opacity: 0, scale: 0.95, y: 20 }"
    :animate="{ opacity: 1, scale: 1, y: 0 }"
    :transition="{ duration: 0.5, delay: delay }"
  >
    <div 
      @click="abrirChat"
      class="chatbot-card relative overflow-hidden rounded-2xl p-8 cursor-pointer group"
    >
      <!-- Gradient Background - Purple theme -->
      <div class="absolute inset-0 bg-linear-to-br from-purple-600 via-purple-500 to-purple-400" />
      
      <!-- Subtle animated background -->
      <div class="absolute inset-0 opacity-5">
        <div class="absolute top-0 left-0 w-32 h-32 bg-white rounded-full blur-3xl animate-float" />
        <div class="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl animate-float" style="animation-delay: -2s;" />
      </div>

      <!-- Content -->
      <div class="relative z-10 flex flex-col items-center justify-center text-center h-full">
        <!-- Bot Avatar - Prominente -->
        <Motion
          :initial="{ scale: 0.8, y: 10 }"
          :animate="{ scale: 1, y: 0 }"
          :transition="{ duration: 0.6, delay: delay + 0.2, type: 'spring', stiffness: 200 }"
        >
          <div class="w-32 h-32 rounded-2xl bg-white/95 backdrop-blur-sm p-3 shadow-2xl shadow-purple-900/30 group-hover:scale-110 group-hover:shadow-purple-900/50 transition-all duration-500 mb-6">
            <img 
              src="/assets/robot_mascot.png" 
              alt="MIO Bot"
              class="w-full h-full object-contain"
            />
          </div>
        </Motion>

        <!-- Título -->
        <Motion
          :initial="{ opacity: 0, y: 10 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.4, delay: delay + 0.4 }"
        >
          <h3 class="text-white font-bold text-2xl">
            Asistente Virtual
          </h3>
        </Motion>
      </div>

      <!-- Glassmorphism overlay on hover -->
      <div class="absolute inset-0 bg-linear-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  </Motion>
</template>

<style scoped>
.chatbot-card {
  min-height: 280px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.chatbot-card:hover {
  transform: translateY(-4px);
  box-shadow: 
    0 20px 40px -15px rgba(147, 51, 234, 0.4),
    0 10px 20px -10px rgba(168, 85, 247, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.2);
}

@keyframes float {
  0%, 100% { 
    transform: translateY(0) scale(1);
  }
  50% { 
    transform: translateY(-10px) scale(1.05);
  }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}
</style>
320px;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.chatbot-card:hover {
  transform: translateY(-6px);
  box-shadow: 
    0 25px 50px -15px rgba(147, 51, 234, 0.5),
    0 15px 30px -10px rgba(168, 85, 247, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.3);
}

@keyframes float {
  0%, 100% { 
    transform: translateY(0) scale(1);
  }
  50% { 
    transform: translateY(-8px) scale(1.03