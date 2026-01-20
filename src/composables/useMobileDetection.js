// composables/useMobileDetection.js
import { ref, onMounted, onUnmounted } from 'vue'
import { useThrottleFn } from '@vueuse/core'

/**
 * Composable para detectar si el dispositivo es móvil
 * @param {number} breakpoint - Ancho máximo para considerar móvil (default: 768)
 * @returns {{ isMobile: import('vue').Ref<boolean> }}
 */
export function useMobileDetection(breakpoint = 768) {
  const isMobile = ref(false)

  const checkMobile = () => {
    if (typeof window !== 'undefined') {
      isMobile.value = window.innerWidth < breakpoint
    }
  }

  // Throttle para mejor performance
  const throttledCheck = useThrottleFn(checkMobile, 200)

  onMounted(() => {
    checkMobile()
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', throttledCheck)
    }
  })

  onUnmounted(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', throttledCheck)
    }
  })

  return {
    isMobile
  }
}
