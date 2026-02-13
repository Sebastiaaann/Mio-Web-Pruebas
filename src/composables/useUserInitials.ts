import { computed, toValue, type MaybeRefOrGetter } from 'vue'

/**
 * Composable para calcular las iniciales del usuario
 *
 * Proporciona funcionalidad para generar iniciales a partir del nombre
 * - Usa las primeras 2 letras del firstName si existe
 * - Si no, usa las iniciales de cada palabra del nombre completo
 * - Fallback a 'MP' (Mio Patient) si no hay nombre
 *
 * @example
 * ```ts
 * const { iniciales } = useUserInitials(firstName, nombreCompleto)
 * // Retorna: 'JD' para 'John Doe'
 * ```
 */

export function useUserInitials(
  firstName: MaybeRefOrGetter<string | null | undefined>,
  nombreCompleto: MaybeRefOrGetter<string | null | undefined>
) {
  const iniciales = computed(() => {
    const nombre = toValue(firstName)
    const completo = toValue(nombreCompleto)

    if (nombre) {
      return nombre.substring(0, 2).toUpperCase()
    }

    if (completo) {
      return completo
        .split(' ')
        .map(n => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    }

    return 'MP' // Mio Patient - fallback
  })

  return {
    iniciales
  }
}

export default useUserInitials
