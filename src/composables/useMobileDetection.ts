// composables/useMobileDetection.ts
import { onMounted, onUnmounted, ref } from 'vue'
import type { Ref } from 'vue'
import { useThrottleFn } from '@vueuse/core'

interface ResultadoMobileDetection {
  isMobile: Ref<boolean>
}

/**
 * Composable para detectar si el dispositivo es movil
 */
export function useMobileDetection(breakpoint: number = 768): ResultadoMobileDetection {
  const isMobile = ref(false)

  const checkMobile = (): void => {
    if (typeof window !== 'undefined') {
      isMobile.value = window.innerWidth < breakpoint
    }
  }

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
