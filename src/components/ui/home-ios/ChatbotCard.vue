<script setup>
import { Motion } from 'motion-v'
import { RouterLink } from 'vue-router'
import { computed } from 'vue'
import { usePrefersReducedMotion } from '@/composables/usePrefersReducedMotion'

const props = defineProps({
  delay: {
    type: Number,
    default: 0
  }
})

const { prefersReduced } = usePrefersReducedMotion()

const motionTransition = computed(() =>
  prefersReduced.value ? { duration: 0.001, delay: props.delay } : { duration: 0.5, delay: props.delay }
)

const avatarTransition = computed(() =>
  prefersReduced.value ? { duration: 0.001 } : { duration: 0.6, delay: props.delay + 0.2, type: 'spring', stiffness: 200 }
)

const titleTransition = computed(() =>
  prefersReduced.value ? { duration: 0.001 } : { duration: 0.4, delay: props.delay + 0.4 }
)
</script>

<template>
  <Motion
    :initial="{ opacity: 0, scale: 0.95, y: 20 }"
    :animate="{ opacity: 1, scale: 1, y: 0 }"
    :transition="motionTransition"
  >
    <RouterLink
      to="/chat"
      aria-label="Abrir asistente virtual"
      class="chatbot-card relative overflow-hidden rounded-2xl p-8 cursor-pointer group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/90 focus-visible:ring-offset-2 focus-visible:ring-offset-purple-700"
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
          :transition="avatarTransition"
        >
            <div class="w-32 h-32 rounded-2xl bg-white/95 backdrop-blur-sm p-3 shadow-2xl shadow-purple-900/30 group-hover:scale-110 group-hover:shadow-purple-900/50 transition-transform duration-500 mb-6" aria-hidden="true">
            <img 
              src="/assets/robot_mascot.png" 
              alt="MIO Bot"
              width="128" height="128"
              loading="eager" decoding="async"
              class="w-full h-full object-contain"
            />
          </div>
        </Motion>

        <!-- Título -->
        <Motion
          :initial="{ opacity: 0, y: 10 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="titleTransition"
        >
          <h3 class="text-white font-bold text-2xl">
            Asistente Virtual
          </h3>
        </Motion>
      </div>

      <!-- Glassmorphism overlay on hover -->
      <div class="absolute inset-0 bg-linear-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true" />
    </RouterLink>
  </Motion>
</template>

<style scoped>
.chatbot-card {
  min-height: 280px;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
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