// composables/useFocusTrap.js
import { ref, onMounted, onUnmounted } from 'vue'

/**
 * Composable para atrapar el foco dentro de un contenedor (modales, diálogos)
 * @param {import('vue').Ref<HTMLElement|null>} containerRef - Ref al elemento contenedor
 * @returns {{ focusFirst: () => void }}
 */
export function useFocusTrap(containerRef) {
  const focusableSelectors = [
    'button:not([disabled])',
    'a[href]',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ].join(', ')

  let previousFocus = null

  const handleKeydown = (e) => {
    if (e.key !== 'Tab' || !containerRef.value) return

    const focusables = containerRef.value.querySelectorAll(focusableSelectors)
    if (focusables.length === 0) return

    const first = focusables[0]
    const last = focusables[focusables.length - 1]

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  const activate = () => {
    previousFocus = document.activeElement
    document.addEventListener('keydown', handleKeydown)
  }

  const deactivate = () => {
    document.removeEventListener('keydown', handleKeydown)
    if (previousFocus && typeof previousFocus.focus === 'function') {
      previousFocus.focus()
    }
  }

  const focusFirst = () => {
    if (!containerRef.value) return
    const focusable = containerRef.value.querySelector(focusableSelectors)
    focusable?.focus()
  }

  onUnmounted(() => {
    deactivate()
  })

  return {
    activate,
    deactivate,
    focusFirst
  }
}
