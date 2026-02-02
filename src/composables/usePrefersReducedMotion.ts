import { onMounted, onUnmounted, ref } from 'vue'
import type { Ref } from 'vue'

interface PrefersReducedMotionResultado {
  prefersReduced: Ref<boolean>
}

// Composable simple para exponer prefers-reduced-motion como ref reactivo
export function usePrefersReducedMotion(): PrefersReducedMotionResultado {
  const prefersReduced = ref(false)
  let mql: MediaQueryList | null = null

  function update(): void {
    prefersReduced.value = !!(mql && mql.matches)
  }

  onMounted(() => {
    if (typeof window !== 'undefined' && 'matchMedia' in window) {
      mql = window.matchMedia('(prefers-reduced-motion: reduce)')
      update()
      mql.addEventListener('change', update)
    }
  })

  onUnmounted(() => {
    if (mql) {
      mql.removeEventListener('change', update)
    }
  })

  return { prefersReduced }
}
