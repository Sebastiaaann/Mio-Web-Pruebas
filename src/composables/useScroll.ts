import { ref, onMounted, onUnmounted } from 'vue'

/**
 * useScroll — detecta si el usuario ha bajado la página más allá de un umbral.
 *
 * Usa histéresis para evitar parpadeo: se activa al superar `umbralBajar`,
 * pero solo se desactiva cuando el scroll vuelve a ser menor que `umbralSubir`.
 *
 * @param umbralBajar - píxeles de scroll para activar el estado "scrolleado"
 * @param umbralSubir - píxeles para desactivarlo (por defecto = umbralBajar / 2)
 * @returns Ref<boolean> reactivo
 */
export function useScroll(umbralBajar: number, umbralSubir?: number) {
  const estaScrolleado = ref(false)
  const umbralSubirFinal = umbralSubir ?? Math.floor(umbralBajar / 2)

  function manejarScroll() {
    const y = window.scrollY
    // Histéresis: umbrales distintos para subir y bajar
    estaScrolleado.value = estaScrolleado.value
      ? y > umbralSubirFinal   // ya estaba activo → desactivar solo si vuelve muy arriba
      : y > umbralBajar        // estaba inactivo → activar al superar el umbral
  }

  onMounted(() => {
    window.addEventListener('scroll', manejarScroll, { passive: true })
    // Evaluar posición inicial por si la página ya está scrolleada al montar
    manejarScroll()
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', manejarScroll)
  })

  return estaScrolleado
}
