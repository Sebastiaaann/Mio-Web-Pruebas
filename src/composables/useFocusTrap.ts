// composables/useFocusTrap.ts
import { onUnmounted } from 'vue'
import type { Ref } from 'vue'

interface ResultadoFocusTrap {
  activate: () => void
  deactivate: () => void
  focusFirst: () => void
}

/**
 * Composable para atrapar el foco dentro de un contenedor (modales, dialogos)
 */
export function useFocusTrap(containerRef: Ref<HTMLElement | null>): ResultadoFocusTrap {
  const focusableSelectors = [
    'button:not([disabled])',
    'a[href]',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ].join(', ')

  let previousFocus: Element | null = null

  const handleKeydown = (e: KeyboardEvent): void => {
    if (e.key !== 'Tab' || !containerRef.value) return

    const focusables = containerRef.value.querySelectorAll<HTMLElement>(focusableSelectors)
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

  const activate = (): void => {
    previousFocus = document.activeElement
    document.addEventListener('keydown', handleKeydown)
  }

  const deactivate = (): void => {
    document.removeEventListener('keydown', handleKeydown)
    if (previousFocus && typeof (previousFocus as HTMLElement).focus === 'function') {
      ;(previousFocus as HTMLElement).focus()
    }
  }

  const focusFirst = (): void => {
    if (!containerRef.value) return
    const focusable = containerRef.value.querySelector<HTMLElement>(focusableSelectors)
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
