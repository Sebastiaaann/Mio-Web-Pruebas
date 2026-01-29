import { ref, onMounted, onUnmounted } from 'vue'

// Simple composable to expose prefers-reduced-motion as a reactive ref
export function usePrefersReducedMotion() {
  const prefersReduced = ref(false)
  let mql = null

  function update() {
    prefersReduced.value = !!(mql && mql.matches)
  }

  onMounted(() => {
    if (typeof window !== 'undefined' && 'matchMedia' in window) {
      mql = window.matchMedia('(prefers-reduced-motion: reduce)')
      update()
      if ('addEventListener' in mql) {
        mql.addEventListener('change', update)
      } else if ('addListener' in mql) {
        mql.addListener(update)
      }
    }
  })

  onUnmounted(() => {
    if (mql) {
      if ('removeEventListener' in mql) {
        mql.removeEventListener('change', update)
      } else if ('removeListener' in mql) {
        mql.removeListener(update)
      }
    }
  })

  return { prefersReduced }
}
