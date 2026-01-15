<script setup>
/**
 * MioRobot - Mascota virtual de Mio+
 * Avatar del robot que aparece en auth y mensajes
 * Migrado a Lucide icons
 */
import { computed } from 'vue'
import { MessageCircle, Mail, Heart, HelpCircle } from 'lucide-vue-next'

const { 
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl'
  mood = 'happy', // 'happy' | 'thinking' | 'waving' | 'sad'
  animate = true,
  showBubble = false,
  bubbleIcon = 'pi pi-comments' // legacy prop, now mapped
} = defineProps([
  'size',
  'mood',
  'animate',
  'showBubble',
  'bubbleIcon'
])

// Map legacy PrimeIcons to Lucide components
const iconMap = {
  'pi pi-comments': MessageCircle,
  'pi pi-envelope': Mail,
  'pi pi-heart': Heart,
  'default': HelpCircle
}

const BubbleIconComponent = computed(() => {
  return iconMap[bubbleIcon] || iconMap['default']
})

const sizeClasses = computed(() => {
  switch (size) {
    case 'sm':
      return 'h-16'
    case 'lg':
      return 'h-32'
    case 'xl':
      return 'h-48'
    default:
      return 'h-24'
  }
})

const animationClass = computed(() => {
  if (!animate) return ''
  
  switch (mood) {
    case 'waving':
      return 'animate-wave'
    case 'thinking':
      return 'animate-pulse'
    case 'sad':
      return ''
    default:
      return 'animate-bounce-slow'
  }
})

const bubbleSizeClasses = computed(() => {
  switch (size) {
    case 'sm':
      return { container: 'w-6 h-6 -right-1 -top-1', icon: 'h-3 w-3' }
    case 'lg':
      return { container: 'w-10 h-10 -right-3 -top-2', icon: 'h-5 w-5' }
    case 'xl':
      return { container: 'w-12 h-12 -right-4 -top-3', icon: 'h-6 w-6' }
    default:
      return { container: 'w-8 h-8 -right-2 -top-1', icon: 'h-4 w-4' }
  }
})
</script>

<template>
  <div class="mio-robot relative inline-block">
    <!-- Robot Image -->
    <img 
      src="/assets/robot_mascot.png" 
      alt="MIO Agente Virtual" 
      :class="[sizeClasses, animationClass, 'object-contain drop-shadow-lg']"
    />
    
    <!-- Speech Bubble -->
    <div 
      v-if="showBubble"
      :class="[
        'absolute bg-purple-100 rounded-xl rounded-bl-none shadow-sm flex items-center justify-center',
        bubbleSizeClasses.container
      ]"
    >
      <component :is="BubbleIconComponent" :class="['text-primary', bubbleSizeClasses.icon]" />
    </div>
    
    <slot />
  </div>
</template>

<style scoped>
@keyframes bounce-slow {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

@keyframes wave {
  0%, 100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(10deg);
  }
  75% {
    transform: rotate(-10deg);
  }
}

.animate-bounce-slow {
  animation: bounce-slow 3s ease-in-out infinite;
}

.animate-wave {
  animation: wave 1s ease-in-out infinite;
  transform-origin: bottom center;
}
</style>
